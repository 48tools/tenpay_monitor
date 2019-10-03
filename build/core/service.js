"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const create_api_1 = __importDefault(require("./create-api"));
const format_date_1 = __importDefault(require("../utils/format-date"));
function getTimeStr(time) {
    if (time instanceof Date) {
        //
        return format_date_1.default(time, 'yyyy-MM-dd hh:mm:ss');
    }
    return time;
}
class TenpayGroupAccountService {
    /**
     * 获取项目流水
     */
    static async projectWater(config) {
        const payload = Object.assign(Object.assign({ limit: 10, offset: 0, type: 1 }, config), { start_time: getTimeStr(config.start_time || '1970-01-01 00:00:00'), end_time: getTimeStr(config.end_time || new Date()) });
        const resp = await create_api_1.default.post('grp_qry_group_water.fcgi', payload);
        const result = Object.assign(Object.assign({}, resp.data), { water_array: JSON.parse(decodeURIComponent(resp.data.water_array || '{}')) });
        return result;
    }
    static async projectRank() {
        return null;
    }
    static async projectComments() {
        return null;
    }
    static async groupInfo(config) {
        //
        const { data } = await create_api_1.default.post('grp_qry_group_info.fcgi', config);
        const result = Object.assign(Object.assign({}, data), { balance_array: JSON.parse(data.balance_array || '[]') });
        return result;
    }
    static async groupProjects(config) {
        const { data } = await create_api_1.default.post('grp_project_qry_list.fcgi', config);
        const result = Object.assign(Object.assign({}, data), { project_array: JSON.parse(data.project_array || '[]') });
        return result;
    }
}
exports.TenpayGroupAccountService = TenpayGroupAccountService;
//# sourceMappingURL=service.js.map