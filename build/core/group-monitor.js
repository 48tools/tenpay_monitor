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
const _ = __importStar(require("lodash"));
const Rx = __importStar(require("rxjs"));
const logger_1 = __importDefault(require("../logger"));
const project_monitor_1 = require("./project-monitor");
const service_1 = require("./service");
const types_1 = require("./types");
const MINIMUM_INTERVAL = 2000;
const DEFAULT_INTERVAL = 10000;
var ProjectSubscriptionType;
(function (ProjectSubscriptionType) {
    ProjectSubscriptionType["INITIAL"] = "INITIAL";
    ProjectSubscriptionType["NEW"] = "NEW";
    ProjectSubscriptionType["BALANCE_GROW"] = "BALANCE_GROW";
    ProjectSubscriptionType["FINISHED"] = "FINISHED";
})(ProjectSubscriptionType = exports.ProjectSubscriptionType || (exports.ProjectSubscriptionType = {}));
class TenpayGroupMonitor {
    constructor(config) {
        this.waterSubject = new Rx.BehaviorSubject(null);
        this.projectSubject = new Rx.BehaviorSubject({
            type: ProjectSubscriptionType.INITIAL, projects: [],
        });
        this._isRunning = false;
        this.projects = [];
        this.projectInstances = [];
        const { interval = DEFAULT_INTERVAL, autoStart = true, tenpayGroupId } = config;
        this.tenpayGroupId = tenpayGroupId;
        this._interval = interval;
        if (autoStart) {
            this.startTimer();
        }
    }
    get isRunning() {
        return this._isRunning;
    }
    // public async setup(): Promise<void> {
    //   await this.loopGroupProjects()
    // }
    get interval() {
        return this._interval;
    }
    set interval(interval) {
        this._interval = Math.max(MINIMUM_INTERVAL, interval);
        if (this.isRunning) {
            this.stopTimer();
            this.startTimer();
        }
    }
    startTimer() {
        this._isRunning = true;
        this.timer = setInterval(() => {
            this.loopGroupProjects();
        }, this.interval);
    }
    stopTimer() {
        clearInterval(this.timer);
    }
    getProjectInstance(projectId) {
        return this.projectInstances.find((instance) => instance.projectId === projectId);
    }
    getProject(projectId) {
        return this.projects.find((project) => project.project_id === projectId);
    }
    async loopGroupProjects() {
        const result = await service_1.TenpayGroupAccountService.groupProjects({
            parent_guid: this.tenpayGroupId,
        });
        const { retcode, project_array } = result;
        if (retcode === '0' && project_array.length) {
            this.diffProjects(project_array);
            this.projects = project_array;
        }
    }
    subscribeProject(projectId) {
        //
        const find = this.getProjectInstance(projectId);
        const handler = (waterItems) => {
            this.waterSubject.next({
                project: this.getProject(projectId),
                projectId,
                waterItems,
            });
            this.waterSubject.next(null);
        };
        if (!find) {
            const instance = new project_monitor_1.TenpayProjectMonitor({
                projectId,
            });
            const subscription = instance.subject.subscribe(handler);
            this.projectInstances.push({
                subscription,
                projectId,
                instance,
            });
        }
    }
    unsubscribeProject(projectId) {
        const projectInstance = this.projectInstances.find((instance) => instance.projectId === projectId);
        if (projectInstance) {
            projectInstance.subscription && projectInstance.subscription.unsubscribe();
            projectInstance.instance.destroy();
            this.projectInstances.splice(this.projectInstances.indexOf(projectInstance), 1);
        }
    }
    resetProjectSubject() {
        this.projectSubject.next({
            type: ProjectSubscriptionType.INITIAL,
            projects: [],
        });
    }
    handleNewProjects(projects) {
        projects.forEach((project) => {
            this.subscribeProject(project.project_id);
        });
        if (projects.length) {
            this.projectSubject.next({
                type: ProjectSubscriptionType.NEW,
                projects,
            });
            this.resetProjectSubject();
        }
    }
    async handleBalanceGrowProjects(projects) {
        if (projects.length) {
            this.projectSubject.next({
                type: ProjectSubscriptionType.BALANCE_GROW,
                projects,
            });
            this.resetProjectSubject();
        }
        return Promise.all(projects.map(async (project) => {
            const monitor = this.getProjectInstance(project.project_id);
            if (monitor && !monitor.instance.standalone) {
                try {
                    return monitor.instance.fetchNewWater();
                }
                catch (e) {
                    logger_1.default.error(e, `Fetch water failed, project:${project.title}#${project.project_id}`, project);
                }
            }
        }));
    }
    handleFinishedProjects(projects) {
        if (projects.length) {
            setTimeout(() => {
                projects.forEach((project) => {
                    this.unsubscribeProject(project.project_id);
                });
                this.projectSubject.next({
                    type: ProjectSubscriptionType.FINISHED,
                    projects,
                });
                this.resetProjectSubject();
            }, 0);
        }
    }
    async diffProjects(projects) {
        const newProjects = _.cloneDeep(projects).filter((project) => {
            return !this.getProject(project.project_id)
                && (project.state === types_1.ProjectState.PENDING || project.state === types_1.ProjectState.PROCESSING);
        });
        const balanceGrowProjects = projects.filter((project) => {
            const find = this.getProject(project.project_id);
            if (find) {
                return find.balance < project.balance;
            }
            return false;
        });
        const finishedProjects = projects.filter((project) => {
            const find = this.getProject(project.project_id);
            if (find) {
                return (find.state === types_1.ProjectState.PENDING || find.state === types_1.ProjectState.PROCESSING)
                    && (project.state === types_1.ProjectState.EXPIRED || project.state === types_1.ProjectState.CLOSED);
            }
            return find;
        });
        this.handleNewProjects(newProjects);
        await this.handleBalanceGrowProjects(balanceGrowProjects);
        this.handleFinishedProjects(finishedProjects);
    }
}
exports.TenpayGroupMonitor = TenpayGroupMonitor;
//# sourceMappingURL=group-monitor.js.map