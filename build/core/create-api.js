"use strict";
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
const axios_1 = __importDefault(require("axios"));
const qs = __importStar(require("querystring"));
const isPlainObject_1 = __importDefault(require("lodash/isPlainObject"));
const config_1 = __importDefault(require("../config"));
const logger_1 = __importDefault(require("../logger"));
const request = axios_1.default.create({
    baseURL: 'https://groupaccount.tenpay.com/fcgi-bin',
});
function onResponse(resp) {
    const { data } = resp;
    try {
        if (data.retcode !== '0') {
            logger_1.default.error({
                response: {
                    data,
                    headers: resp.headers,
                    status: resp.status,
                },
                request: {
                    url: resp.config.url,
                    params: resp.config.params,
                    data: resp.config.data,
                },
            }, 'Seems got an unexpected response data.');
        }
    }
    catch (e) {
        logger_1.default.error(e, 'Not valid response data but something went wrong when recording messages.');
    }
    return resp;
}
request.interceptors.response.use(onResponse, (err) => {
    logger_1.default.fatal(err, 'Axios error, request failed.');
    return err;
});
request.interceptors.request.use((config) => {
    const cookie = `grp_qlskey=${config_1.default.cookie.qlskey};grp_qluin=${config_1.default.cookie.qluin}`;
    config.headers = Object.assign(Object.assign({ 'host': 'groupaccount.tenpay.com', 'accept': '*/*', 'referer': 'https://servicewechat.com/wxcf8e5b328359cb7a/193/page-frame.html', 
        // eslint-disable-next-line
        'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.5(0x17000523) NetType/WIFI Language/zh_CN' }, config.headers), { cookie });
    if (config.data && isPlainObject_1.default(config.data)) {
        config.data = qs.stringify(config.data);
    }
    return config;
});
exports.default = request;
//# sourceMappingURL=create-api.js.map