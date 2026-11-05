const SingleButton86Parser = require('./SingleButton86Parser');
const wirelessButton = require('../lib/WirelessButtonAccessoryParser');

class WirelessWallButtonParser extends SingleButton86Parser {
    parserAccessories(message) {
        // Virtual presses generate object-valued data locally; legacy battery
        // and virtual-press parsers expect the gateway's JSON-string format.
        if (message.data && typeof message.data === 'object') message = { ...message, data: JSON.stringify(message.data) };
        super.parserAccessories(message);
    }

    getAccessoriesParserInfo() {
        return {
            ...super.getAccessoriesParserInfo(),
            SingleButton86_StatelessProgrammableSwitch: wirelessButton(0)
        };
    }
}
WirelessWallButtonParser.modelName = ['remote.b186acn01', 'remote.b186acn02'];
module.exports = WirelessWallButtonParser;
