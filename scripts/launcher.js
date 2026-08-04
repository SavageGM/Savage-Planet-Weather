const MODULE_ID = "savage-planet-weather";

function openWeather() {
  if (game.savageWeather?.open) {
    game.savageWeather.open();
    return;
  }

  ui.notifications.error("Savage Planet Weather Engine is not ready. Reload the world and try again.");
}

Hooks.once("init", () => {
  game.keybindings.register(MODULE_ID, "openWeather", {
    name: "Open Savage Planet Weather",
    hint: "Open the Savage Planet Weather Engine generator window.",
    editable: [
      {
        key: "KeyW",
        modifiers: ["CONTROL", "SHIFT"]
      }
    ],
    restricted: true,
    onDown: () => {
      openWeather();
      return true;
    },
    precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
  });
});

Hooks.on("getSceneControlButtons", controls => {
  if (!game.user?.isGM || Array.isArray(controls)) return;

  const tool = {
    name: "savage-weather",
    title: "Savage Planet Weather",
    icon: "fas fa-cloud-bolt",
    visible: true,
    button: true,
    onClick: openWeather
  };

  const groups = Object.values(controls ?? {});
  const tokenControls = controls.tokens
    ?? controls.token
    ?? groups.find(control => ["tokens", "token"].includes(control?.name));

  if (!tokenControls) return;

  if (Array.isArray(tokenControls.tools)) {
    if (!tokenControls.tools.some(existing => existing.name === tool.name)) {
      tokenControls.tools.push(tool);
    }
    return;
  }

  tokenControls.tools ??= {};
  tokenControls.tools[tool.name] = tool;
});

Hooks.once("ready", () => {
  if (!game.user?.isGM) return;

  console.log("Savage Planet Weather Engine | Launcher ready. Use Ctrl+Shift+W or game.savageWeather.open().");
});
