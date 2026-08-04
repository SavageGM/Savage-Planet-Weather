# Savage Planet Weather Engine Test Plan

This document defines the repeatable smoke and regression tests required before a development build is treated as releasable.

## Supported Test Environment

- Foundry VTT: version declared in `module.json`
- Primary system: GURPS (`gurps`)
- User role: GM unless a test says otherwise
- Browser console open during testing

## Release Gate

A version is ready for release only when:

1. The manifest installs or updates successfully.
2. Foundry loads the world without a fatal module error.
3. Runtime diagnostics report no failed required checks.
4. The smoke-test cases below pass.
5. Known issues are recorded in `CHANGELOG.md`.

## Smoke Tests

### ST-01 Module Startup

1. Enable the module.
2. Reload the world.
3. Confirm the console reports the weather engine, scene profile, application, state, launcher, and diagnostics as ready.
4. Run:

```js
game.savageWeather.diagnostics()
```

Expected: all required checks pass when a Scene is active.

### ST-02 Open Weather Application

1. Click the Savage Planet Weather scene-control button, or run:

```js
game.savageWeather.open()
```

Expected: the native weather application opens without a red console error.

### ST-03 Application Tabs

Open each tab:

- Weather
- Scene
- Savage Planet
- GURPS

Expected: only the selected panel is visible and no form values are lost while switching tabs.

### ST-04 Basic Weather Generation

Use:

- Classic mode
- Temperate climate
- Plains terrain
- June
- Dialog output

Expected: a weather result is generated and displayed. Internal dice rolls do not create separate chat cards.

### ST-05 Chat Visibility Modes

Generate one result using each mode:

- Public
- Private GM
- Blind GM
- Self

Expected: the resulting chat message follows the selected Foundry visibility mode.

### ST-06 Scene Profile

1. Open the Scene tab.
2. Configure the active Scene profile.
3. Save it.
4. Close and reopen the profile.

Expected: sector, climate, terrain, month, elevation, latitude, and the use-profile toggle persist.

### ST-07 Generate From Scene

1. Save a Scene profile.
2. Click Generate from Scene.

Expected: generated weather uses the saved Scene climate, terrain, month, and sector.

### ST-08 Scene Weather Persistence

1. Generate weather on Scene A.
2. Run:

```js
game.savageWeather.state.getCurrent()
```

3. Switch to Scene B and generate different weather.
4. Return to Scene A.

Expected: each Scene retains its own current weather.

### ST-09 Weather History

Generate at least three events on one Scene and run:

```js
game.savageWeather.history()
```

Expected: history contains the generated events in newest-first or documented order and does not exceed 50 entries.

### ST-10 GURPS Effects

Enable Include GURPS Effects and generate a storm result.

Expected: the output includes relevant visibility, wind, movement, exposure, or hazard guidance without changing the underlying weather roll.

### ST-11 Tornado Suppression

Generate events until a tornado-capable hook is encountered.

Expected:

- No hook chance or tornado roll is displayed when no tornado forms.
- A formed tornado displays the original Fujita F0-F5 scale and associated GURPS effects.

### ST-12 Savage Planet Mode

Use Savage Planet mode with a non-generic sector.

Expected: the normal weather engine still runs, and a sector phenomenon may be layered onto the result according to frequency.

## Regression Checklist

Before each version bump, verify:

- Existing manifest URL still works.
- Existing API methods remain available or are documented as changed.
- Saved world settings still load.
- Existing Scene flags do not throw migration errors.
- Legacy `game.savageWeather.legacyOpen()` remains available until explicitly removed.
- No browser-reserved keyboard shortcut is registered.

## Defect Reporting

Record each defect with:

- Version
- Foundry build
- Game system version
- Exact steps to reproduce
- Expected result
- Actual result
- Console error and stack trace
- Screenshot when useful
