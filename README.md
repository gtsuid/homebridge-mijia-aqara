# homebridge-mijia-aqara

[![npm version](https://img.shields.io/npm/v/homebridge-mijia-aqara)](https://www.npmjs.com/package/homebridge-mijia-aqara)

Homebridge plugin for (old) Xiaomi Mijia and Aqara devices.

## Background

Around 2019, I bought the cheaper Mijia Gateway (DGNWG02LM), only to discover that it didn't support HomeKit out of the box. [YinHangCode](https://github.com/YinHangCode)'s [homebridge-mi-aqara](https://github.com/YinHangCode/homebridge-mi-aqara) plugin bridged that gap, and I've used it ever since.

The original plugin appears to be unmaintained, with its last update in 2023. When newer Homebridge versions broke my gateway and its connected accessories, I forked the plugin to restore compatibility and add support for a few more accessories. Newer alternatives may exist, but I wanted to keep my existing setup working.

**Compatibility note:** This fork is tested only on my limited setup. Other accesories may have issues, including with Homebridge 2. Use it if your setup and needs align with mine; the device list below does not guarantee compatibility with every device.

## Supported Devices
| # | Device | Protocol Model IDs |
|:-:|:-|:-|
|1|Smart Home Hub|gateway<br>gateway.v3|
|2|Door & Window Sensor|magnet<br>sensor_magnet<br>sensor_magnet.aq2|
|3|Motion Sensor|motion<br>sensor_motion.aq2|
|4|Wireless Button|switch<br>sensor_switch<br>sensor_switch.aq2<br>remote.b1acn01<br>sensor_switch.aq3|
|5|Temperature & Humidity Sensor|sensor_ht<br>weather.v1<br>weather|
|6|Single Switch (No Neutral)|ctrl_neutral1<br>switch.b1lacn02<br>switch.b1lacn01<br>switch.l1acn1<br>switch.l1aeu1<br>switch.b1lc04|
|7|Double Switch (No Neutral)|ctrl_neutral2<br>switch.b2lacn02<br>switch.b2lacn01<br>switch.l2acn1<br>switch.l2aeu1<br>switch.b2lc04|
|8|Single Switch (With Neutral)|ctrl_ln1<br>ctrl_ln1.aq1<br>switch.b1nacn02<br>switch.b1nc01|
|9|Double Switch (With Neutral)|ctrl_ln2<br>ctrl_ln2.aq1<br>switch.b2nacn02<br>switch.b2nc01<br>switch.n2aeu1|
|10|Wireless Wall Button (Single Button)|86sw1<br>sensor_86sw1.aq1<br>sensor_86sw1<br>remote.b186acn01<br>remote.b186acn02|
|11|Wireless Wall Button (Double Button)|86sw2<br>sensor_86sw2.aq1<br>sensor_86sw2<br>remote.b286acn01<br>remote.b286acn02|
|12|Smart Plug (Zigbee)|plug<br>plug.maus01<br>plug.mmeu01|
|13|Smart Wall Outlet|86plug<br>ctrl_86plug<br>ctrl_86plug.aq1|
|14|Cube Remote|cube<br>sensor_cube<br>sensor_cube.aqgl01|
|15|Smoke Detector|smoke<br>sensor_smoke|
|16|Natural Gas Leak Detector|natgas<br>sensor_natgas|
|17|Motorized Curtain Controller|curtain|
|18|Water Leak Sensor|sensor_wleak.aq1|
|19|Smart Door Lock|lock.aq1|
|20|Air Conditioner Companion Hub|acpartner.v3|
|21|Vibration Sensor|vibration|
|22|Motorized Curtain Controller (Battery Powered)|curtain.hagl04|
|23|Dual Relay Module|relay.c2acn01|
|24|Triple Switch (No Neutral)|switch.l3acn3|
|25|Triple Switch (With Neutral)|switch.n3acn3|
|26|Dimmable White Bulb|light.aqcn02|

“86” in some model IDs refers to the square wall-switch format (approximately 86 × 86 mm), as shown in the [Aqara wireless wall button manual](https://cdn.cnbj2.fds.api.mi-img.com/cdn/aqara/website/manuals_en/Wireless%20Remote%20Switch%20%28Double%20Rocker%29%20Quick%20Start%20Guide.pdf). Wireless wall buttons are battery-powered remote controls.

The model values above also accept the `lumi.` prefix and gateway spellings such as `switch_b2lacn02` or `relay_c2acn01`. Devices must be exposed by a compatible gateway through its legacy LAN API. The added device mappings have automated protocol checks but still need verification on physical devices and gateway firmware.

## Pre-Requirements
1. Gateway v1 (DGNWG01LM) has limited space so can't support this feature. Make sure you have:
    - Gateway v2 (DGNWG02LM), or
    - acpartner v3.
2. Update gateway firmware to:
    - **1.4.1_155.0143** (gateway v2),
    - **1.4.1_148.019** (acpartner v3), or
    - newer version.
3. Obtain your gateway's LAN key. I retrieved mine years ago, but that method appears to no longer work, and I haven't verified a current alternative. Search online for an up-to-date method for your gateway model and firmware.

## Installation

1. Install [Homebridge](https://homebridge.io/install/) 2.x with Node.js 22.12.0 or later in the 22.x release line, Node.js 24.x, or Node.js 26.x.
2. Open the Homebridge UI, go to **Plugins**, search for `homebridge-mijia-aqara`, and install it.
3. Open **Config** and add this plugin's platform entry to the existing `platforms` array. Use [sampleConfig.json](sampleConfig.json) as a reference, set `platform` to `MijiaAqaraPlatform`, and replace the example gateway IDs and keys with your own. Keep your existing bridge settings.
4. Save the configuration and restart Homebridge. Check the logs to confirm the plugin loads and discovers your gateway and devices.

For a manual installation, run this command in the environment where Homebridge is installed, then complete steps 3 and 4 above:

```bash
npm install -g homebridge-mijia-aqara
```

## Configuration
||Name|Required|Value Type|Description|Value Example|
|:-:|:-|:-|:-|:-|:-|
|1|platform|True|String||It must be 'MijiaAqaraPlatform'|
|2|gateways|True|Object|set gateway information.|{ "6409802da3b3": "02i44k56zrgg578b" }|
|3|bindAddress|False|String|specified network.|"10.0.1.1"|
|4|sendWhoisCmdInterval|False|Integer|set send whois cmd interval.|3600000|
|5|autoRemoveAccessoryInterval|False|Integer|set auto remove accessory interval.|3600000|
|6|defaultValue|False|Object|set device default value.||
|7|mqtt|False|Object|open mqtt and mqtt configs.|{ "username": "mqtt", "password": "107927710" }|
|8|deviceModels|False|Object|Set a model by device SID when the gateway reports an empty or missing model.|{ "158d0000000001": "relay.c2acn01" }|

For more information about config, Please refer to file ``sampleConfig.json``.

### Additional accessory configuration

Existing configuration keys remain unchanged. The additional models use the following keys under `defaultValue`, grouped by device SID:

| Device | Accessory configuration keys | Features |
|:-|:-|:-|
| Additional single wall buttons (`remote.b186acn01`, `remote.b186acn02`) | `SingleButton86_StatelessProgrammableSwitch` | Single press, double press, long press, and battery reports when supplied by the gateway |
| Additional double wall button (`remote.b286acn02`) | `DuplexButton862_StatelessProgrammableSwitch_Left`, `_Right`, `_Both` | Separate left, right, and simultaneous-button events; battery reports |
| Dual relay module | `DualRelay_Switch_Channel1`, `DualRelay_Switch_Channel2` | Independent on/off control; optional `serviceType: "Lightbulb"` |
| Triple switch (No Neutral) | `TripleSwitch_Switch_Left`, `_Center`, `_Right` | Independent on/off control; optional `serviceType: "Lightbulb"` |
| Triple switch (With Neutral) | `TripleSwitchWithNeutral_Switch_Left`, `_Center`, `_Right` | Independent on/off control; optional `serviceType: "Lightbulb"` |
| Regional Zigbee plugs | `PlugBase_Outlet` | On/off and outlet-in-use state from load or usage reports; no energy-history service |
| Dimmable white bulb | `AqaraLightBulb_Lightbulb` | On/off, brightness, and white colour temperature |

Where a row abbreviates a key with `_Right`, `_Center`, or `_Both`, replace the final suffix of the first key. Each key accepts the existing `name` and `disable` settings. Controllable accessories also accept `syncValue`, `ignoreWriteResult`, and `disableNoResponse`.

Additional wall buttons reuse the existing single/double wall-button keys and virtual-press switches from `sampleConfig.json`, preserving accessory identities when equivalent model IDs change. The new button models also accept double-press and long-press reports when the gateway supplies them.

Some gateways return an empty model for the dual relay. In that case, add `"deviceModels": { "YOUR_RELAY_SID": "relay.c2acn01" }` to the platform configuration. This fills only empty or missing model IDs; explicit gateway-reported models are kept. It does not add a device that is absent from the gateway's discovery list.

The new relay and triple-switch parsers accept `channel_0` / `neutral_0` style reports (and corresponding channel 1 and 2 fields), keeping each channel separate. The bulb uses brightness from 0–100 and colour temperature from 153–370 mireds (approximately 6500–2700 K). Wi-Fi plugs and newer gateway protocols are not covered by these additions.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release notes and version history.
