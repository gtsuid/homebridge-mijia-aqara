var fs = require("fs");
var path = require('path');

class ParseUtil {
    constructor(platform) {
        this.platform = platform;
        this.parsers = {};
        this.gatewayModels = [];
        this.unsupportedModels = new Set();
        
        this.loadParser();
    }
    
    loadParser() {
        var that = this;
        var parsersPath = path.resolve(__dirname, './../parser/');
        that.platform.log.debug('loading parsers from: ' + parsersPath);
        fs.readdir(parsersPath, function (err, files) {
            if (err) {
                return;
            }
            files.forEach(function (filename) {
                if(filename == null || filename == '') {
                    return;
                }
                if('.js' != filename.substring(filename.lastIndexOf('.'), filename.length)) {
                    return;
                }
                if('AccessoryParser.js' == filename) {
                    return;
                }
                if('DeviceParser.js' == filename) {
                    return;
                }
//                that.platform.log.debug(filename);
                
                var parserPath = path.join(parsersPath, filename);
                try {
                    var parserFile = require(parserPath);
                    var parserModel = parserFile && parserFile.modelName;
                    if (!parserModel) {
                        return;
                    }
                    
                    var parser = new parserFile(that.platform);
                    if (parserModel instanceof Array) {
                        parserModel.forEach(function (model) {
                            that.parsers[model] = parser;
                            if(parserFile.isGateway) {
                                that.gatewayModels.push(model);
                            }
//                            that.platform.log.debug(model);
                        });
                    } else {
                        that.parsers[parserModel] = parser;
                        if(parserFile.isGateway) {
                            that.gatewayModels.push(parserModel);
                        }
//                        that.platform.log.debug(parserModel);
                    }
                } catch (error) {
                    that.platform.log.error(error);
                }
            });
        });
    }
    
    isGatewayModel(modelName) {
        modelName = typeof modelName === 'string' ? modelName.replace(/^lumi\./, '') : modelName;
        if (this.gatewayModels.indexOf(modelName) > -1) {
            return true;
        } else {
            return false;
        }
    }
    
    getByModel(model) {
        // Some gateways use switch_b2lacn02 instead of switch.b2lacn02.
        // Normalize known namespaces only; legacy IDs such as ctrl_neutral2
        // contain meaningful underscores. Keep the original model for writes.
        var modelName = typeof model === 'string' ? model.replace(/^lumi\./, '').replace(/^(switch|relay|remote|plug|light)_/, '$1.') : model;
        return Object.prototype.hasOwnProperty.call(this.parsers, modelName) ? this.parsers[modelName] : null;
    }
    
    getByModelName(model) {
        function getFnName(fn){
            return typeof fn !== "function" ?
                undefined:
                fn.name || 
                /function (.+?)\(/.exec(fn + "")[1];
        }
        var parse = this.getByModel(model);
        if(parse) {
            return getFnName(parse.constructor).replace("Parser", "");
        } else {
            return "";
        }
    }
    
    getCreateAccessories(jsonObj) {
        jsonObj = this.resolveMessageModel(jsonObj);
        var result = [];
        
        var model = jsonObj['model'];
        var parser = this.getByModel(model);
        if(parser) {
            result = parser.getCreateAccessories(jsonObj);
        } else if(model && !this.unsupportedModels.has(model)) {
            this.unsupportedModels.add(model);
            this.platform.log.warn('Unsupported device model "' + model + '" (sid: ' + jsonObj['sid'] + '); no accessories created.');
        }
        
        return result;
    }
    
    parserAccessories(jsonObj) {
        jsonObj = this.resolveMessageModel(jsonObj);
        var result = [];
        
        var model = jsonObj['model'];
        var parser = this.getByModel(model);
        if(parser) {
            result = parser.parserAccessories(jsonObj);
        }
        
        return result;
    }

    resolveMessageModel(message) {
        if (message.model) return message;
        const model = this.platform.ConfigUtil.getDeviceModelOverride(message.sid);
        return model ? { ...message, model } : message;
    }
    
    getAccessoriesUUID(sid, deviceModel) {
        var result = [];
        
        var parser = this.getByModel(deviceModel);
        if(parser) {
            result = parser.getAccessoriesUUID(sid);
        }
        
        return result;
    }
}

module.exports = ParseUtil;
