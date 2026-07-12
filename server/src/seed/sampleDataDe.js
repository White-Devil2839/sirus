// German Betriebsrat session — showcases the DE region: German-language report,
// findings grounded in the BetrVG. Deutsche Maschinenwerke GmbH (fictional).

export const betriebsratExtraction = {
  cover: {
    reportType: 'Sitzungsprotokoll',
    org: 'Deutsche Maschinenwerke GmbH',
    location: 'Stuttgart, Deutschland',
    title: 'Protokoll der Betriebsratssitzung',
    subtitle: 'Ordentliche Sitzung vom 18. Juni 2026',
    date: '18 June 2026',
    preparedBy: 'SIRUS · geprüft durch K. Hoffmann',
    complianceInstance: 'BR',
    stats: [
      { label: 'Gremium', value: 'Betriebsrat (DE)' },
      { label: 'Sitzung', value: 'Ordentlich' },
      { label: 'Anwesend', value: '9 von 11' },
      { label: 'Beschlussfähig', value: 'Ja' },
    ],
  },
  documentDetails: {
    reportLabel: 'BR-PROT-2026-06-18',
    title: 'Protokoll der Betriebsratssitzung',
    date: '18 June 2026',
    type: 'Ordentliche Sitzung',
    location: 'Stuttgart, Werk 2',
    preparedBy: 'Katrin Hoffmann (Schriftführerin)',
    reference: 'BetrVG §§ 29, 34, 87',
  },
  notice:
    'Dieses Protokoll dokumentiert die ordentliche Sitzung des Betriebsrats gemäß § 34 BetrVG. Es enthält die Anwesenheit, die Beratungen und die gefassten Beschlüsse. Das Protokoll wird vom Vorsitzenden und der Schriftführerin unterzeichnet und den Mitgliedern zur Genehmigung vorgelegt.',
  overview: {
    executiveSummary:
      'Der Betriebsrat beriet über die geplante Einführung einer elektronischen Zeiterfassungssoftware sowie die Überstundenregelung für das dritte Quartal. Die Einführung der Software wurde von der Zustimmung zu einer Betriebsvereinbarung abhängig gemacht; die Überstundenregelung wurde mit Auflagen beschlossen.',
    context:
      'Die Geschäftsführung plant die konzernweite Einführung des Systems "TimeTrack Pro". Der Betriebsrat hat hierzu ein Mitbestimmungsrecht nach § 87 Abs. 1 Nr. 6 BetrVG, da das System geeignet ist, Verhalten und Leistung der Arbeitnehmer zu überwachen.',
    complianceContext:
      'Maßgeblich sind das Betriebsverfassungsgesetz (insb. §§ 29, 34, 80, 87 BetrVG) sowie die DSGVO hinsichtlich der Verarbeitung von Beschäftigtendaten.',
  },
  attendance: {
    present: [
      { name: 'Jürgen Baumann', role: 'Vorsitzender des Betriebsrats', group: 'IG Metall', arrival: '09:00', departure: '12:15', voteRight: true },
      { name: 'Katrin Hoffmann', role: 'Schriftführerin', group: 'IG Metall', arrival: '09:00', departure: '12:15', voteRight: true },
      { name: 'Stefan Krüger', role: 'Stellv. Vorsitzender', group: 'IG Metall', arrival: '09:00', departure: '12:15', voteRight: true },
      { name: 'Ayşe Demir', role: 'Betriebsratsmitglied', group: 'ver.di', arrival: '09:05', departure: '12:15', voteRight: true },
      { name: 'Martin Vogel', role: 'Betriebsratsmitglied', group: 'IG Metall', arrival: '09:00', departure: '11:40', voteRight: true },
      { name: 'Petra Lang', role: 'Betriebsratsmitglied', group: 'unabhängig', arrival: '09:00', departure: '12:15', voteRight: true },
    ],
    absent: [
      { name: 'Thomas Richter', group: 'IG Metall', role: 'Betriebsratsmitglied', reason: 'Urlaub — Ersatzmitglied geladen' },
      { name: 'Sabine Wolf', group: 'ver.di', role: 'Betriebsratsmitglied', reason: 'Krankheit' },
    ],
    invited: [
      { name: 'Dr. Frank Neumann', function: 'Geschäftsführer', org: 'Deutsche Maschinenwerke GmbH', status: 'TOP 2 anwesend' },
      { name: 'Julia Sperling', function: 'HR-Leiterin', org: 'Deutsche Maschinenwerke GmbH', status: 'TOP 2–3 anwesend' },
    ],
  },
  agendaItems: [
    {
      title: 'TOP 1 — Genehmigung des Protokolls der Sitzung vom 21. Mai',
      summary:
        'Das Protokoll der letzten Sitzung wurde ohne Änderungen genehmigt.',
      log: [
        { speaker: 'Jürgen Baumann (Vorsitzender)', role: 'b', text: 'Eröffnete die Sitzung, stellte die Beschlussfähigkeit fest und rief TOP 1 auf.' },
        { speaker: 'Katrin Hoffmann (Schriftführerin)', role: 'b', text: 'Berichtete, dass keine Einwände gegen das Protokoll der Mai-Sitzung eingegangen sind.' },
      ],
      alerts: [
        { type: 'decision', subject: 'Protokoll Mai-Sitzung', fact: 'Einstimmig genehmigt.', extra: 'Ablage im Betriebsratsbüro.' },
      ],
      timeline: [],
    },
    {
      title: 'TOP 2 — Einführung der Zeiterfassungssoftware "TimeTrack Pro"',
      summary:
        'Die Geschäftsführung stellte das System vor. Der Betriebsrat machte die Zustimmung von einer Betriebsvereinbarung abhängig, die Auswertungen personenbezogener Leistungsdaten ausschließt.',
      log: [
        { speaker: 'Dr. Frank Neumann (Geschäftsführer)', role: 'a', text: 'Stellte die geplante Einführung von TimeTrack Pro vor und betonte die gesetzliche Pflicht zur Arbeitszeiterfassung.' },
        { speaker: 'Stefan Krüger (Stellv. Vorsitzender)', role: 'b', text: 'Wies auf das Mitbestimmungsrecht nach § 87 Abs. 1 Nr. 6 BetrVG hin und forderte den Abschluss einer Betriebsvereinbarung vor der Einführung.' },
        { speaker: 'Ayşe Demir (Betriebsratsmitglied)', role: 'b', text: 'Fragte nach der Speicherdauer der Daten und der Möglichkeit individueller Leistungsauswertungen.' },
        { speaker: 'Julia Sperling (HR-Leiterin)', role: 'a', text: 'Sagte zu, einen Entwurf der Betriebsvereinbarung mit Löschfristen und Auswertungsverboten vorzulegen.' },
      ],
      alerts: [
        { type: 'unresolved', subject: 'Betriebsvereinbarung TimeTrack Pro', fact: 'Entwurf der Geschäftsführung steht aus.', extra: 'Vorlage bis 05. Juli zugesagt.' },
        { type: 'tension', subject: 'Leistungsüberwachung', fact: 'Betriebsrat lehnt individuelle Leistungsauswertungen ab.', extra: 'Geschäftsführung prüft technische Deaktivierung.' },
      ],
      timeline: [
        { date: '18 Jun 2026', text: 'Vorstellung des Systems im Betriebsrat.' },
        { date: '05 Jul 2026', text: 'Zugesagte Vorlage des BV-Entwurfs.' },
        { date: '16 Jul 2026', text: 'Geplante Beschlussfassung in außerordentlicher Sitzung.' },
      ],
    },
    {
      title: 'TOP 3 — Überstundenregelung Q3',
      summary:
        'Beratung über die beantragten Mehrarbeitsstunden in der Fertigung. Zustimmung mit Auflagen erteilt.',
      log: [
        { speaker: 'Julia Sperling (HR-Leiterin)', role: 'a', text: 'Beantragte 1.200 Mehrarbeitsstunden für die Fertigung im dritten Quartal wegen erhöhter Auftragslage.' },
        { speaker: 'Petra Lang (Betriebsratsmitglied)', role: 'b', text: 'Forderte einen Freiwilligkeitsvorbehalt und die Einhaltung der Höchstarbeitszeiten nach ArbZG.' },
      ],
      alerts: [
        { type: 'decision', subject: 'Mehrarbeit Q3', fact: 'Zustimmung nach § 87 Abs. 1 Nr. 3 BetrVG mit Auflagen erteilt.', extra: 'Freiwilligkeit, Monatsbericht an den BR.' },
      ],
      timeline: [],
    },
  ],
  votes: [
    {
      question: 'Zustimmung zur Mehrarbeitsregelung Q3 (mit Auflagen)',
      date: '18 June 2026',
      rows: [
        { voter: 'Jürgen Baumann', group: 'IG Metall', vote: 'Ja' },
        { voter: 'Katrin Hoffmann', group: 'IG Metall', vote: 'Ja' },
        { voter: 'Stefan Krüger', group: 'IG Metall', vote: 'Ja' },
        { voter: 'Ayşe Demir', group: 'ver.di', vote: 'Ja' },
        { voter: 'Martin Vogel', group: 'IG Metall', vote: 'Enthaltung' },
        { voter: 'Petra Lang', group: 'unabhängig', vote: 'Ja' },
      ],
      summary: { favorable: 5, unfavorable: 0, abstention: 1 },
      result: 'Angenommen — 5 Ja-Stimmen, 1 Enthaltung. Auflagen im Beschlusstext protokolliert.',
    },
  ],
  numericalData: [
    {
      label: 'Beantragte Mehrarbeitsstunden nach Abteilung (Q3)',
      chartType: 'bar',
      series: [
        { name: 'Fertigung', value: 720 },
        { name: 'Montage', value: 310 },
        { name: 'Logistik', value: 170 },
      ],
    },
    {
      label: 'Abstimmungsergebnis TOP 3',
      chartType: 'donut',
      series: [
        { name: 'Ja', value: 5 },
        { name: 'Nein', value: 0 },
        { name: 'Enthaltung', value: 1 },
      ],
    },
  ],
  speakerAnalysis: {
    intro:
      'Analyse der Redebeiträge der ordentlichen Betriebsratssitzung vom 18. Juni 2026, abgeleitet aus dem Transkript.',
    speakers: [
      { id: 'Sprecher 1', name: 'Jürgen Baumann', role: 'BR-Vorsitzender', interventions: 9, engagement: 4, stance: 'Sitzungsleitung — neutral moderierend' },
      { id: 'Sprecher 2', name: 'Stefan Krüger', role: 'Stellv. Vorsitzender', interventions: 7, engagement: 5, stance: 'Fordert Betriebsvereinbarung vor Einführung' },
      { id: 'Sprecher 3', name: 'Dr. Frank Neumann', role: 'Geschäftsführer', interventions: 6, engagement: 4, stance: 'Vertritt zügige Einführung des Systems' },
      { id: 'Sprecher 4', name: 'Ayşe Demir', role: 'BR-Mitglied', interventions: 5, engagement: 4, stance: 'Datenschutz und Speicherfristen' },
      { id: 'Sprecher 5', name: 'Julia Sperling', role: 'HR-Leiterin', interventions: 5, engagement: 3, stance: 'Vermittelnd, sagt BV-Entwurf zu' },
    ],
  },
  findings: {
    score: 76,
    summary:
      'Die Sitzung ist formal ordnungsgemäß dokumentiert. Wesentliches Risiko: Die Einführung von TimeTrack Pro darf ohne abgeschlossene Betriebsvereinbarung nicht erfolgen (§ 87 Abs. 1 Nr. 6 BetrVG). Zudem fehlt die datenschutzrechtliche Folgenabschätzung.',
    riskExposure: 'Medium',
    metrics: [
      { label: 'BetrVG-Konformität', value: 78 },
      { label: 'Dokumentationsqualität', value: 84 },
      { label: 'Risikoexposition', value: 42 },
      { label: 'Datenvollständigkeit', value: 81 },
    ],
    counts: { criticalRisks: 1, recommendations: 4, compliantAreas: 8, missingDocuments: 3 },
    risks: [
      { title: 'Einführung ohne Betriebsvereinbarung', description: 'Ein Rollout von TimeTrack Pro vor Abschluss der BV verletzt das Mitbestimmungsrecht.', riskLevel: 'High', impact: 5, confidence: 92, related: '§ 87 Abs. 1 Nr. 6 BetrVG' },
      { title: 'Fehlende Datenschutz-Folgenabschätzung', description: 'Für die systematische Überwachung von Beschäftigten ist eine DSFA erforderlich.', riskLevel: 'Medium', impact: 4, confidence: 85, related: 'Art. 35 DSGVO' },
      { title: 'Höchstarbeitszeiten bei Mehrarbeit', description: 'Die genehmigten Mehrarbeitsstunden müssen gegen die ArbZG-Grenzen laufend geprüft werden.', riskLevel: 'Medium', impact: 3, confidence: 78, related: '§ 3 ArbZG' },
      { title: 'Ersatzmitglied-Ladung nicht dokumentiert', description: 'Die ordnungsgemäße Ladung des Ersatzmitglieds für T. Richter ist im Protokoll nicht nachgewiesen.', riskLevel: 'Low', impact: 2, confidence: 70, related: '§ 25 BetrVG' },
    ],
    missingDocuments: [
      { title: 'Entwurf der Betriebsvereinbarung', description: 'Zugesagter BV-Entwurf zu TimeTrack Pro liegt noch nicht vor.' },
      { title: 'Datenschutz-Folgenabschätzung', description: 'DSFA für die Verarbeitung von Beschäftigtendaten fehlt.' },
      { title: 'Ladungsnachweis Ersatzmitglied', description: 'Nachweis der Ladung des Ersatzmitglieds gem. § 25 BetrVG.' },
    ],
    complianceReferences: [
      { code: '§ 29 BetrVG', title: 'Einberufung der Sitzung', status: 'Compliant' },
      { code: '§ 34 BetrVG', title: 'Sitzungsniederschrift', status: 'Compliant' },
      { code: '§ 87 Abs. 1 Nr. 6 BetrVG', title: 'Mitbestimmung technische Überwachung', status: 'Partial' },
      { code: 'Art. 35 DSGVO', title: 'Datenschutz-Folgenabschätzung', status: 'Missing' },
    ],
    recommendations: [
      { title: 'BV vor Rollout abschließen', description: 'Einführung von TimeTrack Pro erst nach unterzeichneter Betriebsvereinbarung.' },
      { title: 'DSFA einfordern', description: 'Datenschutz-Folgenabschätzung vor Beschlussfassung vorlegen lassen.' },
      { title: 'Mehrarbeits-Monitoring', description: 'Monatlicher Bericht über geleistete Mehrarbeit an den Betriebsrat.' },
      { title: 'Ladungspraxis dokumentieren', description: 'Ladung von Ersatzmitgliedern künftig im Protokoll vermerken.' },
    ],
  },
};
