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
  '#4d96ff', '#ff922b', '#cc5de8', '#20c997',
  '#e599f7', '#ffa94d',
];

// Global chart instances
let charts = {};

// Global CI visibility flag (toggled by UI checkbox)
let showConfidenceIntervals = false;

// Custom Chart.js plugin: draws a vertical dashed line at x=2026 labeled "Today"
const todayLinePlugin = {
  id: 'todayLine',
  afterDraw(chart) {
    const xScale = chart.scales.x;
    if (!xScale) return;
    const xPixel = xScale.getPixelForValue(2026);
    if (xPixel === undefined || xPixel < xScale.left || xPixel > xScale.right) return;

    const ctx = chart.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.moveTo(xPixel, chart.chartArea.top);
    ctx.lineTo(xPixel, chart.chartArea.bottom);
    ctx.stroke();

    // Label
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Today', xPixel, chart.chartArea.top - 4);
    ctx.restore();
  },
};

// Custom Chart.js plugin: draws a horizontal dashed line at y=0
const zeroLinePlugin = {
  id: 'zeroLine',
  afterDraw(chart) {
    const yScale = chart.scales.y;
    if (!yScale) return;
    const yPixel = yScale.getPixelForValue(0);
    if (yPixel === undefined || yPixel < chart.chartArea.top || yPixel > chart.chartArea.bottom) return;

    const ctx = chart.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.moveTo(chart.chartArea.left, yPixel);
    ctx.lineTo(chart.chartArea.right, yPixel);
    ctx.stroke();
    ctx.restore();
  },
};

// Register plugins globally
Chart.register(todayLinePlugin, zeroLinePlugin);

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
        labels: { color: '#e0e0e0', font: { size: 11 }, usePointStyle: true, pointStyleWidth: 40 },
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
        ticks: {
          color: '#a0a0b0',
          font: { size: 10 },
          callback: function(value) { return value.toString(); },
        },
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
      pointStyle: 'line',
      pointRadius: 0,
      tension: 0.3,
    });

    // CI band (only for first/primary experiment, togglable)
    if (idx === 0 && showConfidenceIntervals) {
      datasets.push({
        label: '95% CI',
        data: agg.years.map((yr, i) => ({ x: yr, y: agg.medianIdeologyP975[i] })),
        borderColor: CHART_COLORS.ciBorder,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderDash: [3, 3],
        pointStyle: 'line',
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
        pointStyle: 'line',
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
        todayLine: {}, // uses global plugin
        zeroLine: {}, // uses global plugin
      },
      scales: {
        ...defaults.scales,
        x: { ...defaults.scales.x, type: 'linear', ticks: { ...defaults.scales.x.ticks, includeBounds: true }, title: { display: true, text: 'Year', color: '#a0a0b0' } },
        y: { ...defaults.scales.y, min: -1, max: 1, title: { display: true, text: 'Conservatism of Median Justice', color: '#a0a0b0' } },
      },
    },
  });
}

// ============================================================
// CHART 2: Dem Seat Count Box Plot by Decade
// ============================================================
function renderDemSeatsBoxplot(canvasId, result) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId).getContext('2d');
  const agg = result.aggregated;

  // Use tft distribution when available (tit-for-tat includes packed seats)
  const distribution = agg.tftDemSeatsDistribution || agg.demSeatsDistribution;

  // Collect decade keys (2020, 2030, 2040, ... 2090)
  const decadeYears = Object.keys(distribution)
    .map(Number)
    .filter(yr => yr >= 2020 && yr < 2100)
    .sort();

  if (decadeYears.length === 0) return;

  // Find max seats across all decades to set dynamic majority threshold and y-axis
  let maxSeats = 9;
  decadeYears.forEach(yr => {
    const dist = distribution[yr];
    if (dist) {
      const m = Math.max(...dist);
      if (m > maxSeats) maxSeats = m;
    }
  });
  const majorityThreshold = Math.ceil(maxSeats / 2);

  const labels = decadeYears.map(yr => `${yr}s`);
  const boxplotData = [];
  const backgroundColors = [];
  const borderColors = [];

  decadeYears.forEach(yr => {
    const dist = distribution[yr];
    if (!dist || dist.length === 0) {
      boxplotData.push({ min: 0, q1: 0, median: 0, q3: 0, max: 0 });
      backgroundColors.push(CHART_COLORS.rep + '60');
      borderColors.push(CHART_COLORS.rep);
      return;
    }

    const sorted = [...dist].sort((a, b) => a - b);
    const n = sorted.length;
    const percentile = (p) => sorted[Math.min(n - 1, Math.max(0, Math.floor(n * p)))];

    const median = percentile(0.5);
    const q1 = percentile(0.25);
    const q3 = percentile(0.75);
    const whiskerLow = percentile(0.05);
    const whiskerHigh = percentile(0.95);

    boxplotData.push({
      min: whiskerLow,
      q1: q1,
      median: median,
      q3: q3,
      max: whiskerHigh,
    });

    const color = median >= majorityThreshold ? CHART_COLORS.dem : CHART_COLORS.rep;
    backgroundColors.push(color + '60');
    borderColors.push(color);
  });

  const defaults = getChartDefaults();
  charts[canvasId] = new Chart(ctx, {
    type: 'boxplot',
    data: {
      labels,
      datasets: [{
        label: 'Dem-Appointed Seats',
        data: boxplotData,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1.5,
        medianColor: '#e0e0e0',
        itemRadius: 0,
      }],
    },
    options: {
      ...defaults,
      plugins: { ...defaults.plugins, legend: { display: false } },
      scales: {
        ...defaults.scales,
        x: {
          type: 'category',
          ticks: { color: '#a0a0b0', font: { size: 10 } },
          grid: { color: 'rgba(255,255,255,0.05)' },
          title: { display: true, text: 'Decade', color: '#a0a0b0' },
        },
        y: {
          ...defaults.scales.y,
          title: { display: true, text: 'Dem-Appointed Seats', color: '#a0a0b0' },
          suggestedMin: 0,
          suggestedMax: Math.max(9, maxSeats) + 1,
        },
      },
    },
  });
}

// ============================================================
// CHART 3: Bloc Composition Over Time
// ============================================================
function renderBlocChart(canvasId, result, expName) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId).getContext('2d');
  const agg = result.aggregated;
  const defaults = getChartDefaults();
  const suffix = expName ? ` (${expName})` : '';

  charts[canvasId] = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [
        {
          label: 'Liberal' + suffix,
          data: agg.years.map((yr, i) => ({ x: yr, y: agg.blocLiberal[i] })),
          borderColor: CHART_COLORS.liberal,
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointStyle: 'line',
          pointRadius: 0,
          tension: 0.3,
        },
        {
          label: 'Moderate' + suffix,
          data: agg.years.map((yr, i) => ({ x: yr, y: agg.blocModerate[i] })),
          borderColor: CHART_COLORS.moderate,
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointStyle: 'line',
          pointRadius: 0,
          tension: 0.3,
        },
        {
          label: 'Conservative' + suffix,
          data: agg.years.map((yr, i) => ({ x: yr, y: agg.blocConservative[i] })),
          borderColor: CHART_COLORS.conservative,
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointStyle: 'line',
          pointRadius: 0,
          tension: 0.3,
        },
      ],
    },
    options: {
      ...defaults,
      scales: {
        ...defaults.scales,
        x: { ...defaults.scales.x, type: 'linear', ticks: { ...defaults.scales.x.ticks, includeBounds: true }, title: { display: true, text: 'Year', color: '#a0a0b0' } },
        y: { ...defaults.scales.y, min: 0, suggestedMax: 9, title: { display: true, text: 'Mean Justices', color: '#a0a0b0' } },
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
          pointStyle: 'line',
          pointRadius: 0,
          tension: 0.3,
        },
        {
          label: 'P(Dem Senate)',
          data: agg.years.map((yr, i) => ({ x: yr, y: agg.pDemSenate[i] })),
          borderColor: '#6bcb77',
          borderWidth: 2,
          pointStyle: 'line',
          pointRadius: 0,
          tension: 0.3,
        },
        {
          label: 'P(Unified Gov)',
          data: agg.years.map((yr, i) => ({ x: yr, y: agg.pUnifiedGov[i] })),
          borderColor: '#ffd93d',
          borderWidth: 2,
          borderDash: [5, 3],
          pointStyle: 'line',
          pointRadius: 0,
          tension: 0.3,
        },
      ],
    },
    options: {
      ...defaults,
      scales: {
        ...defaults.scales,
        x: { ...defaults.scales.x, type: 'linear', ticks: { ...defaults.scales.x.ticks, includeBounds: true }, title: { display: true, text: 'Year', color: '#a0a0b0' } },
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
  let hasTitForTat = false;

  results.forEach((result, idx) => {
    const agg = result.aggregated;
    const color = EXPERIMENT_COLORS[idx % EXPERIMENT_COLORS.length];

    // For tit-for-tat, use tftDemSeatsMean (includes packed seats)
    if (agg.tftDemSeatsMean) {
      hasTitForTat = true;
      datasets.push({
        label: experimentNames[idx] + ' (Dem seats)',
        data: agg.years.map((yr, i) => ({ x: yr, y: agg.tftDemSeatsMean[i] })),
        borderColor: color,
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointStyle: 'line',
        pointRadius: 0,
        tension: 0.3,
        yAxisID: 'y',
      });
      datasets.push({
        label: experimentNames[idx] + ' (Dem share %)',
        data: agg.years.map((yr, i) => ({ x: yr, y: agg.tftDemShareMean[i] * 100 })),
        borderColor: color,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [6, 3],
        pointStyle: 'line',
        pointRadius: 0,
        tension: 0.3,
        yAxisID: 'y1',
      });
    } else {
      datasets.push({
        label: experimentNames[idx],
        data: agg.years.map((yr, i) => ({ x: yr, y: agg.demSeatsMean[i] })),
        borderColor: color,
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointStyle: 'line',
        pointRadius: 0,
        tension: 0.3,
        yAxisID: 'y',
      });
    }
  });

  const defaults = getChartDefaults();
  const scales = {
    ...defaults.scales,
    x: { ...defaults.scales.x, type: 'linear', ticks: { ...defaults.scales.x.ticks, includeBounds: true }, title: { display: true, text: 'Year', color: '#a0a0b0' } },
    y: { ...defaults.scales.y, position: 'left', title: { display: true, text: 'Mean Dem-Appointed Seats', color: '#a0a0b0' } },
  };

  if (hasTitForTat) {
    scales.y1 = {
      ...defaults.scales.y,
      position: 'right',
      title: { display: true, text: 'Dem Share (%)', color: '#a0a0b0' },
      min: 0, max: 100,
      grid: { drawOnChartArea: false },
    };
  }

  charts[canvasId] = new Chart(ctx, {
    type: 'line',
    data: { datasets },
    options: { ...defaults, scales },
  });
}

// ============================================================
// CHART 6: Expected Court Size (Tit-for-Tat)
// ============================================================
function renderSeatCountChart(canvasId, result) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId).getContext('2d');
  const agg = result.aggregated;

  if (!agg.nSeatsMean) return;

  const datasets = [
    {
      label: 'Mean Court Size',
      data: agg.years.map((yr, i) => ({ x: yr, y: agg.nSeatsMean[i] })),
      borderColor: '#ff922b',
      backgroundColor: 'transparent',
      borderWidth: 2,
      pointStyle: 'line',
      pointRadius: 0,
      tension: 0.3,
    },
  ];

  // Add CI band if available and toggled on
  if (showConfidenceIntervals && agg.nSeatsP975 && agg.nSeatsP025) {
    datasets.push({
      label: '95% CI',
      data: agg.years.map((yr, i) => ({ x: yr, y: agg.nSeatsP975[i] })),
      borderColor: 'rgba(255, 146, 43, 0.3)',
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderDash: [3, 3],
      pointStyle: 'line',
      pointRadius: 0,
      fill: false,
    });
    datasets.push({
      label: '_ci_lower',
      data: agg.years.map((yr, i) => ({ x: yr, y: agg.nSeatsP025[i] })),
      borderColor: 'rgba(255, 146, 43, 0.3)',
      backgroundColor: 'rgba(255, 146, 43, 0.12)',
      borderWidth: 1,
      borderDash: [3, 3],
      pointStyle: 'line',
      pointRadius: 0,
      fill: '-1',
    });
  }

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
      },
      scales: {
        ...defaults.scales,
        x: { ...defaults.scales.x, type: 'linear', ticks: { ...defaults.scales.x.ticks, includeBounds: true }, title: { display: true, text: 'Year', color: '#a0a0b0' } },
        y: { ...defaults.scales.y, suggestedMin: 9, title: { display: true, text: 'Number of Seats', color: '#a0a0b0' } },
      },
    },
  });
}
