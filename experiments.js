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
    description: 'Add 4 seats at the first unified Democratic government after 2025.',
    pipeline: 'courtPacking',
    params: {
      courtPackN: 4,
      courtPackingParty: 1, // Dem only
      courtPackingStartYear: 2025,
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
    description: 'Mandatory exit after 18 years, staggered by seniority starting 2025.',
    pipeline: 'termLimits',
    params: { termLimitYears: 18 },
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
  'courtPackingFuture',
  'courtPacking2021',
  'termLimits18',
  'counterfactual2016',
];
