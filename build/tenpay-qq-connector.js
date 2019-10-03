"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const bind_1 = __importDefault(require("lodash-decorators/bind"));
const _ = __importStar(require("lodash"));
const connect_cool_q_1 = __importDefault(require("./connect-cool-q"));
const core_1 = require("./core");
const get_message_render_1 = require("./utils/get-message-render");
const logger_1 = __importDefault(require("./logger"));
function mergeGroupWatchConfig(current, parent) {
    return Object.assign(Object.assign({}, _.pick(parent, ['messageRender', 'reportFeeMinimum'])), current);
}
exports.mergeGroupWatchConfig = mergeGroupWatchConfig;
function formatMoney(money) {
    return parseFloat((money / 100).toFixed(2));
}
class TenpayQQConnector {
    constructor(config) {
        this.qqGroups = [];
        this.config = config;
        const { autoStart, interval, tenpayGroupId } = this.config;
        this.tenpayInstance = new core_1.TenpayGroupMonitor({
            tenpayGroupId,
            autoStart,
            interval,
        });
        this.setup();
    }
    setup() {
        const { qqGroup } = this.config;
        this.tenpayInstance.waterSubject.subscribe(this.onNewWaterReceive);
        if (qqGroup) {
            Array.isArray(qqGroup) ? qqGroup.map(this.setupGroup) : this.setupGroup(qqGroup);
        }
    }
    setupGroup(groupSchema) {
        const groupConfig = mergeGroupWatchConfig(groupSchema, this.config);
        const { groupId, reportFeeMinimum, messageRender } = groupConfig;
        this.qqGroups.push({
            groupId,
            reportFeeMinimum,
            messageRender: get_message_render_1.getMessageRender(messageRender),
        });
    }
    onNewWaterReceive(result) {
        if (!result) {
            return;
        }
        const { waterItems, project } = _.cloneDeep(result);
        if (waterItems.length) {
            logger_1.default.debug(`Received ${waterItems.length} water, project id ${result.projectId}`, project);
        }
        if (project) {
            project.target_amount = formatMoney(project.target_amount);
            project.balance = formatMoney(project.balance);
            project.total_amount = formatMoney(project.total_amount);
        }
        waterItems.forEach((waterItem) => {
            waterItem.fee = formatMoney(waterItem.fee).toString();
        });
        this.sendMessage(Object.assign(Object.assign({}, result), { waterItems, project }));
    }
    sendMessage(data) {
        this.qqGroups.forEach((groupConfig) => {
            const waterItems = data.waterItems.filter((item) => {
                if (!groupConfig.reportFeeMinimum) {
                    return true;
                }
                return parseFloat(item.fee) > groupConfig.reportFeeMinimum;
            });
            if (waterItems.length) {
                connect_cool_q_1.default.sendMessage({
                    group_id: parseInt(groupConfig.groupId, 10),
                    message: groupConfig.messageRender(_.cloneDeep(data)),
                });
            }
        });
    }
}
__decorate([
    bind_1.default,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TenpayQQConnector.prototype, "setupGroup", null);
__decorate([
    bind_1.default,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TenpayQQConnector.prototype, "onNewWaterReceive", null);
__decorate([
    bind_1.default,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TenpayQQConnector.prototype, "sendMessage", null);
exports.default = TenpayQQConnector;
//# sourceMappingURL=tenpay-qq-connector.js.map