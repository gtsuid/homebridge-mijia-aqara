const DeviceParser = require('./DeviceParser');
const channelSwitch = require('../lib/ChannelSwitchParser');

class DualRelayParser extends DeviceParser {
    getAccessoriesParserInfo() {
        return {
            DualRelay_Switch_Channel1: channelSwitch(0, 'channel', 'Dual Relay'),
            DualRelay_Switch_Channel2: channelSwitch(1, 'channel', 'Dual Relay')
        };
    }
}
DualRelayParser.modelName = ['relay.c2acn01'];
module.exports = DualRelayParser;
