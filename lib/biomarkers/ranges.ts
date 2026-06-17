// Reference ranges for biomarkers.
// normalLow/normalHigh = standard clinical reference range.
// optimalLow/optimalHigh = tighter "optimal" range used by longevity/functional medicine.
// displayMin/displayMax = the full scale shown on the bar (wider than normal range).
// Sources: LabCorp, Quest, Endocrine Society, and functional medicine consensus ranges.
// Note: ranges can vary by sex, age, and lab — these are general adult (male-skewed) defaults.

export interface BiomarkerRange {
  normalLow: number;
  normalHigh: number;
  optimalLow?: number;
  optimalHigh?: number;
  displayMin: number;
  displayMax: number;
  unit: string;
}

const RANGES: Record<string, BiomarkerRange> = {
  // ── CMP ──────────────────────────────────────────────────────────────────
  Glucose: {
    normalLow: 70, normalHigh: 99,
    optimalLow: 72, optimalHigh: 90,
    displayMin: 40, displayMax: 300,
    unit: "mg/dL",
  },
  "Blood Glucose": {
    normalLow: 70, normalHigh: 99,
    optimalLow: 72, optimalHigh: 90,
    displayMin: 40, displayMax: 300,
    unit: "mg/dL",
  },
  "Fasting Glucose": {
    normalLow: 70, normalHigh: 99,
    optimalLow: 72, optimalHigh: 90,
    displayMin: 40, displayMax: 300,
    unit: "mg/dL",
  },
  BUN: {
    normalLow: 7, normalHigh: 20,
    optimalLow: 10, optimalHigh: 18,
    displayMin: 0, displayMax: 60,
    unit: "mg/dL",
  },
  "Blood Urea Nitrogen": {
    normalLow: 7, normalHigh: 20,
    optimalLow: 10, optimalHigh: 18,
    displayMin: 0, displayMax: 60,
    unit: "mg/dL",
  },
  Creatinine: {
    normalLow: 0.74, normalHigh: 1.35,
    optimalLow: 0.8, optimalHigh: 1.2,
    displayMin: 0.3, displayMax: 3.0,
    unit: "mg/dL",
  },
  eGFR: {
    normalLow: 60, normalHigh: 120,
    optimalLow: 90, optimalHigh: 120,
    displayMin: 0, displayMax: 130,
    unit: "mL/min",
  },
  Sodium: {
    normalLow: 136, normalHigh: 145,
    optimalLow: 138, optimalHigh: 143,
    displayMin: 120, displayMax: 160,
    unit: "mEq/L",
  },
  Potassium: {
    normalLow: 3.5, normalHigh: 5.1,
    optimalLow: 4.0, optimalHigh: 4.8,
    displayMin: 2.5, displayMax: 7.0,
    unit: "mEq/L",
  },
  Chloride: {
    normalLow: 98, normalHigh: 107,
    displayMin: 85, displayMax: 120,
    unit: "mEq/L",
  },
  CO2: {
    normalLow: 22, normalHigh: 29,
    optimalLow: 24, optimalHigh: 28,
    displayMin: 15, displayMax: 35,
    unit: "mEq/L",
  },
  Bicarbonate: {
    normalLow: 22, normalHigh: 29,
    displayMin: 15, displayMax: 35,
    unit: "mEq/L",
  },
  Calcium: {
    normalLow: 8.6, normalHigh: 10.3,
    optimalLow: 9.0, optimalHigh: 10.0,
    displayMin: 6.0, displayMax: 13.0,
    unit: "mg/dL",
  },
  "Total Protein": {
    normalLow: 6.3, normalHigh: 8.2,
    optimalLow: 6.8, optimalHigh: 7.8,
    displayMin: 4.0, displayMax: 10.0,
    unit: "g/dL",
  },
  Albumin: {
    normalLow: 3.5, normalHigh: 5.5,
    optimalLow: 4.0, optimalHigh: 5.0,
    displayMin: 2.0, displayMax: 6.5,
    unit: "g/dL",
  },
  "Total Bilirubin": {
    normalLow: 0.1, normalHigh: 1.2,
    optimalLow: 0.3, optimalHigh: 1.0,
    displayMin: 0, displayMax: 5.0,
    unit: "mg/dL",
  },
  ALT: {
    normalLow: 7, normalHigh: 56,
    optimalLow: 7, optimalHigh: 30,
    displayMin: 0, displayMax: 150,
    unit: "U/L",
  },
  "Alanine Aminotransferase": {
    normalLow: 7, normalHigh: 56,
    optimalLow: 7, optimalHigh: 30,
    displayMin: 0, displayMax: 150,
    unit: "U/L",
  },
  AST: {
    normalLow: 10, normalHigh: 40,
    optimalLow: 10, optimalHigh: 30,
    displayMin: 0, displayMax: 120,
    unit: "U/L",
  },
  "Aspartate Aminotransferase": {
    normalLow: 10, normalHigh: 40,
    optimalLow: 10, optimalHigh: 30,
    displayMin: 0, displayMax: 120,
    unit: "U/L",
  },
  "Alkaline Phosphatase": {
    normalLow: 44, normalHigh: 147,
    optimalLow: 50, optimalHigh: 110,
    displayMin: 0, displayMax: 300,
    unit: "U/L",
  },
  "Anion Gap": {
    normalLow: 8, normalHigh: 16,
    optimalLow: 8, optimalHigh: 14,
    displayMin: 0, displayMax: 30,
    unit: "mEq/L",
  },
  GGT: {
    normalLow: 8, normalHigh: 60,
    optimalLow: 8, optimalHigh: 30,
    displayMin: 0, displayMax: 200,
    unit: "U/L",
  },

  // ── CBC ──────────────────────────────────────────────────────────────────
  WBC: {
    normalLow: 4.5, normalHigh: 11.0,
    optimalLow: 5.0, optimalHigh: 7.5,
    displayMin: 1.0, displayMax: 20.0,
    unit: "10³/µL",
  },
  "White Blood Cell Count": {
    normalLow: 4.5, normalHigh: 11.0,
    optimalLow: 5.0, optimalHigh: 7.5,
    displayMin: 1.0, displayMax: 20.0,
    unit: "10³/µL",
  },
  RBC: {
    normalLow: 4.5, normalHigh: 5.9,
    optimalLow: 4.7, optimalHigh: 5.5,
    displayMin: 2.0, displayMax: 8.0,
    unit: "10⁶/µL",
  },
  Hemoglobin: {
    normalLow: 13.5, normalHigh: 17.5,
    optimalLow: 14.5, optimalHigh: 17.0,
    displayMin: 8.0, displayMax: 22.0,
    unit: "g/dL",
  },
  HGB: {
    normalLow: 13.5, normalHigh: 17.5,
    optimalLow: 14.5, optimalHigh: 17.0,
    displayMin: 8.0, displayMax: 22.0,
    unit: "g/dL",
  },
  Hematocrit: {
    normalLow: 41, normalHigh: 53,
    optimalLow: 43, optimalHigh: 50,
    displayMin: 20, displayMax: 65,
    unit: "%",
  },
  MCV: {
    normalLow: 80, normalHigh: 100,
    optimalLow: 85, optimalHigh: 95,
    displayMin: 60, displayMax: 120,
    unit: "fL",
  },
  MCH: {
    normalLow: 27, normalHigh: 33,
    displayMin: 18, displayMax: 42,
    unit: "pg",
  },
  MCHC: {
    normalLow: 32, normalHigh: 36,
    displayMin: 26, displayMax: 42,
    unit: "g/dL",
  },
  RDW: {
    normalLow: 11.5, normalHigh: 14.5,
    optimalLow: 11.5, optimalHigh: 13.0,
    displayMin: 9.0, displayMax: 20.0,
    unit: "%",
  },
  Platelets: {
    normalLow: 150, normalHigh: 400,
    optimalLow: 175, optimalHigh: 350,
    displayMin: 50, displayMax: 600,
    unit: "10³/µL",
  },
  Neutrophils: {
    normalLow: 50, normalHigh: 70,
    displayMin: 20, displayMax: 90,
    unit: "%",
  },
  Lymphocytes: {
    normalLow: 20, normalHigh: 40,
    displayMin: 5, displayMax: 65,
    unit: "%",
  },
  Monocytes: {
    normalLow: 2, normalHigh: 8,
    displayMin: 0, displayMax: 20,
    unit: "%",
  },
  Eosinophils: {
    normalLow: 0, normalHigh: 6,
    displayMin: 0, displayMax: 20,
    unit: "%",
  },
  Basophils: {
    normalLow: 0, normalHigh: 1,
    displayMin: 0, displayMax: 5,
    unit: "%",
  },

  // ── Lipid Panel ──────────────────────────────────────────────────────────
  "Total Cholesterol": {
    normalLow: 100, normalHigh: 199,
    optimalLow: 150, optimalHigh: 180,
    displayMin: 80, displayMax: 350,
    unit: "mg/dL",
  },
  Cholesterol: {
    normalLow: 100, normalHigh: 199,
    optimalLow: 150, optimalHigh: 180,
    displayMin: 80, displayMax: 350,
    unit: "mg/dL",
  },
  LDL: {
    normalLow: 0, normalHigh: 99,
    optimalLow: 0, optimalHigh: 70,
    displayMin: 0, displayMax: 250,
    unit: "mg/dL",
  },
  "LDL Cholesterol": {
    normalLow: 0, normalHigh: 99,
    optimalLow: 0, optimalHigh: 70,
    displayMin: 0, displayMax: 250,
    unit: "mg/dL",
  },
  "LDL-C": {
    normalLow: 0, normalHigh: 99,
    optimalLow: 0, optimalHigh: 70,
    displayMin: 0, displayMax: 250,
    unit: "mg/dL",
  },
  HDL: {
    normalLow: 40, normalHigh: 100,
    optimalLow: 60, optimalHigh: 90,
    displayMin: 10, displayMax: 120,
    unit: "mg/dL",
  },
  "HDL Cholesterol": {
    normalLow: 40, normalHigh: 100,
    optimalLow: 60, optimalHigh: 90,
    displayMin: 10, displayMax: 120,
    unit: "mg/dL",
  },
  Triglycerides: {
    normalLow: 0, normalHigh: 149,
    optimalLow: 0, optimalHigh: 100,
    displayMin: 0, displayMax: 500,
    unit: "mg/dL",
  },
  VLDL: {
    normalLow: 2, normalHigh: 30,
    displayMin: 0, displayMax: 100,
    unit: "mg/dL",
  },
  "ApoB": {
    normalLow: 0, normalHigh: 90,
    optimalLow: 0, optimalHigh: 70,
    displayMin: 0, displayMax: 200,
    unit: "mg/dL",
  },

  // ── Thyroid ──────────────────────────────────────────────────────────────
  TSH: {
    normalLow: 0.4, normalHigh: 4.0,
    optimalLow: 1.0, optimalHigh: 2.5,
    displayMin: 0, displayMax: 10.0,
    unit: "mIU/L",
  },
  "Thyroid Stimulating Hormone": {
    normalLow: 0.4, normalHigh: 4.0,
    optimalLow: 1.0, optimalHigh: 2.5,
    displayMin: 0, displayMax: 10.0,
    unit: "mIU/L",
  },
  "Free T3": {
    normalLow: 2.3, normalHigh: 4.2,
    optimalLow: 3.0, optimalHigh: 4.0,
    displayMin: 1.0, displayMax: 6.0,
    unit: "pg/mL",
  },
  "Free T4": {
    normalLow: 0.8, normalHigh: 1.8,
    optimalLow: 1.1, optimalHigh: 1.7,
    displayMin: 0.3, displayMax: 3.0,
    unit: "ng/dL",
  },
  T3: {
    normalLow: 80, normalHigh: 200,
    optimalLow: 100, optimalHigh: 180,
    displayMin: 40, displayMax: 280,
    unit: "ng/dL",
  },
  T4: {
    normalLow: 5.0, normalHigh: 12.0,
    optimalLow: 6.0, optimalHigh: 11.0,
    displayMin: 2.0, displayMax: 18.0,
    unit: "µg/dL",
  },

  // ── Hormones ─────────────────────────────────────────────────────────────
  Testosterone: {
    normalLow: 300, normalHigh: 1000,
    optimalLow: 500, optimalHigh: 900,
    displayMin: 0, displayMax: 1400,
    unit: "ng/dL",
  },
  "Testosterone (Total)": {
    normalLow: 300, normalHigh: 1000,
    optimalLow: 500, optimalHigh: 900,
    displayMin: 0, displayMax: 1400,
    unit: "ng/dL",
  },
  "Total Testosterone": {
    normalLow: 300, normalHigh: 1000,
    optimalLow: 500, optimalHigh: 900,
    displayMin: 0, displayMax: 1400,
    unit: "ng/dL",
  },
  "Testosterone, Total": {
    normalLow: 300, normalHigh: 1000,
    optimalLow: 500, optimalHigh: 900,
    displayMin: 0, displayMax: 1400,
    unit: "ng/dL",
  },
  "Free Testosterone": {
    normalLow: 9, normalHigh: 30,
    optimalLow: 15, optimalHigh: 25,
    displayMin: 0, displayMax: 50,
    unit: "ng/dL",
  },
  "Testosterone (Free)": {
    normalLow: 9, normalHigh: 30,
    optimalLow: 15, optimalHigh: 25,
    displayMin: 0, displayMax: 50,
    unit: "ng/dL",
  },
  "DHEA-S": {
    normalLow: 280, normalHigh: 640,
    optimalLow: 300, optimalHigh: 500,
    displayMin: 0, displayMax: 900,
    unit: "µg/dL",
  },
  Estradiol: {
    normalLow: 10, normalHigh: 40,
    optimalLow: 20, optimalHigh: 35,
    displayMin: 0, displayMax: 100,
    unit: "pg/mL",
  },
  LH: {
    normalLow: 1.5, normalHigh: 9.3,
    displayMin: 0, displayMax: 20,
    unit: "mIU/mL",
  },
  FSH: {
    normalLow: 1.5, normalHigh: 12.4,
    displayMin: 0, displayMax: 25,
    unit: "mIU/mL",
  },
  Prolactin: {
    normalLow: 2, normalHigh: 18,
    optimalLow: 2, optimalHigh: 12,
    displayMin: 0, displayMax: 50,
    unit: "ng/mL",
  },
  SHBG: {
    normalLow: 13, normalHigh: 71,
    optimalLow: 20, optimalHigh: 40,
    displayMin: 0, displayMax: 100,
    unit: "nmol/L",
  },
  "Sex Hormone Binding Globulin": {
    normalLow: 13, normalHigh: 71,
    optimalLow: 20, optimalHigh: 40,
    displayMin: 0, displayMax: 100,
    unit: "nmol/L",
  },
  Cortisol: {
    normalLow: 6, normalHigh: 23,
    optimalLow: 10, optimalHigh: 20,
    displayMin: 0, displayMax: 40,
    unit: "µg/dL",
  },
  "IGF-1": {
    normalLow: 88, normalHigh: 246,
    optimalLow: 150, optimalHigh: 230,
    displayMin: 0, displayMax: 400,
    unit: "ng/mL",
  },

  // ── Metabolic ────────────────────────────────────────────────────────────
  HbA1c: {
    normalLow: 4.0, normalHigh: 5.6,
    optimalLow: 4.5, optimalHigh: 5.4,
    displayMin: 3.5, displayMax: 10.0,
    unit: "%",
  },
  "Hemoglobin A1c": {
    normalLow: 4.0, normalHigh: 5.6,
    optimalLow: 4.5, optimalHigh: 5.4,
    displayMin: 3.5, displayMax: 10.0,
    unit: "%",
  },
  A1c: {
    normalLow: 4.0, normalHigh: 5.6,
    optimalLow: 4.5, optimalHigh: 5.4,
    displayMin: 3.5, displayMax: 10.0,
    unit: "%",
  },
  "Fasting Insulin": {
    normalLow: 2, normalHigh: 10,
    optimalLow: 2, optimalHigh: 5,
    displayMin: 0, displayMax: 35,
    unit: "µIU/mL",
  },
  Insulin: {
    normalLow: 2, normalHigh: 10,
    optimalLow: 2, optimalHigh: 5,
    displayMin: 0, displayMax: 35,
    unit: "µIU/mL",
  },
  "C-Reactive Protein": {
    normalLow: 0, normalHigh: 3.0,
    optimalLow: 0, optimalHigh: 1.0,
    displayMin: 0, displayMax: 10.0,
    unit: "mg/L",
  },
  CRP: {
    normalLow: 0, normalHigh: 3.0,
    optimalLow: 0, optimalHigh: 1.0,
    displayMin: 0, displayMax: 10.0,
    unit: "mg/L",
  },
  "hs-CRP": {
    normalLow: 0, normalHigh: 3.0,
    optimalLow: 0, optimalHigh: 0.5,
    displayMin: 0, displayMax: 10.0,
    unit: "mg/L",
  },
  "High Sensitivity CRP": {
    normalLow: 0, normalHigh: 3.0,
    optimalLow: 0, optimalHigh: 0.5,
    displayMin: 0, displayMax: 10.0,
    unit: "mg/L",
  },
  Homocysteine: {
    normalLow: 5, normalHigh: 15,
    optimalLow: 5, optimalHigh: 9,
    displayMin: 0, displayMax: 30,
    unit: "µmol/L",
  },
  "Uric Acid": {
    normalLow: 3.5, normalHigh: 7.2,
    optimalLow: 3.5, optimalHigh: 6.0,
    displayMin: 0, displayMax: 12,
    unit: "mg/dL",
  },

  // ── Vitamins & Minerals ──────────────────────────────────────────────────
  "Vitamin D": {
    normalLow: 30, normalHigh: 100,
    optimalLow: 50, optimalHigh: 80,
    displayMin: 0, displayMax: 130,
    unit: "ng/mL",
  },
  "Vitamin D (25-OH)": {
    normalLow: 30, normalHigh: 100,
    optimalLow: 50, optimalHigh: 80,
    displayMin: 0, displayMax: 130,
    unit: "ng/mL",
  },
  "25-OH Vitamin D": {
    normalLow: 30, normalHigh: 100,
    optimalLow: 50, optimalHigh: 80,
    displayMin: 0, displayMax: 130,
    unit: "ng/mL",
  },
  "Vitamin B12": {
    normalLow: 200, normalHigh: 900,
    optimalLow: 500, optimalHigh: 900,
    displayMin: 0, displayMax: 1200,
    unit: "pg/mL",
  },
  Ferritin: {
    normalLow: 24, normalHigh: 336,
    optimalLow: 50, optimalHigh: 150,
    displayMin: 0, displayMax: 500,
    unit: "ng/mL",
  },
  Iron: {
    normalLow: 60, normalHigh: 170,
    optimalLow: 80, optimalHigh: 150,
    displayMin: 0, displayMax: 250,
    unit: "µg/dL",
  },
  Folate: {
    normalLow: 2.0, normalHigh: 20.0,
    optimalLow: 10.0, optimalHigh: 20.0,
    displayMin: 0, displayMax: 25,
    unit: "ng/mL",
  },
  Magnesium: {
    normalLow: 1.7, normalHigh: 2.2,
    optimalLow: 1.9, optimalHigh: 2.2,
    displayMin: 1.0, displayMax: 3.0,
    unit: "mg/dL",
  },

  // ── Wearable ─────────────────────────────────────────────────────────────
  "HRV RMSSD": {
    normalLow: 20, normalHigh: 80,
    optimalLow: 50, optimalHigh: 80,
    displayMin: 0, displayMax: 120,
    unit: "ms",
  },
  "Resting Heart Rate": {
    normalLow: 50, normalHigh: 90,
    optimalLow: 45, optimalHigh: 65,
    displayMin: 30, displayMax: 110,
    unit: "bpm",
  },
  "Recovery Score": {
    normalLow: 33, normalHigh: 100,
    optimalLow: 67, optimalHigh: 100,
    displayMin: 0, displayMax: 100,
    unit: "%",
  },
};

export function getRangeForMarker(type: string): BiomarkerRange | null {
  if (RANGES[type]) return RANGES[type];
  // Case-insensitive fallback
  const lower = type.toLowerCase();
  for (const [key, range] of Object.entries(RANGES)) {
    if (key.toLowerCase() === lower) return range;
  }
  return null;
}

export type RangeStatus = "optimal" | "normal" | "borderline" | "abnormal" | "unknown";

export function getRangeStatus(value: number, range: BiomarkerRange): RangeStatus {
  const { normalLow, normalHigh, optimalLow, optimalHigh } = range;

  if (optimalLow !== undefined && optimalHigh !== undefined) {
    if (value >= optimalLow && value <= optimalHigh) return "optimal";
  }

  if (value >= normalLow && value <= normalHigh) return "normal";

  // Borderline: within 20% of the range outside normal
  const rangeWidth = normalHigh - normalLow;
  const buffer = rangeWidth * 0.25;
  if (value >= normalLow - buffer && value <= normalHigh + buffer) return "borderline";

  return "abnormal";
}
