const DeviceParser = require('./DeviceParser');
const LanAccessoryParser = require('../lib/LanAccessoryParser');

class AqaraLightBulbParser extends DeviceParser {
    getAccessoriesParserInfo() { return { AqaraLightBulb_Lightbulb: AqaraLightBulbAccessoryParser }; }
}
AqaraLightBulbParser.modelName = ['light.aqcn02'];
module.exports = AqaraLightBulbParser;

class AqaraLightBulbAccessoryParser extends LanAccessoryParser {
    get modelLabel() { return 'Dimmable White Bulb'; }
    serviceName() { return 'Lightbulb'; }
    characteristics() {
        return [{
            name: 'On',
            read: message => LanAccessoryParser.boolean(this.readField(message, 'On', ['power_status', 'status'])),
            write: (sid, value) => ({ [this.fieldFor(sid, 'On', 'power_status')]: value ? 'on' : 'off' })
        }, {
            name: 'Brightness',
            props: { minValue: 0, maxValue: 100, minStep: 1 },
            read: message => LanAccessoryParser.number(this.readField(message, 'Brightness', ['light_level', 'brightness']), 0, 100),
            write: (sid, value) => ({ [this.fieldFor(sid, 'Brightness', 'light_level')]: this.validNumber(value, 0, 100) })
        }, {
            name: 'ColorTemperature',
            // Aqara ZNLDP12LM: 2700–6500 K, represented by mireds in Lumi.
            props: { minValue: 153, maxValue: 370, minStep: 1 },
            read: message => LanAccessoryParser.number(this.readField(message, 'ColorTemperature', ['colour_temperature', 'color_temperature']), 153, 370),
            write: (sid, value) => ({ [this.fieldFor(sid, 'ColorTemperature', 'colour_temperature')]: this.validNumber(value, 153, 370) })
        }];
    }
    validNumber(value, min, max) {
        const number = LanAccessoryParser.number(value, min, max);
        if (number == null) throw new Error(`Value must be between ${min} and ${max}`);
        return Math.round(number);
    }
}
