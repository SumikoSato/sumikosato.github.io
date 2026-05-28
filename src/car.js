// 痛车数据库

export const CAMAZDA = "长安马自达";
export const FAWMAZDA = "一汽轿车马自达";
export const HNMAZDA = "海南马自达";
export const FAWAUDI = "一汽奥迪";
export const SEMITSUBISHI = "东南汽车";
export const SHVW = "上汽大众";
export const FAWVW = "一汽大众";
export const AUDI = "奥迪";
export const BJSUZUKI = "昌河铃木";
export const BJBENZ = "北京奔驰";
export const SYBMW = "华晨宝马";



/** 汽车型号列表 */
export const CAR_MODELS = [
  { id: "DongnanV3",      model: "V3菱悦",                  brand: SEMITSUBISHI },
  { id: "Mazda6",         model: "马自达6",                 brand: FAWMAZDA },
  { id: "AudiA6L_C6",     model: "A6L（C6）",               brand: FAWAUDI },
  { id: "LamandoLGTS",    model: "凌渡L GTS 380TSI",        brand: SHVW },
  { id: "Mazda3_Axela",   model: "马自达3 次世代昂克赛拉",    brand: CAMAZDA },
  { id: "AudiA6L_C8",     model: "A6L（C8）",               brand: FAWAUDI },
  { id: "CC_RV",          model: "CC 猎装版",               brand: FAWVW },
  { id: "S4_Avant",       model: "S4 Avant",               brand: AUDI },
  { id: "WagonR",         model: "北斗星",                  brand: BJSUZUKI },
  { id: "AMG_A35L",       model: "AMG A 35 L 4MATIC",      brand: BJBENZ },
  { id: "435I",           model: "BMW 435i",               brand: SYBMW },
  { id: "BJ323",           model: "323 福美来",               brand: HNMAZDA },
];

const MODEL_MAP = Object.fromEntries(CAR_MODELS.map((c) => [c.id, c]));

/** 根据编号拼接完整的显示标签 */
export function getCarLabel(id) {
  const m = MODEL_MAP[id];
  if (!m) return id;
  return m.brand ? `${m.brand} ${m.model}` : m.model;
}

function buildEntry(id, weight) {
  return { id, label: getCarLabel(id), weight };
}

/** 大学生模板 */
export const PAIN_CAR_MODELS_UNIVERSITY = [
  { id: "none", label: "无", weight: 80 },
  buildEntry("BJ323",      5),
  buildEntry("WagonR",     5),
  buildEntry("DongnanV3",  5),
  buildEntry("Mazda6",     4),
  buildEntry("AudiA6L_C6", 1),
];

/** 社畜模板 */
export const PAIN_CAR_MODELS_OFFICE = [
  { id: "none", label: "无", weight: 40 },
  buildEntry("LamandoLGTS",      20),
  buildEntry("Mazda3_Axela",     25),
  buildEntry("AudiA6L_C8",        5),
  buildEntry("CC_RV",  5),
  buildEntry("435I",  2),
  buildEntry("AMG_A35L",  1),
  buildEntry("S4_Avant",  1),
];
