"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const _ = __importStar(require("lodash"));
const Rx = __importStar(require("rxjs"));
const service_1 = require("./service");
const MINIMUM_INTERVAL = 2000;
const DEFAULT_INTERVAL = 10000;
/** 最大播报多少分钟前的订单 */
const MAX_AVAILABLE_TIME_DIFF = 180000;
class TenpayProjectMonitor {
    constructor(config) {
        this.subject = new Rx.BehaviorSubject([]);
        // private onNewWater: ITenpayProjectMonitorConfig['onNewWater']
        this._standalone = false;
        this._interval = DEFAULT_INTERVAL;
        this.maxAvailableWaterTimeDiff = MAX_AVAILABLE_TIME_DIFF;
        this.lastWater = null;
        this.firstFetched = false;
        this.projectId = config.projectId;
        if (config.interval) {
            this.interval = config.interval;
        }
        this.standalone = !!config.standalone;
        // this.onNewWater = config.onNewWater
        this.setup();
    }
    get interval() {
        return this._interval;
    }
    set interval(interval) {
        this._interval = Math.max(MINIMUM_INTERVAL, interval);
        this.maxAvailableWaterTimeDiff = Math.max(3 * this._interval, MAX_AVAILABLE_TIME_DIFF);
        this.stopTimer();
        this.startTimer();
    }
    get standalone() {
        return this._standalone;
    }
    set standalone(val) {
        const standalone = this.standalone;
        this._standalone = val;
        if (!standalone && val) {
            this.startTimer();
        }
        else if (!val && standalone) {
            this.stopTimer();
        }
    }
    destroy() {
        this.stopTimer();
        this.subject.complete();
    }
    async setup() {
        const result = await this.fetchWater();
        const { retcode, water_array: { water_array } } = result;
        if (retcode === '0') {
            water_array[0] && (this.lastWater = water_array[0]);
        }
        this.firstFetched = true;
    }
    async fetchNewWater() {
        if (!this.firstFetched) {
            return;
        }
        const listid = _.get(this.lastWater, 'listid') || '';
        const newWater = await this.collectWater(listid);
        if (newWater.length) {
            this.subject.next(newWater.map((waterItem) => {
                waterItem.project_id = this.projectId;
                return waterItem;
            }));
            this.subject.next([]);
            this.lastWater = newWater[0];
        }
    }
    async collectWater(listid, collected = [], offset = 0) {
        const collectedWater = collected;
        const result = await this.fetchWater({ offset });
        const water_array = result.water_array.water_array || [];
        let foundLast = false;
        const now = new Date().getTime();
        for (const waterItem of water_array) {
            if (foundLast) {
                continue;
            }
            const waterTime = new Date(waterItem.time).getTime();
            const isOverTimeDiff = now - waterTime > this.maxAvailableWaterTimeDiff;
            // 找到了之前最后的订单或者超过了最大播报时间限制
            if (waterItem.listid === listid || isOverTimeDiff) {
                foundLast = true;
            }
            else {
                collectedWater.push(waterItem);
            }
        }
        if (!foundLast && water_array.length) {
            return this.collectWater(listid, collectedWater, offset + 10);
        }
        return collectedWater;
    }
    async fetchWater(config) {
        return service_1.TenpayGroupAccountService.projectWater(Object.assign({ group_account_id: this.projectId }, config));
    }
    stopTimer() {
        clearInterval(this.timer);
    }
    startTimer() {
        this.timer = setInterval(() => {
            this.fetchNewWater();
        }, this.interval);
    }
}
exports.TenpayProjectMonitor = TenpayProjectMonitor;
//# sourceMappingURL=project-monitor.js.map