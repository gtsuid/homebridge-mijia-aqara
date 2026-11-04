# homebridge-mijia-aqara

Homebridge plugin for Xiaomi Mijia and Aqara devices, based on [YinHangCode](https://github.com/YinHangCode)'s [original plugin](https://github.com/YinHangCode/homebridge-mi-aqara) and updated for Homebridge 2 compatibility.

## Supported Devices
||Device Name|Protocol Model Value|
|:-:|:-|:-|
|1|Gateway|gateway<br>gateway.v3|
|2|ContactSensor|magnet<br>sensor_magnet|
|3|MotionSensor|motion|
|4|Button|switch<br>sensor_switch|
|5|TemperatureAndHumiditySensor|sensor_ht|
|6|SingleSwitch|ctrl_neutral1|
|7|DuplexSwitch|ctrl_neutral2|
|8|SingleSwitchLN|ctrl_ln1<br>ctrl_ln1.aq1|
|9|DuplexSwitchLN|ctrl_ln2<br>ctrl_ln2.aq1|
|10|SingleButton86|86sw1<br>sensor_86sw1.aq1<br>sensor_86sw1|
|11|DuplexButton86|86sw2<br>sensor_86sw2.aq1<br>sensor_86sw2|
|12|PlugBase|plug|
|13|PlugBase86|86plug<br>ctrl_86plug<br>ctrl_86plug.aq1|
|14|MagicSquare|cube<br>sensor_cube<br>sensor_cube.aqgl01|
|15|SmokeDetector|smoke<br>sensor_smoke|
|16|NatgasDetector|natgas<br>sensor_natgas|
|17|ElectricCurtain|curtain|
|18|ContactSensor2|sensor_magnet.aq2|
|19|MotionSensor2|sensor_motion.aq2|
|20|Button2|sensor_switch.aq2<br>remote.b1acn01|
|21|TemperatureAndHumiditySensor2|weather.v1<br>weather|
|22|WaterDetector|sensor_wleak.aq1|
|23|Lock|lock.aq1|
|24|AcPartner|acpartner.v3|
|25|Button3|sensor_switch.aq3|
|26|DuplexButton862|remote.b286acn01|
|27|VibrationSensor|vibration|
|28|ElectricCurtainBattery|curtain.hagl04|

## Newer Aqara wall switches

Single- and double-rocker switches below are recognized when a compatible gateway exposes them through this plugin's legacy LAN API. Both `switch.*` and full `lumi.switch.*` model identifiers are accepted, along with gateway spellings such as `switch_b2lacn02`. The original gateway model spelling is preserved in write commands.

| Family | No neutral, single / double | With neutral, single / double |
|:-|:-|:-|
| D1 | `switch.b1lacn02` / `switch.b2lacn02` | `switch.b1nacn02` / `switch.b2nacn02` |
| T1 | `switch.b1lacn01` / `switch.b2lacn01` | — |
| H1 China | `switch.l1acn1` / `switch.l2acn1` | — |
| H1 EU | `switch.l1aeu1` / `switch.l2aeu1` | — / `switch.n2aeu1` |
| E1 | `switch.b1lc04` / `switch.b2lc04` | `switch.b1nc01` / `switch.b2nc01` |

Model identities are listed in [Aqara's device documentation](https://opendoc.aqara.com/en/docs/SDKDevelopment/IOSDevelopmentGuide/Equipmentdistributionnetwork/DistributionNetworkSDKSupportedDeviceList.html); channel mappings are based on the [AqaraGateway device definitions](https://github.com/niceboygithub/AqaraGateway/blob/master/custom_components/aqara_gateway/core/utils.py). Three-rocker switches, Matter transport, and other unlisted models are not covered by these mappings.

### Configuration for a D1 double switch without neutral

`LN` means **live + neutral**. Use `DuplexSwitch_Switch_Left` and `DuplexSwitch_Switch_Right` for a no-neutral D1, rather than the `DuplexSwitchLN_*` keys. Add the following under the platform's `defaultValue`, replacing the example SID with the gateway-reported switch SID:

```json
"158d0000000001": {
    "DuplexSwitch_Switch_Left": {
        "name": "D1 left",
        "serviceType": "Lightbulb"
    },
    "DuplexSwitch_Switch_Right": {
        "name": "D1 right",
        "serviceType": "Lightbulb"
    }
}
```

For a single-rocker no-neutral model use `SingleSwitch_Switch`. With-neutral variants use `SingleSwitchLN_Switch` or `DuplexSwitchLN_Switch_Left` / `DuplexSwitchLN_Switch_Right`. Existing accessory keys and UUIDs are preserved.

Install this updated plugin in the Homebridge environment and restart Homebridge to discover the switches. Configuration customizes discovered accessories; it does not manually add devices. No configuration entry is required for discovery.

Pairing in Xiaomi Home alone is insufficient: the gateway must return the switch in `get_id_list_ack` / `discovery_rsp`, respond to reads, and expose `channel_0` / `channel_1` on/off values through the LAN API. New gateway APIs (including MIoT) are not implemented by this change. Protocol 1 `data` and protocol 2 `params` state reports accept `on`/`off`, booleans, and numeric `1`/`0`; writes use the existing LAN on/off format.

If a switch still does not appear, enable Homebridge debug logging, restart, and inspect `read_ack` / `read_rsp` messages for its SID. An exposed but unrecognized model now produces an `Unsupported device model` warning. If the gateway never exposes the device, a parser mapping cannot make it discoverable.

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
