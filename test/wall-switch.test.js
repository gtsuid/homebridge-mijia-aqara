const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { test } = require('node:test');
const { setTimeout: delay } = require('node:timers/promises');
const ParseUtil = require('../lib/ParseUtil');
const ConfigUtil = require('../lib/ConfigUtil');
const AccessoryUtil = require('../lib/AccessoryUtil');

class Characteristic extends EventEmitter {
    updateValue(value) { this.value = value; }
}

class Service {
    constructor(name) {
        this.name = name;
        this.characteristics = new Map();
    }
    getCharacteristic(type) {
        if (!this.characteristics.has(type)) this.characteristics.set(type, new Characteristic());
        return this.characteristics.get(type);
    }
    setCharacteristic(type, value) {
        this.getCharacteristic(type).updateValue(value);
        return this;
    }
}

class Switch extends Service {}
class Lightbulb extends Service {}
class AccessoryInformation extends Service {}

class Accessory extends EventEmitter {
    constructor(name, uuid, category) {
        super();
        this.displayName = name;
        this.UUID = uuid;
        this.category = category;
        this.services = [new AccessoryInformation()];
    }
    getService(type) { return this.services.find(service => service instanceof type); }
    addService(service) { this.services.push(service); }
}

async function platformFor(model, protocol = 1, config = {}) {
    const warnings = [];
    const commands = [];
    const platform = {
        Accessory: { Categories: { SWITCH: 8, LIGHTBULB: 5 } },
        PlatformAccessory: Accessory,
        Service: { Switch, Lightbulb, AccessoryInformation },
        Characteristic: { On: 'On' },
        UUIDGen: { generate: value => value },
        ConfigUtil: new ConfigUtil(config),
        AccessoryUtil: new AccessoryUtil(),
        log: { debug() {}, error(error) { throw error; }, warn(message) { warnings.push(message); } },
        getDeviceModelBySid: () => model,
        getDeviceProtoVersionBySid: () => `${protocol}.0`,
        getProtoVersionPrefixByProtoVersion: version => version.split('.')[0],
        sendWriteCommand: async (sid, command) => { commands.push(JSON.parse(command)); },
        sendWriteCommandWithoutFeedback: (sid, command) => { commands.push(JSON.parse(command)); },
        sendReadCommand: async () => packet(model, protocol, { channel_0: 'off', channel_1: 'on' })
    };
    platform.ParseUtil = new ParseUtil(platform);
    for (let attempt = 0; !platform.ParseUtil.getByModel('switch.b2lacn02'); attempt++) {
        assert.ok(attempt < 100, 'parser loading timed out');
        await delay(10);
    }
    return { platform, warnings, commands };
}

function packet(model, protocol, values) {
    return { cmd: protocol === 1 ? 'read_ack' : 'read_rsp', sid: '158d0000000001', model,
        ...(protocol === 1 ? { data: JSON.stringify(values) } : { params: [values] }) };
}

function discover(platform, message) {
    const accessories = platform.ParseUtil.getCreateAccessories(message);
    accessories.forEach(accessory => platform.AccessoryUtil.add(accessory));
    platform.ParseUtil.parserAccessories(message);
    return accessories;
}

function setValue(characteristic, value) {
    return new Promise((resolve, reject) => {
        characteristic.emit('set', value, error => error ? reject(error) : resolve());
    });
}

// Explicit expectations keep model registration and electrical variants under test.
const groups = [
    ['SingleSwitch', ['ctrl_neutral1', 'switch.b1lacn02', 'switch.b1lacn01', 'switch.l1acn1', 'switch.l1aeu1', 'switch.b1lc04'], 1],
    ['DuplexSwitch', ['ctrl_neutral2', 'switch.b2lacn02', 'switch.b2lacn01', 'switch.l2acn1', 'switch.l2aeu1', 'switch.b2lc04'], 2],
    ['SingleSwitchLN', ['ctrl_ln1', 'ctrl_ln1.aq1', 'switch.b1nacn02', 'switch.b1nc01'], 1],
    ['DuplexSwitchLN', ['ctrl_ln2', 'ctrl_ln2.aq1', 'switch.b2nacn02', 'switch.b2nc01', 'switch.n2aeu1'], 2]
];

for (const [type, models, channels] of groups) {
    for (const model of models) {
        for (const protocol of [1, 2]) {
            test(`${model}: discovery, state and independent writes (protocol ${protocol})`, async () => {
                const { platform, commands } = await platformFor(model, protocol);
                const message = packet(model, protocol, { channel_0: 'on', channel_1: 'off' });
                const accessories = discover(platform, message);
                assert.equal(accessories.length, channels);
                assert.equal(platform.ParseUtil.getByModelName(model), type);
                assert.equal(platform.ParseUtil.getByModel(`lumi.${model}`), platform.ParseUtil.getByModel(model));
                if (model.startsWith('switch.')) {
                    const underscoreModel = model.replace(/^switch\./, 'switch_');
                    assert.equal(platform.ParseUtil.getByModel(underscoreModel), platform.ParseUtil.getByModel(model));
                    assert.equal(platform.ParseUtil.getByModel(`lumi.${underscoreModel}`), platform.ParseUtil.getByModel(model));
                }
                assert.deepEqual(platform.ParseUtil.getCreateAccessories(message), [], 'cached accessories are not duplicated');
                for (let channel = 0; channel < channels; channel++) {
                    const on = accessories[channel].getService(Switch).getCharacteristic('On');
                    assert.equal(on.value, channel === 0);
                    for (const value of [false, true]) {
                        await setValue(on, value);
                        const expected = { cmd: 'write', model, sid: message.sid };
                        if (protocol === 1) expected.data = { [`channel_${channel}`]: value ? 'on' : 'off', key: '${key}' };
                        else Object.assign(expected, { params: [{ [`channel_${channel}`]: value ? 'on' : 'off' }], key: '${key}' });
                        assert.deepEqual(commands.at(-1), expected);
                    }
                }
                // A partial report must leave the other channel untouched.
                platform.ParseUtil.parserAccessories(packet(model, protocol, { channel_1: 'on' }));
                platform.ParseUtil.parserAccessories(packet(model, protocol, { channel_0: false }));
                assert.equal(accessories[0].getService(Switch).getCharacteristic('On').value, false);
                if (channels === 2) assert.equal(accessories[1].getService(Switch).getCharacteristic('On').value, true);
                for (const [raw, expected] of [['on', true], ['off', false], [true, true], [false, false], [1, true], [0, false]]) {
                    platform.ParseUtil.parserAccessories(packet(model, protocol, { channel_0: raw }));
                    assert.equal(accessories[0].getService(Switch).getCharacteristic('On').value, expected);
                }
                platform.ParseUtil.parserAccessories(packet(model, protocol, { channel_0: 'unknown' }));
                assert.equal(accessories[0].getService(Switch).getCharacteristic('On').value, false);
            });
        }
    }
}

for (const protocol of [1, 2]) test(`full D1 identifier: lightbulbs, sync reads and feedback-free writes (protocol ${protocol})`, async () => {
    const model = 'lumi.switch.b2lacn02';
    const config = { defaultValue: { '158d0000000001': {
        Global: { serviceType: 'Lightbulb', syncValue: true, ignoreWriteResult: true },
        DuplexSwitch_Switch_Left: { name: 'D1 left' },
        DuplexSwitch_Switch_Right: { name: 'D1 right' }
    } } };
    const { platform, commands } = await platformFor(model, protocol, config);
    const accessories = discover(platform, packet(model, protocol, { channel_0: 'on', channel_1: 'off' }));
    assert.deepEqual(accessories.map(accessory => accessory.displayName), ['D1 left', 'D1 right']);
    assert.deepEqual(accessories.map(accessory => accessory.category), [5, 5]);
    for (let channel = 0; channel < 2; channel++) {
        const on = accessories[channel].getService(Lightbulb).getCharacteristic('On');
        const value = await new Promise((resolve, reject) => on.emit('get', (error, value) => error ? reject(error) : resolve(value)));
        assert.equal(value, channel === 1);
        await setValue(on, true);
        assert.equal(commands.at(-1).model, model);
    }
    assert.equal(platform.ParseUtil.isGatewayModel('lumi.gateway'), true);
});

for (const protocol of [1, 2]) test(`gateway-reported switch_b2lacn02 discovers and controls both channels (protocol ${protocol})`, async () => {
    const model = 'switch_b2lacn02';
    const sid = '158d00040688ca';
    const { platform, commands, warnings } = await platformFor(model, protocol);
    const message = { ...packet(model, protocol, { channel_0: 'off', channel_1: 'on' }), sid };
    const accessories = discover(platform, message);
    assert.equal(accessories.length, 2);
    assert.equal(platform.ParseUtil.getByModelName(model), 'DuplexSwitch');
    assert.deepEqual(warnings, []);
    for (let channel = 0; channel < 2; channel++) {
        const on = accessories[channel].getService(Switch).getCharacteristic('On');
        assert.equal(on.value, channel === 1);
        await setValue(on, true);
        const command = commands.at(-1);
        assert.equal(command.model, model, 'write preserves the gateway model spelling');
        assert.equal(command.sid, sid);
        assert.equal((command.data || command.params[0])[`channel_${channel}`], 'on');
    }
    assert.deepEqual(platform.ParseUtil.getAccessoriesUUID(sid, model), platform.ParseUtil.getAccessoriesUUID(sid, 'switch.b2lacn02'));
});

test('D1 write failures are returned to Homebridge', async () => {
    const { platform } = await platformFor('switch.b2lacn02');
    platform.log.error = () => {};
    platform.sendWriteCommand = async () => { throw new Error('gateway timeout'); };
    const accessories = discover(platform, packet('switch.b2lacn02', 1, {}));
    await assert.rejects(setValue(accessories[1].getService(Switch).getCharacteristic('On'), true), /gateway timeout/);
});

test('disabled channel stays hidden and unsupported models produce one diagnostic', async () => {
    const { platform, warnings } = await platformFor('switch.b2lacn02', 1, {
        defaultValue: { '158d0000000001': { DuplexSwitch_Switch_Right: { disable: true } } }
    });
    assert.equal(discover(platform, packet('switch.b2lacn02', 1, {})).length, 1);
    for (let i = 0; i < 2; i++) {
        assert.deepEqual(platform.ParseUtil.getCreateAccessories(packet('switch.future', 1, {})), []);
    }
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /switch.future.*158d0000000001/);
});
