# Changelog

All notable changes to the Savage Planet Weather Engine are recorded here.

The project uses semantic versioning while following an iterative development lifecycle.

## [Unreleased]

### Planned

- Complete stabilization testing for the native ApplicationV2 workflow.
- Replace legacy HTML-string reports with a dedicated report template.
- Add visible current-weather and history panels.
- Continue modularization of WTHR, PREC, SCN, SCS, tornado, Savage Planet, and GURPS logic.

## [0.1.5] - 2026-08-03

### Added

- Runtime diagnostic API: `game.savageWeather.diagnostics()`.
- Repeatable smoke and regression test plan in `docs/TESTING.md`.
- Formal changelog and release-gate documentation.

### Changed

- Stabilization work is now governed by documented release criteria.

### Known Issues

- The native ApplicationV2 interface requires field testing in Foundry V14.
- The legacy weather engine still constructs result HTML directly.
- Automated unit tests have not yet replaced manual engine regression tests.

## [0.1.4] - 2026-08-03

### Added

- Persistent current weather stored on each Scene.
- Per-Scene weather history.
- Weather state API.

## [0.1.3] - 2026-08-03

### Added

- Native Foundry ApplicationV2 weather interface.
- Handlebars weather application template.

## [0.1.2] - 2026-08-03

### Added

- Persistent Scene weather profiles.
- Scene profile API and Scene-based generation.

## [0.1.1] - 2026-08-03

### Changed

- Added the Foundry scene-control launcher.
- Removed the conflicting Ctrl+Shift+W browser shortcut.

## [0.1.0] - 2026-08-03

### Added

- Initial installable Foundry module.
- WTHR, PREC, SCN, and SCS weather generation.
- Multi-cell storms and supercells.
- Original Fujita F0-F5 tornado results.
- Dialog and chat output.
- Public, private GM, blind GM, and self visibility modes.
- Optional GURPS effects.
- Initial Savage Planet weather phenomena.
