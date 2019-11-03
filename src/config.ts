import { CQWebSocketOption } from 'cq-websocket'
import * as TJS from 'typescript-json-schema'
import { Schema, Validator } from 'jsonschema'
import { isDev } from './env'
import logger, { LOG_FILE_PATH } from './logger'

export interface IBaseGroupWatchConfigSchema {
  /** 消息渲染 */
  messageRender?: string
  /** 监听间隔，默认10秒 */
  interval?: number
  /** 最低播报金额 单位：元 */
  reportFeeMinimum?: number
}

export interface IQQGroupReportSchema extends Omit<IBaseGroupWatchConfigSchema, 'interval'> {
  groupId: string
  /** QQ群备注 */
  remarkName?: string
}

export interface IGroupWatchConfigSchema extends Partial<IBaseGroupWatchConfigSchema> {
  /** 圈子ID */
  tenpayGroupId: string
  /** 圈子备注 */
  remarkName?: string
  /** 是否默认开启轮询，设为false关闭，默认true */
  autoStart?: boolean
  /** 圈子主图 */
  tenpayGroupImage?: string
  qqGroup?: IQQGroupReportSchema | IQQGroupReportSchema[]
}

export interface IConfigSchema extends IBaseGroupWatchConfigSchema {
  cookie: {
    qlskey: string
    qluin: string
  }
  coolQ: Partial<CQWebSocketOption>
  tenpayGroups: IGroupWatchConfigSchema[]
  /** QQ消息发送间隔 */
  messageThrottle?: number
}

export function validateSchema(config: IConfigSchema): boolean {
  const validator = new Validator()
  let schema: Schema
  if (isDev) {
    const program = TJS.getProgramFromFiles([__filename])
    schema = TJS.generateSchema(program, 'IConfigSchema', { required: true }) as any as Schema
  } else {
    // eslint-disable-next-line
    schema = require('./config.schema.json')
  }

  validator.validate(config, schema, { throwError: true })

  return true
}

function getConfig(): IConfigSchema {
  // eslint-disable-next-line
  let config = require('../config.json')

  if (isDev) {
    try {
      // eslint-disable-next-line
      config = require('../config.dev.json')
    } catch (e) {
      logger.debug('Load development config(config.dev.json) failed, use config.json instead')
    }
  }
  try {
    validateSchema(config)
  } catch (e) {
    logger.fatal(e, 'Config validate failed')
    setTimeout(() => {
      logger.info(`Config validate failed, process exit now, cat log for more details: ${LOG_FILE_PATH}`)
      process.exit(-1)
    }, 2000)
  }
  return config
}

export default getConfig()
