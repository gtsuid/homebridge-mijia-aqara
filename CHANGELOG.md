# Changelog

All notable changes to `homebridge-mijia-aqara` are documented here.

## [1.0.2] - 2026-11-04

- Recognize gateway model IDs with an underscore switch prefix, including `switch_b2lacn02`.
- Preserve the reported model spelling in commands and add regression coverage for D1 discovery and both channels.

## [1.0.1] - 2026-11-04

- Recognize selected D1, E1, H1, and T1 single- and double-rocker wall switches.
- Accept full `lumi.` model IDs and boolean or numeric switch state reports.
- Fix malformed protocol 1 write commands for no-neutral switches.
- Warn when a discovered device model has no matching parser.
- Document no-neutral configuration keys and gateway LAN requirements; add 46 regression tests.

## [1.0.0] - 2026-10-25

- Fix `LIGHTBULB` crashes by restoring legacy accessory category access.
- Map removed `BatteryService` to `Battery`.
- Replace `getServiceByUUIDAndSubType()` with `getServiceById()` in the lock parser.
- Remove obsolete `accessory.reachable` usage.
- Update runtime requirements for Homebridge 2 and modern Node.js.
