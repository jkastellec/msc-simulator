// ui.js — Parameter controls, event wiring, progress reporting

let simulationResults = {}; // experimentId -> result
let selectedExperiments = ['baseline'];
let isRunning = false;

// ============================================================
// INITIALIZATION
// ============================================================

function initUI() {
  renderExperimentList();
  renderAdvancedParams();
  setupEventListeners();
}

// ============================================================
// EXPERIMENT LIST
// ============================================================

function renderExperimentList() {
  const container = document.getElementById('experiment-list');
  container.innerHTML = '';

  EXPERIMENT_ORDER.forEach(id => {
    const exp = EXPERIMENTS[id];
    const div = document.createElement('div');
    div.className = 'experiment-item' + (selectedExperiments.includes(id) ? ' selected' : '');
    div.innerHTML = `
      <input type="checkbox" id="exp-${id}" ${selectedExperiments.includes(id) ? 'checked' : ''}>
      <div>
        <div>${exp.label}</div>
        <div class="experiment-desc">${exp.description}</div>
      </div>
    `;
    div.addEventListener('click', (e) => {
      if (e.target.tagName === 'INPUT') return;
      const cb = div.querySelector('input');
      cb.checked = !cb.checked;
      cb.dispatchEvent(new Event('change'));
    });
    div.querySelector('input').addEventListener('change', (e) => {
      if (e.target.checked) {
        if (!selectedExperiments.includes(id)) selectedExperiments.push(id);
      } else {
        selectedExperiments = selectedExperiments.filter(x => x !== id);
      }
      renderExperimentList();
    });
    container.appendChild(div);
  });
}

// ============================================================
// ADVANCED PARAMETERS
// ============================================================

const PARAM_DEFS = [
  { group: 'Presidential Elections', subtitle: 'Probability of Democratic presidential win in each scenario (historical average)', params: [
    { key: 'probDemPRD', label: 'Dem wins re-election (1st term)', min: 0, max: 1, step: 0.01 },
    { key: 'probDemPDD', label: 'Dem wins 3rd+ consecutive term', min: 0, max: 1, step: 0.01 },
    { key: 'probDemPDR', label: 'Dem wins vs. Rep incumbent', min: 0, max: 1, step: 0.01 },
    { key: 'probDemPRR', label: 'Dem wins after 2 Rep terms', min: 0, max: 1, step: 0.01 },
  ]},
  { group: 'Senate Control', subtitle: 'Probability the Senate changes party control in a given election', params: [
    { key: 'senateFlipUnified', label: 'Flips under unified gov.',
      min: 0.05, max: 0.80, step: 0.01, type: 'senate',
      labelLeft: 'Low (stable)', labelRight: 'High (volatile)' },
    { key: 'senateFlipDivided', label: 'Flips under divided gov.',
      min: 0.05, max: 0.80, step: 0.01, type: 'senate',
      labelLeft: 'Low (stable)', labelRight: 'High (volatile)' },
  ]},
  { group: 'Nominee Ideology', params: [
    { key: 'demIdeologyMean', label: 'Dem nominees', min: -0.80, max: -0.30, step: 0.01,
      labelLeft: 'Very Liberal', labelRight: 'Moderate', type: 'ideology' },
    { key: 'repIdeologyMean', label: 'Rep nominees', min: 0.30, max: 0.80, step: 0.01,
      labelLeft: 'Moderate', labelRight: 'Very Conservative', type: 'ideology' },
  ]},
  { group: 'Retirement & Replacement', params: [
    { key: 'weightStrategicRetirement', label: 'Strategic ret. weight', min: 0, max: 2, step: 0.1 },
    { key: 'meanAge', label: 'New justice mean age', min: 40, max: 65, step: 1, type: 'number' },
    { key: 'sdAge', label: 'New justice age SD', min: 1, max: 10, step: 0.5, type: 'number' },
  ]},
];

function renderAdvancedParams() {
  const container = document.getElementById('advanced-params');
  container.innerHTML = '';

  PARAM_DEFS.forEach(group => {
    const section = document.createElement('div');
    section.className = 'section collapsed';
    section.innerHTML = `
      <div class="section-header">
        <span>${group.group}</span>
        <span class="arrow">&#9660;</span>
      </div>
      <div class="section-body">
        ${group.subtitle ? `<div class="section-subtitle">${group.subtitle}</div>` : ''}
      </div>
    `;
    const body = section.querySelector('.section-body');
    group.params.forEach(p => {
      const defaultVal = DEFAULT_PARAMS[p.key];
      const row = document.createElement('div');
      row.className = 'param-row';

      if (p.type === 'ideology' || p.type === 'senate') {
        // Slider with labeled endpoints and value below
        let defaultMean;
        if (p.key === 'demIdeologyMean') defaultMean = -0.57;
        else if (p.key === 'repIdeologyMean') defaultMean = 0.57;
        else if (p.key === 'senateFlipUnified') defaultMean = 0.40;
        else if (p.key === 'senateFlipDivided') defaultMean = 0.18;
        else defaultMean = defaultVal || (p.min + p.max) / 2;

        row.className = 'param-row ideology-row';
        row.innerHTML = `
          <label>${p.label}</label>
          <div class="ideology-slider-wrap">
            <span class="ideology-label-left">${p.labelLeft}</span>
            <input type="range" id="param-${p.key}" value="${defaultMean}" min="${p.min}" max="${p.max}" step="${p.step}">
            <span class="ideology-label-right">${p.labelRight}</span>
          </div>
          <div class="ideology-current-value">${p.type === 'senate' ? 'Flip probability' : 'Current mean'}: <span id="val-${p.key}">${defaultMean.toFixed(2)}</span></div>
        `;
        row.querySelector('input[type="range"]').addEventListener('input', (e) => {
          document.getElementById(`val-${p.key}`).textContent = Number(e.target.value).toFixed(2);
        });
      } else if (p.type === 'number') {
        row.innerHTML = `
          <label>${p.label}</label>
          <input type="number" id="param-${p.key}" value="${defaultVal}" min="${p.min}" max="${p.max}" step="${p.step}">
        `;
      } else {
        row.innerHTML = `
          <label>${p.label}</label>
          <input type="range" id="param-${p.key}" value="${defaultVal}" min="${p.min}" max="${p.max}" step="${p.step}">
          <span class="param-value" id="val-${p.key}">${Number(defaultVal).toFixed(2)}</span>
        `;
        row.querySelector('input[type="range"]').addEventListener('input', (e) => {
          document.getElementById(`val-${p.key}`).textContent = Number(e.target.value).toFixed(2);
        });
      }
      body.appendChild(row);
    });

    container.appendChild(section);
  });
}

// Convert ideology mean on [-1,1] to Beta shape params
// Keep concentration (alpha+beta) = 14 (matching default Beta(3,11))
// For Dem: mean_beta = (ideologyMean + 1) / 2, alpha = mean_beta * 14, beta = 14 - alpha
// For Rep: the simulator negates, so mean_beta = (-ideologyMean + 1) / 2
function ideologyMeanToBetaShapes(ideologyMean, party) {
  const concentration = 14;
  let meanBeta;
  if (party === 'dem') {
    meanBeta = (ideologyMean + 1) / 2; // e.g., -0.57 -> 0.215
  } else {
    meanBeta = (-ideologyMean + 1) / 2; // e.g., +0.57 -> 0.215
  }
  const alpha = Math.max(1, meanBeta * concentration);
  const beta = Math.max(1, concentration - alpha);
  return { shape1: alpha, shape2: beta };
}

function getCustomParams() {
  const params = {};
  PARAM_DEFS.forEach(group => {
    group.params.forEach(p => {
      const el = document.getElementById(`param-${p.key}`);
      if (!el) return;
      if (p.type === 'ideology') {
        // Convert slider value to Beta shapes
        const mean = parseFloat(el.value);
        if (p.key === 'demIdeologyMean') {
          const shapes = ideologyMeanToBetaShapes(mean, 'dem');
          params.demShape1 = shapes.shape1;
          params.demShape2 = shapes.shape2;
        } else if (p.key === 'repIdeologyMean') {
          const shapes = ideologyMeanToBetaShapes(mean, 'rep');
          params.repShape1 = shapes.shape1;
          params.repShape2 = shapes.shape2;
        }
      } else if (p.type === 'senate') {
        // Expand 2 simplified sliders into 8 symmetric senate switch params
        const val = parseFloat(el.value);
        if (p.key === 'senateFlipUnified') {
          params.demUniPres = val;
          params.demUniMid  = val;
          params.repUniPres = val;
          params.repUniMid  = val;
        } else if (p.key === 'senateFlipDivided') {
          params.demDivPres = val;
          params.demDivMid  = val;
          params.repDivPres = val;
          params.repDivMid  = val;
        }
      } else {
        params[p.key] = parseFloat(el.value);
      }
    });
  });
  return params;
}

// ============================================================
// EVENT LISTENERS
// ============================================================

function setupEventListeners() {
  document.getElementById('run-btn').addEventListener('click', runSimulations);

  document.getElementById('export-r-btn').addEventListener('click', exportToR);

  // About modal
  const aboutModal = document.getElementById('about-modal');
  document.getElementById('about-btn').addEventListener('click', () => {
    aboutModal.classList.add('visible');
  });
  document.getElementById('about-close').addEventListener('click', () => {
    aboutModal.classList.remove('visible');
  });
  aboutModal.addEventListener('click', (e) => {
    if (e.target === aboutModal) aboutModal.classList.remove('visible');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && aboutModal.classList.contains('visible')) {
      aboutModal.classList.remove('visible');
    }
  });
}

// ============================================================
// RUN SIMULATIONS
// ============================================================

async function runSimulations() {
  if (isRunning) return;
  isRunning = true;

  const runBtn = document.getElementById('run-btn');
  runBtn.disabled = true;
  runBtn.textContent = 'Running...';

  const numSims = parseInt(document.getElementById('num-sims').value) || 200;
  const endYear = parseInt(document.getElementById('end-year').value) || 2100;
  const customParams = getCustomParams();

  const statusEl = document.getElementById('status-text');
  const progressFill = document.getElementById('progress-fill');
  const totalExperiments = selectedExperiments.length;
  let completedExperiments = 0;

  simulationResults = {};

  for (const expId of selectedExperiments) {
    const exp = EXPERIMENTS[expId];
    statusEl.textContent = `Running ${exp.label}...`;

    const mergedParams = {
      ...customParams,
      ...exp.params,
      numSims,
      endYear,
    };

    const result = await runExperimentAsync(exp.pipeline, mergedParams, (progress) => {
      const overallProgress = (completedExperiments + progress) / totalExperiments;
      progressFill.style.width = (overallProgress * 100) + '%';
    });

    simulationResults[expId] = result;
    completedExperiments++;
    progressFill.style.width = (completedExperiments / totalExperiments * 100) + '%';
  }

  statusEl.textContent = `Done: ${numSims} sims x ${totalExperiments} experiments`;
  runBtn.disabled = false;
  runBtn.textContent = 'Run Simulations';
  isRunning = false;

  updateCharts();
}

// ============================================================
// UPDATE CHARTS
// ============================================================

function updateCharts() {
  const resultsList = selectedExperiments
    .filter(id => simulationResults[id])
    .map(id => simulationResults[id]);
  const names = selectedExperiments
    .filter(id => simulationResults[id])
    .map(id => EXPERIMENTS[id].label);

  if (resultsList.length === 0) return;

  // Chart 1: Median ideology comparison
  renderMedianIdeologyChart('chart-ideology', resultsList, names);

  // Chart 2: Dem seats box plot by decade (primary experiment)
  const primaryResult = resultsList[0];
  renderDemSeatsBoxplot('chart-boxplot', primaryResult);

  // Chart 3: Bloc composition (primary experiment)
  renderBlocChart('chart-blocs', primaryResult);

  // Chart 4: Branch control (primary experiment)
  renderBranchControlChart('chart-branches', primaryResult);

  // Chart 5: Dem seats comparison
  // Chart 5: Dem seats comparison (all experiments including tit-for-tat)
  renderDemSeatsMeanChart('chart-dem-seats', resultsList, names);

  // Chart 6: Tit-for-tat seat count (show/hide card based on whether tit-for-tat was run)
  const seatsPlaceholder = document.getElementById('chart-seats-placeholder');
  const titForTatResult = simulationResults['titForTat'];
  if (titForTatResult && titForTatResult.aggregated.nSeatsMean) {
    seatsPlaceholder.style.display = 'none';
    renderSeatCountChart('chart-seats', titForTatResult);
  } else {
    seatsPlaceholder.style.display = 'flex';
    destroyChart('chart-seats');
  }
}

// ============================================================
// EXPORT TO R
// ============================================================

function exportToR() {
  const params = getCustomParams();
  const numSims = document.getElementById('num-sims').value;
  const endYear = document.getElementById('end-year').value;

  let r = `# MSC Simulator — R parameter export\n`;
  r += `# Generated from browser simulator settings\n\n`;
  r += `n.sims <- ${numSims}\n`;
  r += `end.year <- ${endYear}\n\n`;
  r += `# Presidential election probabilities\n`;
  r += `Prob_demP_DD <<- ${params.probDemPDD}\n`;
  r += `Prob_demP_RR <<- ${params.probDemPRR}\n`;
  r += `Prob_demP_RD <<- ${params.probDemPRD}\n`;
  r += `Prob_demP_DR <<- ${params.probDemPDR}\n\n`;
  r += `# Senate switch probabilities\n`;
  r += `Dem_uni_pres <<- ${params.demUniPres}\n`;
  r += `Dem_div_pres <<- ${params.demDivPres}\n`;
  r += `Dem_uni_mid <<- ${params.demUniMid}\n`;
  r += `Dem_div_mid <<- ${params.demDivMid}\n`;
  r += `Rep_uni_pres <<- ${params.repUniPres}\n`;
  r += `Rep_div_pres <<- ${params.repDivPres}\n`;
  r += `Rep_uni_mid <<- ${params.repUniMid}\n`;
  r += `Rep_div_mid <<- ${params.repDivMid}\n\n`;
  r += `# Justice ideology Beta distribution shapes\n`;
  r += `Dem_Shape_One <<- ${params.demShape1}\n`;
  r += `Dem_Shape_Two <<- ${params.demShape2}\n`;
  r += `Rep_Shape_One <<- ${params.repShape1}\n`;
  r += `Rep_Shape_Two <<- ${params.repShape2}\n\n`;
  r += `# Retirement\n`;
  r += `Weighting_Strategic_Retirement <<- ${params.weightStrategicRetirement}\n`;
  r += `mean.age <- ${params.meanAge}\n`;
  r += `sd.age <- ${params.sdAge}\n`;

  // Create download
  const blob = new Blob([r], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'msc_simulator_params.R';
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================================
// COLLAPSIBLE SECTIONS
// ============================================================

document.addEventListener('click', (e) => {
  const header = e.target.closest('.section-header');
  if (header) {
    header.parentElement.classList.toggle('collapsed');
  }
});

// Init on load
document.addEventListener('DOMContentLoaded', initUI);
