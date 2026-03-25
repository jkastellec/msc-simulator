// simulator.js — Core simulation engine
// Faithful port of FSC_Simulator_2024.R and FSC_metafunctions_2024.R

// ============================================================
// RANDOM NUMBER UTILITIES
// ============================================================

// Bernoulli trial: returns 1 with probability p, 0 otherwise
function randBinom(p) {
  return Math.random() < p ? 1 : 0;
}

// Normal distribution via Box-Muller transform
function randNormal(mean, sd) {
  let u1, u2;
  do { u1 = Math.random(); } while (u1 === 0);
  u2 = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + sd * z;
}

// Gamma distribution via Marsaglia-Tsang method (shape >= 1)
function randGamma(shape) {
  if (shape < 1) {
    // For shape < 1, use: Gamma(shape) = Gamma(shape+1) * U^(1/shape)
    return randGamma(shape + 1) * Math.pow(Math.random(), 1 / shape);
  }
  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  while (true) {
    let x, v;
    do {
      x = randNormal(0, 1);
      v = 1 + c * x;
    } while (v <= 0);
    v = v * v * v;
    const u = Math.random();
    if (u < 1 - 0.0331 * (x * x) * (x * x)) return d * v;
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
  }
}

// Beta distribution via Gamma ratio
function randBeta(a, b) {
  const x = randGamma(a);
  const y = randGamma(b);
  return x / (x + y);
}

// ============================================================
// SIMULATION DATA STRUCTURES
// ============================================================

function createSimResult(nYears, numJustices) {
  return {
    nYears: nYears,
    numJustices: numJustices,
    years: new Array(nYears),
    demPresident: new Array(nYears),
    demSenMaj: new Array(nYears),
    unifiedGov: new Array(nYears),
    // Each justice is an object with arrays of length nYears
    justices: Array.from({ length: numJustices }, (_, j) => ({
      seatid: new Array(nYears).fill(0),
      demJustice: new Array(nYears).fill(0),
      ideology: new Array(nYears).fill(0),
      age: new Array(nYears).fill(0),
      originalSeat: j + 1,
      active: new Array(nYears).fill(true), // for court packing: false until packed
    })),
  };
}

// ============================================================
// INITIALIZATION
// Port of make_new_dataset() from FSC_Simulator_2024.R
// ============================================================

function initSimulation(params) {
  const nYears = params.endYear - params.currentYear + 1;
  const court = params.startingCourt;
  const numJustices = court.length;
  const sim = createSimResult(nYears, numJustices);

  // Fill year 0 with starting court data
  sim.years[0] = params.currentYear;
  sim.demPresident[0] = params.startingDemPresident;
  sim.demSenMaj[0] = params.startingDemSenMaj;
  sim.unifiedGov[0] = params.startingUnifiedGov;

  for (let j = 0; j < numJustices; j++) {
    sim.justices[j].seatid[0] = court[j].seatid;
    sim.justices[j].demJustice[0] = court[j].demJustice;
    sim.justices[j].ideology[0] = court[j].ideology;
    sim.justices[j].age[0] = court[j].age;
    sim.justices[j].originalSeat = court[j].originalSeat;
  }

  // Fill in years
  for (let i = 1; i < nYears; i++) {
    sim.years[i] = params.currentYear + i;
  }

  return sim;
}

// ============================================================
// PREDICT PRESIDENT
// Port of predict_president() from FSC_Simulator_2024.R lines 16-72
// ============================================================

function predictPresident(sim, params) {
  const nYears = sim.nYears;

  // Build president_history with 5 prefix entries + nYears entries
  // R code: president_history <- rep(NA, N+4), then fills [1:6] with init
  // Then loops from i=6 to N+4
  const histLen = nYears + 5;
  const presHist = new Array(histLen).fill(0);

  // Fill first 6 with president_history_init
  for (let k = 0; k < 6; k++) {
    presHist[k] = params.presidentHistoryInit[k];
  }

  const a = params.probDemPDD; // P(Dem | last two Dem) — seeking 3rd+ term
  const b = params.probDemPRD; // P(Dem | prev Rep, curr Dem) — seeking 2nd term
  const c = params.probDemPRR; // P(Dem | last two Rep) — seeking 3rd+ term
  const d = params.probDemPDR; // P(Dem | prev Dem, curr Rep) — seeking 2nd term

  // R loop: for (i in 6:(N+4))
  // R uses 1-based indexing, mod((i-1), 4)
  // In JS: i goes from 5 to histLen-2 (0-based)
  for (let i = 5; i < histLen - 1; i++) {
    // R: if (mod((i-1), 4) != 0) — not election year
    // i is 0-based here, R's i is 1-based. R's (i-1) maps to our i.
    // R election check: mod((i-1), 4) == 0 where i is 1-based starting at 6
    // The election pattern depends on actual calendar years, not array index.
    // Let's think about this differently:
    // presHist[0..5] = init (years going back)
    // presHist[5] = current year president
    // After dropping first 5: presHist[5:] maps to years starting from current year
    // The R code checks mod((i-1), 4) where i is the loop variable starting at 6 (1-based)
    // In R: i=6 → mod(5,4)=1 → not election. i=7 → mod(6,4)=2 → not election.
    // The election timing depends on the president_history_init alignment.
    // For 2025 start: presHist[5]=Trump(0), so next election is 2028.
    // presHist[5] corresponds to year 2025. Index offset from current year = index - 5.
    // Year at index i = currentYear + (i - 5).
    // Election year when (year - currentYear) % 4 == 3 for 2025 start? No...
    // Actually R just uses mod((i-1), 4) where i starts at 6 (1-based).
    // In 0-based: i starts at 5, so R's (i-1) = our i, so mod(i, 4).
    // For i=5: mod(5,4)=1 ≠ 0, not election
    // For i=6: mod(6,4)=2 ≠ 0, not election
    // For i=7: mod(7,4)=3 ≠ 0, not election
    // For i=8: mod(8,4)=0, ELECTION → this is 2028 (index 8, year = 2025 + 3 = 2028) ✓

    if (i % 4 !== 0) {
      // Not election year — keep president
      presHist[i + 1] = presHist[i];
    } else {
      // Election year — simulate
      const currentPres = presHist[i];
      const fourYearsAgo = presHist[i - 4];
      let reelectionProb;

      // R logic: 4 conditions checking current vs 4-years-ago
      if (currentPres === fourYearsAgo && currentPres === 1) {
        reelectionProb = a; // Dem seeking 3rd+ term
      } else if (currentPres !== fourYearsAgo && currentPres === 1) {
        reelectionProb = c; // Was mislabeled in R comment; this is Dem seeking 2nd term
        // Wait — let me re-read the R code carefully:
        // if(current == prev4 & current == 1) → reelection_probability = a  (Prob_demP_DD)
        // if(current == prev4 & current == 0) → reelection_probability = b  (Prob_demP_RD)
        // if(current != prev4 & current == 1) → reelection_probability = c  (Prob_demP_RR)
        // if(current != prev4 & current == 0) → reelection_probability = d  (Prob_demP_DR)
        // Wait, that doesn't make sense with the variable names. Let me re-check.
        // Actually looking at the R code assignment:
        // a <- Prob_demP_DD (same party twice, both Dem → Dem seeking 3rd+)
        // b <- Prob_demP_RD (different parties, current Dem → hmm)
        // Actually the comment says:
        // a: P(next=Dem | last two terms both Dem)
        // b: P(next=Dem | prev Rep, curr Dem) — Dem seeking 2nd term
        // c: P(next=Dem | last two terms both Rep) — Rep seeking 3rd+ term
        // d: P(next=Dem | prev Dem, curr Rep) — Rep seeking 2nd term
        // And the conditions:
        // current==prev4 && current==1 → both Dem → a (DD)
        // current==prev4 && current==0 → both Rep → b (RD)... wait that's wrong
        // Actually no: the R variable names are confusing. Let me just port the logic exactly.
        // In R:
        // if(current == prev4 & current == 1) → a = Prob_demP_DD
        // if(current == prev4 & current == 0) → b = Prob_demP_RD
        // if(current != prev4 & current == 1) → c = Prob_demP_RR
        // if(current != prev4 & current == 0) → d = Prob_demP_DR
        reelectionProb = c;
      } else if (currentPres === fourYearsAgo && currentPres === 0) {
        reelectionProb = b;
      } else {
        // current != fourYearsAgo && current == 0
        reelectionProb = d;
      }

      presHist[i + 1] = randBinom(reelectionProb);
    }
  }

  // Drop first 5 entries (R: president_history <- president_history[-c(1:5)])
  // Then fill into sim.demPresident
  const trimmed = presHist.slice(5);
  for (let i = 0; i < nYears; i++) {
    sim.demPresident[i] = trimmed[i];
  }
}

// ============================================================
// PREDICT SENATE
// Port of predict_senate() from FSC_Simulator_2024.R lines 85-146
// ============================================================

function predictSenate(sim, params) {
  const nYears = sim.nYears;

  // Extract year-level arrays (R works with 9-row-per-year, we already have year-level)
  // sim.demSenMaj[0] and sim.unifiedGov[0] are already set from init

  for (let i = 0; i < nYears - 1; i++) {
    const year = sim.years[i];

    // Odd year = no election, carry forward
    if (year % 2 === 1) {
      sim.demSenMaj[i + 1] = sim.demSenMaj[i];
    } else {
      // Election year
      const isPres = (year % 4 === 0);
      const senateHeld = sim.demSenMaj[i]; // 0=Rep, 1=Dem
      const unified = sim.unifiedGov[i];

      let switchProb;

      if (isPres) {
        // Presidential election year
        if (senateHeld === 0) {
          // Rep holds Senate
          switchProb = unified === 1 ? params.repUniPres : params.repDivPres;
          sim.demSenMaj[i + 1] = randBinom(switchProb); // 1=switch to Dem
        } else {
          // Dem holds Senate
          switchProb = unified === 1 ? params.demUniPres : params.demDivPres;
          sim.demSenMaj[i + 1] = randBinom(1 - switchProb); // 1=stay Dem, 0=switch to Rep
        }
      } else {
        // Midterm year
        if (senateHeld === 0) {
          switchProb = unified === 1 ? params.repUniMid : params.repDivMid;
          sim.demSenMaj[i + 1] = randBinom(switchProb);
        } else {
          switchProb = unified === 1 ? params.demUniMid : params.demDivMid;
          sim.demSenMaj[i + 1] = randBinom(1 - switchProb);
        }
      }
    }

    // Compute unified government
    sim.unifiedGov[i + 1] = (sim.demSenMaj[i + 1] === sim.demPresident[i + 1]) ? 1 : 0;
  }
}

// ============================================================
// PREDICT JUDGE (standard baseline)
// Port of predict_judge() from FSC_Simulator_2024.R lines 243-317
// ============================================================

function predictJudge(sim, params) {
  const nYears = sim.nYears;
  const termLimit = params.termLimit;
  const a = params.weightStrategicRetirement;
  let seatCount = 9;

  // Find max seatid from starting court
  for (let j = 0; j < sim.numJustices; j++) {
    if (sim.justices[j].seatid[0] > seatCount) seatCount = sim.justices[j].seatid[0];
  }

  for (let i = 0; i < nYears - 1; i++) {
    const presidentSide = sim.demPresident[i];

    for (let j = 0; j < sim.numJustices; j++) {
      if (!sim.justices[j].active[i]) continue;

      const justice = sim.justices[j];
      const age = justice.age[i];
      const justiceSide = justice.demJustice[i];

      // Death probability (indexed by age)
      const deathProb = age < DEATH_PROB.length ? DEATH_PROB[age] : 1;

      // Retirement probabilities (indexed by age - 35)
      const retIdx = age - 35;
      const basic = (retIdx >= 0 && retIdx < BASIC_RETIREMENT.length) ? BASIC_RETIREMENT[retIdx] : 0.5;
      const strategic = (retIdx >= 0 && retIdx < STRATEGIC_RETIREMENT.length) ? STRATEGIC_RETIREMENT[retIdx] : 0.5;

      let exitProb;

      // Term limit check: R checks if seatid[i] == seatid[i - termLimit] && i > termLimit
      if (i > termLimit && justice.seatid[i] === justice.seatid[i - termLimit]) {
        exitProb = 1;
      } else {
        if (justiceSide === presidentSide) {
          exitProb = deathProb + (basic + a * strategic) * (1 - deathProb);
        } else {
          exitProb = deathProb + basic * (1 - deathProb);
        }
      }

      if (exitProb > 1) exitProb = 1;
      if (exitProb < 0) exitProb = 0;

      const exits = randBinom(exitProb);

      if (exits === 0) {
        // Stays
        justice.age[i + 1] = age + 1;
        justice.demJustice[i + 1] = justiceSide;
        justice.seatid[i + 1] = justice.seatid[i];
        justice.ideology[i + 1] = justice.ideology[i];
        justice.active[i + 1] = true;
      } else {
        // Exits — replaced by new justice
        seatCount++;
        justice.seatid[i + 1] = seatCount;
        justice.demJustice[i + 1] = presidentSide;
        justice.age[i + 1] = Math.floor(randNormal(params.meanAge, params.sdAge));
        justice.active[i + 1] = true;
        // Ideology will be filled by predictIdeology
      }
    }
  }
}

// ============================================================
// PREDICT JUDGE — NO STRATEGIC RETIREMENT
// Port of predict_judge_nostrategic() from FSC_Simulator_2024.R
// Same as predictJudge but strategic retirement weight = 0
// ============================================================

function predictJudgeNoStrategic(sim, params) {
  const modParams = { ...params, weightStrategicRetirement: 0 };
  predictJudge(sim, modParams);
}

// ============================================================
// PREDICT IDEOLOGY
// Port of predict_ideology() from FSC_Simulator_2024.R lines 404-431
// ============================================================

function predictIdeology(sim, params) {
  const nYears = sim.nYears;

  for (let i = 1; i < nYears; i++) {
    for (let j = 0; j < sim.numJustices; j++) {
      if (!sim.justices[j].active[i]) continue;
      const justice = sim.justices[j];

      if (justice.seatid[i] !== justice.seatid[i - 1]) {
        // New justice — draw ideology from Beta distribution
        if (justice.demJustice[i] === 1) {
          justice.ideology[i] = -1 + 2 * randBeta(params.demShape1, params.demShape2);
        } else {
          justice.ideology[i] = -(-1 + 2 * randBeta(params.repShape1, params.repShape2));
        }
      } else {
        // Incumbent — carry forward
        justice.ideology[i] = justice.ideology[i - 1];
      }
    }
  }
}

// ============================================================
// VACANCY UNTIL UNIFIED — PREDICT JUDGE
// Port of vacancy_until_unified_predict_judge() from FSC_Simulator_2024.R lines 433-517
// ============================================================

function vacancyPredictJudge(sim, params) {
  const nYears = sim.nYears;
  const termLimit = params.termLimit;
  const a = params.weightStrategicRetirement;
  let seatCount = 9;

  for (let j = 0; j < sim.numJustices; j++) {
    if (sim.justices[j].seatid[0] > seatCount) seatCount = sim.justices[j].seatid[0];
  }

  for (let i = 0; i < nYears - 1; i++) {
    const presidentSide = sim.demPresident[i];

    for (let j = 0; j < sim.numJustices; j++) {
      const justice = sim.justices[j];
      const age = justice.age[i];
      const justiceSide = justice.demJustice[i];

      const deathProb = age < DEATH_PROB.length ? DEATH_PROB[age] : 1;
      const retIdx = age - 35;
      const basic = (retIdx >= 0 && retIdx < BASIC_RETIREMENT.length) ? BASIC_RETIREMENT[retIdx] : 0.5;
      const strategic = (retIdx >= 0 && retIdx < STRATEGIC_RETIREMENT.length) ? STRATEGIC_RETIREMENT[retIdx] : 0.5;

      let exitProb;

      // Term limit check
      if (i > termLimit && justice.seatid[i] === justice.seatid[i - termLimit]) {
        exitProb = 1;
      } else if (justiceSide === -1) {
        // Vacancy always exits (to be potentially filled)
        exitProb = 1;
      } else {
        if (justiceSide === presidentSide) {
          exitProb = deathProb + (basic + a * strategic) * (1 - deathProb);
        } else {
          exitProb = deathProb + basic * (1 - deathProb);
        }
      }

      if (exitProb > 1) exitProb = 1;
      if (exitProb < 0) exitProb = 0;

      const exits = randBinom(exitProb);

      if (exits === 0) {
        // Stays
        justice.age[i + 1] = age + 1;
        justice.demJustice[i + 1] = justiceSide;
        justice.seatid[i + 1] = justice.seatid[i];
        justice.ideology[i + 1] = justice.ideology[i];
      } else if (sim.unifiedGov[i] === 0) {
        // Exits but divided government — vacancy
        justice.seatid[i + 1] = 0;
        justice.demJustice[i + 1] = -1;
        justice.age[i + 1] = 20; // dummy
        justice.ideology[i + 1] = NaN;
      } else {
        // Exits with unified government — replaced
        seatCount++;
        justice.seatid[i + 1] = seatCount;
        justice.demJustice[i + 1] = presidentSide;
        justice.age[i + 1] = Math.floor(randNormal(params.meanAge, params.sdAge));
        // Ideology filled by vacancyPredictIdeology
      }
    }
  }
}

// ============================================================
// VACANCY UNTIL UNIFIED — PREDICT IDEOLOGY
// Port of vacancy_until_unified_predict_ideology()
// ============================================================

function vacancyPredictIdeology(sim, params) {
  const nYears = sim.nYears;

  for (let i = 1; i < nYears; i++) {
    for (let j = 0; j < sim.numJustices; j++) {
      const justice = sim.justices[j];

      if (justice.seatid[i] === justice.seatid[i - 1]) {
        // Incumbent
        justice.ideology[i] = justice.ideology[i - 1];
      } else if (justice.seatid[i] > 0 && justice.seatid[i] !== justice.seatid[i - 1]) {
        // New justice (filled seat)
        if (justice.demJustice[i] === 1) {
          justice.ideology[i] = -1 + 2 * randBeta(params.demShape1, params.demShape2);
        } else if (justice.demJustice[i] === 0) {
          justice.ideology[i] = -(-1 + 2 * randBeta(params.repShape1, params.repShape2));
        }
      } else {
        // Vacancy
        justice.ideology[i] = NaN;
      }
    }
  }
}

// ============================================================
// COURT PACKING — ONE-TIME INCREASE
// Port of court_packing_onetimeincrease() from FSC_Simulator_2024.R lines 847-983
// ============================================================

function courtPackingOneTimeIncrease(sim, params) {
  const nYears = sim.nYears;
  const seatIncreaseN = params.courtPackN;
  const startYear = params.courtPackingStartYear;
  const a = params.weightStrategicRetirement;
  const termLimit = params.termLimit;

  // Find first unified government year on or after startYear
  // courtPackingParty: if set (0 or 1), only pack when that party has unified gov
  // Default: 1 (Dem), matching the book's intent (Dem court packing scenario).
  // The R code's _dem variant checks: unified_government==1 && dem_president==1
  let packYear = -1;
  let packSide = -1;
  const startIdx = Math.max(startYear - params.currentYear, 0);
  const requiredParty = params.courtPackingParty !== undefined ? params.courtPackingParty : -1;

  for (let i = startIdx + 1; i < nYears; i++) {
    if (sim.unifiedGov[i] === 1 && (requiredParty === -1 || sim.demPresident[i] === requiredParty)) {
      packYear = i;
      packSide = sim.demPresident[i];
      break;
    }
  }

  if (packYear === -1) {
    // No unified government found — just run standard judge prediction
    predictJudge(sim, params);
    predictIdeology(sim, params);
    return;
  }

  // Add new justice tracks
  const totalJustices = 9 + seatIncreaseN;
  let seatCount = 9;
  for (let j = 0; j < 9; j++) {
    if (sim.justices[j].seatid[0] > seatCount) seatCount = sim.justices[j].seatid[0];
  }

  // Create new justice tracks (initially inactive)
  for (let k = 0; k < seatIncreaseN; k++) {
    const track = {
      seatid: new Array(nYears).fill(0),
      demJustice: new Array(nYears).fill(0),
      ideology: new Array(nYears).fill(0),
      age: new Array(nYears).fill(0),
      originalSeat: 9 + k + 1,
      active: new Array(nYears).fill(false),
    };
    sim.justices.push(track);
  }
  sim.numJustices = totalJustices;

  // Fill the new tracks at pack year
  for (let k = 9; k < totalJustices; k++) {
    seatCount++;
    sim.justices[k].active[packYear] = true;
    sim.justices[k].seatid[packYear] = seatCount;
    sim.justices[k].demJustice[packYear] = packSide;
    sim.justices[k].age[packYear] = Math.floor(randNormal(params.meanAge, params.sdAge));
    if (packSide === 1) {
      sim.justices[k].ideology[packYear] = -1 + 2 * randBeta(params.demShape1, params.demShape2);
    } else {
      sim.justices[k].ideology[packYear] = -(-1 + 2 * randBeta(params.repShape1, params.repShape2));
    }
  }

  // Now run judge prediction for ALL justice tracks across ALL years
  // For the original 9 justices: standard logic from year 0
  // For new justices: standard logic from packYear onward
  for (let i = 0; i < nYears - 1; i++) {
    const presidentSide = sim.demPresident[i];

    for (let j = 0; j < totalJustices; j++) {
      const justice = sim.justices[j];

      if (!justice.active[i]) {
        // Not yet active — check if this is the pack year
        if (i + 1 === packYear && j >= 9) {
          // Will be activated at packYear (already set above)
        }
        continue;
      }

      const age = justice.age[i];
      const justiceSide = justice.demJustice[i];
      const deathProb = age < DEATH_PROB.length ? DEATH_PROB[age] : 1;
      const retIdx = age - 35;
      const basic = (retIdx >= 0 && retIdx < BASIC_RETIREMENT.length) ? BASIC_RETIREMENT[retIdx] : 0.5;
      const strategic = (retIdx >= 0 && retIdx < STRATEGIC_RETIREMENT.length) ? STRATEGIC_RETIREMENT[retIdx] : 0.5;

      let exitProb;
      if (i > termLimit && justice.seatid[i] === justice.seatid[i - termLimit]) {
        exitProb = 1;
      } else {
        if (justiceSide === presidentSide) {
          exitProb = deathProb + (basic + a * strategic) * (1 - deathProb);
        } else {
          exitProb = deathProb + basic * (1 - deathProb);
        }
      }

      if (exitProb > 1) exitProb = 1;
      if (exitProb < 0) exitProb = 0;

      const exits = randBinom(exitProb);

      if (exits === 0) {
        justice.age[i + 1] = age + 1;
        justice.demJustice[i + 1] = justiceSide;
        justice.seatid[i + 1] = justice.seatid[i];
        justice.ideology[i + 1] = justice.ideology[i];
        justice.active[i + 1] = true;
      } else {
        seatCount++;
        justice.seatid[i + 1] = seatCount;
        justice.demJustice[i + 1] = presidentSide;
        justice.age[i + 1] = Math.floor(randNormal(params.meanAge, params.sdAge));
        justice.active[i + 1] = true;
        // Draw ideology immediately for court packing (R does this inline)
        if (presidentSide === 1) {
          justice.ideology[i + 1] = -1 + 2 * randBeta(params.demShape1, params.demShape2);
        } else {
          justice.ideology[i + 1] = -(-1 + 2 * randBeta(params.repShape1, params.repShape2));
        }
      }
    }
  }
}

// ============================================================
// TIT FOR TAT
// Port of tit_for_tat() from FSC_Simulator_2024.R lines 1128-1150
// Only tracks n_seats over time (does not simulate individual justices)
// ============================================================

function titForTat(sim, params) {
  const nYears = sim.nYears;
  const n = params.courtPackN;
  const startYear = params.courtPackingStartYear;
  const k = startYear - params.currentYear;

  const nSeats = new Array(nYears).fill(9);
  let presSide = -1;

  for (let i = Math.max(k, 1); i < nYears; i++) {
    if (sim.unifiedGov[i - 1] === 1 && sim.demPresident[i - 1] !== presSide) {
      presSide = sim.demPresident[i - 1];
      nSeats[i] = nSeats[i - 1] + n;
    } else {
      nSeats[i] = nSeats[i - 1];
    }
  }

  // Debug: log first sim's seat trajectory
  if (typeof window !== 'undefined' && !titForTat._logged) {
    console.log('Tit-for-tat nSeats (first sim):', JSON.stringify(nSeats.slice(0, 20)));
    console.log('Tit-for-tat final seats:', nSeats[nSeats.length - 1]);
    const packYears = [];
    for (let ii = 1; ii < nYears; ii++) {
      if (nSeats[ii] > nSeats[ii - 1]) packYears.push(sim.years[ii]);
    }
    console.log('Packing years:', packYears);
    titForTat._logged = true;
  }

  return nSeats;
}

// ============================================================
// TERM LIMITS (18yr or 9yr)
// Port of term_limit_separate_script.R
// Post-processes baseline simulation results
// ============================================================

function applyTermLimits(sim, params) {
  const nYears = sim.nYears;
  const termLength = params.termLimitYears;
  const startYear = params.currentYear;
  const onsets = termLength === 18 ? TERM_LIMIT_ONSETS_18 : TERM_LIMIT_ONSETS_9;

  // For each year and justice, check if term limit fires
  // A term limit fires when (year - onsetYear) % termLength === 0 and year >= onsetYear
  let seatCount = 9;
  for (let j = 0; j < 9; j++) {
    if (sim.justices[j].seatid[0] > seatCount) seatCount = sim.justices[j].seatid[0];
  }

  // First pass: find max seatid from baseline
  for (let i = 0; i < nYears; i++) {
    for (let j = 0; j < 9; j++) {
      if (sim.justices[j].seatid[i] > seatCount) seatCount = sim.justices[j].seatid[i];
    }
  }

  // Second pass: apply term limits
  for (let i = 1; i < nYears; i++) {
    const year = sim.years[i];

    for (let j = 0; j < 9; j++) {
      const justice = sim.justices[j];
      const origSeat = justice.originalSeat;
      const onsetOffset = onsets[origSeat];
      if (onsetOffset === undefined) continue;

      const onsetYear = startYear + onsetOffset;

      if (year >= onsetYear && (year - onsetYear) % termLength === 0) {
        // Term limit fires — new justice
        seatCount++;
        justice.seatid[i] = seatCount;
        justice.demJustice[i] = sim.demPresident[i];
        // Draw ideology based on president's party
        if (sim.demPresident[i] === 1) {
          justice.ideology[i] = -1 + 2 * randBeta(params.demShape1, params.demShape2);
        } else {
          justice.ideology[i] = -(-1 + 2 * randBeta(params.repShape1, params.repShape2));
        }
      } else {
        // Carry forward from previous year (override baseline)
        // Find the most recent value for this seat
        justice.seatid[i] = justice.seatid[i - 1] === undefined ? justice.seatid[i] : justice.seatid[i - 1] || justice.seatid[i];
        // If seatid didn't change, carry forward ideology and demJustice
        if (justice.seatid[i] === justice.seatid[i - 1]) {
          justice.ideology[i] = justice.ideology[i - 1];
          justice.demJustice[i] = justice.demJustice[i - 1];
        }
        // If baseline had a replacement, keep it only if no term limit override
      }
    }
  }
}

// ============================================================
// PIPELINE ORCHESTRATORS
// ============================================================

function runBaselinePipeline(sim, params) {
  predictPresident(sim, params);
  predictSenate(sim, params);
  predictJudge(sim, params);
  predictIdeology(sim, params);
}

function runNoStrategicPipeline(sim, params) {
  predictPresident(sim, params);
  predictSenate(sim, params);
  predictJudgeNoStrategic(sim, params);
  predictIdeology(sim, params);
}

function runVacancyPipeline(sim, params) {
  predictPresident(sim, params);
  predictSenate(sim, params);
  vacancyPredictJudge(sim, params);
  vacancyPredictIdeology(sim, params);
}

function runCourtPackingPipeline(sim, params) {
  predictPresident(sim, params);
  predictSenate(sim, params);
  courtPackingOneTimeIncrease(sim, params);
  // Ideology is handled inside courtPackingOneTimeIncrease
}

function runTitForTatPipeline(sim, params) {
  predictPresident(sim, params);
  predictSenate(sim, params);
  return titForTat(sim, params);
}

function runTermLimitPipeline(sim, params) {
  // First run baseline to get political environment and baseline judge predictions
  predictPresident(sim, params);
  predictSenate(sim, params);
  predictJudge(sim, params);
  predictIdeology(sim, params);
  // Then apply term limits as post-processing
  applyTermLimits(sim, params);
}

// ============================================================
// AGGREGATION
// ============================================================

function aggregateSimulations(results, params) {
  const nYears = params.endYear - params.currentYear + 1;
  const years = Array.from({ length: nYears }, (_, i) => params.currentYear + i);

  const agg = {
    years: years,
    // Per-year arrays (each is mean/median across sims)
    medianIdeologyMean: new Array(nYears).fill(0),
    medianIdeologyMedian: new Array(nYears).fill(0),
    medianIdeologyP025: new Array(nYears).fill(0),
    medianIdeologyP975: new Array(nYears).fill(0),
    demSeatsMean: new Array(nYears).fill(0),
    pDemPresident: new Array(nYears).fill(0),
    pDemSenate: new Array(nYears).fill(0),
    pUnifiedGov: new Array(nYears).fill(0),
    blocLiberal: new Array(nYears).fill(0),
    blocModerate: new Array(nYears).fill(0),
    blocConservative: new Array(nYears).fill(0),
    // For histograms at specific years
    demSeatsDistribution: {}, // year -> array of counts across sims
    // Tit-for-tat specific
    nSeatsMean: null,
  };

  const nSims = results.length;

  // Collect per-sim per-year median ideologies
  const mediansByYear = Array.from({ length: nYears }, () => []);
  const demSeatsByYear = Array.from({ length: nYears }, () => []);

  for (let s = 0; s < nSims; s++) {
    const sim = results[s];

    for (let i = 0; i < nYears; i++) {
      // Collect ideologies for active justices at year i
      const ideologies = [];
      let demSeats = 0;
      let liberal = 0, moderate = 0, conservative = 0;

      for (let j = 0; j < sim.numJustices; j++) {
        if (!sim.justices[j].active[i]) continue;
        const ideo = sim.justices[j].ideology[i];
        if (isNaN(ideo)) continue; // skip vacancies
        ideologies.push(ideo);
        if (sim.justices[j].demJustice[i] === 1) demSeats++;

        if (ideo < -0.2) liberal++;
        else if (ideo > 0.2) conservative++;
        else moderate++;
      }

      // Compute median ideology
      ideologies.sort((a, b) => a - b);
      const median = ideologies.length > 0
        ? (ideologies.length % 2 === 1
          ? ideologies[Math.floor(ideologies.length / 2)]
          : (ideologies[ideologies.length / 2 - 1] + ideologies[ideologies.length / 2]) / 2)
        : 0;

      mediansByYear[i].push(median);
      demSeatsByYear[i].push(demSeats);

      // Accumulate for means
      agg.pDemPresident[i] += sim.demPresident[i];
      agg.pDemSenate[i] += sim.demSenMaj[i];
      agg.pUnifiedGov[i] += sim.unifiedGov[i];
      agg.blocLiberal[i] += liberal;
      agg.blocModerate[i] += moderate;
      agg.blocConservative[i] += conservative;
    }
  }

  // Compute statistics
  for (let i = 0; i < nYears; i++) {
    const medians = mediansByYear[i].sort((a, b) => a - b);
    const n = medians.length;

    agg.medianIdeologyMean[i] = medians.reduce((s, v) => s + v, 0) / n;
    agg.medianIdeologyMedian[i] = n % 2 === 1
      ? medians[Math.floor(n / 2)]
      : (medians[n / 2 - 1] + medians[n / 2]) / 2;
    agg.medianIdeologyP025[i] = medians[Math.max(0, Math.floor(n * 0.025))];
    agg.medianIdeologyP975[i] = medians[Math.min(n - 1, Math.floor(n * 0.975))];

    agg.demSeatsMean[i] = demSeatsByYear[i].reduce((s, v) => s + v, 0) / n;
    agg.pDemPresident[i] /= nSims;
    agg.pDemSenate[i] /= nSims;
    agg.pUnifiedGov[i] /= nSims;
    agg.blocLiberal[i] /= nSims;
    agg.blocModerate[i] /= nSims;
    agg.blocConservative[i] /= nSims;

    // Store full distribution keyed by decade start (e.g., 2026 -> 2020, 2035 -> 2030)
    const year = years[i];
    const decadeKey = Math.floor(year / 10) * 10;
    if (!agg.demSeatsDistribution[decadeKey]) {
      agg.demSeatsDistribution[decadeKey] = [];
    }
    // Append this year's per-sim dem seat counts to the decade bucket
    agg.demSeatsDistribution[decadeKey].push(...demSeatsByYear[i]);
  }

  return agg;
}

// Aggregate tit-for-tat results (array of nSeats arrays)
function aggregateTitForTat(nSeatsResults, params) {
  const nYears = params.endYear - params.currentYear + 1;
  const years = Array.from({ length: nYears }, (_, i) => params.currentYear + i);
  const nSims = nSeatsResults.length;

  const nSeatsMean = new Array(nYears).fill(0);
  const nSeatsP025 = new Array(nYears).fill(0);
  const nSeatsP975 = new Array(nYears).fill(0);

  for (let i = 0; i < nYears; i++) {
    const vals = [];
    for (let s = 0; s < nSims; s++) {
      nSeatsMean[i] += nSeatsResults[s][i];
      vals.push(nSeatsResults[s][i]);
    }
    nSeatsMean[i] /= nSims;
    vals.sort((a, b) => a - b);
    nSeatsP025[i] = vals[Math.max(0, Math.floor(nSims * 0.025))];
    nSeatsP975[i] = vals[Math.min(nSims - 1, Math.floor(nSims * 0.975))];
  }

  return { years, nSeatsMean, nSeatsP025, nSeatsP975 };
}

// ============================================================
// MAIN SIMULATION RUNNER
// ============================================================

function runExperiment(experimentType, userParams) {
  const params = { ...DEFAULT_PARAMS, ...userParams };
  const nSims = params.numSims;
  const results = [];
  const nSeatsResults = []; // for tit-for-tat

  for (let s = 0; s < nSims; s++) {
    const sim = initSimulation(params);

    switch (experimentType) {
      case 'baseline':
        runBaselinePipeline(sim, params);
        break;
      case 'noStrategicRetirement':
        runNoStrategicPipeline(sim, params);
        break;
      case 'noDGConfirmations':
        runVacancyPipeline(sim, params);
        break;
      case 'courtPacking':
        runCourtPackingPipeline(sim, params);
        break;
      case 'titForTat': {
        runBaselinePipeline(sim, params);
        const nSeats = titForTat(sim, params);
        nSeatsResults.push(nSeats);
        break;
      }
      case 'termLimits':
        runTermLimitPipeline(sim, params);
        break;
      case 'counterfactual2016':
        runBaselinePipeline(sim, params);
        break;
      default:
        runBaselinePipeline(sim, params);
    }

    results.push(sim);
  }

  const agg = aggregateSimulations(results, params);

  if (experimentType === 'titForTat') {
    const tftAgg = aggregateTitForTat(nSeatsResults, params);
    agg.nSeatsMean = tftAgg.nSeatsMean;
    agg.nSeatsP025 = tftAgg.nSeatsP025;
    agg.nSeatsP975 = tftAgg.nSeatsP975;
  }

  return { results, aggregated: agg, params };
}

// Async version that yields to the event loop
async function runExperimentAsync(experimentType, userParams, onProgress) {
  const params = { ...DEFAULT_PARAMS, ...userParams };
  const nSims = params.numSims;
  const results = [];
  const nSeatsResults = [];
  const batchSize = 20;

  for (let s = 0; s < nSims; s++) {
    const sim = initSimulation(params);

    switch (experimentType) {
      case 'baseline':
        runBaselinePipeline(sim, params);
        break;
      case 'noStrategicRetirement':
        runNoStrategicPipeline(sim, params);
        break;
      case 'noDGConfirmations':
        runVacancyPipeline(sim, params);
        break;
      case 'courtPacking':
        runCourtPackingPipeline(sim, params);
        break;
      case 'titForTat': {
        // Run full baseline pipeline so justice data is available for charts
        runBaselinePipeline(sim, params);
        // Also compute seat count trajectory
        const nSeats = titForTat(sim, params);
        nSeatsResults.push(nSeats);
        break;
      }
      case 'termLimits':
        runTermLimitPipeline(sim, params);
        break;
      case 'counterfactual2016':
        runBaselinePipeline(sim, params);
        break;
      default:
        runBaselinePipeline(sim, params);
    }

    results.push(sim);

    if (s % batchSize === 0 && onProgress) {
      onProgress(s / nSims);
      await new Promise(r => setTimeout(r, 0));
    }
  }

  if (onProgress) onProgress(1);

  const agg = aggregateSimulations(results, params);
  if (experimentType === 'titForTat') {
    const tftAgg = aggregateTitForTat(nSeatsResults, params);
    agg.nSeatsMean = tftAgg.nSeatsMean;
    agg.nSeatsP025 = tftAgg.nSeatsP025;
    agg.nSeatsP975 = tftAgg.nSeatsP975;
  }

  return { results, aggregated: agg, params };
}
