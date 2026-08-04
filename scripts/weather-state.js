const MODULE_ID = "savage-planet-weather";
const CURRENT_FLAG = "currentWeather";
const HISTORY_FLAG = "weatherHistory";
const MAX_HISTORY = 50;

function sceneOrActive(scene = null) {
  return scene ?? canvas?.scene ?? game.scenes?.active ?? null;
}

export function getCurrentWeather(scene = null) {
  const target = sceneOrActive(scene);
  return target?.getFlag(MODULE_ID, CURRENT_FLAG) ?? null;
}

export function getWeatherHistory(scene = null) {
  const target = sceneOrActive(scene);
  return target?.getFlag(MODULE_ID, HISTORY_FLAG) ?? [];
}

export async function saveWeather(weather, scene = null) {
  const target = sceneOrActive(scene);
  if (!target) return weather;

  const now = new Date().toISOString();
  const record = {
    ...foundry.utils.deepClone(weather),
    sceneId: target.id,
    sceneName: target.name,
    savedAt: now
  };

  const history = getWeatherHistory(target);
  history.unshift(record);
  history.splice(MAX_HISTORY);

  await target.setFlag(MODULE_ID, CURRENT_FLAG, record);
  await target.setFlag(MODULE_ID, HISTORY_FLAG, history);
  Hooks.callAll("savagePlanetWeatherSaved", record, target);
  return record;
}

export async function clearCurrentWeather(scene = null) {
  const target = sceneOrActive(scene);
  if (!target) return;
  await target.unsetFlag(MODULE_ID, CURRENT_FLAG);
  Hooks.callAll("savagePlanetWeatherCleared", target);
}

export async function clearWeatherHistory(scene = null) {
  const target = sceneOrActive(scene);
  if (!target) return;
  await target.setFlag(MODULE_ID, HISTORY_FLAG, []);
}

Hooks.once("ready", () => {
  const originalRoll = game.savageWeather?.roll;
  if (!originalRoll) return;

  game.savageWeather.roll = async options => {
    const result = await originalRoll(options);
    const current = game.savageWeather.current?.();
    if (current) await saveWeather(current);
    return result;
  };

  game.savageWeather.state = {
    getCurrent: getCurrentWeather,
    getHistory: getWeatherHistory,
    save: saveWeather,
    clearCurrent: clearCurrentWeather,
    clearHistory: clearWeatherHistory
  };

  game.savageWeather.history = scene => getWeatherHistory(scene);
  console.log("Savage Planet Weather Engine | Persistent weather state ready.");
});
