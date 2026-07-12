// UK Works Council (ICE Regulations) session — showcases the UK region:
// English-language report, findings grounded in ICE Regs / TULRCA. Fictional org.

export const ukWorksCouncilExtraction = {
  cover: {
    reportType: 'Official Minutes',
    org: 'Albion Logistics Ltd',
    location: 'Manchester, United Kingdom',
    title: 'Minutes of the Employee Forum',
    subtitle: 'Quarterly consultation meeting — 2 June 2026',
    date: '2 June 2026',
    preparedBy: 'SIRUS · reviewed by D. Okafor',
    complianceInstance: 'WC',
    stats: [
      { label: 'Body', value: 'Works Council (ICE)' },
      { label: 'Session', value: 'Quarterly' },
      { label: 'Members Present', value: '8 of 10' },
      { label: 'Quorum', value: 'Reached' },
    ],
  },
  documentDetails: {
    reportLabel: 'WC-MIN-2026-06-02',
    title: 'Minutes of the Employee Forum',
    date: '2 June 2026',
    type: 'Quarterly consultation',
    location: 'Manchester DC, Meeting Room A',
    preparedBy: 'Daniel Okafor (Forum Secretary)',
    reference: 'ICE Regulations 2004, reg. 20',
  },
  notice:
    'These minutes record the quarterly information and consultation meeting held under the company’s negotiated ICE agreement. They summarise the information provided by management, the consultation undertaken, and the positions recorded by employee representatives.',
  overview: {
    executiveSummary:
      'Management presented the warehouse automation programme for the Manchester distribution centre, expected to affect 46 roles over 18 months. Representatives requested the underlying business case and challenged the redeployment provisions. A formal opinion was recorded; consultation continues at an extraordinary session in July.',
    context:
      'The automation programme involves phased introduction of autonomous picking systems. Under regulation 20 of the ICE Regulations 2004, the employer must consult on decisions likely to lead to substantial changes in work organisation or contractual relations.',
    complianceContext:
      'Governed by the Information and Consultation of Employees Regulations 2004 and, for any collective redundancies, section 188 TULRCA 1992.',
  },
  attendance: {
    present: [
      { name: 'Sarah Whitfield', role: 'Forum Chair (employee rep)', group: 'Warehouse', arrival: '10:00', departure: '12:30', voteRight: true },
      { name: 'Daniel Okafor', role: 'Forum Secretary (employee rep)', group: 'Transport', arrival: '10:00', departure: '12:30', voteRight: true },
      { name: 'Priya Sharma', role: 'Employee representative', group: 'Office & Admin', arrival: '10:00', departure: '12:30', voteRight: true },
      { name: 'Liam Gallagher', role: 'Employee representative', group: 'Warehouse', arrival: '10:05', departure: '12:30', voteRight: true },
      { name: 'Emma Clarke', role: 'HR Director', group: 'Management', arrival: '10:00', departure: '12:30', voteRight: false },
      { name: 'James Holt', role: 'Operations Director', group: 'Management', arrival: '10:00', departure: '11:45', voteRight: false },
    ],
    absent: [
      { name: 'Tom Bradley', group: 'Transport', role: 'Employee representative', reason: 'Annual leave' },
      { name: 'Grace Lin', group: 'Office & Admin', role: 'Employee representative', reason: 'Sickness absence' },
    ],
    invited: [
      { name: 'Rachel Adeyemi', function: 'External automation consultant', org: 'Fulcrum Advisory', status: 'Item 2 only' },
    ],
  },
  agendaItems: [
    {
      title: 'Item 1 — Approval of March minutes & matters arising',
      summary: 'The March minutes were approved without amendment. One matter arising: the canteen refurbishment timeline was confirmed for August.',
      log: [
        { speaker: 'Sarah Whitfield (Chair)', role: 'b', text: 'Opened the meeting, confirmed quorum and asked for comments on the March minutes.' },
        { speaker: 'Emma Clarke (HR Director)', role: 'a', text: 'Confirmed the canteen refurbishment will start in the first week of August as previously indicated.' },
      ],
      alerts: [
        { type: 'decision', subject: 'March minutes', fact: 'Approved unanimously.', extra: 'Signed by Chair and Secretary.' },
      ],
      timeline: [],
    },
    {
      title: 'Item 2 — Warehouse automation programme (consultation)',
      summary:
        'Management presented the phased automation of the Manchester DC affecting 46 roles. Representatives requested the full business case and challenged redeployment terms; the forum recorded a preliminary opinion pending further information.',
      log: [
        { speaker: 'James Holt (Operations Director)', role: 'a', text: 'Presented the 18-month automation phasing and stated 46 roles are in scope, with an ambition to redeploy at least 30.' },
        { speaker: 'Rachel Adeyemi (Consultant)', role: 'neutral', text: 'Summarised the technology assessment and benchmarked attrition-led transitions at comparable sites.' },
        { speaker: 'Liam Gallagher (Employee rep)', role: 'b', text: 'Challenged the absence of the business case and asked whether compulsory redundancies are ruled out.' },
        { speaker: 'Priya Sharma (Employee rep)', role: 'b', text: 'Requested the retraining budget per affected employee and the selection criteria for redeployment.' },
        { speaker: 'Emma Clarke (HR Director)', role: 'a', text: 'Committed to sharing the business case under confidentiality and confirmed no decision on redundancies has been taken.' },
      ],
      alerts: [
        { type: 'tension', subject: 'Business case disclosure', fact: 'Representatives consider consultation incomplete without the business case.', extra: 'Management to provide under reg. 25 confidentiality.' },
        { type: 'projection', subject: 'Extraordinary consultation session', fact: 'Scheduled for 14 July 2026 once the business case is shared.', extra: 'Responsible: HR Director.' },
        { type: 'unresolved', subject: 'Redeployment guarantees', fact: 'No commitment yet on ruling out compulsory redundancies.', extra: 'To be addressed in July session.' },
      ],
      timeline: [
        { date: '2 Jun 2026', text: 'Programme presented to the forum.' },
        { date: '20 Jun 2026', text: 'Business case to be shared with representatives.' },
        { date: '14 Jul 2026', text: 'Extraordinary consultation session.' },
      ],
    },
    {
      title: 'Item 3 — Health & safety quarterly update',
      summary: 'Reportable incidents fell from 7 to 3 quarter-on-quarter. Forklift near-miss actions closed.',
      log: [
        { speaker: 'James Holt (Operations Director)', role: 'a', text: 'Reported three RIDDOR-reportable incidents this quarter, down from seven, and confirmed closure of the forklift near-miss actions.' },
      ],
      alerts: [
        { type: 'decision', subject: 'H&S update', fact: 'Noted by the forum.', extra: 'Next audit scheduled for September.' },
      ],
      timeline: [],
    },
  ],
  votes: [
    {
      question: 'Preliminary opinion: consultation on automation cannot conclude before the business case is disclosed',
      date: '2 June 2026',
      rows: [
        { voter: 'Sarah Whitfield', group: 'Warehouse', vote: 'For' },
        { voter: 'Daniel Okafor', group: 'Transport', vote: 'For' },
        { voter: 'Priya Sharma', group: 'Office & Admin', vote: 'For' },
        { voter: 'Liam Gallagher', group: 'Warehouse', vote: 'For' },
      ],
      summary: { favorable: 4, unfavorable: 0, abstention: 0 },
      result: 'Carried unanimously by the employee representatives; recorded as the forum’s formal position.',
    },
  ],
  numericalData: [
    {
      label: 'Roles in scope by phase',
      chartType: 'bar',
      series: [
        { name: 'Phase 1 (Q4 26)', value: 14 },
        { name: 'Phase 2 (Q2 27)', value: 18 },
        { name: 'Phase 3 (Q4 27)', value: 14 },
      ],
    },
    {
      label: 'Reportable incidents (quarter)',
      chartType: 'bar',
      series: [
        { name: 'Q4 25', value: 9 },
        { name: 'Q1 26', value: 7 },
        { name: 'Q2 26', value: 3 },
      ],
    },
  ],
  speakerAnalysis: {
    intro: 'Analysis of contributions during the quarterly Employee Forum of 2 June 2026, derived from the transcript.',
    speakers: [
      { id: 'Speaker 1', name: 'Sarah Whitfield', role: 'Forum Chair', interventions: 8, engagement: 4, stance: 'Procedural stewardship, presses for completeness' },
      { id: 'Speaker 2', name: 'James Holt', role: 'Operations Director', interventions: 7, engagement: 4, stance: 'Presents and defends the programme' },
      { id: 'Speaker 3', name: 'Liam Gallagher', role: 'Employee rep', interventions: 6, engagement: 5, stance: 'Most active challenger — job security' },
      { id: 'Speaker 4', name: 'Priya Sharma', role: 'Employee rep', interventions: 5, engagement: 4, stance: 'Retraining and selection criteria' },
      { id: 'Speaker 5', name: 'Emma Clarke', role: 'HR Director', interventions: 5, engagement: 3, stance: 'Concessive — commits to disclosure' },
    ],
  },
  findings: {
    score: 84,
    summary:
      'The consultation was properly convened and recorded. The main gap is the undisclosed business case: consultation on a decision of this magnitude cannot be regarded as complete without it. If headcount reductions proceed, section 188 TULRCA duties must be anticipated.',
    riskExposure: 'Low to Medium',
    metrics: [
      { label: 'ICE Regs Compliance', value: 86 },
      { label: 'Documentation Quality', value: 88 },
      { label: 'Risk Exposure', value: 30 },
      { label: 'Data Completeness', value: 83 },
    ],
    counts: { criticalRisks: 1, recommendations: 3, compliantAreas: 9, missingDocuments: 2 },
    risks: [
      { title: 'Consultation without the business case', description: 'Withholding the business case undermines the adequacy of consultation on substantial workplace change.', riskLevel: 'High', impact: 4, confidence: 88, related: 'ICE Regulations 2004, reg. 20' },
      { title: 'Potential collective redundancy duties', description: 'If 20+ redundancies are proposed within 90 days, formal collective consultation obligations will apply.', riskLevel: 'Medium', impact: 4, confidence: 80, related: 'TULRCA 1992, s.188' },
      { title: 'Confidentiality handling of disclosed material', description: 'Business case disclosure must follow the agreement’s confidentiality provisions to protect both parties.', riskLevel: 'Low', impact: 2, confidence: 75, related: 'ICE Regulations 2004, reg. 25' },
    ],
    missingDocuments: [
      { title: 'Automation business case', description: 'Full business case underpinning the 46-role impact assessment.' },
      { title: 'Redeployment & retraining plan', description: 'Per-employee retraining budget and redeployment selection criteria.' },
    ],
    complianceReferences: [
      { code: 'ICE 2004 reg. 20', title: 'Duty to inform and consult', status: 'Partial' },
      { code: 'ICE 2004 reg. 25', title: 'Confidential information', status: 'Compliant' },
      { code: 'TULRCA 1992 s.188', title: 'Collective redundancy consultation', status: 'Compliant' },
      { code: 'RIDDOR 2013', title: 'Incident reporting', status: 'Compliant' },
    ],
    recommendations: [
      { title: 'Disclose the business case', description: 'Share under reg. 25 confidentiality before the July session so consultation can conclude properly.' },
      { title: 'Prepare s.188 readiness', description: 'Map the redundancy threshold scenario and required notification timelines now.' },
      { title: 'Publish redeployment criteria', description: 'Agree objective selection criteria and the retraining budget with the forum.' },
    ],
  },
};
