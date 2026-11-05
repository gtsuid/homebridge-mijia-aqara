const AccessoryParser = require('../parser/AccessoryParser');

module.exports = function wirelessButton(channel) {
    return class extends AccessoryParser {
        getAccessoryCategory() { return this.Categories.PROGRAMMABLE_SWITCH; }
        getAccessoryInformation(sid) {
            return { Manufacturer: 'Aqara', Model: 'Wireless Wall Button', SerialNumber: sid };
        }
        getServices(message, name) {
            const service = new this.Service.StatelessProgrammableSwitch(name);
            service.getCharacteristic(this.Characteristic.ProgrammableSwitchEvent).setProps({ validValues: [0, 1, 2] });
            return [service, new this.Service.BatteryService(name)];
        }
        parserAccessories(message) {
            const accessory = this.platform.AccessoryUtil.getByUUID(this.getAccessoryUUID(message.sid));
            if (!accessory) return;
            const protocol = this.platform.getProtoVersionPrefixByProtoVersion(this.platform.getDeviceProtoVersionBySid(message.sid));
            const key = channel === 'both' ? 'dual_channel' : `${protocol == 1 ? 'channel' : 'button'}_${channel}`;
            const event = this.getValueFrJsonObjData(message, key);
            const events = {
                click: this.Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS,
                both_click: this.Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS,
                double_click: this.Characteristic.ProgrammableSwitchEvent.DOUBLE_PRESS,
                both_double_click: this.Characteristic.ProgrammableSwitchEvent.DOUBLE_PRESS,
                long_click_release: this.Characteristic.ProgrammableSwitchEvent.LONG_PRESS,
                long_click: this.Characteristic.ProgrammableSwitchEvent.LONG_PRESS
            };
            if (Object.prototype.hasOwnProperty.call(events, event)) {
                accessory.getService(this.Service.StatelessProgrammableSwitch)
                    .getCharacteristic(this.Characteristic.ProgrammableSwitchEvent).updateValue(events[event]);
            }
            this.parserBatteryService(accessory, message);
        }
    };
};
