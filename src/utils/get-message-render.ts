import * as path from 'path'
import {
  IProjectDetail,
  IProjectWaterSingleItem,
  IWaterSubscriptionResult,
} from '../core'
import logger from '../logger'

export function defaultRender(data: IWaterSubscriptionResult): string {
  const { project, waterItems } = data

  let projectText = ''
  if (project) {
    projectText = defaultProjectTemplate(project)
  }

  return `${waterItems.map(defaultWaterTemplate).join('\n')}\n\n${projectText}`
}

export function defaultWaterTemplate(waterItem: IProjectWaterSingleItem): string {
  const { nickname, remark, project_name, fee } = waterItem
  return `感谢聚聚 ${remark || nickname} 在 ${project_name} 中支持了 ￥${fee}`
}

export function defaultProjectTemplate(project: IProjectDetail): string {
  const { percent, title, target_amount, total_amount } = project
  return `项目 ${title} 当前进度 ${percent}% (${total_amount}/${target_amount})`
}

export type TMessageRender = typeof defaultRender

export function getMessageRender(pathFile?: string): TMessageRender {
  if (!pathFile) {
    return defaultRender
  }

  try {
    // eslint-disable-next-line
    const render = require(path.join(__dirname, '../..', pathFile))

    if (render.default) {
      return render.default
    }

    return render
  } catch (e) {
    logger.error(e, `[Message Render]: Render not found, path: ${pathFile}`)
    return defaultRender
  }
}
