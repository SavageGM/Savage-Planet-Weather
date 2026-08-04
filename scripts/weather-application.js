const MODULE_ID = "savage-planet-weather";
const TEMPLATE = `modules/${MODULE_ID}/templates/weather-app.hbs`;

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

const TERRAIN_BY_CLIMATE = {
  tropical: ["hills", "mountains", "forest", "plains", "swamp", "desert", "coast"],
  subtropical: ["hills", "mountains", "forest", "plains", "swamp", "desert", "coast"],
  temperate: ["hills", "mountains", "forest", "plains", "swamp", "desert", "coast"],
  subarctic: ["hills", "mountains", "forest", "plains", "swamp", "desert", "coast"],
  arctic: ["hills", "mountains", "plains", "desert", "coast"]
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const LABELS = {
  tropical: "Tropical",
  subtropical: "Subtropical",
  temperate: "Temperate",
  subarctic: "Subarctic",
  arctic: "Arctic",
  hills: "Hills",
  mountains: "Mountains",
  forest: "Forest",
  plains: "Plains",
  swamp: "Swamp",
  desert: "Desert",
  coast: "Coast"
};

const SECTORS = [
  ["none", "None / Generic"],
  ["loneStar", "Lone Star Sector"],
  ["heartlandWastes", "Heartland Wastes"],
  ["gulfCoast", "Gulf Coast"],
  ["greatLakes", "Great Lakes Sector"],
  ["wasteland", "General Wasteland"]
];

const FREQUENCIES = [
  ["low", "Low"],
  ["normal", "Normal"],
  ["high", "High"],
  ["extreme", "Extreme"]
];

const ROLL_MODES = [
  ["publicroll", "Public Roll"],
  ["gmroll", "Private GM Roll"],
  ["blindroll", "Blind GM Roll"],
  ["selfroll", "Self Roll"]
];

function currentDefaults() {
  const fallback = {
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

  try {
    const stored = game.settings.get(MODULE_ID, "defaults") ?? {};
    return foundry.utils.mergeObject(fallback, stored, { inplace: false });
  } catch (error) {
    console.warn(`${MODULE_ID} | Unable to read saved defaults.`, error);
    return fallback;
  }
}

function choices(entries, selected) {
  return entries.map(([value, label]) => ({ value, label, selected: String(value) === String(selected) }));
}

export class SavageWeatherApplication extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "savage-planet-weather-app",
    classes: ["savage-planet-weather", "spw-application"],
    tag: "div",
    window: {
      title: "Savage Planet Weather Engine",
      icon: "fas fa-cloud-bolt",
      resizable: true
    },
    position: {
      width: 680,
      height: "auto"
    },
    actions: {
      generate: this.#generate,
      "configure-scene": this.#configureScene,
      "load-scene": this.#loadScene,
      "roll-scene": this.#rollScene
    }
  };

  static PARTS = {
    main: { template: TEMPLATE }
  };

  constructor(options = {}) {
    super(options);
    this.state = currentDefaults();
  }

  async _prepareContext(options) {
    const state = this.state;
    const validTerrains = TERRAIN_BY_CLIMATE[state.climate] ?? TERRAIN_BY_CLIMATE.temperate;
    if (!validTerrains.includes(state.terrain)) state.terrain = validTerrains[0];

    return {
      ...state,
      sceneName: canvas?.scene?.name ?? "No Active Scene",
      isClassic: state.mode === "classic",
      isSavage: state.mode === "savage",
      climates: choices(Object.keys(TERRAIN_BY_CLIMATE).map(value => [value, LABELS[value]]), state.climate),
      terrains: choices(validTerrains.map(value => [value, LABELS[value]]), state.terrain),
      months: choices(MONTHS.map((label, index) => [index + 1, label]), state.month),
      sectors: choices(SECTORS, state.sector),
      frequencies: choices(FREQUENCIES, state.savageFrequency),
      rollModes: choices(ROLL_MODES, state.rollMode),
      simpleTemp: state.tempMethod === "simple",
      advancedTemp: state.tempMethod === "advanced",
      noVariation: state.variation === "none",
      d3Variation: state.variation === "d3",
      d5Variation: state.variation === "d5",
      dialogOutput: state.output === "dialog",
      chatOutput: state.output === "chat"
    };
  }

  _onRender(context, options) {
    super._onRender(context, options);

    const root = this.element;
    root.querySelectorAll("[data-spw-tab]").forEach(button => {
      button.addEventListener("click", () => this.#activateTab(button.dataset.spwTab));
    });

    root.querySelectorAll("select, input").forEach(control => {
      control.addEventListener("change", () => this.#captureForm());
    });

    root.querySelector("#spw-app-climate")?.addEventListener("change", event => {
      this.state.climate = event.currentTarget.value;
      const valid = TERRAIN_BY_CLIMATE[this.state.climate] ?? [];
      if (!valid.includes(this.state.terrain)) this.state.terrain = valid[0];
      this.render({ force: true });
    });
  }

  #activateTab(tab) {
    this.element.querySelectorAll("[data-spw-tab]").forEach(button => {
      button.classList.toggle("active", button.dataset.spwTab === tab);
    });
    this.element.querySelectorAll("[data-spw-panel]").forEach(panel => {
      panel.classList.toggle("active", panel.dataset.spwPanel === tab);
    });
  }

  #captureForm() {
    const form = this.element.querySelector("form.spw-app");
    if (!form) return this.state;

    const data = Object.fromEntries(new FormData(form).entries());
    this.state = {
      ...this.state,
      ...data,
      month: Number(data.month ?? this.state.month),
      showGurps: form.querySelector("[name='showGurps']")?.checked ?? false
    };
    return this.state;
  }

  static async #generate(event, target) {
    const options = this.#captureForm();
    if (!game.savageWeather?.roll) {
      ui.notifications.error("Savage Planet Weather Engine is not ready.");
      return;
    }
    await game.savageWeather.roll(options);
  }

  static #configureScene(event, target) {
    game.savageWeatherScene?.configure?.();
  }

  static async #loadScene(event, target) {
    const profile = game.savageWeatherScene?.get?.();
    if (!profile) {
      ui.notifications.warn("No active scene weather profile is available.");
      return;
    }

    this.state = {
      ...this.state,
      sector: profile.sector,
      climate: profile.climate,
      terrain: profile.terrain,
      month: profile.month,
      mode: profile.sector === "none" ? "classic" : "savage"
    };
    await this.render({ force: true });
    ui.notifications.info("Loaded values from the active scene profile.");
  }

  static async #rollScene(event, target) {
    if (!game.savageWeatherScene?.roll) {
      ui.notifications.error("Scene weather profiles are not ready.");
      return;
    }
    await game.savageWeatherScene.roll(canvas?.scene, this.#captureForm());
  }
}

let weatherApplication = null;

export function openWeatherApplication() {
  weatherApplication ??= new SavageWeatherApplication();
  weatherApplication.render({ force: true });
  return weatherApplication;
}

Hooks.once("ready", () => {
  const legacyOpen = game.savageWeather?.open;

  game.savageWeatherApp = {
    open: openWeatherApplication,
    get instance() {
      return weatherApplication;
    }
  };

  if (game.savageWeather) {
    game.savageWeather.legacyOpen = legacyOpen;
    game.savageWeather.open = openWeatherApplication;
    game.savageWeather.app = game.savageWeatherApp;
  }

  console.log("Savage Planet Weather Engine | ApplicationV2 interface ready.");
});
