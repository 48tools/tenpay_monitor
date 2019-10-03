"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const bunyan = __importStar(require("bunyan"));
const path = __importStar(require("path"));
const env_1 = require("./env");
const debugFileName = 'debug.log';
let filePath = path.join(__dirname, '../logs/log.log');
if (env_1.isDev) {
    filePath = path.join(__dirname, `../logs/${debugFileName}`);
}
exports.logger = bunyan.createLogger({
    name: 'TenpayMonitor',
    streams: [
        {
            level: env_1.isDev ? 'debug' : 'info',
            stream: process.stdout,
        },
        {
            type: 'rotating-file',
            path: filePath,
            period: '1w',
            count: 4,
            level: env_1.isDev ? 'debug' : 'info',
        },
    ],
});
exports.LOG_FILE_PATH = filePath;
exports.default = exports.logger;
//# sourceMappingURL=logger.js.map