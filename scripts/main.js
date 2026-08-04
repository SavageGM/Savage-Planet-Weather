const MODULE_ID = "savage-planet-weather";
const VERSION = "0.1.0";

const DEFAULTS = {
  climate: "temperate",
  terrain: "plains",
  month: 6,
  tempMethod: "simple",
  variation: "none",
  output: "dialog",
  rollMode: "publicroll",
  showGurps: false,
  mode: "classic",
  sector: "none",
  savageFrequency: "normal"
};

const WTHR_RAW = `
tropical|hills|60/-,65/I,70/-,75/I,80/II,85/I,95/I,100/III,95/II,80/-,70/I,65/-
tropical|mountains|65/I,65/III,70/II,75/III,80/IV,85/IV,90/I,95/III,95/II,90/III,80/IV,70/IV
tropical|forest|80/III,80/V,80/IV,85/III,85/V,85/IV,90/III,95/V,90/IV,85/III,80/V,80/IV
tropical|plains|65/-,70/I,75/-,80/II,85/IV,90/III,95/III,95/IV,90/III,85/II,80/IV,75/III
tropical|swamp|65/-,70/II,75/I,80/III,85/IV,90/IV,95/III,95/IV,90/III,85/II,80/III,75/III
tropical|desert|70/-,75/I,80/-,80/-,85/II,85/I,90/-,95/I,90/-,85/-,80/I,75/-
tropical|coast|75/-,75/I,80/-,85/II,85/V,90/III,90/IV,90/V,85/V,75/I,75/II,70/I
subtropical|hills|60/I,65/II,70/II,75/II,75/IV,80/III,80/II,85/IV,75/III,70/I,65/III,60/II
subtropical|mountains|55/I,60/III,65/II,70/II,70/IV,75/III,65/II,60/III,65/III,60/I,60/III,55/II
subtropical|forest|75/III,70/IV,75/IV,75/III,80/V,85/IV,85/III,85/V,80/IV,80/III,75/IV,75/IV
subtropical|plains|60/-,65/II,70/I,75/I,80/IV,85/II,90/I,90/III,95/II,85/-,75/II,65/I
subtropical|swamp|60/I,65/II,70/II,75/I,80/III,85/II,90/I,90/IV,85/II,85/I,70/II,65/II
subtropical|desert|60/-,65/I,75/-,75/-,80/I,85/-,90/-,90/-,85/-,80/-,75/I,70/-
subtropical|coast|55/I,60/III,65/II,65/II,75/IV,85/III,75/II,75/V,70/III,70/-,65/II,60/I
temperate|hills|25/I,30/III,40/I,50/II,60/IV,70/III,75/II,80/IV,70/III,55/I,40/III,30/II
temperate|mountains|25/-,25/II,30/II,40/-,50/III,65/II,70/-,70/II,60/I,50/-,40/III,30/II
temperate|forest|20/I,15/III,40/II,50/II,60/IV,65/III,75/II,75/III,65/III,60/I,35/III,30/III
temperate|plains|15/-,20/II,40/I,50/II,60/IV,65/III,75/II,75/IV,65/III,50/I,40/III,30/II
temperate|swamp|30/I,35/III,40/II,50/II,60/IV,65/II,75/II,75/IV,75/III,60/-,50/III,40/II
temperate|desert|55/-,55/I,60/-,65/-,70/I,80/-,90/-,90/I,85/-,75/-,70/-,55/-
temperate|coast|30/II,40/IV,45/III,50/I,55/III,65/II,65/I,65/II,60/I,50/II,40/IV,35/III
subarctic|hills|-5/-,-5/I,10/I,15/-,40/II,50/I,55/I,55/II,40/II,30/-,15/II,10/I
subarctic|mountains|-5/-,-5/I,15/I,15/I,30/III,40/II,50/I,55/II,40/I,30/-,15/II,10/I
subarctic|forest|5/-,5/II,15/I,30/I,40/III,50/II,55/I,55/III,40/II,30/I,20/II,15/I
subarctic|plains|-5/-,-5/II,5/I,15/I,40/III,50/II,55/II,55/III,40/II,25/I,5/II,-5/I
subarctic|swamp|-5/-,-5/II,5/I,20/I,40/III,50/II,55/I,55/II,40/II,25/I,10/II,0/II
subarctic|desert|-5/-,-5/I,5/-,15/-,40/-,50/I,55/-,55/-,40/I,25/-,5/I,-5/-
subarctic|coast|15/-,20/I,25/I,30/-,40/II,50/I,55/I,55/III,50/II,40/-,25/II,15/I
arctic|hills|-15/-,-20/-,-10/I,-5/-,5/II,15/I,20/-,20/-,15/I,5/-,0/-,-10/I
arctic|mountains|-15/-,-20/-,-10/I,-5/-,5/-,15/I,20/-,20/-,15/I,5/-,0/-,-10/I
arctic|plains|-10/-,-15/I,-5/I,5/-,15/II,30/I,40/-,40/II,25/II,15/-,-5/I,-15/I
arctic|desert|-10/-,-15/I,-5/-,5/-,15/I,30/-,40/-,40/I,25/-,15/-,-5/I,-15/-
arctic|coast|-5/-,-15/I,5/-,5/-,15/-,30/I,40/-,40/II,25/I,15/-,0/I,-10/I
`;

const WTHR = {};
for (const line of WTHR_RAW.trim().split("\n")) {
  const [climate, terrain, vals] = line.split("|");
  WTHR[climate] ??= {};
  WTHR[climate][terrain] = vals.split(",").map(v => {
    const [temp, cls] = v.split("/");
    return { temp: Number(temp), cls: cls === "-" ? null : cls };
  });
}

const PREC = {
  I: [[1,29,"none"],[30,30,"A"]],
  II: [[1,25,"none"],[26,28,"A"],[29,29,"B"],[30,30,"D"]],
  III: [[1,15,"none"],[16,19,"A"],[20,23,"B"],[24,24,"C"],[25,28,"D"],[29,29,"E"],[30,30,"F"]],
  IV: [[1,8,"none"],[9,14,"A"],[15,18,"B"],[19,21,"C"],[22,25,"D"],[26,28,"E"],[29,30,"F"]],
  V: [[1,4,"none"],[5,9,"A"],[10,14,"B"],[15,18,"C"],[19,23,"D"],[24,27,"E"],[28,30,"F"]]
};

const EVENT_NAMES = {
  none: "No Precipitation Event",
  A: "Single Cell Storm",
  B: "Multi-cell Cluster, Non-severe",
  C: "Multi-cell Cluster, Severe",
  D: "Multi-cell Line, Non-severe",
  E: "Multi-cell Line, Severe",
  F: "Supercell"
};

const CELL_TABLES = {
  SCN: {
    rain: [.1,.2,.3,.4,.5,.6,.7,.8,.9,1,.1,.2,.3,.4,.5,.6,.7,.8,.9,1,1.25,1.5,1.75,2,2.25,2.5,2.75,3,3.25,3.5],
    wind: [3,3,3,3,3,4,4,4,4,4,5,5,5,5,5,6,6,6,6,6,7,7,7,7,7,8,8,8,8,8],
    solid: ["—","—","—","—","—","—","—","—","—","—","—","—","—","—","—","—","—","—","—","—","—","L","L","L","M","M","M","H","H","H"],
    hook: ["—","—","—","—","—","—","—","—","—","—","—","—","—","—","—","—","—","—","—","—","—","—","—","—","—",1,5,10,15,20]
  },
  SCS: {
    rain: [.5,1,1.5,2,2.5,3,.5,1,1.5,2,2.5,3,1,1.5,2,2.5,3,3.5,1,1.5,2,2.5,3,3.5,2,2.5,3,3.5,4,5],
    wind: [3,3,3,7,7,7,10,10,10,15,15,15,20,20,20,21,21,21,22,22,22,23,23,23,24,24,24,25,25,25],
    solid: ["—","—","—","—","—","—","—","—","—","—","—","—","L","L","L","L","L","L","M","M","M","M","M","M","H","H","H","H","H","H"],
    hook: ["—","—","—","—","—","—","—","—","—","—","—","—","—","—",5,10,15,20,"—",5,10,15,20,25,5,10,15,20,25,30]
  }
};

const SECTORS = {
  none: { label: "None / Generic", phenomena: [] },
  loneStar: { label: "Lone Star Sector", phenomena: ["Megacell", "Derecho", "Haboob", "Black Rain", "Toxic Flood"] },
  heartlandWastes: { label: "Heartland Wastes", phenomena: ["Megacell", "Radioactive Haboob", "Fallout Storm", "Derecho", "Black Rain"] },
  gulfCoast: { label: "Gulf Coast", phenomena: ["Toxic Flood", "Hurricane Band", "Black Rain", "Megacell"] },
  greatLakes: { label: "Great Lakes Sector", phenomena: ["Hyperstorm", "Ice Storm", "Black Rain", "EMP Lightning Storm"] },
  wasteland: { label: "General Wasteland", phenomena: ["Fallout Storm", "Haboob", "Black Rain", "EMP Lightning Storm", "Meteor Shower"] }
};

const PHENOMENA = {
  "Black Rain": { icon: "☢️🌧️", severity: "Severe", text: "Radioactive precipitation contaminates exposed surfaces and water supplies.", gurps: "Radiation Threshold Point exposure every 10 minutes if unprotected; Survival or NBC Suit checks may be required." },
  "Megacell": { icon: "🌀", severity: "Extreme", text: "A massive Savage Planet superstorm cell with repeated lightning and possible multiple vortex activity.", gurps: "Treat wind and visibility penalties as one severity level worse; outdoor movement requires frequent DX or Survival checks." },
  "Haboob": { icon: "🌪️🏜️", severity: "Severe", text: "A fast-moving dust wall reduces visibility and chokes exposed characters.", gurps: "Visibility 10-50 yards; unprotected breathing requires HT checks; vehicle operation at -3 or worse." },
  "Radioactive Haboob": { icon: "☢️🌪️🏜️", severity: "Extreme", text: "A radioactive dust wall carries fallout particles across the region.", gurps: "Use Haboob effects plus radiation exposure; sealed masks and decontamination are strongly recommended." },
  "Fallout Storm": { icon: "☢️🌫️", severity: "Extreme", text: "Radioactive ash and dust obscure the area and contaminate equipment.", gurps: "Visibility 10-50 yards; Radiation Threshold Point exposure; unsealed electronics may require failure checks." },
  "Derecho": { icon: "💨⚡", severity: "Severe", text: "A long-lived straight-line windstorm sweeps across the region.", gurps: "Treat wind damage as sustained. Exposed characters make DX or ST checks to avoid being knocked down." },
  "Hyperstorm": { icon: "❄️🌨️", severity: "Extreme", text: "A Savage Planet blizzard with whiteout, deep snow, and freezing wind.", gurps: "Visibility near zero; fatigue or cold exposure checks; vehicles risk immobilization." },
  "Ice Storm": { icon: "🧊🌧️", severity: "Severe", text: "Freezing rain coats structures, ground, and vehicles in ice.", gurps: "Footing penalties from -2 to -4; vehicles require control checks; exposed surfaces become hazardous." },
  "EMP Lightning Storm": { icon: "⚡", severity: "Extreme", text: "High-atmosphere electrical discharges disrupt communications and electronics.", gurps: "Unshielded electronics may require HT or malfunction checks; radio communications are unreliable." },
  "Toxic Flood": { icon: "☣️🌊", severity: "Severe", text: "Floodwater carries industrial, biological, or chemical contamination.", gurps: "Avoid contact or roll HT; contaminated wounds risk infection or poison effects." },
  "Hurricane Band": { icon: "🌀🌧️", severity: "Extreme", text: "A feeder band from a massive coastal storm produces violent rain and wind.", gurps: "Travel and ranged attacks heavily penalized; flooding and structural damage likely." },
  "Meteor Shower": { icon: "☄️", severity: "Catastrophic", text: "Small fragments burn through the atmosphere and strike the region.", gurps: "Random impact hazards; shockwaves, fires, and local damage at GM discretion." }
};

let lastWeather = null;

Hooks.once("init", () => {
  game.settings.register(MODULE_ID, "defaults", {
    name: "Savage Planet Weather Defaults",
    scope: "world",
    config: false,
    type: Object,
    default: DEFAULTS
  });
});

Hooks.once("ready", () => {
  game.savageWeather = {
    open: openWeatherDialog,
    roll: rollWeather,
    current: () => lastWeather,
    version: VERSION
  };
  console.log(`Savage Planet Weather Engine v${VERSION} ready.`);
});

Hooks.on("getSceneControlButtons", controls => {
  if (!Array.isArray(controls)) return;
  const token = controls.find(c => c.name === "token") ?? controls[0];
  if (!token) return;
  token.tools.push({
    name: "savage-weather",
    title: "Savage Planet Weather",
    icon: "fas fa-cloud-bolt",
    visible: game.user?.isGM,
    onClick: () => openWeatherDialog(),
    button: true
  });
});

function getDefaults() {
  const stored = game.settings.get(MODULE_ID, "defaults") ?? {};
  return foundry.utils.mergeObject(foundry.utils.deepClone(DEFAULTS), stored, { inplace: false });
}

async function saveDefaults(data) {
  await game.settings.set(MODULE_ID, "defaults", {
    climate: data.climate,
    terrain: data.terrain,
    month: Number(data.month),
    tempMethod: data.tempMethod,
    variation: data.variation,
    output: data.output,
    rollMode: data.rollMode,
    showGurps: Boolean(data.showGurps),
    mode: data.mode,
    sector: data.sector,
    savageFrequency: data.savageFrequency
  });
}

async function rollTotal(formula) {
  return (await new Roll(formula).evaluate()).total;
}

function lookupPREC(cls, roll) {
  return PREC[cls].find(([lo, hi]) => roll >= lo && roll <= hi)?.[2] ?? "none";
}

function precipType(t) {
  if (t >= 35) return "rain";
  if (t >= 30) return "mixed";
  return "snow";
}

function tempRange(climate, month, median) {
  const cold = [1,2,3,10,11,12].includes(Number(month));
  const map = {
    tropical: cold ? [-20,20] : [-10,25],
    subtropical: cold ? [-20,15] : [-15,25],
    temperate: cold ? [-25,15] : [-15,25],
    subarctic: cold ? [-25,15] : [-20,20],
    arctic: cold ? [-30,10] : [-20,20]
  };
  const [low, high] = map[climate] ?? [-15, 15];
  return { low: median + low, high: median + high };
}

function badge(text, bg = "#333") {
  return `<span class="spw-badge" style="background:${bg};">${text}</span>`;
}

function weatherIcon(type) {
  if (type === "snow") return "❄️";
  if (type === "mixed") return "🌧️❄️";
  return "🌧️";
}

function solidText(solid, type) {
  if (type === "snow") return "Ignored in snow conditions";
  if (solid === "L") return "L - light hail/sleet";
  if (solid === "M") return "M - medium hail/sleet";
  if (solid === "H") return "H - heavy hail/sleet";
  return "—";
}

function tornadoSeverityFromHook(hook) {
  if (hook <= 5) return { f:"F0", wind:"< 73 mph", kmh:"< 117 km/h", desc:"Light damage", gurps:"Outdoor DX rolls at -1 in debris; light structures and signs damaged." };
  if (hook <= 10) return { f:"F1", wind:"73-112 mph", kmh:"117-180 km/h", desc:"Moderate damage", gurps:"DX-2 to stay upright; light debris 1d-2 cr; weak roofs damaged." };
  if (hook <= 15) return { f:"F2", wind:"113-157 mph", kmh:"181-253 km/h", desc:"Considerable damage", gurps:"DX-3 or be knocked down; flying debris 1d to 2d cr/cut." };
  if (hook <= 20) return { f:"F3", wind:"158-206 mph", kmh:"254-332 km/h", desc:"Severe damage", gurps:"DX-4 or be thrown; debris 3d cr/cut; vehicles may overturn." };
  if (hook <= 25) return { f:"F4", wind:"207-260 mph", kmh:"333-418 km/h", desc:"Devastating damage", gurps:"DX-5 or be thrown; heavy debris 4d to 6d cr/cut." };
  return { f:"F5", wind:"261-318 mph", kmh:"419-512 km/h", desc:"Incredible damage", gurps:"Survival-level hazard; heavy debris 6d+ cr/cut; immediate hard cover required." };
}

async function tornadoText(hook, showGurps) {
  if (hook === "—") return "—";
  const roll = await rollTotal("1d30");
  if (roll > Number(hook)) return "No tornado.";
  const sev = tornadoSeverityFromHook(Number(hook));
  return `🌪️ ${badge(sev.f, "#7a1f1f")} <b>TORNADO!</b> ${sev.wind} / ${sev.kmh}, ${sev.desc}.${showGurps ? `<br><b>GURPS:</b> ${sev.gurps}` : ""}`;
}

function gurpsWeatherText(type, amount, wind) {
  const gust = wind * 3;
  const windEffect = gust < 30 ? "Minor weather penalty only." :
    gust < 60 ? "-1 to exposed ranged attacks and Hearing rolls." :
    gust < 90 ? "DX or Survival checks for movement; ranged attacks at -2 or worse." :
    "Dangerous storm winds; DX/ST checks required and ranged attacks are heavily penalized.";
  const precipEffect = type === "snow"
    ? `${amount}\" snowfall; apply movement penalties when accumulation becomes significant.`
    : `${amount}\" precipitation; poor footing, visibility penalties, and flooding may apply.`;
  return `${precipEffect} ${windEffect}`;
}

async function cellCard(tableName, roll, meanTemp, label, showGurps) {
  const t = CELL_TABLES[tableName];
  const i = roll - 1;
  const type = precipType(meanTemp);
  const rain = t.rain[i];
  const wind = t.wind[i];
  const solid = t.solid[i];
  const hook = t.hook[i];
  const amount = type === "snow" ? rain * 2 : rain;
  const tornado = await tornadoText(hook, showGurps);

  return `<div class="spw-card">
    <div class="spw-card-title">${badge(tableName, "#444")} ${label}</div>
    <div>🎲 <b>Roll:</b> ${roll}</div>
    <div>${weatherIcon(type)} <b>Precipitation:</b> ${amount}\" ${type === "snow" ? "snowfall" : "precipitation"} (${type})</div>
    <div>💨 <b>Wind:</b> ${wind} mph average; gusts up to ${wind * 3} mph</div>
    <div>🧊 <b>Solid:</b> ${solidText(solid, type)}</div>
    <div>🌪️ <b>Tornado:</b> ${tornado}</div>
    ${showGurps ? `<div>🎲 <b>GURPS Weather Effects:</b> ${gurpsWeatherText(type, amount, wind)}</div>` : ""}
  </div>`;
}

async function getVariation(mode) {
  if (mode === "d3") {
    const r = await rollTotal("1d3");
    return r === 1 ? -5 : r === 2 ? 0 : 5;
  }
  if (mode === "d5") {
    const r = await rollTotal("1d5");
    return [-10,-5,0,5,10][r - 1];
  }
  return 0;
}

function savageThreshold(freq) {
  return { low: 3, normal: 6, high: 10, extreme: 18 }[freq] ?? 6;
}

async function savagePhenomenon(data, event) {
  if (data.mode !== "savage") return "";
  const profile = SECTORS[data.sector] ?? SECTORS.none;
  if (!profile.phenomena.length) return "";

  let threshold = savageThreshold(data.savageFrequency);
  if (event === "F") threshold += 5;
  if (["C", "E"].includes(event)) threshold += 2;
  if (await rollTotal("1d30") > threshold) return "";

  const name = profile.phenomena[(await rollTotal(`1d${profile.phenomena.length}`)) - 1];
  const p = PHENOMENA[name];
  return `<div class="spw-card spw-savage">
    <div class="spw-card-title">${p.icon} ${badge(p.severity, "#7a1f1f")} ${name}</div>
    <div>${p.text}</div>
    ${data.showGurps ? `<div>🎲 <b>GURPS:</b> ${p.gurps}</div>` : ""}
  </div>`;
}

async function generateWeather(data) {
  const base = WTHR[data.climate]?.[data.terrain]?.[Number(data.month) - 1];
  if (!base) throw new Error("Invalid climate, terrain, or month combination.");

  const variation = await getVariation(data.variation);
  const meanTemp = base.temp + variation;
  const type = precipType(meanTemp);
  const range = tempRange(data.climate, data.month, meanTemp);

  let html = `<div class="spw-summary">
    <h2>${weatherIcon(type)} Weather Event</h2>
    <p><b>Mode:</b> ${data.mode === "savage" ? "Savage Planet Weather" : "Classic d30 Weather"}</p>
    ${data.mode === "savage" ? `<p><b>Sector:</b> ${(SECTORS[data.sector] ?? SECTORS.none).label}</p>` : ""}
    <p><b>Climate:</b> ${data.climate}</p>
    <p><b>Terrain:</b> ${data.terrain}</p>
    <p><b>Month:</b> ${data.month}</p>
    <p><b>WTHR Base:</b> ${base.temp}°F / ${base.cls ?? "None"}</p>
    <p><b>Temperature Adjustment:</b> ${variation >= 0 ? "+" : ""}${variation}°F</p>
    <p><b>Final Mean Temperature:</b> ${meanTemp}°F</p>
    ${data.tempMethod === "advanced" ? `<p><b>Daily Range:</b> Low ${range.low}°F / High ${range.high}°F</p>` : ""}
    <p><b>Precipitation Type:</b> ${weatherIcon(type)} ${type}</p>
  </div>`;

  if (!base.cls) {
    html += `<p><b>Result:</b> No measurable precipitation.</p>${await savagePhenomenon(data, "none")}`;
    lastWeather = { data, html, event: "none", meanTemp, precipitationType: type };
    return html;
  }

  const precRoll = await rollTotal("1d30");
  const event = lookupPREC(base.cls, precRoll);
  html += `<p><b>PREC Roll:</b> ${precRoll} on Class ${base.cls} → <b>${EVENT_NAMES[event]}</b></p>`;

  if (event === "none") {
    html += `<p><b>Result:</b> No precipitation event.</p>${await savagePhenomenon(data, event)}`;
    lastWeather = { data, html, event, meanTemp, precipitationType: type };
    return html;
  }

  let cards = "";
  if (event === "A") {
    const duration = 20 + await rollTotal("1d10");
    cards += await cellCard("SCN", await rollTotal("1d30"), meanTemp, `Single Cell: ${duration} minutes`, data.showGurps);
  }

  if (["B","C","D","E"].includes(event)) {
    const cells = Math.ceil((await rollTotal("1d30") + 10) / 5);
    const table = ["B","D"].includes(event) ? "SCN" : "SCS";
    const hasBreaks = ["B","C"].includes(event);
    html += `<p><b>Number of Cells:</b> ${cells}</p>`;
    html += `<p><b>Storm Structure:</b> ${hasBreaks ? "Cluster with breaks between cells" : "Continuous squall line; no substantial breaks"}</p>`;

    for (let n = 1; n <= cells; n++) {
      const duration = 20 + await rollTotal("1d10");
      let label = `Cell ${n}: ${duration} minutes`;
      if (hasBreaks && n < cells) label += `; then ${Math.ceil(await rollTotal("1d30") / 2)} minute break`;
      cards += await cellCard(table, await rollTotal("1d30"), meanTemp, label, data.showGurps);
    }
  }

  if (event === "F") {
    const total = 60 + (await rollTotal("1d30") * 10);
    const segments = Math.ceil(total / 10);
    html += `<p><b>Total Supercell Duration:</b> ${total} minutes</p><p><b>Effect Interval:</b> Every 10 minutes</p>`;
    for (let n = 1; n <= segments; n++) {
      const formula = (n === 1 || n === segments) ? "1d10" : n === 2 ? "1d10+10" : "1d10+20";
      cards += await cellCard("SCS", await rollTotal(formula), meanTemp, `Supercell Segment ${n}: minute ${(n - 1) * 10}-${n * 10}`, data.showGurps);
    }
  }

  cards += await savagePhenomenon(data, event);
  html += `<hr><div class="spw-card-stack">${cards}</div>`;
  lastWeather = { data, html, event, meanTemp, precipitationType: type };
  return html;
}

async function postToChat(content, mode) {
  const chatData = { speaker: ChatMessage.getSpeaker(), content };
  ChatMessage.applyRollMode(chatData, mode);
  await ChatMessage.create(chatData);
}

function showResults(content) {
  new Dialog({
    title: "Weather Event Results",
    content: `<div class="spw-results">${content}</div>`,
    buttons: { close: { label: "Close" } },
    default: "close"
  }, { width: 680, resizable: true }).render(true);
}

async function rollWeather(options = {}) {
  const data = foundry.utils.mergeObject(getDefaults(), options, { inplace: false });
  await saveDefaults(data);
  const result = await generateWeather(data);
  if (data.output === "chat") await postToChat(result, data.rollMode);
  else showResults(result);
  return result;
}

function selected(value, current) {
  return String(value) === String(current) ? "selected" : "";
}

function terrainOptions(climate, current = "") {
  return Object.keys(WTHR[climate]).map(t => `<option value="${t}" ${selected(t, current)}>${t}</option>`).join("");
}

function sectorOptions(current = "none") {
  return Object.entries(SECTORS).map(([id, s]) => `<option value="${id}" ${selected(id, current)}>${s.label}</option>`).join("");
}

function openWeatherDialog() {
  const saved = getDefaults();
  const climates = Object.keys(WTHR);
  const climate = WTHR[saved.climate] ? saved.climate : climates[0];
  const terrain = WTHR[climate]?.[saved.terrain] ? saved.terrain : Object.keys(WTHR[climate])[0];

  new Dialog({
    title: "Savage Planet Weather Engine",
    content: `<form class="spw-form">
      <div class="form-group"><label>Mode</label><select id="spw-mode"><option value="classic" ${selected("classic", saved.mode)}>Classic d30 Weather</option><option value="savage" ${selected("savage", saved.mode)}>Savage Planet Weather</option></select></div>
      <div class="form-group"><label>Sector</label><select id="spw-sector">${sectorOptions(saved.sector)}</select></div>
      <div class="form-group"><label>Savage Frequency</label><select id="spw-frequency"><option value="low" ${selected("low", saved.savageFrequency)}>Low</option><option value="normal" ${selected("normal", saved.savageFrequency)}>Normal</option><option value="high" ${selected("high", saved.savageFrequency)}>High</option><option value="extreme" ${selected("extreme", saved.savageFrequency)}>Extreme</option></select></div>
      <hr>
      <div class="form-group"><label>Climate</label><select id="spw-climate">${climates.map(c => `<option value="${c}" ${selected(c, climate)}>${c}</option>`).join("")}</select></div>
      <div class="form-group"><label>Terrain</label><select id="spw-terrain">${terrainOptions(climate, terrain)}</select></div>
      <div class="form-group"><label>Month</label><select id="spw-month">${Array.from({length:12}, (_,i) => `<option value="${i+1}" ${selected(i+1, saved.month)}>${i+1}</option>`).join("")}</select></div>
      <div class="form-group"><label>Temperature Method</label><select id="spw-temp"><option value="simple" ${selected("simple", saved.tempMethod)}>Simple</option><option value="advanced" ${selected("advanced", saved.tempMethod)}>Advanced</option></select></div>
      <div class="form-group"><label>Mean Temp Variation</label><select id="spw-variation"><option value="none" ${selected("none", saved.variation)}>None</option><option value="d3" ${selected("d3", saved.variation)}>d3: -5 / 0 / +5</option><option value="d5" ${selected("d5", saved.variation)}>d5: -10 / -5 / 0 / +5 / +10</option></select></div>
      <hr>
      <div class="form-group"><label>Output</label><select id="spw-output"><option value="dialog" ${selected("dialog", saved.output)}>Dialog Box</option><option value="chat" ${selected("chat", saved.output)}>Chat</option></select></div>
      <div class="form-group"><label>Roll Visibility</label><select id="spw-roll"><option value="publicroll" ${selected("publicroll", saved.rollMode)}>Public Roll</option><option value="gmroll" ${selected("gmroll", saved.rollMode)}>Private GM Roll</option><option value="blindroll" ${selected("blindroll", saved.rollMode)}>Blind GM Roll</option><option value="selfroll" ${selected("selfroll", saved.rollMode)}>Self Roll</option></select></div>
      <div class="form-group"><label>GURPS Damage Effects</label><input id="spw-gurps" type="checkbox" ${saved.showGurps ? "checked" : ""}></div>
    </form>`,
    buttons: {
      roll: {
        label: "Create Weather Event",
        callback: async html => rollWeather({
          mode: html.find("#spw-mode").val(),
          sector: html.find("#spw-sector").val(),
          savageFrequency: html.find("#spw-frequency").val(),
          climate: html.find("#spw-climate").val(),
          terrain: html.find("#spw-terrain").val(),
          month: Number(html.find("#spw-month").val()),
          tempMethod: html.find("#spw-temp").val(),
          variation: html.find("#spw-variation").val(),
          output: html.find("#spw-output").val(),
          rollMode: html.find("#spw-roll").val(),
          showGurps: html.find("#spw-gurps").is(":checked")
        })
      }
    },
    render: html => {
      html.find("#spw-climate").on("change", ev => {
        const c = ev.target.value;
        html.find("#spw-terrain").html(terrainOptions(c, Object.keys(WTHR[c])[0]));
      });
      const refresh = () => {
        const savage = html.find("#spw-mode").val() === "savage";
        html.find("#spw-sector, #spw-frequency").prop("disabled", !savage);
      };
      html.find("#spw-mode").on("change", refresh);
      refresh();
    },
    default: "roll"
  }, { width: 540 }).render(true);
}
