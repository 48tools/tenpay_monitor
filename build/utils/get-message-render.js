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
const path = __importStar(require("path"));
const logger_1 = __importDefault(require("../logger"));
function defaultRender(data) {
    const { project, waterItems } = data;
    let projectText = '';
    if (project) {
        projectText = defaultProjectTemplate(project);
    }
    return `${waterItems.map(defaultWaterTemplate).join('\n')}\n\n${projectText}`;
}
exports.defaultRender = defaultRender;
function defaultWaterTemplate(waterItem) {
    const { nickname, remark, project_name, fee } = waterItem;
    return `感谢聚聚 ${remark || nickname} 在 ${project_name} 中支持了 ￥${fee}`;
}
exports.defaultWaterTemplate = defaultWaterTemplate;
function defaultProjectTemplate(project) {
    const { percent, title, balance, target_amount } = project;
    return `项目 ${title} 当前进度 ${percent}% (${balance}/${target_amount})`;
}
exports.defaultProjectTemplate = defaultProjectTemplate;
function getMessageRender(pathFile) {
    if (!pathFile) {
        return defaultRender;
    }
    try {
        // eslint-disable-next-line
        const render = require(path.join(__dirname, '../..', pathFile));
        if (render.default) {
            return render.default;
        }
        return render;
    }
    catch (e) {
        logger_1.default.error(e, `[Message Render]: Render not found, path: ${pathFile}`);
        return defaultRender;
    }
}
exports.getMessageRender = getMessageRender;
//# sourceMappingURL=get-message-render.js.map