import * as bunyan from 'bunyan'
import * as path from 'path'
import { isDev } from './env'

const debugFileName = 'debug.log'
let filePath = path.join(__dirname, '../logs/log.log')
if (isDev) {
  filePath = path.join(__dirname, `../logs/${debugFileName}`)
}

export const logger = bunyan.createLogger({
  name: 'TenpayMonitor',
  streams: [
    {
      level: isDev ? 'debug' : 'info',
      stream: process.stdout,
    },
    {
      type: 'rotating-file',
      path: filePath,
      period: '1w',   // daily rotation
      count: 4, // keep 4 back copies
      level: isDev ? 'debug' : 'info',
    },
  ],
})

export const LOG_FILE_PATH = filePath

export default logger
