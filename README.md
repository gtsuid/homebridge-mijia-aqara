# homebridge-mijia-aqara

Homebridge plugin for Xiaomi Mijia and Aqara devices, based on [YinHangCode](https://github.com/YinHangCode)'s [original plugin](https://github.com/YinHangCode/homebridge-mi-aqara) and updated for Homebridge 2 compatibility.

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
|10|Wireless Wall Button (Single Button)|86sw1<br>sensor_86sw1.aq1<br>sensor_86sw1|
|11|Wireless Wall Button (Double Button)|86sw2<br>sensor_86sw2.aq1<br>sensor_86sw2<br>remote.b286acn01|
|12|Smart Plug|plug|
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

“86” in some model IDs refers to the square wall-switch format (approximately 86 × 86 mm), as shown in the [Aqara wireless wall button manual](https://cdn.cnbj2.fds.api.mi-img.com/cdn/aqara/website/manuals_en/Wireless%20Remote%20Switch%20%28Double%20Rocker%29%20Quick%20Start%20Guide.pdf). Wireless wall buttons are battery-powered remote controls.

The model values above also accept the `lumi.` prefix and gateway switch spellings such as `switch_b2lacn02`. Devices must be exposed by a compatible gateway through its legacy LAN API.

## Pre-Requirements
1. Make sure your IOS version is IOS11 or later.
2. Make sure you have gateway v2 or acpartner v3. gateway v1 has limited space so can't support this feature.
3. Update gateway firmware to **1.4.1_155.0143** (gateway v2), **1.4.1_148.019** (acpartner v3) or later.

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

For more information about config, Please refer to file ``sampleConfig.json``.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release notes and version history.
