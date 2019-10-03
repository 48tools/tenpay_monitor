"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cq_websocket_1 = require("cq-websocket");
const _ = __importStar(require("lodash"));
const async_sema_1 = require("async-sema");
const config_1 = __importDefault(require("./config"));
const logger_1 = __importDefault(require("./logger"));
const env_1 = require("./env");
const client = new cq_websocket_1.CQWebSocket(config_1.default.coolQ);
const throttle = new async_sema_1.Sema(1, { capacity: 5 });
// TODO: 在PK时开启插队发送模式
client.sendMessage = async (options) => {
    const msgId = _.uniqueId('QQ_MSG_');
    if (env_1.isDev) {
        logger_1.default.debug(options, `Preparing send message, message Id: ${msgId}`);
    }
    else {
        logger_1.default.info(`Preparing send message, message Id: ${msgId}
      message: ${options.message}\n
      message to:${options.group_id || options.user_id}`);
    }
    if (throttle.nrWaiting() > 0) {
        logger_1.default.info(`${throttle.nrWaiting()} messages is waiting for sending, current message Id: ${msgId}`);
    }
    await throttle.acquire();
    const result = await client('send_msg', options);
    logger_1.default.info(result, `message(#${msgId}) sent`);
    throttle.release();
    return result;
};
exports.default = client;
//# sourceMappingURL=connect-cool-q.js.map