const LanAccessoryParser = require('./LanAccessoryParser');

// One accessory per physical channel, compatible with the plugin's per-channel
// name, disable, Lightbulb, syncValue and ignoreWriteResult settings.
module.exports = function channelSwitch(channel, defaultPrefix, label) {
    return class extends LanAccessoryParser {
        get modelLabel() { return label; }
        serviceName(sid) {
            return this.platform.ConfigUtil.getAccessoryServiceType(sid, this.accessoryType) === 'Lightbulb' ? 'Lightbulb' : 'Switch';
        }
        characteristics() {
            const preferred = `${defaultPrefix}_${channel}`;
            const alternate = `${defaultPrefix === 'channel' ? 'neutral' : 'channel'}_${channel}`;
            return [{
                name: 'On',
                read: message => LanAccessoryParser.boolean(this.readField(message, 'On', [preferred, alternate])),
                write: (sid, value) => ({ [this.fieldFor(sid, 'On', preferred)]: value ? 'on' : 'off' })
            }];
        }
    };
};
