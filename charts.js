// charts.js — Chart.js visualization code for MSC Simulator

const CHART_COLORS = {
  dem: '#2166ac',
  rep: '#b2182b',
  neutral: '#888888',
  accent: '#64ffda',
  liberal: '#2166ac',
  moderate: '#888888',
  conservative: '#b2182b',
  ci: 'rgba(100, 255, 218, 0.15)',
  ciBorder: 'rgba(100, 255, 218, 0.3)',
};

const EXPERIMENT_COLORS = [
  '#64ffda', '#ff6b6b', '#ffd93d', '#6bcb77',
  '#4d96ff', '#ff922b', '#cc5de8',
];

// Global chart instances
let charts = {};

function destroyChart(id) {
  if (charts[id]) {
    charts[id].destroy();
    delete charts[id];
  }
}

function getChartDefaults() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#e0e0e0', font: { size: 11 } },
      },
      tooltip: {
        backgroundColor: '#1a1a2e',
        titleColor: '#64ffda',
        bodyColor: '#e0e0e0',
        borderColor: '#2a2a4a',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: { color: '#a0a0b0', font: { size: 10 } },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
      y: {
        ticks: { color: '#a0a0b0', font: { size: 10 } },
        grid: { color: 'rgba(255,255,255,0.08)' },
      },
    },
  };
}

// ============================================================
// CHART 1: Median Justice Ideology Over Time
// ============================================================
function renderMedianIdeologyChart(canvasId, results, experimentNames) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId).getContext('2d');
  const datasets = [];

  results.forEach((result, idx) => {
    const agg = result.aggregated;
    const color = EXPERIMENT_COLORS[idx % EXPERIMENT_COLORS.length];

    // Mean line
    datasets.push({
      label: experimentNames[idx],
      data: agg.years.map((yr, i) => ({ x: yr, y: agg.medianIdeologyMean[i] })),
      borderColor: color,
      backgroundColor: 'transparent',
      borderWidth: 2,
      pointRadius: 0,
      tension: 0.3,
    });

    // CI band (only for first/primary experiment)
    if (idx === 0) {
      datasets.push({
        label: '95% CI',
        data: agg.years.map((yr, i) => ({ x: yr, y: agg.medianIdeologyP975[i] })),
        borderColor: CHART_COLORS.ciBorder,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderDash: [3, 3],
        pointRadius: 0,
        fill: false,
      });
      datasets.push({
        label: '_ci_lower',
        data: agg.years.map((yr, i) => ({ x: yr, y: agg.medianIdeologyP025[i] })),
        borderColor: CHART_COLORS.ciBorder,
        backgroundColor: CHART_COLORS.ci,
        borderWidth: 1,
        borderDash: [3, 3],
        pointRadius: 0,
        fill: '-1',
      });
    }
  });

  const defaults = getChartDefaults();
  charts[canvasId] = new Chart(ctx, {
    type: 'line',
    data: { datasets },
    options: {
      ...defaults,
      plugins: {
        ...defaults.plugins,
        legend: {
          ...defaults.plugins.legend,
          labels: {
            ...defaults.plugins.legend.labels,
            filter: (item) => !item.text.startsWith('_'),
          },
        },
        annotation: {
          annotations: {
            zeroLine: {
              type: 'line',
              yMin: 0, yMax: 0,
              borderColor: 'rgba(255,255,255,0.3)',
              borderWidth: 1,
              borderDash: [5, 5],
            },
          },
        },
      },
      scales: {
        ...defaults.scales,
        x: { ...defaults.scales.x, type: 'linear', title: { display: true, text: 'Year', color: '#a0a0b0' } },
        y: { ...defaults.scales.y, min: -1, max: 1, title: { display: true, text: 'Median Justice Ideology', color: '#a0a0b0' } },
      },
    },
  });
}

// ============================================================
// CHART 2: Dem Seat Count Histogram
// ============================================================
function renderDemSeatsHistogram(canvasId, result, year) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId).getContext('2d');
  const agg = result.aggregated;

  const dist = agg.demSeatsDistribution[year];
  if (!dist) return;

  // Count frequencies
  const maxSeats = Math.max(...dist) + 1;
  const counts = new Array(maxSeats + 1).fill(0);
  dist.forEach(v => { if (v >= 0 && v <= maxSeats) counts[v]++; });

  const labels = Array.from({ length: maxSeats + 1 }, (_, i) => i);
  const colors = labels.map(n => n > maxSeats / 2 ? CHART_COLORS.dem : CHART_COLORS.rep);

  const defaults = getChartDefaults();
  charts[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Simulations',
        data: counts,
        backgroundColor: colors.map(c => c + '99'),
        borderColor: colors,
        borderWidth: 1,
      }],
    },
    options: {
      ...defaults,
      plugins: { ...defaults.plugins, legend: { display: false } },
      scales: {
        ...defaults.scales,
        x: { ...defaults.scales.x, title: { display: true, text: 'Dem-Appointed Seats', color: '#a0a0b0' } },
        y: { ...defaults.scales.y, title: { display: true, text: 'Count', color: '#a0a0b0' } },
      },
    },
  });
}

// ============================================================
// CHART 3: Bloc Composition Over Time
// ============================================================
function renderBlocChart(canvasId, result) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId).getContext('2d');
  const agg = result.aggregated;
  const defaults = getChartDefaults();

  charts[canvasId] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: agg.years,
      datasets: [
        {
          label: 'Liberal (< -0.2)',
          data: agg.blocLiberal,
          backgroundColor: CHART_COLORS.liberal + '40',
          borderColor: CHART_COLORS.liberal,
          borderWidth: 1.5,
          fill: true,
          pointRadius: 0,
          tension: 0.3,
        },
        {
          label: 'Moderate',
          data: agg.blocModerate,
          backgroundColor: CHART_COLORS.moderate + '40',
          borderColor: CHART_COLORS.moderate,
          borderWidth: 1.5,
          fill: true,
          pointRadius: 0,
          tension: 0.3,
        },
        {
          label: 'Conservative (> 0.2)',
          data: agg.blocConservative,
          backgroundColor: CHART_COLORS.conservative + '40',
          borderColor: CHART_COLORS.conservative,
          borderWidth: 1.5,
          fill: true,
          pointRadius: 0,
          tension: 0.3,
        },
      ],
    },
    options: {
      ...defaults,
      scales: {
        ...defaults.scales,
        x: { ...defaults.scales.x, title: { display: true, text: 'Year', color: '#a0a0b0' } },
        y: { ...defaults.scales.y, stacked: true, title: { display: true, text: 'Mean Justices', color: '#a0a0b0' } },
      },
      plugins: {
        ...defaults.plugins,
      },
    },
  });
}

// ============================================================
// CHART 4: Branch Control Probabilities
// ============================================================
function renderBranchControlChart(canvasId, result) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId).getContext('2d');
  const agg = result.aggregated;
  const defaults = getChartDefaults();

  charts[canvasId] = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [
        {
          label: 'P(Dem President)',
          data: agg.years.map((yr, i) => ({ x: yr, y: agg.pDemPresident[i] })),
          borderColor: CHART_COLORS.dem,
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.3,
        },
        {
          label: 'P(Dem Senate)',
          data: agg.years.map((yr, i) => ({ x: yr, y: agg.pDemSenate[i] })),
          borderColor: '#6bcb77',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.3,
        },
        {
          label: 'P(Unified Gov)',
          data: agg.years.map((yr, i) => ({ x: yr, y: agg.pUnifiedGov[i] })),
          borderColor: '#ffd93d',
          borderWidth: 2,
          borderDash: [5, 3],
          pointRadius: 0,
          tension: 0.3,
        },
      ],
    },
    options: {
      ...defaults,
      scales: {
        ...defaults.scales,
        x: { ...defaults.scales.x, type: 'linear', title: { display: true, text: 'Year', color: '#a0a0b0' } },
        y: { ...defaults.scales.y, min: 0, max: 1, title: { display: true, text: 'Probability', color: '#a0a0b0' } },
      },
      plugins: {
        ...defaults.plugins,
        annotation: {
          annotations: {
            halfLine: {
              type: 'line',
              yMin: 0.5, yMax: 0.5,
              borderColor: 'rgba(255,255,255,0.2)',
              borderWidth: 1,
              borderDash: [5, 5],
            },
          },
        },
      },
    },
  });
}

// ============================================================
// CHART 5: Dem Seats Mean Over Time
// ============================================================
function renderDemSeatsMeanChart(canvasId, results, experimentNames) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId).getContext('2d');
  const datasets = [];

  results.forEach((result, idx) => {
    const agg = result.aggregated;
    const color = EXPERIMENT_COLORS[idx % EXPERIMENT_COLORS.length];
    datasets.push({
      label: experimentNames[idx],
      data: agg.years.map((yr, i) => ({ x: yr, y: agg.demSeatsMean[i] })),
      borderColor: color,
      backgroundColor: 'transparent',
      borderWidth: 2,
      pointRadius: 0,
      tension: 0.3,
    });
  });

  const defaults = getChartDefaults();
  charts[canvasId] = new Chart(ctx, {
    type: 'line',
    data: { datasets },
    options: {
      ...defaults,
      scales: {
        ...defaults.scales,
        x: { ...defaults.scales.x, type: 'linear', title: { display: true, text: 'Year', color: '#a0a0b0' } },
        y: { ...defaults.scales.y, title: { display: true, text: 'Mean Dem-Appointed Seats', color: '#a0a0b0' } },
      },
    },
  });
}
