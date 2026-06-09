// 痛车数据库 — Legacy ES5 version of src/car.js
// Car data is identical to the native version; only syntax is down-leveled.

var CAMAZDA = "长安马自达";
var FAWMAZDA = "一汽轿车马自达";
var HNMAZDA = "海南马自达";
var FAWAUDI = "一汽奥迪";
var SEMITSUBISHI = "东南汽车";
var SHVW = "上汽大众";
var FAWVW = "一汽大众";
var AUDI = "奥迪";
var BJSUZUKI = "昌河铃木";
var BJBENZ = "北京奔驰";
var SYBMW = "华晨宝马";

export var CAR_MODELS = [
  { id: "DongnanV3",    model: "V3菱悦",                brand: SEMITSUBISHI },
  { id: "Mazda6",       model: "马自达6",               brand: FAWMAZDA },
  { id: "AudiA6L_C6",   model: "A6L（C6）",             brand: FAWAUDI },
  { id: "LamandoLGTS",  model: "凌渡L GTS 380TSI",      brand: SHVW },
  { id: "Mazda3_Axela", model: "马自达3 次世代昂克赛拉",  brand: CAMAZDA },
  { id: "AudiA6L_C8",   model: "A6L（C8）",             brand: FAWAUDI },
  { id: "CC_RV",        model: "CC 猎装版",             brand: FAWVW },
  { id: "S4_Avant",     model: "S4 Avant",             brand: AUDI },
  { id: "WagonR",       model: "北斗星",                brand: BJSUZUKI },
  { id: "AMG_A35L",     model: "AMG A 35 L 4MATIC",    brand: BJBENZ },
  { id: "435I",         model: "BMW 435i",             brand: SYBMW },
  { id: "BJ323",        model: "323 福美来",             brand: HNMAZDA },
];

var MODEL_MAP = {};
for (var i = 0; i < CAR_MODELS.length; i++) {
  MODEL_MAP[CAR_MODELS[i].id] = CAR_MODELS[i];
}

/** 根据编号拼接完整的显示标签 */
export function getCarLabel(id) {
  var m = MODEL_MAP[id];
  if (!m) return id;
  return m.brand ? (m.brand + " " + m.model) : m.model;
}

export function getCarWeight(id) {
  var m = MODEL_MAP[id];
  return m ? m.weight : 1;
}

function buildEntry(id, weight) {
  return { id: id, label: getCarLabel(id), weight: weight };
}

/** 大学生模板 */
export var PAIN_CAR_MODELS_UNIVERSITY = [
  { id: "none", label: "无", weight: 80 },
  buildEntry("BJ323",      5),
  buildEntry("WagonR",     5),
  buildEntry("DongnanV3",  5),
  buildEntry("Mazda6",     4),
  buildEntry("AudiA6L_C6", 1),
];

/** 社畜模板 */
export var PAIN_CAR_MODELS_OFFICE = [
  { id: "none", label: "无", weight: 40 },
  buildEntry("LamandoLGTS",      20),
  buildEntry("Mazda3_Axela",     25),
  buildEntry("AudiA6L_C8",       5),
  buildEntry("CC_RV",            5),
  buildEntry("435I",             2),
  buildEntry("AMG_A35L",         1),
  buildEntry("S4_Avant",         1),
];
