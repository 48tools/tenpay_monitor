"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 项目状态
 */
var ProjectState;
(function (ProjectState) {
    /** 未开始 */
    ProjectState[ProjectState["PENDING"] = 0] = "PENDING";
    /** 进行中 */
    ProjectState[ProjectState["PROCESSING"] = 1] = "PROCESSING";
    /** 自动到期 */
    ProjectState[ProjectState["EXPIRED"] = 3] = "EXPIRED";
    /** 提前关闭，资金转入资金池 */
    ProjectState[ProjectState["CLOSED"] = 4] = "CLOSED";
})(ProjectState = exports.ProjectState || (exports.ProjectState = {}));
var IGroupBalanceType;
(function (IGroupBalanceType) {
    /** 圈子资金池内资金（项目结束/被关闭之后主动转入） */
    IGroupBalanceType[IGroupBalanceType["GROUP_BALANCE"] = 1] = "GROUP_BALANCE";
    /** 项目内资金（进行中/到期结束中） */
    IGroupBalanceType[IGroupBalanceType["PROJECT_BALANCE"] = 2] = "PROJECT_BALANCE";
})(IGroupBalanceType = exports.IGroupBalanceType || (exports.IGroupBalanceType = {}));
//# sourceMappingURL=types.js.map