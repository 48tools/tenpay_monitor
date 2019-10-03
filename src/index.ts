// import { TenpayGroupAccount } from './core'
// import { IProjectWaterSingleItem, ProjectSubscriptionType, TenpayGroupMonitor, TenpayProjectMonitor } from './core'
import * as _ from 'lodash'
import config from './config'
import logger from './logger'
import coolQClient from './connect-cool-q'
import TenpayQQConnector from './tenpay-qq-connector'

coolQClient.connect()

const { tenpayGroups } = config

logger.info('start')

tenpayGroups.map((groupConfig) => {
  const connector = new TenpayQQConnector({
    ..._.pick(config, ['messageRender', 'reportFeeMinimum']),
    ...groupConfig,
  })
  connector.tenpayInstance.waterSubject.subscribe((waterItems) => {
    // if (waterItems.length) {
    //   logger.info(waterItems, `${groupConfig.remarkName} 新增集资`)
    // }
  })
  return connector
})
