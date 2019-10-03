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
// import { TenpayGroupAccount } from './core'
// import { IProjectWaterSingleItem, ProjectSubscriptionType, TenpayGroupMonitor, TenpayProjectMonitor } from './core'
const _ = __importStar(require("lodash"));
const config_1 = __importDefault(require("./config"));
const logger_1 = __importDefault(require("./logger"));
const connect_cool_q_1 = __importDefault(require("./connect-cool-q"));
const tenpay_qq_connector_1 = __importDefault(require("./tenpay-qq-connector"));
connect_cool_q_1.default.connect();
const { tenpayGroups } = config_1.default;
logger_1.default.info('start');
tenpayGroups.map((groupConfig) => {
    const connector = new tenpay_qq_connector_1.default(Object.assign(Object.assign({}, _.pick(config_1.default, ['messageRender', 'reportFeeMinimum'])), groupConfig));
    connector.tenpayInstance.waterSubject.subscribe((waterItems) => {
        // if (waterItems.length) {
        //   logger.info(waterItems, `${groupConfig.remarkName} 新增集资`)
        // }
    });
    return connector;
});
//# sourceMappingURL=index.js.map