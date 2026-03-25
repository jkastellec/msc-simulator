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
  { group: 'Election Probabilities', params: [
    { key: 'probDemPDD', label: 'P(Dem | 2 Dem terms)', min: 0, max: 1, step: 0.01 },
    { key: 'probDemPRR', label: 'P(Dem | 2 Rep terms)', min: 0, max: 1, step: 0.01 },
    { key: 'probDemPRD', label: 'P(Dem | Dem incumb.)', min: 0, max: 1, step: 0.01 },
    { key: 'probDemPDR', label: 'P(Dem | Rep incumb.)', min: 0, max: 1, step: 0.01 },
  ]},
  { group: 'Senate Switch Probs', params: [
    { key: 'demUniPres', label: 'Dem sw. uni/pres', min: 0, max: 1, step: 0.01 },
    { key: 'demDivPres', label: 'Dem sw. div/pres', min: 0, max: 1, step: 0.01 },
    { key: 'demUniMid',  label: 'Dem sw. uni/mid',  min: 0, max: 1, step: 0.01 },
    { key: 'demDivMid',  label: 'Dem sw. div/mid',  min: 0, max: 1, step: 0.01 },
    { key: 'repUniPres', label: 'Rep sw. uni/pres', min: 0, max: 1, step: 0.01 },
    { key: 'repDivPres', label: 'Rep sw. div/pres', min: 0, max: 1, step: 0.01 },
    { key: 'repUniMid',  label: 'Rep sw. uni/mid',  min: 0, max: 1, step: 0.01 },
    { key: 'repDivMid',  label: 'Rep sw. div/mid',  min: 0, max: 1, step: 0.01 },
  ]},
  { group: 'Justice Ideology (Beta shapes)', params: [
    { key: 'demShape1', label: 'Dem shape \u03B1', min: 1, max: 20, step: 0.5, type: 'number' },
    { key: 'demShape2', label: 'Dem shape \u03B2', min: 1, max: 20, step: 0.5, type: 'number' },
    { key: 'repShape1', label: 'Rep shape \u03B1', min: 1, max: 20, step: 0.5, type: 'number' },
    { key: 'repShape2', label: 'Rep shape \u03B2', min: 1, max: 20, step: 0.5, type: 'number' },
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
      <div class="section-body"></div>
    `;
    section.querySelector('.section-header').addEventListener('click', () => {
      section.classList.toggle('collapsed');
    });

    const body = section.querySelector('.section-body');
    group.params.forEach(p => {
      const defaultVal = DEFAULT_PARAMS[p.key];
      const row = document.createElement('div');
      row.className = 'param-row';

      if (p.type === 'number') {
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

function getCustomParams() {
  const params = {};
  PARAM_DEFS.forEach(group => {
    group.params.forEach(p => {
      const el = document.getElementById(`param-${p.key}`);
      if (el) params[p.key] = parseFloat(el.value);
    });
  });
  return params;
}

// ============================================================
// EVENT LISTENERS
// ============================================================

function setupEventListeners() {
  document.getElementById('run-btn').addEventListener('click', runSimulations);

  document.getElementById('histogram-year').addEventListener('change', (e) => {
    const year = parseInt(e.target.value);
    const primaryId = selectedExperiments[0];
    if (simulationResults[primaryId]) {
      renderDemSeatsHistogram('chart-histogram', simulationResults[primaryId], year);
    }
  });

  document.getElementById('export-r-btn').addEventListener('click', exportToR);
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

  // Chart 2: Dem seats histogram (primary experiment)
  const primaryResult = resultsList[0];
  const histYearSelect = document.getElementById('histogram-year');
  const availableYears = Object.keys(primaryResult.aggregated.demSeatsDistribution).map(Number).sort();
  histYearSelect.innerHTML = availableYears.map(yr =>
    `<option value="${yr}" ${yr === 2050 ? 'selected' : ''}>${yr}</option>`
  ).join('');
  const selectedYear = parseInt(histYearSelect.value) || availableYears[Math.floor(availableYears.length / 2)];
  renderDemSeatsHistogram('chart-histogram', primaryResult, selectedYear);

  // Chart 3: Bloc composition (primary experiment)
  renderBlocChart('chart-blocs', primaryResult);

  // Chart 4: Branch control (primary experiment)
  renderBranchControlChart('chart-branches', primaryResult);

  // Chart 5: Dem seats comparison
  renderDemSeatsMeanChart('chart-dem-seats', resultsList, names);
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
