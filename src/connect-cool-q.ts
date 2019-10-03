import { CQWebSocket } from 'cq-websocket'
import * as _ from 'lodash'
import { Sema } from 'async-sema'
import sysConfig from './config'
import logger from './logger'
import { isDev } from './env'

interface ISeneMessageOptions {
  message_type?:	'private' | 'group' | 'discuss'
  user_id?: number
  group_id?: number
  discuss_id?: number
  message: string
  auto_escape?: boolean
}

interface ICQWebSocketEnhance extends CQWebSocket {
  sendMessage(options: ISeneMessageOptions): any
}

const client = new CQWebSocket(sysConfig.coolQ) as any as ICQWebSocketEnhance

const throttle = new Sema(1, { capacity: 5 })

// TODO: 在PK时开启插队发送模式
client.sendMessage = async (options: ISeneMessageOptions) => {
  const msgId = _.uniqueId('QQ_MSG_')
  if (isDev) {
    logger.debug(options, `Preparing send message, message Id: ${msgId}`)
  } else {
    logger.info(`Preparing send message, message Id: ${msgId}
      message: ${options.message}\n
      message to:${options.group_id || options.user_id}`)
  }

  if (throttle.nrWaiting() > 0) {
    logger.info(`${throttle.nrWaiting()} messages is waiting for sending, current message Id: ${msgId}`)
  }

  await throttle.acquire()

  const result = await client<{message_id: number}>('send_msg', options)

  logger.info(result, `message(#${msgId}) sent`)

  throttle.release()

  return result
}

export default client
