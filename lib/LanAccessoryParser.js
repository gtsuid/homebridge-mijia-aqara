const AccessoryParser = require('../parser/AccessoryParser');

// Shared only by the new controllable accessories; existing parsers retain
// their accessory keys, UUIDs, state decoding and command formats.
class LanAccessoryParser extends AccessoryParser {
    constructor(platform, accessoryType) {
        super(platform, accessoryType);
        this.reportedFields = new Map();
    }

    getFields(message) {
        const data = typeof message.data === 'string' ? JSON.parse(message.data) : message.data;
        return Object.assign({}, data, ...(Array.isArray(message.params) ? message.params : []));
    }

    readField(message, name, aliases) {
        const fields = this.getFields(message);
        for (const field of aliases) {
            if (Object.prototype.hasOwnProperty.call(fields, field) && fields[field] != null) {
                this.reportedFields.set(`${message.sid}:${name}`, field);
                return fields[field];
            }
        }
        return null;
    }

    fieldFor(sid, name, fallback) {
        return this.reportedFields.get(`${sid}:${name}`) || fallback;
    }

    static boolean(value) {
        if (value === 'on' || value === true || value === 1 || value === '1') return true;
        if (value === 'off' || value === false || value === 0 || value === '0') return false;
        return null;
    }

    static number(value, min, max) {
        if (!['number', 'string'].includes(typeof value) || (typeof value === 'string' && !value.trim())) return null;
        const number = Number(value);
        return Number.isFinite(number) && number >= min && number <= max ? number : null;
    }

    getAccessoryInformation(sid) {
        return { Manufacturer: 'Aqara / Xiaomi', Model: this.modelLabel, SerialNumber: sid };
    }

    getAccessoryCategory(sid) {
        return this.Categories[this.serviceName(sid) === 'Lightbulb' ? 'LIGHTBULB' : this.serviceName(sid).toUpperCase()];
    }

    getServices(message, name) {
        const service = new this.Service[this.serviceName(message.sid)](name);
        for (const spec of this.characteristics()) {
            const characteristic = service.getCharacteristic(this.Characteristic[spec.name]);
            if (spec.props) characteristic.setProps(spec.props);
        }
        return [service];
    }

    command(sid, values) {
        const protocol = this.platform.getProtoVersionPrefixByProtoVersion(this.platform.getDeviceProtoVersionBySid(sid));
        const command = { cmd: 'write', model: this.platform.getDeviceModelBySid(sid), sid };
        if (protocol == 1) command.data = { ...values, key: '${key}' };
        else if (protocol == 2) Object.assign(command, { params: [values], key: '${key}' });
        else throw new Error(`Unsupported gateway protocol for ${sid}`);
        return JSON.stringify(command);
    }

    parserAccessories(message) {
        const sid = message.sid;
        const accessory = this.platform.AccessoryUtil.getByUUID(this.getAccessoryUUID(sid));
        if (!accessory) return;
        const service = accessory.getService(this.Service[this.serviceName(sid)]);
        for (const spec of this.characteristics()) {
            const characteristic = service.getCharacteristic(this.Characteristic[spec.name]);
            const value = spec.read(message);
            if (value != null) characteristic.updateValue(value);
            if (this.platform.ConfigUtil.getAccessorySyncValue(sid, this.accessoryType) && !characteristic.listeners('get').length) {
                characteristic.on('get', callback => {
                    Promise.resolve().then(() => this.platform.sendReadCommand(sid, JSON.stringify({ cmd: 'read', sid })))
                        .then(result => {
                            const value = spec.read(result);
                            if (value == null) throw new Error(`Missing ${spec.name} in gateway response for ${sid}`);
                            callback(null, value);
                        }).catch(error => callback(error));
                });
            }
            if (spec.write && !characteristic.listeners('set').length) {
                characteristic.on('set', (value, callback) => {
                    Promise.resolve().then(() => {
                        const command = this.command(sid, spec.write(sid, value));
                        if (this.platform.ConfigUtil.getAccessoryIgnoreWriteResult(sid, this.accessoryType)) {
                            this.platform.sendWriteCommandWithoutFeedback(sid, command);
                        } else return this.platform.sendWriteCommand(sid, command);
                    }).then(() => this.callback2HB(sid, characteristic, callback, null))
                        .catch(error => this.callback2HB(sid, characteristic, callback, error));
                });
            }
        }
    }
}

module.exports = LanAccessoryParser;
