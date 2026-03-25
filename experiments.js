// experiments.js — Named experiment configurations
// Each experiment overrides DEFAULT_PARAMS and selects a pipeline.

const EXPERIMENTS = {
  baseline: {
    id: 'baseline',
    label: 'Baseline',
    description: 'Standard model with strategic retirement, symmetric election/Senate probabilities.',
    pipeline: 'baseline',
    params: {},
  },

  noStrategicRetirement: {
    id: 'noStrategicRetirement',
    label: 'No Strategic Retirement',
    description: 'Justices do not strategically time retirement to align with a co-partisan president.',
    pipeline: 'noStrategicRetirement',
    params: { weightStrategicRetirement: 0 },
  },

  noDGConfirmations: {
    id: 'noDGConfirmations',
    label: 'No Divided-Gov Confirmations',
    description: 'Vacancies persist until unified government can fill them (Garland scenario).',
    pipeline: 'noDGConfirmations',
    params: {},
  },

  courtPackingFuture: {
    id: 'courtPackingFuture',
    label: 'Court Packing (Future)',
    description: 'Add 4 seats at the first unified Democratic government after 2026.',
    pipeline: 'courtPacking',
    params: {
      courtPackN: 4,
      courtPackingParty: 1, // Dem only
      courtPackingStartYear: 2026,
    },
  },

  courtPacking2021: {
    id: 'courtPacking2021',
    label: 'Court Packing (2021 Retroactive)',
    description: 'Hypothetical: Democrats packed 4 seats in 2021. Court starts at 13 justices (7D-6R).',
    pipeline: 'baseline',
    params: {
      startingCourt: STARTING_COURT_PACKED_2021,
    },
  },

  termLimits18: {
    id: 'termLimits18',
    label: 'Term Limits (18 years)',
    description: 'Mandatory exit after 18 years, staggered by seniority starting 2026.',
    pipeline: 'termLimits',
    params: { termLimitYears: 18 },
  },

  gopSenateAdvantage: {
    id: 'gopSenateAdvantage',
    label: 'GOP Senate Advantage',
    description: 'Senate map favors Republicans due to geographic clustering of Democratic voters.',
    pipeline: 'noDGConfirmations',
    params: {
      // Increase Dem switch probs by +0.10 (harder for Dems to hold Senate)
      demUniPres: BASELINE_PROBS.switchUniPres + 0.10,
      demDivPres: BASELINE_PROBS.switchDivPres + 0.10,
      demUniMid:  BASELINE_PROBS.switchUniMid  + 0.10,
      demDivMid:  BASELINE_PROBS.switchDivMid  + 0.10,
      // Decrease Rep switch probs by -0.10 (easier for Reps to hold Senate)
      repUniPres: BASELINE_PROBS.switchUniPres - 0.10,
      repDivPres: BASELINE_PROBS.switchDivPres - 0.10,
      repUniMid:  BASELINE_PROBS.switchUniMid  - 0.10,
      repDivMid:  BASELINE_PROBS.switchDivMid  - 0.10,
    },
  },

  titForTat: {
    id: 'titForTat',
    label: 'Tit-for-Tat Court Packing',
    description: 'Each party adds seats when it gains unified government, leading to an ever-expanding court.',
    pipeline: 'titForTat',
    params: {
      courtPackN: 2,
      courtPackingStartYear: 2026,
    },
  },

  termLimits9: {
    id: 'termLimits9',
    label: 'Term Limits (9 years)',
    description: 'Mandatory 9-year terms, staggered by seniority. Each president appoints 4 justices per term.',
    pipeline: 'termLimits',
    params: { termLimitYears: 9 },
  },

  counterfactual2016: {
    id: 'counterfactual2016',
    label: '2016 Counterfactual',
    description: 'Clinton wins 2016, Garland confirmed. 5-4 liberal court starting 2017.',
    pipeline: 'counterfactual2016',
    params: {
      currentYear: STARTING_YEAR_2016CF,
      startingCourt: STARTING_COURT_2016CF,
      startingDemPresident: STARTING_DEM_PRESIDENT_2016CF,
      startingDemSenMaj: STARTING_DEM_SEN_MAJ_2016CF,
      startingUnifiedGov: STARTING_UNIFIED_GOV_2016CF,
      presidentHistoryInit: PRESIDENT_HISTORY_INIT_2016CF,
      probDemPDD: CF2016_PROBS.probDemPDD,
      probDemPRR: CF2016_PROBS.probDemPRR,
      probDemPRD: CF2016_PROBS.probDemPRD,
      probDemPDR: CF2016_PROBS.probDemPDR,
      demUniPres: CF2016_PROBS.switchUniPres,
      demDivPres: CF2016_PROBS.switchDivPres,
      demUniMid:  CF2016_PROBS.switchUniMid,
      demDivMid:  CF2016_PROBS.switchDivMid,
      repUniPres: CF2016_PROBS.switchUniPres,
      repDivPres: CF2016_PROBS.switchDivPres,
      repUniMid:  CF2016_PROBS.switchUniMid,
      repDivMid:  CF2016_PROBS.switchDivMid,
    },
  },
};

// List of experiment IDs in display order
const EXPERIMENT_ORDER = [
  'baseline',
  'noStrategicRetirement',
  'noDGConfirmations',
  'gopSenateAdvantage',
  'courtPackingFuture',
  'courtPacking2021',
  'titForTat',
  'termLimits18',
  'termLimits9',
  'counterfactual2016',
];
