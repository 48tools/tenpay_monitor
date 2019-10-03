import * as _ from 'lodash'
import * as Rx from 'rxjs'

import {
  IProjectWaterDetail,
  IProjectWaterReqConfig,
  IProjectWaterSingleItem,
  ProjectState,
} from './types'
import { TenpayGroupAccountService } from './service'

const MINIMUM_INTERVAL = 2000
const DEFAULT_INTERVAL = 10000

/** 最大播报多少分钟前的订单 */
const MAX_AVAILABLE_TIME_DIFF = 180000

export interface ITenpayProjectMonitorConfig {
  projectId: string
  // onNewWater: (orders: IProjectWaterSingleItem[]) => void
  onEnd?: (type: ProjectState.CLOSED | ProjectState.EXPIRED) => void
  standalone?: boolean
  interval?: number
}

export class TenpayProjectMonitor {
  public readonly subject = new Rx.BehaviorSubject<IProjectWaterSingleItem[]>([])

  public readonly projectId: string
  // private onNewWater: ITenpayProjectMonitorConfig['onNewWater']
  private _standalone: boolean = false
  private _interval: number = DEFAULT_INTERVAL
  private maxAvailableWaterTimeDiff: number = MAX_AVAILABLE_TIME_DIFF
  private timer: NodeJS.Timeout
  private lastWater: IProjectWaterSingleItem | null = null
  private firstFetched = false

  public constructor(config: ITenpayProjectMonitorConfig) {
    this.projectId = config.projectId
    if (config.interval) {
      this.interval = config.interval
    }

    this.standalone = !!config.standalone
    // this.onNewWater = config.onNewWater

    this.setup()
  }

  public get interval(): number {
    return this._interval
  }

  public set interval(interval: number) {
    this._interval = Math.max(MINIMUM_INTERVAL, interval)
    this.maxAvailableWaterTimeDiff = Math.max(3 * this._interval, MAX_AVAILABLE_TIME_DIFF)

    this.stopTimer()
    this.startTimer()
  }

  public get standalone(): boolean {
    return this._standalone
  }

  public set standalone(val: boolean) {
    const standalone = this.standalone
    this._standalone = val

    if (!standalone && val) {
      this.startTimer()
    } else if (!val && standalone) {
      this.stopTimer()
    }
  }

  public destroy(): void {
    this.stopTimer()
    this.subject.complete()
  }

  public async setup(): Promise<void> {
    const result = await this.fetchWater()
    const { retcode, water_array: { water_array } } = result

    if (retcode === '0') {
      water_array[0] && (this.lastWater = water_array[0])
    }
    this.firstFetched = true
  }

  public async fetchNewWater(): Promise<void> {
    if (!this.firstFetched) {
      return
    }

    const listid = _.get(this.lastWater, 'listid') || ''
    const newWater = await this.collectWater(listid)

    if (newWater.length) {
      this.subject.next(newWater.map((waterItem) => {
        waterItem.project_id = this.projectId
        return waterItem
      }))
      this.subject.next([])

      this.lastWater = newWater[0]
    }
  }

  public async collectWater(
    listid: string,
    collected: IProjectWaterSingleItem[] = [],
    offset: number = 0,
  ): Promise<IProjectWaterSingleItem[]> {
    const collectedWater: IProjectWaterSingleItem[] = collected
    const result = await this.fetchWater({ offset })

    const water_array = result.water_array.water_array || []
    let foundLast = false
    const now = new Date().getTime()

    for (const waterItem of water_array) {
      if (foundLast) {
        continue
      }

      const waterTime = new Date(waterItem.time).getTime()
      const isOverTimeDiff = now - waterTime > this.maxAvailableWaterTimeDiff

      // 找到了之前最后的订单或者超过了最大播报时间限制
      if (waterItem.listid === listid || isOverTimeDiff) {
        foundLast = true
      } else {
        collectedWater.push(waterItem)
      }
    }

    if (!foundLast && water_array.length) {
      return this.collectWater(listid, collectedWater, offset + 10)
    }

    return collectedWater
  }

  public async fetchWater(config?: Partial<IProjectWaterReqConfig>): Promise<IProjectWaterDetail> {
    return TenpayGroupAccountService.projectWater({
      group_account_id: this.projectId,
      ...config,
    })
  }

  private stopTimer(): void {
    clearInterval(this.timer)
  }

  private startTimer(): void {
    this.timer = setInterval(() => {
      this.fetchNewWater()
    }, this.interval)
  }
}
