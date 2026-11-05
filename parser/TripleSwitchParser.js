const DeviceParser = require('./DeviceParser');
const channelSwitch = require('../lib/ChannelSwitchParser');

class TripleSwitchParser extends DeviceParser {
    getAccessoriesParserInfo() {
        return {
            TripleSwitch_Switch_Left: channelSwitch(0, 'neutral', 'Triple Switch (No Neutral)'),
            TripleSwitch_Switch_Center: channelSwitch(1, 'neutral', 'Triple Switch (No Neutral)'),
            TripleSwitch_Switch_Right: channelSwitch(2, 'neutral', 'Triple Switch (No Neutral)')
        };
    }
}
TripleSwitchParser.modelName = ['switch.l3acn3'];
module.exports = TripleSwitchParser;
