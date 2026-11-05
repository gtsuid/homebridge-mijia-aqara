const DuplexButton862Parser = require('./DuplexButton862Parser');
const wirelessButton = require('../lib/WirelessButtonAccessoryParser');

class WirelessDoubleWallButtonParser extends DuplexButton862Parser {
    parserAccessories(message) {
        if (message.data && typeof message.data === 'object') message = { ...message, data: JSON.stringify(message.data) };
        super.parserAccessories(message);
    }

    getAccessoriesParserInfo() {
        return {
            ...super.getAccessoriesParserInfo(),
            DuplexButton862_StatelessProgrammableSwitch_Left: wirelessButton(0),
            DuplexButton862_StatelessProgrammableSwitch_Right: wirelessButton(1),
            DuplexButton862_StatelessProgrammableSwitch_Both: wirelessButton('both')
        };
    }
}
WirelessDoubleWallButtonParser.modelName = ['remote.b286acn02'];
module.exports = WirelessDoubleWallButtonParser;
