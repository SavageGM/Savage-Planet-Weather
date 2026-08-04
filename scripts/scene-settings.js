const MODULE_ID = "savage-planet-weather";
const FLAG_KEY = "sceneProfile";

const DEFAULT_PROFILE = {
  sector: "none",
  climate: "temperate",
  terrain: "plains",
  month: 6,
  elevation: 0,
  latitude: 32,
  useSceneProfile: true
};

function activeScene() {
  return canvas?.scene ?? game.scenes?.active ?? null;
}

function getSceneProfile(scene = activeScene()) {
  if (!scene) return foundry.utils.deepClone(DEFAULT_PROFILE);
  const stored = scene.getFlag(MODULE_ID, FLAG_KEY) ?? {};
  return foundry.utils.mergeObject(foundry.utils.deepClone(DEFAULT_PROFILE), stored, { inplace: false });
}

async function setSceneProfile(profile, scene = activeScene()) {
  if (!scene) throw new Error("No active scene is available.");

  const clean = {
    sector: String(profile.sector ?? DEFAULT_PROFILE.sector),
    climate: String(profile.climate ?? DEFAULT_PROFILE.climate),
    terrain: String(profile.terrain ?? DEFAULT_PROFILE.terrain),
    month: Math.min(12, Math.max(1, Number(profile.month ?? DEFAULT_PROFILE.month))),
    elevation: Number(profile.elevation ?? 0),
    latitude: Number(profile.latitude ?? DEFAULT_PROFILE.latitude),
    useSceneProfile: Boolean(profile.useSceneProfile)
  };

  await scene.setFlag(MODULE_ID, FLAG_KEY, clean);
  return clean;
}

function option(value, label, current) {
  return `<option value="${value}" ${String(value) === String(current) ? "selected" : ""}>${label}</option>`;
}

function monthOptions(current) {
  const names = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return names.map((name, index) => option(index + 1, name, current)).join("");
}

function openSceneProfileDialog(scene = activeScene()) {
  if (!game.user?.isGM) {
    ui.notifications.warn("Only a GM can edit Savage Planet weather scene settings.");
    return;
  }

  if (!scene) {
    ui.notifications.warn("Open a scene before editing its weather profile.");
    return;
  }

  const profile = getSceneProfile(scene);

  new Dialog({
    title: `Weather Profile: ${scene.name}`,
    content: `
      <form class="spw-form spw-scene-profile">
        <div class="form-group">
          <label>Use Scene Profile</label>
          <input id="spw-scene-use" type="checkbox" ${profile.useSceneProfile ? "checked" : ""}>
        </div>

        <div class="form-group">
          <label>Sector</label>
          <select id="spw-scene-sector">
            ${option("none", "None / Generic", profile.sector)}
            ${option("loneStar", "Lone Star Sector", profile.sector)}
            ${option("heartlandWastes", "Heartland Wastes", profile.sector)}
            ${option("gulfCoast", "Gulf Coast", profile.sector)}
            ${option("greatLakes", "Great Lakes Sector", profile.sector)}
            ${option("wasteland", "General Wasteland", profile.sector)}
          </select>
        </div>

        <div class="form-group">
          <label>Climate</label>
          <select id="spw-scene-climate">
            ${option("tropical", "Tropical", profile.climate)}
            ${option("subtropical", "Subtropical", profile.climate)}
            ${option("temperate", "Temperate", profile.climate)}
            ${option("subarctic", "Subarctic", profile.climate)}
            ${option("arctic", "Arctic", profile.climate)}
          </select>
        </div>

        <div class="form-group">
          <label>Terrain</label>
          <select id="spw-scene-terrain">
            ${option("hills", "Hills", profile.terrain)}
            ${option("mountains", "Mountains", profile.terrain)}
            ${option("forest", "Forest", profile.terrain)}
            ${option("plains", "Plains", profile.terrain)}
            ${option("swamp", "Swamp", profile.terrain)}
            ${option("desert", "Desert", profile.terrain)}
            ${option("coast", "Coast", profile.terrain)}
          </select>
        </div>

        <div class="form-group">
          <label>Month</label>
          <select id="spw-scene-month">${monthOptions(profile.month)}</select>
        </div>

        <div class="form-group">
          <label>Elevation (ft)</label>
          <input id="spw-scene-elevation" type="number" step="1" value="${profile.elevation}">
        </div>

        <div class="form-group">
          <label>Latitude</label>
          <input id="spw-scene-latitude" type="number" step="0.1" min="-90" max="90" value="${profile.latitude}">
        </div>
      </form>
    `,
    buttons: {
      save: {
        label: "Save Scene Profile",
        callback: async html => {
          await setSceneProfile({
            useSceneProfile: html.find("#spw-scene-use").is(":checked"),
            sector: html.find("#spw-scene-sector").val(),
            climate: html.find("#spw-scene-climate").val(),
            terrain: html.find("#spw-scene-terrain").val(),
            month: Number(html.find("#spw-scene-month").val()),
            elevation: Number(html.find("#spw-scene-elevation").val()),
            latitude: Number(html.find("#spw-scene-latitude").val())
          }, scene);
          ui.notifications.info(`Saved weather profile for ${scene.name}.`);
        }
      }
    },
    default: "save"
  }, { width: 520 }).render(true);
}

async function rollFromScene(scene = activeScene(), overrides = {}) {
  if (!game.savageWeather?.roll) {
    ui.notifications.error("Savage Planet Weather Engine is not ready.");
    return null;
  }

  const profile = getSceneProfile(scene);
  const options = foundry.utils.mergeObject({
    sector: profile.sector,
    climate: profile.climate,
    terrain: profile.terrain,
    month: profile.month,
    mode: profile.sector === "none" ? "classic" : "savage"
  }, overrides, { inplace: false });

  return game.savageWeather.roll(options);
}

Hooks.once("ready", () => {
  game.savageWeatherScene = {
    defaults: foundry.utils.deepClone(DEFAULT_PROFILE),
    get: getSceneProfile,
    set: setSceneProfile,
    configure: openSceneProfileDialog,
    roll: rollFromScene
  };

  if (game.savageWeather) {
    game.savageWeather.scene = game.savageWeatherScene;
  }

  console.log("Savage Planet Weather Engine | Scene profile API ready.");
});
