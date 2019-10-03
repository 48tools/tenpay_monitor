"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const TJS = __importStar(require("typescript-json-schema"));
const jsonschema_1 = require("jsonschema");
const env_1 = require("./env");
const logger_1 = __importStar(require("./logger"));
function validateSchema(config) {
    const validator = new jsonschema_1.Validator();
    let schema;
    if (env_1.isDev) {
        const program = TJS.getProgramFromFiles([__filename]);
        schema = TJS.generateSchema(program, 'IConfigSchema', { required: true });
    }
    else {
        // eslint-disable-next-line
        schema = require('./config.schema.json');
    }
    validator.validate(config, schema, { throwError: true });
    return true;
}
function getConfig() {
    // eslint-disable-next-line
    let config = require('../config.json');
    if (env_1.isDev) {
        try {
            // eslint-disable-next-line
            config = require('../config.dev.json');
        }
        catch (e) {
            logger_1.default.debug('Load development config(config.dev.json) failed, use config.json instead');
        }
    }
    try {
        validateSchema(config);
    }
    catch (e) {
        logger_1.default.fatal(e, 'Config validate failed');
        setTimeout(() => {
            logger_1.default.info(`Config validate failed, process exit now, cat log for more details: ${logger_1.LOG_FILE_PATH}`);
            process.exit(-1);
        }, 2000);
    }
    return config;
}
exports.default = getConfig();
//# sourceMappingURL=config.js.map