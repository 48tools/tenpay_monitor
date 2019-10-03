import bind from 'lodash-decorators/bind'
import * as _ from 'lodash'

import {
  IBaseGroupWatchConfigSchema,
  IGroupWatchConfigSchema,
  IQQGroupReportSchema,
} from './config'
import coolQClient from './connect-cool-q'

import {
  IWaterSubscriptionResult,
  TenpayGroupMonitor,
} from './core'
import { getMessageRender, TMessageRender } from './utils/get-message-render'
import logger from './logger'

export function mergeGroupWatchConfig<T extends Omit<IBaseGroupWatchConfigSchema, 'interval'>>(
  current: T, parent: IBaseGroupWatchConfigSchema,
): T {
  return {
    ..._.pick(parent, ['messageRender', 'reportFeeMinimum']),
    ...current,
  }
}

function formatMoney(money: string | number): number {
  return parseFloat(((money as any) / 100).toFixed(2))
}

interface IQQGroupReport {
  groupId: string
  /** 最低播报金额 单位：元 */
  reportFeeMinimum?: number
  /** 消息模板 */
  messageRender: TMessageRender
}

export default class TenpayQQConnector {
  public readonly tenpayInstance: TenpayGroupMonitor

  private readonly config: IGroupWatchConfigSchema
  private qqGroups: IQQGroupReport[] = []

  public constructor(config: IGroupWatchConfigSchema) {
    this.config = config
    const { autoStart, interval, tenpayGroupId } = this.config

    this.tenpayInstance = new TenpayGroupMonitor({
      tenpayGroupId,
      autoStart,
      interval,
    })

    this.setup()
  }

  private setup(): void {
    const { qqGroup } = this.config
    this.tenpayInstance.waterSubject.subscribe(this.onNewWaterReceive)
    if (qqGroup) {
      Array.isArray(qqGroup) ? qqGroup.map(this.setupGroup) : this.setupGroup(qqGroup)
    }
  }

  @bind
  private setupGroup(groupSchema: IQQGroupReportSchema): void {
    const groupConfig = mergeGroupWatchConfig(groupSchema, this.config)
    const { groupId, reportFeeMinimum, messageRender } = groupConfig
    this.qqGroups.push({
      groupId,
      reportFeeMinimum,
      messageRender: getMessageRender(messageRender),
    })
  }

  @bind
  private onNewWaterReceive(result: IWaterSubscriptionResult | null): void {
    if (!result) {
      return
    }


    const { waterItems, project } = _.cloneDeep(result)

    if (waterItems.length) {
      logger.debug(`Received ${waterItems.length} water, project id ${result.projectId}`, project)
    }

    if (project) {
      project.target_amount = formatMoney(project.target_amount)
      project.balance = formatMoney(project.balance)
      project.total_amount = formatMoney(project.total_amount)
    }

    waterItems.forEach((waterItem) => {
      waterItem.fee = formatMoney(waterItem.fee).toString()
    })

    this.sendMessage({ ...result, waterItems, project })
  }

  @bind
  private sendMessage(data: IWaterSubscriptionResult): void {
    this.qqGroups.forEach((groupConfig) => {
      const waterItems = data.waterItems.filter((item) => {
        if (!groupConfig.reportFeeMinimum) {
          return true
        }

        return parseFloat(item.fee) > groupConfig.reportFeeMinimum
      })

      if (waterItems.length) {
        coolQClient.sendMessage({
          group_id: parseInt(groupConfig.groupId, 10),
          message: groupConfig.messageRender(_.cloneDeep(data)),
        })
      }
    })
  }
}
