// data.js — Embedded constants from CSV data files
// All data from the R codebase's CSV inputs, embedded for browser use.

// ============================================================
// STARTING COURT (2026)
// From base_data_from_characteristics_for_simulations_2026.csv
// seatid reassigned per master_run_all_sims_2024.R: c(7,9,2,8,6,1,3,4,5)
// ============================================================
const STARTING_COURT_2026 = [
  { justice: "gorsuch",   seatid: 7, demJustice: 0, ideology:  0.58338,    age: 58, originalSeat: 1 },
  { justice: "kavanaugh", seatid: 9, demJustice: 0, ideology:  0.6704823,  age: 60, originalSeat: 2 },
  { justice: "jackson",   seatid: 2, demJustice: 1, ideology: -0.32,       age: 55, originalSeat: 3 },
  { justice: "sotomayor", seatid: 8, demJustice: 1, ideology: -0.2987079, age: 71, originalSeat: 4 },
  { justice: "kagan",     seatid: 6, demJustice: 1, ideology: -0.2919551, age: 65, originalSeat: 5 },
  { justice: "thomas",    seatid: 1, demJustice: 0, ideology:  0.5426272,  age: 77, originalSeat: 6 },
  { justice: "barrett",   seatid: 3, demJustice: 0, ideology:  0.4545732,  age: 53, originalSeat: 7 },
  { justice: "roberts",   seatid: 4, demJustice: 0, ideology:  0.6372294,  age: 70, originalSeat: 8 },
  { justice: "alito",     seatid: 5, demJustice: 0, ideology:  0.6505306,  age: 75, originalSeat: 9 },
];

// Starting political state in 2026: Rep president, Rep senate, unified
const STARTING_YEAR_2026 = 2026;
const STARTING_DEM_PRESIDENT_2026 = 0;
const STARTING_DEM_SEN_MAJ_2026 = 0;
const STARTING_UNIFIED_GOV_2026 = 1;

// President history init for 2026 baseline
// 6 years looking back: 2021-2024=Biden(1,1,1,1), 2025-2026=Trump(0,0)
const PRESIDENT_HISTORY_INIT_2026 = [1, 1, 1, 1, 0, 0];

// ============================================================
// STARTING COURT (2016 COUNTERFACTUAL)
// From base_data_from_characteristics_for_simulations_2016_counterfactual.csv
// seatid reassigned same way: c(7,9,2,8,6,1,3,4,5)
// Order in CSV: alito, breyer, garland, ginsburg, kagan, kennedy, roberts, sotomayor, thomas
// ============================================================
const STARTING_COURT_2016CF = [
  { justice: "alito",     seatid: 7, demJustice: 0, ideology:  0.6505306,  age: 67, originalSeat: 1 },
  { justice: "breyer",    seatid: 9, demJustice: 1, ideology: -0.1518656, age: 79, originalSeat: 2 },
  { justice: "garland",   seatid: 2, demJustice: 1, ideology: -0.25,      age: 65, originalSeat: 3 },
  { justice: "ginsburg",  seatid: 8, demJustice: 1, ideology: -0.3008974, age: 84, originalSeat: 4 },
  { justice: "kagan",     seatid: 6, demJustice: 1, ideology: -0.2919551, age: 57, originalSeat: 5 },
  { justice: "kennedy",   seatid: 1, demJustice: 0, ideology:  0.4737906,  age: 81, originalSeat: 6 },
  { justice: "roberts",   seatid: 3, demJustice: 0, ideology:  0.6372294,  age: 62, originalSeat: 7 },
  { justice: "sotomayor", seatid: 4, demJustice: 1, ideology: -0.2987079, age: 63, originalSeat: 8 },
  { justice: "thomas",    seatid: 5, demJustice: 0, ideology:  0.5426272,  age: 69, originalSeat: 9 },
];

const STARTING_YEAR_2016CF = 2017;
const STARTING_DEM_PRESIDENT_2016CF = 1;
const STARTING_DEM_SEN_MAJ_2016CF = 0;
const STARTING_UNIFIED_GOV_2016CF = 0;

// President history init for 2016 counterfactual: Bush(0) -> Obama x4 (1,1,1,1) -> Clinton(1)
const PRESIDENT_HISTORY_INIT_2016CF = [0, 1, 1, 1, 1, 1];

// ============================================================
// RETROACTIVE COURT PACKING (2021) STARTING COURT
// Hypothetical: Democrats packed 4 seats in 2021. By 2026 those
// justices are ~57 years old. Uses the standard 2026 baseline
// 9 justices plus 4 Dem-appointed justices with pre-drawn ideology.
// Ideology drawn from Beta(3,11) scaled to [-1,1] (Dem side).
// Ages set to 57 (appointed at ~52 in 2021, now 5 years later).
// ============================================================
const STARTING_COURT_PACKED_2021 = [
  // Original 9 (same as STARTING_COURT_2026)
  { justice: "gorsuch",   seatid: 7,  demJustice: 0, ideology:  0.58338,    age: 58, originalSeat: 1 },
  { justice: "kavanaugh", seatid: 9,  demJustice: 0, ideology:  0.6704823,  age: 60, originalSeat: 2 },
  { justice: "jackson",   seatid: 2,  demJustice: 1, ideology: -0.32,       age: 55, originalSeat: 3 },
  { justice: "sotomayor", seatid: 8,  demJustice: 1, ideology: -0.2987079, age: 71, originalSeat: 4 },
  { justice: "kagan",     seatid: 6,  demJustice: 1, ideology: -0.2919551, age: 65, originalSeat: 5 },
  { justice: "thomas",    seatid: 1,  demJustice: 0, ideology:  0.5426272,  age: 77, originalSeat: 6 },
  { justice: "barrett",   seatid: 3,  demJustice: 0, ideology:  0.4545732,  age: 53, originalSeat: 7 },
  { justice: "roberts",   seatid: 4,  demJustice: 0, ideology:  0.6372294,  age: 70, originalSeat: 8 },
  { justice: "alito",     seatid: 5,  demJustice: 0, ideology:  0.6505306,  age: 75, originalSeat: 9 },
  // 4 packed Dem justices (appointed 2021, aged ~52 then, ~57 now)
  // Ideology values are representative draws from Beta(3,11) Dem distribution
  { justice: "packed_1",  seatid: 10, demJustice: 1, ideology: -0.5714, age: 57, originalSeat: 10 },
  { justice: "packed_2",  seatid: 11, demJustice: 1, ideology: -0.4286, age: 57, originalSeat: 11 },
  { justice: "packed_3",  seatid: 12, demJustice: 1, ideology: -0.3571, age: 57, originalSeat: 12 },
  { justice: "packed_4",  seatid: 13, demJustice: 1, ideology: -0.5000, age: 57, originalSeat: 13 },
];

// ============================================================
// HISTORICAL COURT DATA (2016-2025)
// Known court composition for prepending to simulated results.
// NSP ideology scores are static (no drift model in this sim).
//
// Court changes:
//   2016: Scalia dies Feb → 8 justices (vacancy)
//   2017: Gorsuch replaces Scalia (Trump)
//   2018: Kavanaugh replaces Kennedy (Trump)
//   2020: Barrett replaces Ginsburg (Trump, Oct)
//   2022: Jackson replaces Breyer (Biden)
//   2023-2025: stable 6-3 conservative court
//
// medianIdeology: median of 9 justices' NSP scores (5th value when sorted)
//   For 2016 (8 justices): average of 4th and 5th sorted values
// demSeats: number of Dem-appointed justices
// demPresident: 1=Dem, 0=Rep (at start of year)
// demSenate: 1=Dem majority, 0=Rep
// unifiedGov: 1=same party controls presidency and senate
// ============================================================
const HISTORICAL_DATA = [
  // 2016: Obama(D), Rep Senate. Court: Roberts(.637), Kennedy(.474), Thomas(.543),
  //   Alito(.651), Ginsburg(-.301), Breyer(-.152), Sotomayor(-.299), Kagan(-.292)
  //   Scalia vacancy. Sorted 8: [-.301,-.299,-.292,-.152, .474,.543,.637,.651]
  //   Median = avg(4th,5th) = (-.152+.474)/2 = 0.161
  { year: 2016, medianIdeology: 0.161, demSeats: 4, demPresident: 1, demSenate: 0, unifiedGov: 0,
    liberal: 4, moderate: 0, conservative: 4 },
  // 2017: Trump(R), Rep Senate. Gorsuch(.583) replaces Scalia.
  //   Sorted 9: [-.301,-.299,-.292,-.152, .474,.543,.583,.637,.651]  median=.474 (Kennedy)
  { year: 2017, medianIdeology: 0.474, demSeats: 4, demPresident: 0, demSenate: 0, unifiedGov: 1,
    liberal: 4, moderate: 0, conservative: 5 },
  // 2018: Kavanaugh(.670) replaces Kennedy(.474).
  //   Sorted 9: [-.301,-.299,-.292,-.152, .543,.583,.637,.651,.670]  median=.543 (Thomas)
  { year: 2018, medianIdeology: 0.543, demSeats: 4, demPresident: 0, demSenate: 0, unifiedGov: 1,
    liberal: 4, moderate: 0, conservative: 5 },
  // 2019: Same court. Dem Senate (116th Congress). median=.543
  { year: 2019, medianIdeology: 0.543, demSeats: 4, demPresident: 0, demSenate: 0, unifiedGov: 1,
    liberal: 4, moderate: 0, conservative: 5 },
  // 2020: Barrett(.455) replaces Ginsburg(-.301) in Oct.
  //   Sorted 9: [-.299,-.292,-.152, .455,.543,.583,.637,.651,.670]  median=.543
  { year: 2020, medianIdeology: 0.543, demSeats: 3, demPresident: 0, demSenate: 0, unifiedGov: 1,
    liberal: 3, moderate: 0, conservative: 6 },
  // 2021: Biden(D), Dem Senate (50-50+VP). Same court. median=.543
  { year: 2021, medianIdeology: 0.543, demSeats: 3, demPresident: 1, demSenate: 1, unifiedGov: 1,
    liberal: 3, moderate: 0, conservative: 6 },
  // 2022: Jackson(-.32) replaces Breyer(-.152).
  //   Sorted 9: [-.32,-.299,-.292, .455,.543,.583,.637,.651,.670]  median=.543
  { year: 2022, medianIdeology: 0.543, demSeats: 3, demPresident: 1, demSenate: 1, unifiedGov: 1,
    liberal: 3, moderate: 0, conservative: 6 },
  // 2023: Same court. Dem Senate (51-49). median=.543
  { year: 2023, medianIdeology: 0.543, demSeats: 3, demPresident: 1, demSenate: 1, unifiedGov: 1,
    liberal: 3, moderate: 0, conservative: 6 },
  // 2024: Same court. median=.543
  { year: 2024, medianIdeology: 0.543, demSeats: 3, demPresident: 1, demSenate: 1, unifiedGov: 1,
    liberal: 3, moderate: 0, conservative: 6 },
  // 2025: Trump(R), Rep Senate. Same justices. median=.543
  { year: 2025, medianIdeology: 0.543, demSeats: 3, demPresident: 0, demSenate: 0, unifiedGov: 1,
    liberal: 3, moderate: 0, conservative: 6 },
];

// ============================================================
// DEATH PROBABILITIES (SSA mortality table)
// From death_probabilities_from_SSA_for_simulations.csv
// Index by age (0-119)
// ============================================================
const DEATH_PROB = [
  0.0058475, 0.0003955, 0.0002655, 0.0002015, 0.0001625,
  0.000146, 0.0001335, 0.0001225, 0.00011, 0.0000975,
  0.0000905, 0.0000955, 0.0001215, 0.0001745, 0.000248,
  0.0003285, 0.0004115, 0.000501, 0.0005965, 0.000694,
  0.000798, 0.0008985, 0.00098, 0.001035, 0.00107,
  0.0011, 0.0011325, 0.0011675, 0.0012075, 0.0012525,
  0.0012985, 0.001344, 0.0013925, 0.001443, 0.0014975,
  0.0015605, 0.0016295, 0.0016975, 0.0017635, 0.0018315,
  0.0019115, 0.0020105, 0.00213, 0.0022735, 0.002442,
  0.002631, 0.0028455, 0.0030985, 0.0033955, 0.003732,
  0.0041, 0.0044925, 0.0049095, 0.0053505, 0.005816,
  0.006317, 0.0068485, 0.0073965, 0.007958, 0.00854,
  0.0091905, 0.009896, 0.0105975, 0.011281, 0.011988,
  0.0127845, 0.0137245, 0.014818, 0.016095, 0.0175625,
  0.0192675, 0.021177, 0.023223, 0.0253875, 0.0277485,
  0.030499, 0.033677, 0.0371665, 0.0409735, 0.04521,
  0.0501255, 0.0557745, 0.06203, 0.06891, 0.0765645,
  0.085183, 0.0949275, 0.105913, 0.1181995, 0.131798,
  0.1466975, 0.16287, 0.1802755, 0.198868, 0.2185915,
  0.2383185, 0.2576995, 0.2763565, 0.2938995, 0.3099365,
  0.326856, 0.3447065, 0.36354, 0.3834115, 0.4043775,
  0.4265, 0.4498425, 0.4744735, 0.5004645, 0.5278905,
  0.5568325, 0.5873745, 0.619605, 0.653619, 0.689516,
  0.7274005, 0.767384, 0.807162, 0.84752, 0.889896,
];

// ============================================================
// RETIREMENT PROBABILITIES BY AGE
// From basic_and_strategic_retirement_probabilities_by_age.csv
// Index 0 = age 35, index 85 = age 120
// ============================================================
const BASIC_RETIREMENT = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0.01, 0.0125, 0.015, 0.0175, 0.02,
  0.0225, 0.025, 0.0275, 0.03, 0.0325,
  0.035, 0.0375, 0.04, 0.0425, 0.045,
  0.0475, 0.05, 0.06, 0.07, 0.08,
  0.09, 0.1, 0.11, 0.12, 0.13,
  0.14, 0.15, 0.16, 0.17, 0.18,
  0.19, 0.2, 0.21, 0.22, 0.23,
  0.24, 0.25, 0.26, 0.27, 0.28,
  0.29, 0.3, 0.31, 0.32, 0.33,
  0.34, 0.35, 0.36, 0.37, 0.38,
  0.39, 0.4, 0.41, 0.42, 0.43,
  0.44,
];

const STRATEGIC_RETIREMENT = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0.01, 0.01, 0.01, 0.01, 0.01,
  0.02, 0.029575153, 0.042056613, 0.057736555, 0.076790197,
  0.099260213, 0.125054027, 0.153952914, 0.185630409, 0.219676808,
  0.25562645, 0.292984881, 0.331253663, 0.369951353, 0.408629916,
  0.446886404, 0.484370213, 0.520786461, 0.555896215, 0.589514301,
  0.621505406, 0.651779084, 0.680284189, 0.707003135, 0.731946277,
  0.755146624, 0.776655025, 0.796535876, 0.814863391, 0.831718432,
  0.84718585, 0.861352313, 0.874304557, 0.886128016, 0.896905776,
  0.906717794, 0.915640355, 0.923745706, 0.931101849, 0.937772451,
  0.943816843, 0.949290098, 0.95424316, 0.958723009, 0.962772851,
  0.966432334, 0.96973776, 0.972722308, 0.975416254, 0.977847184,
  0.980040201,
];

// ============================================================
// PARTY CONTROL HISTORY (1861-2025)
// From party_control_1861_2025.csv
// Used for computing transition probabilities
// ============================================================
const PARTY_CONTROL = [
  {congress:37,year:1861,demPresident:0,demSenate:0,divGovSenate:0},
  {congress:38,year:1863,demPresident:0,demSenate:0,divGovSenate:0},
  {congress:39,year:1865,demPresident:1,demSenate:0,divGovSenate:1},
  {congress:40,year:1867,demPresident:1,demSenate:0,divGovSenate:1},
  {congress:41,year:1869,demPresident:0,demSenate:0,divGovSenate:0},
  {congress:42,year:1871,demPresident:0,demSenate:0,divGovSenate:0},
  {congress:43,year:1873,demPresident:0,demSenate:0,divGovSenate:0},
  {congress:44,year:1875,demPresident:0,demSenate:0,divGovSenate:0},
  {congress:45,year:1877,demPresident:0,demSenate:0,divGovSenate:0},
  {congress:46,year:1879,demPresident:0,demSenate:1,divGovSenate:1},
  {congress:47,year:1881,demPresident:0,demSenate:0,divGovSenate:0},
  {congress:48,year:1883,demPresident:0,demSenate:0,divGovSenate:0},
  {congress:49,year:1885,demPresident:1,demSenate:0,divGovSenate:1},
  {congress:50,year:1887,demPresident:1,demSenate:0,divGovSenate:1},
  {congress:51,year:1889,demPresident:0,demSenate:0,divGovSenate:0},
  {congress:52,year:1891,demPresident:0,demSenate:0,divGovSenate:0},
  {congress:53,year:1893,demPresident:1,demSenate:1,divGovSenate:0},
  {congress:54,year:1895,demPresident:1,demSenate:0,divGovSenate:1},
  {congress:55,year:1897,demPresident:0,demSenate:0,divGovSenate:0},
  {congress:56,year:1899,demPresident:0,demSenate:0,divGovSenate:0},
  {congress:57,year:1901,demPresident:0,demSenate:0,divGovSenate:0},
  {congress:58,year:1903,demPresident:0,demSenate:0,divGovSenate:0},
  {congress:59,year:1905,demPresident:0,demSenate:0,divGovSenate:0},
  {congress:60,year:1907,demPresident:0,demSenate:0,divGovSenate:0},
  {congress:61,year:1909,demPresident:0,demSenate:0,divGovSenate:0},
  {congress:62,year:1911,demPresident:0,demSenate:0,divGovSenate:0},
  {congress:63,year:1913,demPresident:1,demSenate:1,divGovSenate:0},
  {congress:64,year:1915,demPresident:1,demSenate:1,divGovSenate:0},
  {congress:65,year:1917,demPresident:1,demSenate:1,divGovSenate:0},
  {congress:66,year:1919,demPresident:1,demSenate:0,divGovSenate:1},
  {congress:67,year:1921,demPresident:0,demSenate:0,divGovSenate:0},
  {congress:68,year:1923,demPresident:0,demSenate:0,divGovSenate:0},
  {congress:69,year:1925,demPresident:0,demSenate:0,divGovSenate:0},
  {congress:70,year:1927,demPresident:0,demSenate:0,divGovSenate:0},
  {congress:71,year:1929,demPresident:0,demSenate:0,divGovSenate:0},
  {congress:72,year:1931,demPresident:0,demSenate:0,divGovSenate:0},
  {congress:73,year:1933,demPresident:1,demSenate:1,divGovSenate:0},
  {congress:74,year:1935,demPresident:1,demSenate:1,divGovSenate:0},
  {congress:75,year:1937,demPresident:1,demSenate:1,divGovSenate:0},
  {congress:76,year:1939,demPresident:1,demSenate:1,divGovSenate:0},
  {congress:77,year:1941,demPresident:1,demSenate:1,divGovSenate:0},
  {congress:78,year:1943,demPresident:1,demSenate:1,divGovSenate:0},
  {congress:79,year:1945,demPresident:1,demSenate:1,divGovSenate:0},
  {congress:80,year:1947,demPresident:1,demSenate:0,divGovSenate:1},
  {congress:81,year:1949,demPresident:1,demSenate:1,divGovSenate:0},
  {congress:82,year:1951,demPresident:1,demSenate:1,divGovSenate:0},
  {congress:83,year:1953,demPresident:0,demSenate:0,divGovSenate:0},
  {congress:84,year:1955,demPresident:0,demSenate:1,divGovSenate:1},
  {congress:85,year:1957,demPresident:0,demSenate:1,divGovSenate:1},
  {congress:86,year:1959,demPresident:0,demSenate:1,divGovSenate:1},
  {congress:87,year:1961,demPresident:1,demSenate:1,divGovSenate:0},
  {congress:88,year:1963,demPresident:1,demSenate:1,divGovSenate:0},
  {congress:89,year:1965,demPresident:1,demSenate:1,divGovSenate:0},
  {congress:90,year:1967,demPresident:1,demSenate:1,divGovSenate:0},
  {congress:91,year:1969,demPresident:0,demSenate:1,divGovSenate:1},
  {congress:92,year:1971,demPresident:0,demSenate:1,divGovSenate:1},
  {congress:93,year:1973,demPresident:0,demSenate:1,divGovSenate:1},
  {congress:94,year:1975,demPresident:0,demSenate:1,divGovSenate:1},
  {congress:95,year:1977,demPresident:1,demSenate:1,divGovSenate:0},
  {congress:96,year:1979,demPresident:1,demSenate:1,divGovSenate:0},
  {congress:97,year:1981,demPresident:0,demSenate:0,divGovSenate:0},
  {congress:98,year:1983,demPresident:0,demSenate:0,divGovSenate:0},
  {congress:99,year:1985,demPresident:0,demSenate:0,divGovSenate:0},
  {congress:100,year:1987,demPresident:0,demSenate:1,divGovSenate:1},
  {congress:101,year:1989,demPresident:0,demSenate:1,divGovSenate:1},
  {congress:102,year:1991,demPresident:0,demSenate:1,divGovSenate:1},
  {congress:103,year:1993,demPresident:1,demSenate:1,divGovSenate:0},
  {congress:104,year:1995,demPresident:1,demSenate:0,divGovSenate:1},
  {congress:105,year:1997,demPresident:1,demSenate:0,divGovSenate:1},
  {congress:106,year:1999,demPresident:1,demSenate:0,divGovSenate:1},
  {congress:107,year:2001,demPresident:0,demSenate:1,divGovSenate:1},
  {congress:108,year:2003,demPresident:0,demSenate:0,divGovSenate:0},
  {congress:109,year:2005,demPresident:0,demSenate:0,divGovSenate:0},
  {congress:110,year:2007,demPresident:0,demSenate:1,divGovSenate:1},
  {congress:111,year:2009,demPresident:1,demSenate:1,divGovSenate:0},
  {congress:112,year:2011,demPresident:1,demSenate:1,divGovSenate:0},
  {congress:113,year:2013,demPresident:1,demSenate:1,divGovSenate:0},
  {congress:114,year:2015,demPresident:1,demSenate:0,divGovSenate:1},
  {congress:115,year:2017,demPresident:0,demSenate:0,divGovSenate:0},
  {congress:116,year:2019,demPresident:0,demSenate:0,divGovSenate:0},
  {congress:117,year:2021,demPresident:1,demSenate:1,divGovSenate:0},
  {congress:118,year:2023,demPresident:1,demSenate:1,divGovSenate:0},
  {congress:119,year:2025,demPresident:0,demSenate:0,divGovSenate:0},
];

// ============================================================
// TRANSITION PROBABILITY COMPUTATION
// Ported from FSC_metafunctions_2024.R compute_transition_probs()
// ============================================================
function computeTransitionProbs(yearStart, yearEnd) {
  // Presidential transition probabilities
  // Filter to presidential election years (year-1 divisible by 4) within range
  const presYears = PARTY_CONTROL.filter(d => d.year >= yearStart && d.year <= yearEnd && (d.year - 1) % 4 === 0);

  // Build lagged series
  const presWithLags = presYears.map((d, i) => ({
    ...d,
    demPresLag1: i > 0 ? presYears[i - 1].demPresident : null,
    demPresLag2: i > 1 ? presYears[i - 2].demPresident : null,
    presSwitch: i > 0 ? (d.demPresident !== presYears[i - 1].demPresident ? 1 : 0) : null,
  }));

  const validPres = presWithLags.filter(d => d.presSwitch !== null && d.demPresLag2 !== null);
  const switchWhenDiff = validPres.filter(d => d.demPresLag1 !== d.demPresLag2);
  const switchWhenSame = validPres.filter(d => d.demPresLag1 === d.demPresLag2);

  const s1 = switchWhenDiff.length > 0 ? switchWhenDiff.reduce((s, d) => s + d.presSwitch, 0) / switchWhenDiff.length : 0.5;
  const s2 = switchWhenSame.length > 0 ? switchWhenSame.reduce((s, d) => s + d.presSwitch, 0) / switchWhenSame.length : 0.5;

  // Senate transition probabilities
  // IMPORTANT: Compute lags on the FULL dataset, then filter by year range.
  // R's dplyr::lag() operates on the full dataframe before filter() is applied.
  const full = [...PARTY_CONTROL].sort((a, b) => a.congress - b.congress);

  const fullWithLags = full.map((d, i) => ({
    ...d,
    electionType: d.congress % 2 === 0 ? "presidential" : "midterm",
    electionTypeLag1: i >= 1 ? (full[i - 1].congress % 2 === 0 ? "presidential" : "midterm") : null,
    divGovSenateLag1: i >= 1 ? full[i - 1].divGovSenate : null,
    senateSwitch: i >= 1 ? (d.demSenate !== full[i - 1].demSenate ? 1 : 0) : null,
  }));

  const validCong = fullWithLags.filter(d =>
    d.year >= yearStart && d.year <= yearEnd &&
    d.senateSwitch !== null && d.divGovSenateLag1 !== null && d.electionTypeLag1 !== null);

  function meanSwitch(arr) {
    if (arr.length === 0) return 0.5;
    return arr.reduce((s, d) => s + d.senateSwitch, 0) / arr.length;
  }

  return {
    probDemPDD: 1 - s2,   // P(Dem wins | two consecutive Dem terms)
    probDemPRR: s2,        // P(Dem wins | two consecutive Rep terms)
    probDemPRD: 1 - s1,   // P(Dem wins | Dem incumbent, preceded by Rep)
    probDemPDR: s1,        // P(Dem wins | Rep incumbent, preceded by Dem)
    switchUniPres: meanSwitch(validCong.filter(d => d.divGovSenateLag1 === 0 && d.electionTypeLag1 === "presidential")),
    switchDivPres: meanSwitch(validCong.filter(d => d.divGovSenateLag1 === 1 && d.electionTypeLag1 === "presidential")),
    switchUniMid:  meanSwitch(validCong.filter(d => d.divGovSenateLag1 === 0 && d.electionTypeLag1 === "midterm")),
    switchDivMid:  meanSwitch(validCong.filter(d => d.divGovSenateLag1 === 1 && d.electionTypeLag1 === "midterm")),
  };
}

// Precompute baseline probabilities (1948-2021, matching R's prob.calibration.year.end)
const BASELINE_PROBS = computeTransitionProbs(1948, 2021);

// Also compute 2016 counterfactual probabilities (1948-2017)
const CF2016_PROBS = computeTransitionProbs(1948, 2017);

// ============================================================
// DEFAULT SIMULATION PARAMETERS
// From FSC_metafunctions_2024.R
// ============================================================
const DEFAULT_PARAMS = {
  // Simulation setup
  currentYear: 2026,
  endYear: 2100,
  numSims: 200,

  // Starting court
  startingCourt: STARTING_COURT_2026,
  startingDemPresident: STARTING_DEM_PRESIDENT_2026,
  startingDemSenMaj: STARTING_DEM_SEN_MAJ_2026,
  startingUnifiedGov: STARTING_UNIFIED_GOV_2026,
  presidentHistoryInit: PRESIDENT_HISTORY_INIT_2026,

  // Presidential election probabilities
  probDemPDD: BASELINE_PROBS.probDemPDD,
  probDemPRR: BASELINE_PROBS.probDemPRR,
  probDemPRD: BASELINE_PROBS.probDemPRD,
  probDemPDR: BASELINE_PROBS.probDemPDR,

  // Senate switch probabilities (symmetric baseline: Dem=Rep)
  demUniPres: BASELINE_PROBS.switchUniPres,
  demDivPres: BASELINE_PROBS.switchDivPres,
  demUniMid:  BASELINE_PROBS.switchUniMid,
  demDivMid:  BASELINE_PROBS.switchDivMid,
  repUniPres: BASELINE_PROBS.switchUniPres,
  repDivPres: BASELINE_PROBS.switchDivPres,
  repUniMid:  BASELINE_PROBS.switchUniMid,
  repDivMid:  BASELINE_PROBS.switchDivMid,

  // Justice ideology Beta distribution shapes
  demShape1: 3,
  demShape2: 11,
  repShape1: 3,
  repShape2: 11,

  // Justice replacement
  meanAge: 52,
  sdAge: 3,

  // Strategic retirement
  weightStrategicRetirement: 1,

  // Term limit (100 = no limit, matching R's term.limit.dummy)
  termLimit: 100,

  // Court packing
  courtPackN: 0,
  courtPackingStartYear: 2026,
  courtPackingParty: 1, // 1=Dem only, 0=Rep only, -1=either (first unified gov)

  // Term limits experiment
  termLimitYears: 18,

  // GOP senate advantage (for linear variant)
  gopSenateAdvantageParam: 0.005,
};

// ============================================================
// TERM LIMIT ONSET SCHEDULES
// From term_limit_separate_script.R
// Maps originalSeat -> onset year offset from start year
// Order is by seniority: Thomas first, then Roberts, Alito, etc.
// ============================================================
const TERM_LIMIT_ONSETS_18 = {
  // originalSeat: offset from start year (spaced 2 years apart)
  6: 0,   // Thomas
  8: 2,   // Roberts
  9: 4,   // Alito
  4: 6,   // Sotomayor
  5: 8,   // Kagan
  1: 10,  // Gorsuch
  2: 12,  // Kavanaugh
  7: 14,  // Barrett
  3: 16,  // Jackson
};

const TERM_LIMIT_ONSETS_9 = {
  // originalSeat: offset from start year (spaced 1 year apart)
  6: 0,   // Thomas
  8: 1,   // Roberts
  9: 2,   // Alito
  4: 3,   // Sotomayor
  5: 4,   // Kagan
  1: 5,   // Gorsuch
  2: 6,   // Kavanaugh
  7: 7,   // Barrett
  3: 8,   // Jackson
};
