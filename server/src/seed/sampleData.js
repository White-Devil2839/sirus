// A realistic canonical extraction built from the provided CSE Rockefeller
// transcript. Used to seed the homepage sample library and to give a fully
// working end-to-end demo before any LLM key is configured. When a key IS set,
// the live pipeline produces this same shape from the raw transcript.

export const cseRockefellerExtraction = {
  cover: {
    reportType: 'Official Minutes',
    org: 'CSE Rockefeller',
    location: 'Lyon, France',
    title: 'Procès-verbal du Comité Social et Économique',
    subtitle: 'Séance extraordinaire du 26 mars 2026',
    date: '26 March 2026',
    preparedBy: 'Alami Loine — atoopv.com',
    complianceInstance: 'CSE',
    stats: [
      { label: 'Governing Body', value: 'CSE (France)' },
      { label: 'Session', value: 'Extraordinary' },
      { label: 'Members Present', value: '7 of 12' },
      { label: 'Quorum', value: 'Reached' },
    ],
  },
  documentDetails: {
    reportLabel: 'PV-CSE-2026-03-26',
    title: 'Procès-verbal du Comité Social et Économique',
    date: '26 March 2026',
    type: 'Extraordinary Session',
    location: 'Lyon, France',
    preparedBy: 'Alami Loine (PDG ALC SAS, rédacteur du PV)',
    reference: 'Code du travail — Art. L.2315-27 et suivants',
  },
  notice:
    'This document constitutes the official minutes (procès-verbal) of the extraordinary CSE session held on 26 March 2026. It records attendance, deliberations, and formal votes as required by the French Code du travail. It was prepared by the appointed editor on behalf of the elected secretary and is submitted for approval at the next ordinary session.',
  overview: {
    executiveSummary:
      'The extraordinary CSE session opened with a roll call and the validation of the minutes of the 29 January and 12 February sessions. The committee then examined the medical-unfitness (inaptitude) procedure and reclassification search for an affected employee, before proceeding to a formal vote. The elected members contested the adequacy of the reclassification effort; the resolution was carried with reservations recorded.',
    context:
      'The CSE was convened outside the ordinary calendar to consult on a statutory unfitness procedure requiring the committee’s opinion before the employer can proceed. Management presented the case; elected CFDT members led the substantive challenge.',
    complianceContext:
      'Governed by the French Code du travail (works-council consultation, Art. L.2315-27; unfitness and reclassification obligations, Art. L.1226-10). The committee’s opinion is advisory but must be formally recorded.',
  },
  attendance: {
    present: [
      { name: 'Adeline Vallée', role: 'Secrétaire Générale, Présidente du CSE', group: 'Direction', arrival: '08:30', departure: '11:10', voteRight: false },
      { name: 'Tara Eyraud', role: 'RRH', group: 'Direction', arrival: '08:30', departure: '11:10', voteRight: false },
      { name: 'Charlotte Bailly', role: 'Suppléante — Secrétaire', group: 'CFDT · ETAM', arrival: '08:30', departure: '11:10', voteRight: false },
      { name: 'Pascal Bonjean', role: 'Titulaire — RS CFDT', group: 'CFDT · CADRES', arrival: '08:30', departure: '11:10', voteRight: true },
      { name: 'Nathalie Coudanne', role: 'Titulaire, Trésorière', group: 'CFDT · ETAM', arrival: '08:30', departure: '11:10', voteRight: true },
      { name: 'Fabienne Minjeaud', role: 'Titulaire', group: 'CFDT · CADRES', arrival: '08:30', departure: '11:10', voteRight: true },
      { name: 'Élodie Leydier', role: 'Titulaire, Secrétaire du CSE', group: 'CFDT · ETAM', arrival: '08:30', departure: '11:10', voteRight: true },
    ],
    absent: [
      { name: 'Yolande Belleville', group: 'CFDT · CADRES', role: 'Titulaire', reason: 'Absence excusée' },
      { name: 'Nathalie Gabarre', group: 'CFDT · ETAM', role: 'Suppléante', reason: 'Absence excusée' },
      { name: 'Freddy Garcia', group: 'Direction', role: 'DG Adjoint', reason: 'Absence excusée' },
      { name: 'Marylise Slotala-Fifre', group: 'CFDT · CADRES', role: 'Titulaire', reason: 'Absence excusée' },
      { name: 'Florent Tosdu', group: 'CFDT · CADRES', role: 'Titulaire', reason: 'Absence excusée' },
    ],
    invited: [
      { name: 'Alami Loine', function: 'PDG ALC SAS (rédacteur du PV)', org: 'atoopv.com', status: 'Present' },
      { name: 'Esther Picard', function: 'Inspectrice du travail', org: 'DREETS Lyon', status: 'Absence excusée' },
      { name: 'Mayada Alsadoun', function: 'Médecin du travail', org: 'Promeom Lyon', status: 'Absence excusée' },
    ],
  },
  agendaItems: [
    {
      title: 'Validation des procès-verbaux (29 janvier & 12 février)',
      summary:
        'The secretary confirmed that the requested amendments to both prior minutes had been incorporated. The committee deferred formal validation until a quorum of signatories was confirmed present, then proceeded to the next point.',
      log: [
        { speaker: 'Adeline Vallée (Présidente)', role: 'neutral', text: 'Opened the session and called for a roll call of members present.' },
        { speaker: 'Élodie Leydier (Secrétaire, CFDT)', role: 'b', text: 'Read the attendance and confirmed that the amendments requested on the January and February minutes had all been validated.' },
        { speaker: 'Pascal Bonjean (RS CFDT)', role: 'b', text: 'Questioned whether enough signatories were present to validate the minutes in session, and proposed deferring the validation.' },
      ],
      alerts: [
        { type: 'decision', subject: 'Validation of prior minutes', fact: 'Amendments incorporated; validation deferred to signatory quorum.', extra: 'To be finalized later in the same session.' },
      ],
      timeline: [
        { date: '29 Jan 2026', text: 'Ordinary session — minutes drafted.' },
        { date: '12 Feb 2026', text: 'Ordinary session — minutes drafted.' },
        { date: '26 Mar 2026', text: 'Amendments confirmed; validation pending signatory quorum.' },
      ],
    },
    {
      title: 'Procédure d’inaptitude et recherche de reclassement',
      summary:
        'Management presented the medical-unfitness procedure and the reclassification search. Elected members challenged the causal link with working conditions and the adequacy of the posts proposed, referencing the internal job board.',
      log: [
        { speaker: 'Tara Eyraud (RRH)', role: 'a', text: 'Presented the unfitness case and the reclassification search conducted, and responded to members’ questions on the process.' },
        { speaker: 'Élu CFDT', role: 'b', text: 'Raised a potential causal link between the employee’s working conditions and the unfitness, and questioned whether the reclassification effort was made in good faith.' },
        { speaker: 'Élu CFDT (challenger)', role: 'b', text: 'Referenced specific posts on the internal job board (gestionnaire back-office) and questioned why they were not offered.' },
      ],
      alerts: [
        { type: 'tension', subject: 'Adequacy of reclassification effort', fact: 'Elected members dispute that all suitable posts were offered.', extra: 'Management maintains the search complied with obligations.' },
        { type: 'projection', subject: 'Formal offer of reclassification', fact: 'A written reclassification proposal is expected before the next session.', extra: 'Responsible: HR Department.' },
      ],
      timeline: [],
    },
  ],
  votes: [
    {
      question: 'Avis du CSE sur la procédure d’inaptitude et de reclassement',
      date: '26 March 2026',
      rows: [
        { voter: 'Pascal Bonjean', group: 'CFDT · CADRES', vote: 'Unfavorable' },
        { voter: 'Nathalie Coudanne', group: 'CFDT · ETAM', vote: 'Unfavorable' },
        { voter: 'Fabienne Minjeaud', group: 'CFDT · CADRES', vote: 'Unfavorable' },
        { voter: 'Élodie Leydier', group: 'CFDT · ETAM', vote: 'Unfavorable' },
      ],
      summary: { favorable: 0, unfavorable: 4, abstention: 0 },
      result: 'Unfavorable opinion recorded. CFDT voted unfavorable; reservations on the reclassification effort minuted.',
    },
  ],
  numericalData: [
    {
      label: 'Attendance by college',
      chartType: 'bar',
      series: [
        { name: 'Direction', value: 2 },
        { name: 'CFDT · ETAM', value: 3 },
        { name: 'CFDT · CADRES', value: 2 },
        { name: 'Invités', value: 1 },
      ],
    },
    {
      label: 'Vote distribution',
      chartType: 'donut',
      series: [
        { name: 'Favorable', value: 0 },
        { name: 'Unfavorable', value: 4 },
        { name: 'Abstention', value: 0 },
      ],
    },
  ],
  speakerAnalysis: {
    intro:
      'Analysis of verbal contributions, decision-making authority, and engagement of each identified speaker during the extraordinary CSE session, derived from the transcript.',
    speakers: [
      { id: 'Intervenant 4', name: 'Tara Eyraud (RRH)', role: 'Management spokesperson', interventions: 15, engagement: 5, stance: 'Institutional — presents and defends the HR process' },
      { id: 'Intervenant 6', name: 'Élu CFDT', role: 'Elected member — most active challenger', interventions: 6, engagement: 5, stance: 'Employee advocacy — challenges reclassification' },
      { id: 'Intervenant 5', name: 'Élu CFDT', role: 'Elected member', interventions: 4, engagement: 4, stance: 'Substantive challenge on causal link' },
      { id: 'Intervenant 2', name: 'Élodie Leydier (Secrétaire)', role: 'Secretary of the CSE', interventions: 5, engagement: 3, stance: 'Procedural — roll call and agenda' },
      { id: 'Intervenant 1', name: 'Adeline Vallée (Présidente)', role: 'Chair', interventions: 3, engagement: 2, stance: 'Neutral — opens and steers the session' },
    ],
  },
  findings: {
    score: 88,
    summary:
      'Overall compliance is strong: the consultation was convened and recorded correctly and the vote was formally minuted. The principal risk is the disputed adequacy of the reclassification search, which should be documented in writing to satisfy Art. L.1226-10.',
    riskExposure: 'Low to Medium',
    metrics: [
      { label: 'Labor Law Compliance', value: 92 },
      { label: 'Documentation Quality', value: 85 },
      { label: 'Risk Exposure', value: 24 },
      { label: 'Data Completeness', value: 90 },
    ],
    counts: { criticalRisks: 1, recommendations: 4, compliantAreas: 11, missingDocuments: 2 },
    risks: [
      { title: 'Reclassification effort not fully documented', description: 'The written record of posts studied and offered is incomplete relative to the members’ challenge.', riskLevel: 'High', impact: 4, confidence: 90, related: 'Code du travail Art. L.1226-10' },
      { title: 'Prior minutes validated outside quorum window', description: 'Validation of the Jan/Feb minutes was deferred pending signatory quorum; ensure it is recorded once completed.', riskLevel: 'Medium', impact: 3, confidence: 78, related: 'Code du travail Art. L.2315-34' },
      { title: 'Occupational physician opinion absent from session', description: 'The médecin du travail was excused; ensure the written opinion is annexed to the file.', riskLevel: 'Medium', impact: 3, confidence: 75, related: 'Code du travail Art. R.4624-42' },
    ],
    missingDocuments: [
      { title: 'Written reclassification proposal', description: 'Formal written offer of reclassification posts to the employee.' },
      { title: 'Occupational physician’s written opinion', description: 'Signed opinion supporting the unfitness determination.' },
    ],
    complianceReferences: [
      { code: 'Art. L.2315-27', title: 'CSE consultation obligation', status: 'Compliant' },
      { code: 'Art. L.1226-10', title: 'Reclassification search obligation', status: 'Partial' },
      { code: 'Art. R.4624-42', title: 'Occupational physician opinion', status: 'Missing' },
      { code: 'Art. L.2315-34', title: 'Minutes drafting & validation', status: 'Compliant' },
    ],
    recommendations: [
      { title: 'Annex the written reclassification search', description: 'Attach the list of posts studied and the reasons any were excluded.' },
      { title: 'Record minutes validation', description: 'Minute the formal validation of the January and February PVs once signatories confirm.' },
      { title: 'Attach the physician’s opinion', description: 'Include the médecin du travail’s written opinion in the case file.' },
      { title: 'Send the formal reclassification offer', description: 'Issue and log the written reclassification proposal before the next session.' },
    ],
  },
};
