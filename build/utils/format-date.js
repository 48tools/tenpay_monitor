"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Format date
 */
const parse_date_1 = require("./parse-date");
const indexToWeek = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
function formatDate(_date, format) {
    const date = parse_date_1.parseDate(_date); // tslint:disable-line
    const map = {
        M: date.getMonth() + 1,
        d: date.getDate(),
        D: indexToWeek[date.getDay()],
        h: date.getHours(),
        m: date.getMinutes(),
        s: date.getSeconds(),
        q: Math.floor((date.getMonth() + 3) / 3),
        S: date.getMilliseconds(),
    };
    format = format.replace(/[yMdDhmsqS]+/g, (all, t) => {
        let v = map[t];
        if (v !== undefined) {
            if (all.length > 1) {
                v = `0${v}`;
                v = v.substr(v.length - 2);
            }
            return v;
        }
        else if (t === 'y') {
            return date.getFullYear().toString().substr(4 - all.length);
        }
        return all;
    });
    return format;
}
exports.formatDate = formatDate;
exports.default = formatDate;
//# sourceMappingURL=format-date.js.map