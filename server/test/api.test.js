import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { User } from '../src/models/User.js';

const app = createApp();

async function signup(overrides = {}) {
  const res = await request(app).post('/api/auth/signup').send({
    name: 'Camille Test',
    email: `user-${Math.random().toString(36).slice(2)}@test.dev`,
    password: 'password123',
    company: 'CSE Test',
    ...overrides,
  });
  return res;
}

async function makeAdmin(email) {
  await User.updateOne({ email }, { role: 'admin' });
}

describe('platform basics', () => {
  it('health endpoint responds with security headers', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['content-security-policy']).toContain("default-src 'none'");
  });

  it('meta reports offline AI capabilities in test mode', async () => {
    const res = await request(app).get('/api/meta');
    expect(res.body.llm.enabled).toBe(false);
    expect(res.body.audio.enabled).toBe(false);
  });

  it('unknown routes return JSON 404', async () => {
    const res = await request(app).get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.body.error).toContain('/api/nope');
  });
});

describe('auth', () => {
  it('signs up and returns a token + safe user', async () => {
    const res = await signup({ email: 'camille@test.dev' });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe('camille@test.dev');
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('rejects duplicate emails with 409', async () => {
    await signup({ email: 'dup@test.dev' });
    const res = await signup({ email: 'dup@test.dev' });
    expect(res.status).toBe(409);
  });

  it('rejects bad credentials with 401', async () => {
    await signup({ email: 'login@test.dev' });
    const res = await request(app).post('/api/auth/login').send({ email: 'login@test.dev', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('requires auth for request listing', async () => {
    const res = await request(app).get('/api/requests');
    expect(res.status).toBe(401);
  });
});

describe('request lifecycle & ownership', () => {
  let alice, bob;

  beforeEach(async () => {
    alice = (await signup({ email: 'alice@test.dev' })).body;
    bob = (await signup({ email: 'bob@test.dev' })).body;
  });

  it('creates a request and scopes it to the owner', async () => {
    const created = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${alice.token}`)
      .send({ compliance: 'CSE', language: 'French', meetingName: 'Séance test' });
    expect(created.status).toBe(201);

    const aliceList = await request(app).get('/api/requests').set('Authorization', `Bearer ${alice.token}`);
    expect(aliceList.body.requests).toHaveLength(1);

    // Bob cannot see or touch Alice's request.
    const bobList = await request(app).get('/api/requests').set('Authorization', `Bearer ${bob.token}`);
    expect(bobList.body.requests).toHaveLength(0);
    const bobRead = await request(app).get(`/api/requests/${created.body.request._id}`).set('Authorization', `Bearer ${bob.token}`);
    expect(bobRead.status).toBe(403);
  });

  it('accepts region-specific compliance bodies (config-driven)', async () => {
    const res = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${alice.token}`)
      .send({ region: 'DE', compliance: 'BR', language: 'German', meetingName: 'Betriebsratssitzung' });
    expect(res.status).toBe(201);
    expect(res.body.request.compliance).toBe('BR');
    expect(res.body.request.region).toBe('DE');
  });

  it('runs the full pipeline: upload → generate → lock → dispatch → client access', async () => {
    const { body } = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${alice.token}`)
      .send({ compliance: 'CSE', language: 'French', meetingName: 'Séance pipeline', tier: 'Scope' });
    const id = body.request._id;

    // Upload a transcript file (txt path — no external services needed).
    const upload = await request(app)
      .post(`/api/requests/${id}/transcript`)
      .set('Authorization', `Bearer ${alice.token}`)
      .attach('file', Buffer.from('[Intervenant 1]\nLa séance est ouverte. Le budget est adopté.'), 'seance.txt');
    expect(upload.status).toBe(200);
    expect(upload.body.request.transcript.source).toBe('txt');

    // Client cannot generate; admin can (demo path with no LLM key).
    const admin = (await signup({ email: 'admin@test.dev' })).body;
    await makeAdmin('admin@test.dev');
    const adminLogin = await request(app).post('/api/auth/login').send({ email: 'admin@test.dev', password: 'password123' });

    const clientGen = await request(app).post(`/api/requests/${id}/generate`).set('Authorization', `Bearer ${alice.token}`);
    expect(clientGen.status).toBe(403);

    const gen = await request(app).post(`/api/requests/${id}/generate`).set('Authorization', `Bearer ${adminLogin.body.token}`);
    expect(gen.status).toBe(200);
    expect(gen.body.report.generatedHtml).toContain('class="page"');
    expect(gen.body.report.findings.score).toBeGreaterThan(0);
    expect(gen.body.request.status).toBe('in-editing');

    // Client cannot fetch the report before dispatch.
    const early = await request(app).get(`/api/requests/${id}/report`).set('Authorization', `Bearer ${alice.token}`);
    expect(early.status).toBe(403);

    // Lock, dispatch, then the client can read it.
    const lock = await request(app)
      .post(`/api/reports/${gen.body.report._id}/lock`)
      .set('Authorization', `Bearer ${adminLogin.body.token}`)
      .send({ locked: true });
    expect(lock.body.report.locked).toBe(true);

    await request(app).post(`/api/requests/${id}/dispatch`).set('Authorization', `Bearer ${adminLogin.body.token}`);
    const final = await request(app).get(`/api/requests/${id}/report`).set('Authorization', `Bearer ${alice.token}`);
    expect(final.status).toBe(200);
    expect(final.request?.status ?? final.body.request.status).toBe('dispatched');
  });

  it('lets owners delete drafts but not delivered work', async () => {
    const { body } = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${alice.token}`)
      .send({ meetingName: 'Draft to delete' });
    const del = await request(app).delete(`/api/requests/${body.request._id}`).set('Authorization', `Bearer ${alice.token}`);
    expect(del.status).toBe(200);

    const kept = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${alice.token}`)
      .send({ meetingName: 'Delivered', status: 'draft' });
    // Force a non-deletable state via an admin status change.
    const admin = (await signup({ email: 'admin2@test.dev' })).body;
    await makeAdmin('admin2@test.dev');
    const adminLogin = await request(app).post('/api/auth/login').send({ email: 'admin2@test.dev', password: 'password123' });
    await request(app)
      .patch(`/api/requests/${kept.body.request._id}`)
      .set('Authorization', `Bearer ${adminLogin.body.token}`)
      .send({ status: 'dispatched' });

    const forbidden = await request(app).delete(`/api/requests/${kept.body.request._id}`).set('Authorization', `Bearer ${alice.token}`);
    expect(forbidden.status).toBe(403);
  });

  it('rejects audio uploads gracefully when Deepgram is not configured', async () => {
    const { body } = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${alice.token}`)
      .send({ meetingName: 'Audio test' });
    const res = await request(app)
      .post(`/api/requests/${body.request._id}/transcript`)
      .set('Authorization', `Bearer ${alice.token}`)
      .attach('file', Buffer.from('fake-audio-bytes'), 'meeting.mp3');
    expect(res.status).toBe(503);
    expect(res.body.error).toContain('DEEPGRAM_API_KEY');
  });
});
