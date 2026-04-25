// Base de datos de protocolos de quimioterapia comunes en México
// Dosis basadas en guías NCCN, GPC mexicanas y consensos internacionales

export const CHEMO_PROTOCOLS = {
  // Cáncer de mama
  "AC": {
    name: "AC (Doxorrubicina/Ciclofosfamida)",
    indication: "Cáncer de mama",
    cycle_days: 21,
    total_cycles: 4,
    drugs: [
      { drug_name: "Doxorrubicina", dose_per_unit: 60, dose_basis: "mg/m²", route: "IV", infusion_time: "15-30 min", diluent: "SSN 0.9%", volume_ml: 100, max_lifetime_dose: 450, vial_size: 50, vial_unit: "mg" },
      { drug_name: "Ciclofosfamida", dose_per_unit: 600, dose_basis: "mg/m²", route: "IV", infusion_time: "30-60 min", diluent: "SSN 0.9%", volume_ml: 250, vial_size: 1000, vial_unit: "mg" }
    ]
  },
  "AC-T": {
    name: "AC-T (AC seguido de Paclitaxel)",
    indication: "Cáncer de mama",
    cycle_days: 21,
    total_cycles: 8,
    drugs: [
      { drug_name: "Doxorrubicina", dose_per_unit: 60, dose_basis: "mg/m²", route: "IV", infusion_time: "15-30 min", diluent: "SSN 0.9%", volume_ml: 100, max_lifetime_dose: 450, vial_size: 50, vial_unit: "mg" },
      { drug_name: "Ciclofosfamida", dose_per_unit: 600, dose_basis: "mg/m²", route: "IV", infusion_time: "30-60 min", diluent: "SSN 0.9%", volume_ml: 250, vial_size: 1000, vial_unit: "mg" },
      { drug_name: "Paclitaxel", dose_per_unit: 175, dose_basis: "mg/m²", route: "IV", infusion_time: "3 hrs", diluent: "SSN 0.9%", volume_ml: 500, vial_size: 300, vial_unit: "mg" }
    ]
  },
  "TC": {
    name: "TC (Docetaxel/Ciclofosfamida)",
    indication: "Cáncer de mama",
    cycle_days: 21,
    total_cycles: 4,
    drugs: [
      { drug_name: "Docetaxel", dose_per_unit: 75, dose_basis: "mg/m²", route: "IV", infusion_time: "1 hr", diluent: "SSN 0.9%", volume_ml: 250, vial_size: 80, vial_unit: "mg" },
      { drug_name: "Ciclofosfamida", dose_per_unit: 600, dose_basis: "mg/m²", route: "IV", infusion_time: "30-60 min", diluent: "SSN 0.9%", volume_ml: 250, vial_size: 1000, vial_unit: "mg" }
    ]
  },
  "TCH": {
    name: "TCH (Docetaxel/Carboplatino/Trastuzumab)",
    indication: "Cáncer de mama HER2+",
    cycle_days: 21,
    total_cycles: 6,
    drugs: [
      { drug_name: "Docetaxel", dose_per_unit: 75, dose_basis: "mg/m²", route: "IV", infusion_time: "1 hr", diluent: "SSN 0.9%", volume_ml: 250, vial_size: 80, vial_unit: "mg" },
      { drug_name: "Carboplatino", dose_per_unit: 6, dose_basis: "AUC", route: "IV", infusion_time: "30-60 min", diluent: "SG 5%", volume_ml: 250, vial_size: 450, vial_unit: "mg" },
      { drug_name: "Trastuzumab", dose_per_unit: 8, dose_basis: "mg/kg", route: "IV", infusion_time: "90 min", diluent: "SSN 0.9%", volume_ml: 250, note: "Dosis de carga 8 mg/kg, mantenimiento 6 mg/kg", vial_size: 440, vial_unit: "mg" }
    ]
  },

  // Cáncer colorrectal
  "FOLFOX": {
    name: "FOLFOX (5-FU/Leucovorina/Oxaliplatino)",
    indication: "Cáncer colorrectal",
    cycle_days: 14,
    total_cycles: 12,
    drugs: [
      { drug_name: "Oxaliplatino", dose_per_unit: 85, dose_basis: "mg/m²", route: "IV", infusion_time: "2 hrs", diluent: "SG 5%", volume_ml: 500, vial_size: 100, vial_unit: "mg" },
      { drug_name: "Leucovorina", dose_per_unit: 400, dose_basis: "mg/m²", route: "IV", infusion_time: "2 hrs", diluent: "SG 5%", volume_ml: 250, vial_size: 200, vial_unit: "mg" },
      { drug_name: "5-Fluorouracilo bolo", dose_per_unit: 400, dose_basis: "mg/m²", route: "IV", infusion_time: "Bolo", diluent: "Directo", volume_ml: 0, vial_size: 500, vial_unit: "mg" },
      { drug_name: "5-Fluorouracilo infusión", dose_per_unit: 2400, dose_basis: "mg/m²", route: "IV", infusion_time: "46 hrs", diluent: "SSN 0.9%", volume_ml: 500, vial_size: 500, vial_unit: "mg" }
    ]
  },
  "FOLFIRI": {
    name: "FOLFIRI (5-FU/Leucovorina/Irinotecán)",
    indication: "Cáncer colorrectal",
    cycle_days: 14,
    total_cycles: 12,
    drugs: [
      { drug_name: "Irinotecán", dose_per_unit: 180, dose_basis: "mg/m²", route: "IV", infusion_time: "90 min", diluent: "SSN 0.9%", volume_ml: 500, vial_size: 100, vial_unit: "mg" },
      { drug_name: "Leucovorina", dose_per_unit: 400, dose_basis: "mg/m²", route: "IV", infusion_time: "2 hrs", diluent: "SG 5%", volume_ml: 250, vial_size: 200, vial_unit: "mg" },
      { drug_name: "5-Fluorouracilo bolo", dose_per_unit: 400, dose_basis: "mg/m²", route: "IV", infusion_time: "Bolo", diluent: "Directo", volume_ml: 0, vial_size: 500, vial_unit: "mg" },
      { drug_name: "5-Fluorouracilo infusión", dose_per_unit: 2400, dose_basis: "mg/m²", route: "IV", infusion_time: "46 hrs", diluent: "SSN 0.9%", volume_ml: 500, vial_size: 500, vial_unit: "mg" }
    ]
  },
  "XELOX": {
    name: "XELOX (Capecitabina/Oxaliplatino)",
    indication: "Cáncer colorrectal",
    cycle_days: 21,
    total_cycles: 8,
    drugs: [
      { drug_name: "Oxaliplatino", dose_per_unit: 130, dose_basis: "mg/m²", route: "IV", infusion_time: "2 hrs", diluent: "SG 5%", volume_ml: 500, vial_size: 100, vial_unit: "mg" },
      { drug_name: "Capecitabina", dose_per_unit: 1000, dose_basis: "mg/m²", route: "VO", infusion_time: "c/12h D1-14", diluent: "N/A", volume_ml: 0, vial_size: 500, vial_unit: "mg" }
    ]
  },

  // Linfomas
  "R-CHOP": {
    name: "R-CHOP",
    indication: "Linfoma No Hodgkin",
    cycle_days: 21,
    total_cycles: 6,
    drugs: [
      { drug_name: "Rituximab", dose_per_unit: 375, dose_basis: "mg/m²", route: "IV", infusion_time: "4-6 hrs", diluent: "SSN 0.9%", volume_ml: 500, vial_size: 500, vial_unit: "mg" },
      { drug_name: "Ciclofosfamida", dose_per_unit: 750, dose_basis: "mg/m²", route: "IV", infusion_time: "30-60 min", diluent: "SSN 0.9%", volume_ml: 250, vial_size: 1000, vial_unit: "mg" },
      { drug_name: "Doxorrubicina", dose_per_unit: 50, dose_basis: "mg/m²", route: "IV", infusion_time: "15-30 min", diluent: "SSN 0.9%", volume_ml: 100, max_lifetime_dose: 450, vial_size: 50, vial_unit: "mg" },
      { drug_name: "Vincristina", dose_per_unit: 1.4, dose_basis: "mg/m²", route: "IV", infusion_time: "Bolo", diluent: "SSN 0.9%", volume_ml: 50, max_single_dose: 2, vial_size: 1, vial_unit: "mg" },
      { drug_name: "Prednisona", dose_per_unit: 100, dose_basis: "mg", route: "VO", infusion_time: "D1-5", diluent: "N/A", volume_ml: 0, vial_size: 50, vial_unit: "mg" }
    ]
  },
  "ABVD": {
    name: "ABVD",
    indication: "Linfoma de Hodgkin",
    cycle_days: 28,
    total_cycles: 6,
    drugs: [
      { drug_name: "Doxorrubicina", dose_per_unit: 25, dose_basis: "mg/m²", route: "IV", infusion_time: "15-30 min", diluent: "SSN 0.9%", volume_ml: 100, max_lifetime_dose: 450, vial_size: 50, vial_unit: "mg" },
      { drug_name: "Bleomicina", dose_per_unit: 10, dose_basis: "U/m²", route: "IV", infusion_time: "15 min", diluent: "SSN 0.9%", volume_ml: 100, vial_size: 15, vial_unit: "U" },
      { drug_name: "Vinblastina", dose_per_unit: 6, dose_basis: "mg/m²", route: "IV", infusion_time: "Bolo", diluent: "SSN 0.9%", volume_ml: 50, vial_size: 10, vial_unit: "mg" },
      { drug_name: "Dacarbazina", dose_per_unit: 375, dose_basis: "mg/m²", route: "IV", infusion_time: "30-60 min", diluent: "SG 5%", volume_ml: 250, vial_size: 200, vial_unit: "mg" }
    ]
  },

  // Cáncer de pulmón
  "Carboplatino-Paclitaxel": {
    name: "Carboplatino/Paclitaxel",
    indication: "Cáncer de pulmón NSCLC",
    cycle_days: 21,
    total_cycles: 4,
    drugs: [
      { drug_name: "Paclitaxel", dose_per_unit: 200, dose_basis: "mg/m²", route: "IV", infusion_time: "3 hrs", diluent: "SSN 0.9%", volume_ml: 500, vial_size: 300, vial_unit: "mg" },
      { drug_name: "Carboplatino", dose_per_unit: 6, dose_basis: "AUC", route: "IV", infusion_time: "30-60 min", diluent: "SG 5%", volume_ml: 250, vial_size: 450, vial_unit: "mg" }
    ]
  },
  "Cisplatino-Pemetrexed": {
    name: "Cisplatino/Pemetrexed",
    indication: "Cáncer de pulmón NSCLC (no escamoso)",
    cycle_days: 21,
    total_cycles: 4,
    drugs: [
      { drug_name: "Pemetrexed", dose_per_unit: 500, dose_basis: "mg/m²", route: "IV", infusion_time: "10 min", diluent: "SSN 0.9%", volume_ml: 100, vial_size: 500, vial_unit: "mg" },
      { drug_name: "Cisplatino", dose_per_unit: 75, dose_basis: "mg/m²", route: "IV", infusion_time: "1-2 hrs", diluent: "SSN 0.9%", volume_ml: 500, note: "Requiere hidratación pre y post", vial_size: 50, vial_unit: "mg" }
    ]
  },

  // Cáncer gástrico
  "FLOT": {
    name: "FLOT (5-FU/Leucovorina/Oxaliplatino/Docetaxel)",
    indication: "Cáncer gástrico / unión gastroesofágica",
    cycle_days: 14,
    total_cycles: 8,
    drugs: [
      { drug_name: "Docetaxel", dose_per_unit: 50, dose_basis: "mg/m²", route: "IV", infusion_time: "1 hr", diluent: "SSN 0.9%", volume_ml: 250, vial_size: 80, vial_unit: "mg" },
      { drug_name: "Oxaliplatino", dose_per_unit: 85, dose_basis: "mg/m²", route: "IV", infusion_time: "2 hrs", diluent: "SG 5%", volume_ml: 500, vial_size: 100, vial_unit: "mg" },
      { drug_name: "Leucovorina", dose_per_unit: 200, dose_basis: "mg/m²", route: "IV", infusion_time: "2 hrs", diluent: "SG 5%", volume_ml: 250, vial_size: 200, vial_unit: "mg" },
      { drug_name: "5-Fluorouracilo infusión", dose_per_unit: 2600, dose_basis: "mg/m²", route: "IV", infusion_time: "24 hrs", diluent: "SSN 0.9%", volume_ml: 500, vial_size: 500, vial_unit: "mg" }
    ]
  },

  // Cáncer de ovario
  "Carboplatino-Paclitaxel-Ovario": {
    name: "Carboplatino/Paclitaxel (Ovario)",
    indication: "Cáncer de ovario",
    cycle_days: 21,
    total_cycles: 6,
    drugs: [
      { drug_name: "Paclitaxel", dose_per_unit: 175, dose_basis: "mg/m²", route: "IV", infusion_time: "3 hrs", diluent: "SSN 0.9%", volume_ml: 500, vial_size: 300, vial_unit: "mg" },
      { drug_name: "Carboplatino", dose_per_unit: 5, dose_basis: "AUC", route: "IV", infusion_time: "30-60 min", diluent: "SG 5%", volume_ml: 250, vial_size: 450, vial_unit: "mg" }
    ]
  },

  // Cáncer cervicouterino
  "Cisplatino-Paclitaxel-CaCu": {
    name: "Cisplatino/Paclitaxel (CaCu)",
    indication: "Cáncer cervicouterino",
    cycle_days: 21,
    total_cycles: 6,
    drugs: [
      { drug_name: "Cisplatino", dose_per_unit: 50, dose_basis: "mg/m²", route: "IV", infusion_time: "1-2 hrs", diluent: "SSN 0.9%", volume_ml: 500, note: "Requiere hidratación", vial_size: 50, vial_unit: "mg" },
      { drug_name: "Paclitaxel", dose_per_unit: 175, dose_basis: "mg/m²", route: "IV", infusion_time: "3 hrs", diluent: "SSN 0.9%", volume_ml: 500, vial_size: 300, vial_unit: "mg" }
    ]
  },

  // Cáncer testicular
  "BEP": {
    name: "BEP (Bleomicina/Etóposido/Cisplatino)",
    indication: "Cáncer testicular",
    cycle_days: 21,
    total_cycles: 3,
    drugs: [
      { drug_name: "Cisplatino", dose_per_unit: 20, dose_basis: "mg/m²", route: "IV", infusion_time: "1-2 hrs", diluent: "SSN 0.9%", volume_ml: 500, note: "D1-5, requiere hidratación", vial_size: 50, vial_unit: "mg" },
      { drug_name: "Etóposido", dose_per_unit: 100, dose_basis: "mg/m²", route: "IV", infusion_time: "1 hr", diluent: "SSN 0.9%", volume_ml: 500, note: "D1-5", vial_size: 100, vial_unit: "mg" },
      { drug_name: "Bleomicina", dose_per_unit: 30, dose_basis: "U", route: "IV", infusion_time: "15 min", diluent: "SSN 0.9%", volume_ml: 100, note: "D1,8,15", vial_size: 15, vial_unit: "U" }
    ]
  },

  // ── Cáncer de mama adicionales ──
  "FEC": {
    name: "FEC (5-FU/Epirrubicina/Ciclofosfamida)",
    indication: "Cáncer de mama",
    cycle_days: 21,
    total_cycles: 6,
    drugs: [
      { drug_name: "5-Fluorouracilo", dose_per_unit: 500, dose_basis: "mg/m²", route: "IV", infusion_time: "Bolo", diluent: "SSN 0.9%", volume_ml: 100, vial_size: 500, vial_unit: "mg" },
      { drug_name: "Epirrubicina", dose_per_unit: 100, dose_basis: "mg/m²", route: "IV", infusion_time: "15-20 min", diluent: "SSN 0.9%", volume_ml: 100, max_lifetime_dose: 900, vial_size: 50, vial_unit: "mg" },
      { drug_name: "Ciclofosfamida", dose_per_unit: 500, dose_basis: "mg/m²", route: "IV", infusion_time: "30-60 min", diluent: "SSN 0.9%", volume_ml: 250, vial_size: 1000, vial_unit: "mg" }
    ]
  },
  "CMF": {
    name: "CMF (Ciclofosfamida/Metotrexato/5-FU)",
    indication: "Cáncer de mama",
    cycle_days: 28,
    total_cycles: 6,
    drugs: [
      { drug_name: "Ciclofosfamida", dose_per_unit: 600, dose_basis: "mg/m²", route: "IV", infusion_time: "30-60 min", diluent: "SSN 0.9%", volume_ml: 250, note: "D1,8", vial_size: 1000, vial_unit: "mg" },
      { drug_name: "Metotrexato", dose_per_unit: 40, dose_basis: "mg/m²", route: "IV", infusion_time: "15-30 min", diluent: "SSN 0.9%", volume_ml: 100, note: "D1,8", vial_size: 50, vial_unit: "mg" },
      { drug_name: "5-Fluorouracilo", dose_per_unit: 600, dose_basis: "mg/m²", route: "IV", infusion_time: "Bolo", diluent: "SSN 0.9%", volume_ml: 100, note: "D1,8", vial_size: 500, vial_unit: "mg" }
    ]
  },
  "Pertuzumab-Trastuzumab-Docetaxel": {
    name: "Pertuzumab/Trastuzumab/Docetaxel (PHD)",
    indication: "Cáncer de mama HER2+",
    cycle_days: 21,
    total_cycles: 6,
    drugs: [
      { drug_name: "Pertuzumab", dose_per_unit: 840, dose_basis: "mg", route: "IV", infusion_time: "60 min", diluent: "SSN 0.9%", volume_ml: 250, note: "Carga 840 mg, mantenimiento 420 mg", vial_size: 420, vial_unit: "mg" },
      { drug_name: "Trastuzumab", dose_per_unit: 8, dose_basis: "mg/kg", route: "IV", infusion_time: "90 min", diluent: "SSN 0.9%", volume_ml: 250, note: "Carga 8 mg/kg, mantenimiento 6 mg/kg", vial_size: 440, vial_unit: "mg" },
      { drug_name: "Docetaxel", dose_per_unit: 75, dose_basis: "mg/m²", route: "IV", infusion_time: "1 hr", diluent: "SSN 0.9%", volume_ml: 250, vial_size: 80, vial_unit: "mg" }
    ]
  },

  // ── Cáncer colorrectal adicionales ──
  "FOLFOXIRI": {
    name: "FOLFOXIRI (Irinotecán/Oxaliplatino/Leucovorina/5-FU)",
    indication: "Cáncer colorrectal",
    cycle_days: 14,
    total_cycles: 12,
    drugs: [
      { drug_name: "Irinotecán", dose_per_unit: 165, dose_basis: "mg/m²", route: "IV", infusion_time: "60 min", diluent: "SSN 0.9%", volume_ml: 500, vial_size: 100, vial_unit: "mg" },
      { drug_name: "Oxaliplatino", dose_per_unit: 85, dose_basis: "mg/m²", route: "IV", infusion_time: "2 hrs", diluent: "SG 5%", volume_ml: 500, vial_size: 100, vial_unit: "mg" },
      { drug_name: "Leucovorina", dose_per_unit: 400, dose_basis: "mg/m²", route: "IV", infusion_time: "2 hrs", diluent: "SG 5%", volume_ml: 250, vial_size: 200, vial_unit: "mg" },
      { drug_name: "5-Fluorouracilo infusión", dose_per_unit: 3200, dose_basis: "mg/m²", route: "IV", infusion_time: "48 hrs", diluent: "SSN 0.9%", volume_ml: 500, vial_size: 500, vial_unit: "mg" }
    ]
  },

  // ── Cáncer gástrico adicionales ──
  "ECF": {
    name: "ECF (Epirrubicina/Cisplatino/5-FU)",
    indication: "Cáncer gástrico",
    cycle_days: 21,
    total_cycles: 6,
    drugs: [
      { drug_name: "Epirrubicina", dose_per_unit: 50, dose_basis: "mg/m²", route: "IV", infusion_time: "15-20 min", diluent: "SSN 0.9%", volume_ml: 100, max_lifetime_dose: 900, vial_size: 50, vial_unit: "mg" },
      { drug_name: "Cisplatino", dose_per_unit: 60, dose_basis: "mg/m²", route: "IV", infusion_time: "1-2 hrs", diluent: "SSN 0.9%", volume_ml: 500, note: "Requiere hidratación", vial_size: 50, vial_unit: "mg" },
      { drug_name: "5-Fluorouracilo infusión", dose_per_unit: 200, dose_basis: "mg/m²", route: "IV", infusion_time: "24 hrs continua", diluent: "SSN 0.9%", volume_ml: 500, vial_size: 500, vial_unit: "mg" }
    ]
  },
  "Ramucirumab-Paclitaxel": {
    name: "Ramucirumab/Paclitaxel",
    indication: "Cáncer gástrico (2ª línea)",
    cycle_days: 28,
    total_cycles: 6,
    drugs: [
      { drug_name: "Ramucirumab", dose_per_unit: 8, dose_basis: "mg/kg", route: "IV", infusion_time: "60 min", diluent: "SSN 0.9%", volume_ml: 250, note: "D1, D15", vial_size: 500, vial_unit: "mg" },
      { drug_name: "Paclitaxel", dose_per_unit: 80, dose_basis: "mg/m²", route: "IV", infusion_time: "60 min", diluent: "SSN 0.9%", volume_ml: 250, note: "D1, D8, D15", vial_size: 300, vial_unit: "mg" }
    ]
  },

  // ── Cáncer de pulmón adicionales ──
  "Cisplatino-Vinorelbina": {
    name: "Cisplatino/Vinorelbina",
    indication: "Cáncer de pulmón NSCLC",
    cycle_days: 21,
    total_cycles: 4,
    drugs: [
      { drug_name: "Cisplatino", dose_per_unit: 80, dose_basis: "mg/m²", route: "IV", infusion_time: "1-2 hrs", diluent: "SSN 0.9%", volume_ml: 500, note: "D1, requiere hidratación", vial_size: 50, vial_unit: "mg" },
      { drug_name: "Vinorelbina", dose_per_unit: 25, dose_basis: "mg/m²", route: "IV", infusion_time: "6-10 min", diluent: "SSN 0.9%", volume_ml: 125, note: "D1, D8", vial_size: 50, vial_unit: "mg" }
    ]
  },
  "Carboplatino-Pemetrexed": {
    name: "Carboplatino/Pemetrexed",
    indication: "Cáncer de pulmón NSCLC (no escamoso)",
    cycle_days: 21,
    total_cycles: 4,
    drugs: [
      { drug_name: "Pemetrexed", dose_per_unit: 500, dose_basis: "mg/m²", route: "IV", infusion_time: "10 min", diluent: "SSN 0.9%", volume_ml: 100, vial_size: 500, vial_unit: "mg" },
      { drug_name: "Carboplatino", dose_per_unit: 5, dose_basis: "AUC", route: "IV", infusion_time: "30-60 min", diluent: "SG 5%", volume_ml: 250, vial_size: 450, vial_unit: "mg" }
    ]
  },
  "Cisplatino-Etoposido-SCLC": {
    name: "Cisplatino/Etóposido (SCLC)",
    indication: "Cáncer de pulmón células pequeñas",
    cycle_days: 21,
    total_cycles: 4,
    drugs: [
      { drug_name: "Cisplatino", dose_per_unit: 75, dose_basis: "mg/m²", route: "IV", infusion_time: "1-2 hrs", diluent: "SSN 0.9%", volume_ml: 500, note: "D1, requiere hidratación", vial_size: 50, vial_unit: "mg" },
      { drug_name: "Etóposido", dose_per_unit: 100, dose_basis: "mg/m²", route: "IV", infusion_time: "1 hr", diluent: "SSN 0.9%", volume_ml: 500, note: "D1-3", vial_size: 100, vial_unit: "mg" }
    ]
  },

  // ── Linfomas adicionales ──
  "CHOP": {
    name: "CHOP (sin Rituximab)",
    indication: "Linfoma No Hodgkin",
    cycle_days: 21,
    total_cycles: 6,
    drugs: [
      { drug_name: "Ciclofosfamida", dose_per_unit: 750, dose_basis: "mg/m²", route: "IV", infusion_time: "30-60 min", diluent: "SSN 0.9%", volume_ml: 250, vial_size: 1000, vial_unit: "mg" },
      { drug_name: "Doxorrubicina", dose_per_unit: 50, dose_basis: "mg/m²", route: "IV", infusion_time: "15-30 min", diluent: "SSN 0.9%", volume_ml: 100, max_lifetime_dose: 450, vial_size: 50, vial_unit: "mg" },
      { drug_name: "Vincristina", dose_per_unit: 1.4, dose_basis: "mg/m²", route: "IV", infusion_time: "Bolo", diluent: "SSN 0.9%", volume_ml: 50, max_single_dose: 2, vial_size: 1, vial_unit: "mg" },
      { drug_name: "Prednisona", dose_per_unit: 100, dose_basis: "mg", route: "VO", infusion_time: "D1-5", diluent: "N/A", volume_ml: 0, vial_size: 50, vial_unit: "mg" }
    ]
  },
  "R-CVP": {
    name: "R-CVP (Rituximab/Ciclofosfamida/Vincristina/Prednisona)",
    indication: "Linfoma No Hodgkin folicular",
    cycle_days: 21,
    total_cycles: 8,
    drugs: [
      { drug_name: "Rituximab", dose_per_unit: 375, dose_basis: "mg/m²", route: "IV", infusion_time: "4-6 hrs", diluent: "SSN 0.9%", volume_ml: 500, vial_size: 500, vial_unit: "mg" },
      { drug_name: "Ciclofosfamida", dose_per_unit: 750, dose_basis: "mg/m²", route: "IV", infusion_time: "30-60 min", diluent: "SSN 0.9%", volume_ml: 250, vial_size: 1000, vial_unit: "mg" },
      { drug_name: "Vincristina", dose_per_unit: 1.4, dose_basis: "mg/m²", route: "IV", infusion_time: "Bolo", diluent: "SSN 0.9%", volume_ml: 50, max_single_dose: 2, vial_size: 1, vial_unit: "mg" },
      { drug_name: "Prednisona", dose_per_unit: 40, dose_basis: "mg/m²", route: "VO", infusion_time: "D1-5", diluent: "N/A", volume_ml: 0, vial_size: 50, vial_unit: "mg" }
    ]
  },
  "Bendamustina-Rituximab": {
    name: "Bendamustina/Rituximab (BR)",
    indication: "Linfoma No Hodgkin / LLC",
    cycle_days: 28,
    total_cycles: 6,
    drugs: [
      { drug_name: "Bendamustina", dose_per_unit: 90, dose_basis: "mg/m²", route: "IV", infusion_time: "30-60 min", diluent: "SSN 0.9%", volume_ml: 500, note: "D1-2", vial_size: 100, vial_unit: "mg" },
      { drug_name: "Rituximab", dose_per_unit: 375, dose_basis: "mg/m²", route: "IV", infusion_time: "4-6 hrs", diluent: "SSN 0.9%", volume_ml: 500, vial_size: 500, vial_unit: "mg" }
    ]
  },
  "BEACOPP": {
    name: "BEACOPP escalado",
    indication: "Linfoma de Hodgkin",
    cycle_days: 21,
    total_cycles: 6,
    drugs: [
      { drug_name: "Bleomicina", dose_per_unit: 10, dose_basis: "U/m²", route: "IV", infusion_time: "15 min", diluent: "SSN 0.9%", volume_ml: 100, note: "D8", vial_size: 15, vial_unit: "U" },
      { drug_name: "Etóposido", dose_per_unit: 200, dose_basis: "mg/m²", route: "IV", infusion_time: "1 hr", diluent: "SSN 0.9%", volume_ml: 500, note: "D1-3", vial_size: 100, vial_unit: "mg" },
      { drug_name: "Doxorrubicina", dose_per_unit: 35, dose_basis: "mg/m²", route: "IV", infusion_time: "15-30 min", diluent: "SSN 0.9%", volume_ml: 100, note: "D1", max_lifetime_dose: 450, vial_size: 50, vial_unit: "mg" },
      { drug_name: "Ciclofosfamida", dose_per_unit: 1250, dose_basis: "mg/m²", route: "IV", infusion_time: "60 min", diluent: "SSN 0.9%", volume_ml: 500, note: "D1", vial_size: 1000, vial_unit: "mg" },
      { drug_name: "Vincristina", dose_per_unit: 1.4, dose_basis: "mg/m²", route: "IV", infusion_time: "Bolo", diluent: "SSN 0.9%", volume_ml: 50, note: "D8", max_single_dose: 2, vial_size: 1, vial_unit: "mg" },
      { drug_name: "Procarbazina", dose_per_unit: 100, dose_basis: "mg/m²", route: "VO", infusion_time: "D1-7", diluent: "N/A", volume_ml: 0, vial_size: 50, vial_unit: "mg" },
      { drug_name: "Prednisona", dose_per_unit: 40, dose_basis: "mg/m²", route: "VO", infusion_time: "D1-14", diluent: "N/A", volume_ml: 0, vial_size: 50, vial_unit: "mg" }
    ]
  },

  // ── Leucemias ──
  "HyperCVAD-A": {
    name: "HyperCVAD Parte A",
    indication: "Leucemia linfoblástica aguda",
    cycle_days: 21,
    total_cycles: 8,
    drugs: [
      { drug_name: "Ciclofosfamida", dose_per_unit: 300, dose_basis: "mg/m²", route: "IV", infusion_time: "3 hrs", diluent: "SSN 0.9%", volume_ml: 500, note: "c/12h D1-3", vial_size: 1000, vial_unit: "mg" },
      { drug_name: "Vincristina", dose_per_unit: 2, dose_basis: "mg", route: "IV", infusion_time: "Bolo", diluent: "SSN 0.9%", volume_ml: 50, note: "D4, D11", vial_size: 1, vial_unit: "mg" },
      { drug_name: "Doxorrubicina", dose_per_unit: 50, dose_basis: "mg/m²", route: "IV", infusion_time: "24 hrs", diluent: "SSN 0.9%", volume_ml: 250, note: "D4", max_lifetime_dose: 450, vial_size: 50, vial_unit: "mg" },
      { drug_name: "Dexametasona", dose_per_unit: 40, dose_basis: "mg", route: "IV/VO", infusion_time: "30 min", diluent: "SSN 0.9%", volume_ml: 100, note: "D1-4, D11-14", vial_size: 8, vial_unit: "mg" }
    ]
  },
  "DA-Leucemia": {
    name: "DA (Daunorrubicina/Citarabina)",
    indication: "Leucemia mieloide aguda (inducción)",
    cycle_days: 28,
    total_cycles: 2,
    drugs: [
      { drug_name: "Daunorrubicina", dose_per_unit: 60, dose_basis: "mg/m²", route: "IV", infusion_time: "30 min", diluent: "SSN 0.9%", volume_ml: 100, note: "D1-3", max_lifetime_dose: 550, vial_size: 20, vial_unit: "mg" },
      { drug_name: "Citarabina", dose_per_unit: 100, dose_basis: "mg/m²", route: "IV", infusion_time: "24 hrs continua", diluent: "SSN 0.9%", volume_ml: 500, note: "D1-7", vial_size: 500, vial_unit: "mg" }
    ]
  },

  // ── Cáncer de vejiga ──
  "MVAC": {
    name: "MVAC (Metotrexato/Vinblastina/Doxorrubicina/Cisplatino)",
    indication: "Cáncer de vejiga",
    cycle_days: 28,
    total_cycles: 6,
    drugs: [
      { drug_name: "Metotrexato", dose_per_unit: 30, dose_basis: "mg/m²", route: "IV", infusion_time: "15-30 min", diluent: "SSN 0.9%", volume_ml: 100, note: "D1, D15, D22", vial_size: 50, vial_unit: "mg" },
      { drug_name: "Vinblastina", dose_per_unit: 3, dose_basis: "mg/m²", route: "IV", infusion_time: "Bolo", diluent: "SSN 0.9%", volume_ml: 50, note: "D2, D15, D22", vial_size: 10, vial_unit: "mg" },
      { drug_name: "Doxorrubicina", dose_per_unit: 30, dose_basis: "mg/m²", route: "IV", infusion_time: "15-30 min", diluent: "SSN 0.9%", volume_ml: 100, note: "D2", max_lifetime_dose: 450, vial_size: 50, vial_unit: "mg" },
      { drug_name: "Cisplatino", dose_per_unit: 70, dose_basis: "mg/m²", route: "IV", infusion_time: "1-2 hrs", diluent: "SSN 0.9%", volume_ml: 500, note: "D2, requiere hidratación", vial_size: 50, vial_unit: "mg" }
    ]
  },
  "Gemcitabina-Cisplatino-Vejiga": {
    name: "Gemcitabina/Cisplatino (Vejiga)",
    indication: "Cáncer de vejiga",
    cycle_days: 28,
    total_cycles: 6,
    drugs: [
      { drug_name: "Gemcitabina", dose_per_unit: 1000, dose_basis: "mg/m²", route: "IV", infusion_time: "30 min", diluent: "SSN 0.9%", volume_ml: 250, note: "D1, D8, D15", vial_size: 1000, vial_unit: "mg" },
      { drug_name: "Cisplatino", dose_per_unit: 70, dose_basis: "mg/m²", route: "IV", infusion_time: "1-2 hrs", diluent: "SSN 0.9%", volume_ml: 500, note: "D2, requiere hidratación", vial_size: 50, vial_unit: "mg" }
    ]
  },

  // ── Cáncer de páncreas ──
  "FOLFIRINOX": {
    name: "FOLFIRINOX",
    indication: "Cáncer de páncreas",
    cycle_days: 14,
    total_cycles: 12,
    drugs: [
      { drug_name: "Oxaliplatino", dose_per_unit: 85, dose_basis: "mg/m²", route: "IV", infusion_time: "2 hrs", diluent: "SG 5%", volume_ml: 500, vial_size: 100, vial_unit: "mg" },
      { drug_name: "Irinotecán", dose_per_unit: 180, dose_basis: "mg/m²", route: "IV", infusion_time: "90 min", diluent: "SSN 0.9%", volume_ml: 500, vial_size: 100, vial_unit: "mg" },
      { drug_name: "Leucovorina", dose_per_unit: 400, dose_basis: "mg/m²", route: "IV", infusion_time: "2 hrs", diluent: "SG 5%", volume_ml: 250, vial_size: 200, vial_unit: "mg" },
      { drug_name: "5-Fluorouracilo bolo", dose_per_unit: 400, dose_basis: "mg/m²", route: "IV", infusion_time: "Bolo", diluent: "Directo", volume_ml: 0, vial_size: 500, vial_unit: "mg" },
      { drug_name: "5-Fluorouracilo infusión", dose_per_unit: 2400, dose_basis: "mg/m²", route: "IV", infusion_time: "46 hrs", diluent: "SSN 0.9%", volume_ml: 500, vial_size: 500, vial_unit: "mg" }
    ]
  },
  "Gemcitabina-Nab-Paclitaxel": {
    name: "Gemcitabina/Nab-Paclitaxel",
    indication: "Cáncer de páncreas",
    cycle_days: 28,
    total_cycles: 6,
    drugs: [
      { drug_name: "Nab-Paclitaxel", dose_per_unit: 125, dose_basis: "mg/m²", route: "IV", infusion_time: "30-40 min", diluent: "SSN 0.9%", volume_ml: 100, note: "D1, D8, D15", vial_size: 100, vial_unit: "mg" },
      { drug_name: "Gemcitabina", dose_per_unit: 1000, dose_basis: "mg/m²", route: "IV", infusion_time: "30 min", diluent: "SSN 0.9%", volume_ml: 250, note: "D1, D8, D15", vial_size: 1000, vial_unit: "mg" }
    ]
  },

  // ── Cáncer de próstata ──
  "Docetaxel-Prostata": {
    name: "Docetaxel (Próstata)",
    indication: "Cáncer de próstata metastásico",
    cycle_days: 21,
    total_cycles: 10,
    drugs: [
      { drug_name: "Docetaxel", dose_per_unit: 75, dose_basis: "mg/m²", route: "IV", infusion_time: "1 hr", diluent: "SSN 0.9%", volume_ml: 250, vial_size: 80, vial_unit: "mg" },
      { drug_name: "Prednisona", dose_per_unit: 10, dose_basis: "mg", route: "VO", infusion_time: "diario", diluent: "N/A", volume_ml: 0, note: "5 mg c/12h continuo", vial_size: 50, vial_unit: "mg" }
    ]
  },
  "Cabazitaxel": {
    name: "Cabazitaxel/Prednisona",
    indication: "Cáncer de próstata metastásico (2ª línea)",
    cycle_days: 21,
    total_cycles: 10,
    drugs: [
      { drug_name: "Cabazitaxel", dose_per_unit: 25, dose_basis: "mg/m²", route: "IV", infusion_time: "1 hr", diluent: "SSN 0.9%", volume_ml: 250, vial_size: 60, vial_unit: "mg" },
      { drug_name: "Prednisona", dose_per_unit: 10, dose_basis: "mg", route: "VO", infusion_time: "diario", diluent: "N/A", volume_ml: 0, note: "5 mg c/12h continuo", vial_size: 50, vial_unit: "mg" }
    ]
  },

  // ── Cáncer de riñón / células renales ──
  "Sunitinib": {
    name: "Sunitinib",
    indication: "Cáncer de células renales",
    cycle_days: 42,
    total_cycles: 6,
    drugs: [
      { drug_name: "Sunitinib", dose_per_unit: 50, dose_basis: "mg", route: "VO", infusion_time: "D1-28", diluent: "N/A", volume_ml: 0, note: "50 mg/día D1-28, descanso D29-42", vial_size: 50, vial_unit: "mg" }
    ]
  },

  // ── Cáncer de cabeza y cuello ──
  "Cisplatino-5FU-CyC": {
    name: "Cisplatino/5-FU (Cabeza y cuello)",
    indication: "Cáncer de cabeza y cuello",
    cycle_days: 21,
    total_cycles: 3,
    drugs: [
      { drug_name: "Cisplatino", dose_per_unit: 100, dose_basis: "mg/m²", route: "IV", infusion_time: "1-2 hrs", diluent: "SSN 0.9%", volume_ml: 500, note: "D1, requiere hidratación agresiva", vial_size: 50, vial_unit: "mg" },
      { drug_name: "5-Fluorouracilo infusión", dose_per_unit: 1000, dose_basis: "mg/m²", route: "IV", infusion_time: "24 hrs continua", diluent: "SSN 0.9%", volume_ml: 500, note: "D1-4", vial_size: 500, vial_unit: "mg" }
    ]
  },
  "Cetuximab-Mono": {
    name: "Cetuximab (monoterapia)",
    indication: "Cáncer de cabeza y cuello / colorrectal",
    cycle_days: 7,
    total_cycles: 12,
    drugs: [
      { drug_name: "Cetuximab", dose_per_unit: 400, dose_basis: "mg/m²", route: "IV", infusion_time: "120 min", diluent: "SSN 0.9%", volume_ml: 500, note: "Carga 400 mg/m², mantenimiento 250 mg/m² semanal", vial_size: 100, vial_unit: "mg" }
    ]
  },

  // ── Mieloma múltiple ──
  "VCD": {
    name: "VCD (Bortezomib/Ciclofosfamida/Dexametasona)",
    indication: "Mieloma múltiple",
    cycle_days: 21,
    total_cycles: 8,
    drugs: [
      { drug_name: "Bortezomib", dose_per_unit: 1.3, dose_basis: "mg/m²", route: "SC/IV", infusion_time: "3-5 seg IV", diluent: "SSN 0.9%", volume_ml: 5, note: "D1, D4, D8, D11", vial_size: 3.5, vial_unit: "mg" },
      { drug_name: "Ciclofosfamida", dose_per_unit: 500, dose_basis: "mg/m²", route: "IV", infusion_time: "30-60 min", diluent: "SSN 0.9%", volume_ml: 250, note: "D1, D8", vial_size: 1000, vial_unit: "mg" },
      { drug_name: "Dexametasona", dose_per_unit: 40, dose_basis: "mg", route: "IV/VO", infusion_time: "30 min", diluent: "SSN 0.9%", volume_ml: 100, note: "D1, D4, D8, D11", vial_size: 8, vial_unit: "mg" }
    ]
  },
  "VMP": {
    name: "VMP (Bortezomib/Melfalán/Prednisona)",
    indication: "Mieloma múltiple",
    cycle_days: 42,
    total_cycles: 9,
    drugs: [
      { drug_name: "Bortezomib", dose_per_unit: 1.3, dose_basis: "mg/m²", route: "SC/IV", infusion_time: "3-5 seg IV", diluent: "SSN 0.9%", volume_ml: 5, note: "D1, D4, D8, D11, D22, D25, D29, D32", vial_size: 3.5, vial_unit: "mg" },
      { drug_name: "Melfalán", dose_per_unit: 9, dose_basis: "mg/m²", route: "VO", infusion_time: "D1-4", diluent: "N/A", volume_ml: 0, vial_size: 2, vial_unit: "mg" },
      { drug_name: "Prednisona", dose_per_unit: 60, dose_basis: "mg/m²", route: "VO", infusion_time: "D1-4", diluent: "N/A", volume_ml: 0, vial_size: 50, vial_unit: "mg" }
    ]
  },

  // ── Cáncer de ovario adicionales ──
  "BEP-Ovario": {
    name: "BEP (Ovario/Células germinales)",
    indication: "Tumores de células germinales de ovario",
    cycle_days: 21,
    total_cycles: 3,
    drugs: [
      { drug_name: "Cisplatino", dose_per_unit: 20, dose_basis: "mg/m²", route: "IV", infusion_time: "1-2 hrs", diluent: "SSN 0.9%", volume_ml: 500, note: "D1-5, requiere hidratación", vial_size: 50, vial_unit: "mg" },
      { drug_name: "Etóposido", dose_per_unit: 100, dose_basis: "mg/m²", route: "IV", infusion_time: "1 hr", diluent: "SSN 0.9%", volume_ml: 500, note: "D1-5", vial_size: 100, vial_unit: "mg" },
      { drug_name: "Bleomicina", dose_per_unit: 30, dose_basis: "U", route: "IV", infusion_time: "15 min", diluent: "SSN 0.9%", volume_ml: 100, note: "D1, D8, D15", vial_size: 15, vial_unit: "U" }
    ]
  },

  // ── Sarcomas ──
  "AI-Sarcoma": {
    name: "AI (Doxorrubicina/Ifosfamida)",
    indication: "Sarcoma de tejidos blandos",
    cycle_days: 21,
    total_cycles: 6,
    drugs: [
      { drug_name: "Doxorrubicina", dose_per_unit: 75, dose_basis: "mg/m²", route: "IV", infusion_time: "15-30 min", diluent: "SSN 0.9%", volume_ml: 100, note: "D1", max_lifetime_dose: 450, vial_size: 50, vial_unit: "mg" },
      { drug_name: "Ifosfamida", dose_per_unit: 2500, dose_basis: "mg/m²", route: "IV", infusion_time: "3 hrs", diluent: "SSN 0.9%", volume_ml: 500, note: "D1-3, con Mesna", vial_size: 1000, vial_unit: "mg" },
      { drug_name: "Mesna", dose_per_unit: 500, dose_basis: "mg/m²", route: "IV", infusion_time: "15 min", diluent: "SSN 0.9%", volume_ml: 100, note: "0h, 4h, 8h post-ifosfamida", vial_size: 400, vial_unit: "mg" }
    ]
  },
  "Gemcitabina-Docetaxel-Sarcoma": {
    name: "Gemcitabina/Docetaxel (Sarcoma)",
    indication: "Sarcoma de tejidos blandos",
    cycle_days: 21,
    total_cycles: 6,
    drugs: [
      { drug_name: "Gemcitabina", dose_per_unit: 900, dose_basis: "mg/m²", route: "IV", infusion_time: "90 min", diluent: "SSN 0.9%", volume_ml: 250, note: "D1, D8", vial_size: 1000, vial_unit: "mg" },
      { drug_name: "Docetaxel", dose_per_unit: 100, dose_basis: "mg/m²", route: "IV", infusion_time: "1 hr", diluent: "SSN 0.9%", volume_ml: 250, note: "D8", vial_size: 80, vial_unit: "mg" }
    ]
  },

  // ── Cáncer de endometrio ──
  "Carboplatino-Paclitaxel-Endometrio": {
    name: "Carboplatino/Paclitaxel (Endometrio)",
    indication: "Cáncer de endometrio",
    cycle_days: 21,
    total_cycles: 6,
    drugs: [
      { drug_name: "Paclitaxel", dose_per_unit: 175, dose_basis: "mg/m²", route: "IV", infusion_time: "3 hrs", diluent: "SSN 0.9%", volume_ml: 500, vial_size: 300, vial_unit: "mg" },
      { drug_name: "Carboplatino", dose_per_unit: 5, dose_basis: "AUC", route: "IV", infusion_time: "30-60 min", diluent: "SG 5%", volume_ml: 250, vial_size: 450, vial_unit: "mg" }
    ]
  }
};

// Calcula BSA usando fórmula de Mosteller
export function calculateBSA(weightKg, heightCm) {
  if (!weightKg || !heightCm) return 0;
  return Math.sqrt((weightKg * heightCm) / 3600);
}

// Calcula dosis por AUC (Calvert) para Carboplatino
export function calculateCarboplatin(auc, creatinineClearance) {
  if (!auc || !creatinineClearance) return 0;
  return auc * (creatinineClearance + 25);
}

// Calcula la dosis basada en el tipo de dosificación
export function calculateDose(drug, bsa, weightKg, creatinineClearance) {
  const { dose_per_unit, dose_basis, max_single_dose } = drug;
  let calculatedDose = 0;

  switch (dose_basis) {
    case "mg/m²":
    case "U/m²":
      calculatedDose = dose_per_unit * bsa;
      break;
    case "mg/kg":
      calculatedDose = dose_per_unit * weightKg;
      break;
    case "AUC":
      calculatedDose = calculateCarboplatin(dose_per_unit, creatinineClearance || 100);
      break;
    case "mg":
    case "U":
      calculatedDose = dose_per_unit;
      break;
    default:
      calculatedDose = dose_per_unit * bsa;
  }

  // Aplicar dosis máxima si existe
  if (max_single_dose && calculatedDose > max_single_dose) {
    calculatedDose = max_single_dose;
  }

  return Math.round(calculatedDose * 100) / 100;
}

// Valida la dosis prescrita vs calculada (tolerancia ±10%)
export function validateDose(prescribedDose, calculatedDose, tolerance = 0.10) {
  if (!prescribedDose || !calculatedDose) return { isValid: false, variance: 0, message: "Datos insuficientes" };
  
  const variance = (prescribedDose - calculatedDose) / calculatedDose;
  const isValid = Math.abs(variance) <= tolerance;
  
  let message = "";
  if (isValid) {
    message = "Dosis dentro del rango aceptable";
  } else if (variance > 0) {
    message = `Dosis SUPERIOR al calculado por ${(variance * 100).toFixed(1)}%`;
  } else {
    message = `Dosis INFERIOR al calculado por ${(Math.abs(variance) * 100).toFixed(1)}%`;
  }

  return {
    isValid,
    variance: Math.round(variance * 10000) / 100,
    message
  };
}

// Genera alertas para la prescripción
export function generateAlerts(drugs, patient) {
  const alerts = [];

  drugs.forEach(drug => {
    // Alerta de función renal para cisplatino
    if (drug.drug_name.toLowerCase().includes("cisplatino") && patient.creatinine_clearance && patient.creatinine_clearance < 60) {
      alerts.push(`⚠️ Precaución: Depuración de creatinina (${patient.creatinine_clearance} mL/min) baja para Cisplatino. Considerar Carboplatino.`);
    }

    // Alerta de función hepática para taxanos
    if ((drug.drug_name.toLowerCase().includes("docetaxel") || drug.drug_name.toLowerCase().includes("paclitaxel")) 
        && patient.hepatic_function && patient.hepatic_function !== "Normal") {
      alerts.push(`⚠️ Función hepática ${patient.hepatic_function}: Considerar ajuste de dosis para ${drug.drug_name}.`);
    }

    // Alerta BSA > 2.0
    if (patient.bsa > 2.2) {
      alerts.push(`⚠️ SCT elevada (${patient.bsa.toFixed(2)} m²). Verificar si se requiere tope de dosis.`);
    }
  });

  return [...new Set(alerts)];
}

export function getProtocolsByIndication() {
  const grouped = {};
  Object.entries(CHEMO_PROTOCOLS).forEach(([key, protocol]) => {
    if (!grouped[protocol.indication]) {
      grouped[protocol.indication] = [];
    }
    grouped[protocol.indication].push({ key, ...protocol });
  });
  return grouped;
}