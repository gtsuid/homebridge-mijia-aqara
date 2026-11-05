const DeviceParser = require('./DeviceParser');
const LanAccessoryParser = require('../lib/LanAccessoryParser');

class RegionalPlugParser extends DeviceParser {
    getAccessoriesParserInfo() { return { PlugBase_Outlet: RegionalPlugOutletParser }; }
}
RegionalPlugParser.modelName = ['plug.maus01', 'plug.mmeu01'];
module.exports = RegionalPlugParser;

class RegionalPlugOutletParser extends LanAccessoryParser {
    get modelLabel() { return 'Regional Zigbee Smart Plug'; }
    serviceName() { return 'Outlet'; }
    characteristics() {
        return [{
            name: 'On',
            read: message => LanAccessoryParser.boolean(this.readField(message, 'On', ['status', 'channel_0', 'neutral_0'])),
            write: (sid, value) => {
                const protocol = this.platform.getProtoVersionPrefixByProtoVersion(this.platform.getDeviceProtoVersionBySid(sid));
                return { [this.fieldFor(sid, 'On', protocol == 1 ? 'status' : 'channel_0')]: value ? 'on' : 'off' };
            }
        }, {
            name: 'OutletInUse',
            read: message => {
                const explicit = LanAccessoryParser.boolean(this.readField(message, 'InUse', ['inuse', 'in_use']));
                if (explicit != null) return explicit;
                const power = LanAccessoryParser.number(this.readField(message, 'Power', ['load_power', 'power']), 0, Infinity);
                return power == null ? null : power > 0;
            }
        }];
    }
}
