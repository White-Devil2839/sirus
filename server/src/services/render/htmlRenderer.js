// Deterministic JSON → blue design-system HTML. Uses the exact component classes
// from Material/Report_Design_Template Blue.html so the generated report is
// pixel-faithful regardless of what the LLM produced. Each <div class="page"> is
// one A4 page; the e-book viewer splits on those boundaries.

const esc = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const initials = (name = '') =>
  name
    .replace(/[^\p{L}\s]/gu, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] || '')
    .join('')
    .toUpperCase() || 'M';

const has = (arr) => Array.isArray(arr) && arr.length > 0;

function header(cover) {
  return `<table class="doc-header"><tr>
    <td>${esc(cover.reportType || 'Official Minutes')} &middot; ${esc(cover.complianceInstance || '')}</td>
    <td class="right">${esc(cover.date || '')}</td>
  </tr></table>`;
}
function footer(cover) {
  return `<table class="doc-footer"><tr>
    <td>CONFIDENTIAL &middot; INTERNAL USE</td>
    <td class="right">${esc(cover.org || 'SIRUS')}</td>
  </tr></table>`;
}
const page = (cover, inner) => `<div class="page">${header(cover)}${inner}${footer(cover)}</div>`;

function coverPage(r) {
  const c = r.cover || {};
  const stats = has(c.stats)
    ? `<table class="stat-row"><tr>${c.stats
        .slice(0, 4)
        .map(
          (s) =>
            `<td class="stat-cell"><p class="stat-label">${esc(s.label)}</p><p class="stat-value">${esc(s.value)}</p></td>`
        )
        .join('')}</tr></table>`
    : '';

  const present = (r.attendance?.present || []).slice(0, 6);
  const roleColors = ['var(--accent-dark)', 'var(--accent)', 'var(--ok)', 'var(--info)', 'var(--warn)', 'var(--accent-dark)'];
  const participants = has(present)
    ? `<h2 class="subsection-title">Key Participants / Stakeholders</h2>
       <table style="width:100%; border-collapse:collapse;"><tr>${present
         .map(
           (p, i) => `<td style="width:50%; padding:0 18px 16px 0; vertical-align:top;">
            <table class="person-row"><tr>
              <td class="avatar"><div class="avatar-circle" style="background:${roleColors[i % 6]};">${esc(initials(p.name))}</div></td>
              <td><p class="person-name">${esc(p.name)}${p.role ? ' — ' + esc(p.role) : ''}</p></td>
            </tr></table></td>${i % 2 === 1 ? '</tr><tr>' : ''}`
         )
         .join('')}</tr></table>`
    : '';

  return page(
    c,
    `<p class="eyebrow"><span class="star">&#9733;</span> ${esc(c.reportType || 'Official Minutes')} &middot; ${esc(c.complianceInstance || 'CSE')}</p>
     <h1 class="h1-cover">${esc(c.title || 'Meeting Minutes')}${c.subtitle ? '<br>' + esc(c.subtitle) : ''}</h1>
     <p class="subtitle">${esc(c.org || '')}${c.location ? ' &middot; ' + esc(c.location) : ''}</p>
     ${stats}
     <div class="rule"></div>
     ${r.overview?.executiveSummary ? `<p class="lede">${esc(r.overview.executiveSummary)}</p>` : ''}
     ${participants}`
  );
}

function documentDetailsPage(r) {
  const d = r.documentDetails || {};
  const rows = [
    ['Report Label', d.reportLabel],
    ['Title', d.title || r.cover?.title],
    ['Date', d.date || r.cover?.date],
    ['Type', d.type],
    ['Location', d.location || r.cover?.location],
    ['Prepared By', d.preparedBy || r.cover?.preparedBy],
    ['Compliance Instance', r.cover?.complianceInstance],
    ['Reference', d.reference],
  ].filter(([, v]) => v);
  if (!rows.length) return '';
  return page(
    r.cover || {},
    `<p class="section-label">Section 1</p><h2 class="section-title">Document Details</h2>
     <table class="kv-table">${rows
       .map(([k, v]) => `<tr><td class="k">${esc(k)}</td><td class="v">${esc(v)}</td></tr>`)
       .join('')}</table>`
  );
}

function noticePage(r) {
  if (!r.notice) return '';
  return page(
    r.cover || {},
    `<p class="section-label">Section 2</p><h2 class="section-title">Notice / Scope Statement</h2>
     <p class="body-text">${esc(r.notice)}</p>`
  );
}

function overviewPage(r) {
  const o = r.overview || {};
  const cards = [
    ['Executive Summary', o.executiveSummary],
    ['Context', o.context],
    ['Compliance / Reference Context', o.complianceContext],
  ].filter(([, v]) => v);
  if (!cards.length) return '';
  return page(
    r.cover || {},
    `<p class="section-label">Section 3</p><h2 class="section-title">Report Overview</h2>
     ${cards
       .map(([l, t]) => `<div class="exec-card"><p class="label">${esc(l)}</p><p class="text">${esc(t)}</p></div>`)
       .join('')}`
  );
}

function attendancePage(r) {
  const a = r.attendance || {};
  if (!has(a.present) && !has(a.absent) && !has(a.invited)) return '';
  let inner = `<p class="section-label">Section 4</p><h2 class="section-title">Attendance / Participants</h2>`;
  if (has(a.present)) {
    inner += `<h3 class="part-title">Present</h3><table class="data-table">
      <thead><tr><th>Name</th><th>Role / Function</th><th>Group</th><th>Arrival</th><th>Departure</th><th>Vote</th></tr></thead>
      <tbody>${a.present
        .map(
          (p) =>
            `<tr><td>${esc(p.name)}</td><td>${esc(p.role)}</td><td>${esc(p.group)}</td><td>${esc(p.arrival)}</td><td>${esc(p.departure)}</td><td>${p.voteRight ? '✓' : '—'}</td></tr>`
        )
        .join('')}</tbody></table>`;
  }
  if (has(a.absent)) {
    inner += `<h3 class="part-title">Absent</h3><table class="data-table">
      <thead><tr><th>Name</th><th>Group</th><th>Role</th><th>Reason</th></tr></thead>
      <tbody>${a.absent
        .map((p) => `<tr><td>${esc(p.name)}</td><td>${esc(p.group)}</td><td>${esc(p.role)}</td><td>${esc(p.reason)}</td></tr>`)
        .join('')}</tbody></table>`;
  }
  if (has(a.invited)) {
    inner += `<h3 class="part-title">Invited</h3><table class="data-table">
      <thead><tr><th>Name</th><th>Function</th><th>Organisation</th><th>Status</th></tr></thead>
      <tbody>${a.invited
        .map((p) => `<tr><td>${esc(p.name)}</td><td>${esc(p.function)}</td><td>${esc(p.org)}</td><td>${esc(p.status)}</td></tr>`)
        .join('')}</tbody></table>`;
  }
  return page(r.cover || {}, inner);
}

function speakerBubble(entry) {
  const role = ['a', 'b', 'neutral'].includes(entry.role) ? entry.role : 'neutral';
  return `<div class="speaker role-${role}">
    <div class="badge-cell"><div class="badge">${esc(initials(entry.speaker))}</div></div>
    <div class="bubble"><p class="who">${esc(entry.speaker)}</p><p class="said">${esc(entry.text)}</p></div>
  </div>`;
}

const ALERT_LABEL = {
  decision: 'Alert — Decision',
  unresolved: 'Alert — Unresolved / Suspended',
  tension: 'Alert — Tension / Blockage',
  projection: 'Alert — Projection / Deadline',
};
function alertBlock(al) {
  const type = ALERT_LABEL[al.type] ? al.type : 'decision';
  return `<div class="alert alert-${type}">
    <p class="label">${esc(ALERT_LABEL[type])}</p>
    ${al.subject ? `<p class="field"><strong>Subject:</strong> ${esc(al.subject)}</p>` : ''}
    ${al.fact ? `<p class="field"><strong>Fact:</strong> ${esc(al.fact)}</p>` : ''}
    ${al.extra ? `<p class="field"><strong>Note:</strong> ${esc(al.extra)}</p>` : ''}
  </div>`;
}

function agendaPages(r) {
  if (!has(r.agendaItems)) return '';
  return r.agendaItems
    .map((item, idx) => {
      let inner = `<p class="section-label">Agenda Item ${idx + 1}</p><h2 class="section-title">${esc(item.title)}</h2>`;
      if (item.summary) inner += `<p class="body-text">${esc(item.summary)}</p>`;
      if (has(item.log)) {
        inner += `<h3 class="part-title">Discussion Log</h3>${item.log.map(speakerBubble).join('')}`;
      }
      if (has(item.alerts)) {
        inner += `<h3 class="part-title">Key Points</h3>${item.alerts.map(alertBlock).join('')}`;
      }
      if (has(item.timeline)) {
        inner += `<div class="timeline-block"><p class="label">Timeline — ${esc(item.title)}</p>
          <table class="timeline">${item.timeline
            .map(
              (t) =>
                `<tr><td class="dot-cell"><div class="dot"></div></td><td class="entry">${esc(t.date)}${t.date ? ' | ' : ''}${esc(t.text)}</td></tr>`
            )
            .join('')}</table></div>`;
      }
      return page(r.cover || {}, inner);
    })
    .join('');
}

function votesPage(r) {
  if (!has(r.votes)) return '';
  let inner = `<p class="section-label">Votes &amp; Decisions</p><h2 class="section-title">Voting Record</h2>`;
  r.votes.forEach((v, i) => {
    inner += `<div class="vote-question"><p>Vote #${i + 1} — ${esc(v.question)}</p></div>`;
    if (v.date) inner += `<div class="vote-date"><p class="label">Vote Date</p><p class="text">${esc(v.date)}</p></div>`;
    if (has(v.rows)) {
      inner += `<table class="data-table"><thead><tr><th>Voter</th><th>Group</th><th>Vote</th></tr></thead><tbody>
        ${v.rows.map((row) => `<tr><td>${esc(row.voter)}</td><td>${esc(row.group)}</td><td>${esc(row.vote)}</td></tr>`).join('')}
        <tr><td>Summary: Favorable = ${v.summary?.favorable ?? 0}</td><td>Unfavorable = ${v.summary?.unfavorable ?? 0}</td><td>Abstention = ${v.summary?.abstention ?? 0}</td></tr>
      </tbody></table>`;
    }
    if (v.result) inner += `<div class="vote-result"><p class="label">Result</p><p class="text">${esc(v.result)}</p></div>`;
  });
  return page(r.cover || {}, inner);
}

function numericalPage(r) {
  if (!has(r.numericalData)) return '';
  const blocks = r.numericalData
    .map(
      (n) => `<h3 class="part-title">${esc(n.label)}</h3>
      <table class="data-table"><thead><tr><th>Item</th><th>Value</th></tr></thead><tbody>
        ${(n.series || []).map((s) => `<tr><td>${esc(s.name)}</td><td>${esc(String(s.value))}</td></tr>`).join('')}
      </tbody></table>`
    )
    .join('');
  return page(
    r.cover || {},
    `<p class="section-label">Numerical Data</p><h2 class="section-title">Figures &amp; Metrics</h2>${blocks}`
  );
}

function speakerAnalysisPage(r) {
  const sa = r.speakerAnalysis || {};
  if (!has(sa.speakers)) return '';
  return page(
    r.cover || {},
    `<p class="section-label">Speaker Analysis</p><h2 class="section-title">Engagement &amp; Contribution</h2>
     ${sa.intro ? `<p class="body-text">${esc(sa.intro)}</p>` : ''}
     <table class="data-table"><thead><tr><th>Speaker</th><th>Role / Affiliation</th><th>Interventions</th><th>Engagement</th><th>Stance</th></tr></thead>
     <tbody>${sa.speakers
       .map(
         (s) =>
           `<tr><td>${esc(s.name || s.id)}</td><td>${esc(s.role)}</td><td>${esc(String(s.interventions ?? ''))}</td><td>${'★'.repeat(Math.round(s.engagement || 0))}${'☆'.repeat(5 - Math.round(s.engagement || 0))}</td><td>${esc(s.stance)}</td></tr>`
       )
       .join('')}</tbody></table>`
  );
}

// Render the full report body (concatenated .page divs). Tier trims what the LLM
// populated, so empty sections simply don't appear.
export function renderReportHtml(extraction) {
  const r = extraction || {};
  return [
    coverPage(r),
    documentDetailsPage(r),
    noticePage(r),
    overviewPage(r),
    attendancePage(r),
    agendaPages(r),
    votesPage(r),
    numericalPage(r),
    speakerAnalysisPage(r),
  ]
    .filter(Boolean)
    .join('\n');
}
