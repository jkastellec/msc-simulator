# MSC Simulator

A browser-based interactive Supreme Court composition simulator. Runs entirely client-side using JavaScript — no server required.

## Features

- **Monte Carlo simulation** of future Supreme Court compositions (2025–2100)
- **6 policy experiments**: Baseline, No Strategic Retirement, No Divided-Government Confirmations, Court Packing (+4), Term Limits (18yr), 2016 Counterfactual
- **Interactive parameter controls**: election probabilities, Senate switch rates, justice ideology distributions, retirement weighting
- **Chart.js visualizations**: median ideology over time, Dem seat counts, bloc composition, branch control probabilities
- **Export to R**: generates equivalent R parameter code for the [replication package](https://github.com/jkastell/replicate_MSC_sims)

## Usage

Open `index.html` in any modern browser, or visit the [live demo](https://jkastell.github.io/msc-simulator/).

Select an experiment, adjust parameters, and click **Run Simulations**.

## Methodology

The simulation engine is a JavaScript port of the R codebase described in:

> Kastellec, J.P. "The Courts That Politics Will Make." Chapter 13, *The Making of the Supreme Court*.

Key model components:
- **Presidential elections**: 4-parameter Markov model calibrated from 1948–2021 data
- **Senate control**: 8-parameter switch model (unified/divided × presidential/midterm)
- **Justice exits**: age-based mortality (SSA tables) + basic/strategic retirement
- **Nominee ideology**: Beta distribution scaled to [-1, 1]

Results are approximate (default: 200 simulations). For full precision (1,000 simulations), see the R replication package.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page structure and layout |
| `data.js` | Embedded data constants (court, mortality, retirement, party history) |
| `simulator.js` | Core Monte Carlo simulation engine |
| `experiments.js` | Policy experiment configurations |
| `charts.js` | Chart.js visualization rendering |
| `ui.js` | Parameter controls and event wiring |
| `style.css` | Responsive styling |

## License

MIT
