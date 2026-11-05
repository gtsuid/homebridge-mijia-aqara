const DeviceParser = require('./DeviceParser');
const channelSwitch = require('../lib/ChannelSwitchParser');

class TripleSwitchWithNeutralParser extends DeviceParser {
    getAccessoriesParserInfo() {
        return {
            TripleSwitchWithNeutral_Switch_Left: channelSwitch(0, 'channel', 'Triple Switch (With Neutral)'),
            TripleSwitchWithNeutral_Switch_Center: channelSwitch(1, 'channel', 'Triple Switch (With Neutral)'),
            TripleSwitchWithNeutral_Switch_Right: channelSwitch(2, 'channel', 'Triple Switch (With Neutral)')
        };
    }
}
TripleSwitchWithNeutralParser.modelName = ['switch.n3acn3'];
module.exports = TripleSwitchWithNeutralParser;
