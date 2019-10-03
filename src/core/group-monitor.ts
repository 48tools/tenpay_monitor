import * as _ from 'lodash'
import * as Rx from 'rxjs'
import logger from '../logger'
import { TenpayProjectMonitor } from './project-monitor'
import { TenpayGroupAccountService } from './service'
import {
  IProjectDetail,
  IProjectWaterSingleItem,
  ProjectState,
} from './types'

const MINIMUM_INTERVAL = 2000
const DEFAULT_INTERVAL = 10000

interface IProjectMonitorInstance {
  projectId: string
  subscription: Rx.Subscription
  instance: TenpayProjectMonitor
}

export enum ProjectSubscriptionType {
  INITIAL = 'INITIAL',
  NEW = 'NEW',
  BALANCE_GROW = 'BALANCE_GROW',
  FINISHED = 'FINISHED',
}

export interface IProjectSubscriptionResult {
  type: ProjectSubscriptionType
  projects: IProjectDetail[]
}

export interface IWaterSubscriptionResult {
  projectId: string
  waterItems: IProjectWaterSingleItem[]
  project?: IProjectDetail
}

interface ITenpayGroupMonitorConfig {
  /**
   * 小圈子ID
   */
  tenpayGroupId: string
  /**
   * 轮询间隔，单位: ms
   * @default 10000
   */
  interval?: number
  /**
   * 是否自动开始轮询
   * @default true
   */
  autoStart?: boolean
}

export class TenpayGroupMonitor {
  public readonly tenpayGroupId: string
  public waterSubject = new Rx.BehaviorSubject<IWaterSubscriptionResult | null>(null)

  public projectSubject = new Rx.BehaviorSubject<IProjectSubscriptionResult>({
    type: ProjectSubscriptionType.INITIAL, projects: [],
  })

  private _isRunning: boolean = false
  private _interval: number
  private timer: NodeJS.Timeout
  private projects: IProjectDetail[] = []
  private projectInstances: IProjectMonitorInstance[] = []

  public constructor(config: ITenpayGroupMonitorConfig) {
    const { interval = DEFAULT_INTERVAL, autoStart = true, tenpayGroupId } = config
    this.tenpayGroupId = tenpayGroupId
    this._interval = interval

    if (autoStart) {
      this.startTimer()
    }
  }

  public get isRunning(): boolean {
    return this._isRunning
  }

  // public async setup(): Promise<void> {
  //   await this.loopGroupProjects()
  // }

  public get interval(): number {
    return this._interval
  }

  public set interval(interval: number) {
    this._interval = Math.max(MINIMUM_INTERVAL, interval)

    if (this.isRunning) {
      this.stopTimer()
      this.startTimer()
    }
  }

  public startTimer(): void {
    this._isRunning = true
    this.timer = setInterval(() => {
      this.loopGroupProjects()
    }, this.interval)
  }

  public stopTimer(): void {
    clearInterval(this.timer)
  }

  public getProjectInstance(projectId: string): IProjectMonitorInstance | undefined {
    return this.projectInstances.find((instance) => instance.projectId === projectId)
  }

  public getProject(projectId: string): IProjectDetail | undefined {
    return this.projects.find((project) => project.project_id === projectId)
  }

  private async loopGroupProjects(): Promise<void> {
    const result = await TenpayGroupAccountService.groupProjects({
      parent_guid: this.tenpayGroupId,
    })

    const { retcode, project_array } = result

    if (retcode === '0' && project_array.length) {
      this.diffProjects(project_array)
      this.projects = project_array
    }
  }

  private subscribeProject(projectId: string): void {
    //
    const find = this.getProjectInstance(projectId)
    const handler = (waterItems: IProjectWaterSingleItem[]): void => {
      this.waterSubject.next({
        project: this.getProject(projectId),
        projectId,
        waterItems,
      })
      this.waterSubject.next(null)
    }

    if (!find) {
      const instance = new TenpayProjectMonitor({
        projectId,
      })

      const subscription = instance.subject.subscribe(handler)

      this.projectInstances.push({
        subscription,
        projectId,
        instance,
      })
    }
  }

  private unsubscribeProject(projectId: string): void {
    const projectInstance = this.projectInstances.find((instance) => instance.projectId === projectId)

    if (projectInstance) {
      projectInstance.subscription && projectInstance.subscription.unsubscribe()
      projectInstance.instance.destroy()

      this.projectInstances.splice(this.projectInstances.indexOf(projectInstance), 1)
    }
  }

  private resetProjectSubject(): void {
    this.projectSubject.next({
      type: ProjectSubscriptionType.INITIAL,
      projects: [],
    })
  }

  private handleNewProjects(projects: IProjectDetail[]): void {
    projects.forEach((project) => {
      this.subscribeProject(project.project_id)
    })
    if (projects.length) {
      this.projectSubject.next({
        type: ProjectSubscriptionType.NEW,
        projects,
      })

      this.resetProjectSubject()
    }
  }

  private async handleBalanceGrowProjects(projects: IProjectDetail[]): Promise<void[]> {
    if (projects.length) {
      this.projectSubject.next({
        type: ProjectSubscriptionType.BALANCE_GROW,
        projects,
      })

      this.resetProjectSubject()
    }

    return Promise.all(projects.map(async (project) => {
      const monitor = this.getProjectInstance(project.project_id)
      if (monitor && !monitor.instance.standalone) {
        try {
          return monitor.instance.fetchNewWater()
        } catch (e) {
          logger.error(e, `Fetch water failed, project:${project.title}#${project.project_id}`, project)
        }
      }
    }))
  }

  private handleFinishedProjects(projects: IProjectDetail[]): void {
    if (projects.length) {
      setTimeout(() => {
        projects.forEach((project) => {
          this.unsubscribeProject(project.project_id)
        })

        this.projectSubject.next({
          type: ProjectSubscriptionType.FINISHED,
          projects,
        })

        this.resetProjectSubject()
      }, 0)
    }
  }

  private async diffProjects(projects: IProjectDetail[]): Promise<void> {
    const newProjects = _.cloneDeep(projects).filter((project) => {
      return !this.getProject(project.project_id)
        && (project.state === ProjectState.PENDING || project.state === ProjectState.PROCESSING)
    })

    const balanceGrowProjects = projects.filter((project) => {
      const find = this.getProject(project.project_id)
      if (find) {
        return find.balance < project.balance
      }

      return false
    })

    const finishedProjects = projects.filter((project) => {
      const find = this.getProject(project.project_id)
      if (find) {
        return (find.state === ProjectState.PENDING || find.state === ProjectState.PROCESSING)
              && (project.state === ProjectState.EXPIRED || project.state === ProjectState.CLOSED)
      }

      return find
    })

    this.handleNewProjects(newProjects)

    await this.handleBalanceGrowProjects(balanceGrowProjects)

    this.handleFinishedProjects(finishedProjects)
  }
}
