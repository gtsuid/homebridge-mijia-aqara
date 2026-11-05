# Changelog

All notable changes to `homebridge-mijia-aqara` are documented here.

## [1.0.3] - 2026-11-04

- Add support for additional Aqara wireless wall buttons and US/EU Zigbee smart plugs.
- Add support for the Aqara dual relay module and D1 triple switches, with and without neutral.
- Add on/off, brightness, and white colour-temperature control for the Aqara dimmable white bulb.
- Allow a device model to be configured by SID when a gateway omits it, including affected dual relay modules.

## [1.0.2] - 2026-11-04

- Fix Aqara D1 switches not appearing in Homebridge or Apple Home when the gateway reports a model ID such as `switch_b2lacn02`.

## [1.0.1] - 2026-11-04

- Add support for selected Aqara D1, E1, H1, and T1 single- and double-rocker wall switches through compatible gateways.
- Fix control commands for single and double switches without neutral on older gateways.
- Improve device recognition and switch state updates across gateway firmware variants.
- Show a warning in the Homebridge log when a discovered device is unsupported.

## [1.0.0] - 2026-10-25

- Add compatibility with Homebridge 2, including fixes for lightbulbs, battery sensors, and door locks.
- Require Node.js 22.12.0 or later in the 22.x release line, Node.js 24.x, or Node.js 26.x.
