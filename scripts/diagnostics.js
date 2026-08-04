const MODULE_ID = "savage-planet-weather";

function result(name, passed, detail = "") {
  return { name, passed: Boolean(passed), detail };
}

function activeScene() {
  return canvas?.scene ?? game.scenes?.active ?? null;
}

async function runDiagnostics({ notify = true } = {}) {
  const module = game.modules.get(MODULE_ID);
  const scene = activeScene();
  const checks = [];

  checks.push(result(
    "Module active",
    module?.active,
    module ? `Version ${module.version ?? module.metadata?.version ?? "unknown"}` : "Module record not found"
  ));

  checks.push(result(
    "Core API registered",
    Boolean(game.savageWeather?.open && game.savageWeather?.roll && game.savageWeather?.current),
    game.savageWeather ? Object.keys(game.savageWeather).sort().join(", ") : "game.savageWeather is missing"
  ));

  checks.push(result(
    "Application interface registered",
    Boolean(game.savageWeatherApp?.open),
    game.savageWeatherApp?.open ? "ApplicationV2 launcher available" : "game.savageWeatherApp.open is missing"
  ));

  checks.push(result(
    "Scene profile API registered",
    Boolean(game.savageWeatherScene?.get && game.savageWeatherScene?.set && game.savageWeatherScene?.roll),
    game.savageWeatherScene ? "Scene profile API available" : "game.savageWeatherScene is missing"
  ));

  checks.push(result(
    "Weather state API registered",
    Boolean(game.savageWeather?.state?.getCurrent && game.savageWeather?.state?.getHistory),
    game.savageWeather?.state ? "Persistent scene weather API available" : "game.savageWeather.state is missing"
  ));

  checks.push(result(
    "Active scene available",
    Boolean(scene),
    scene ? `${scene.name} (${scene.id})` : "Open or activate a Scene to test scene persistence"
  ));

  if (scene && game.savageWeatherScene?.get) {
    try {
      const profile = game.savageWeatherScene.get(scene);
      checks.push(result(
        "Scene profile readable",
        Boolean(profile?.climate && profile?.terrain && profile?.month),
        profile ? `${profile.climate}/${profile.terrain}, month ${profile.month}` : "No profile returned"
      ));
    } catch (error) {
      checks.push(result("Scene profile readable", false, error.message));
    }
  }

  if (scene && game.savageWeather?.state?.getHistory) {
    try {
      const history = await game.savageWeather.state.getHistory(scene);
      checks.push(result(
        "Scene history readable",
        Array.isArray(history),
        Array.isArray(history) ? `${history.length} entr${history.length === 1 ? "y" : "ies"}` : "History did not return an array"
      ));
    } catch (error) {
      checks.push(result("Scene history readable", false, error.message));
    }
  }

  const passed = checks.filter(check => check.passed).length;
  const report = {
    moduleId: MODULE_ID,
    version: module?.version ?? module?.metadata?.version ?? "unknown",
    foundryVersion: game.version,
    systemId: game.system?.id ?? "unknown",
    sceneId: scene?.id ?? null,
    passed,
    failed: checks.length - passed,
    checks,
    timestamp: new Date().toISOString()
  };

  console.group(`Savage Planet Weather diagnostics: ${passed}/${checks.length} passed`);
  console.table(checks);
  console.log(report);
  console.groupEnd();

  if (notify) {
    const message = report.failed
      ? `Weather diagnostics completed: ${passed}/${checks.length} passed. Check the console for details.`
      : `Weather diagnostics passed: ${passed}/${checks.length}.`;
    report.failed ? ui.notifications.warn(message) : ui.notifications.info(message);
  }

  return report;
}

Hooks.once("ready", () => {
  game.savageWeatherDiagnostics = { run: runDiagnostics };

  if (game.savageWeather) {
    game.savageWeather.diagnostics = runDiagnostics;
  }

  console.log("Savage Planet Weather Engine | Diagnostics ready. Use game.savageWeather.diagnostics().");
});
