import request from './create-api'
import {
  IGroupInfoDetail,
  IGroupInfoDetailRaw,
  IGroupProjectList,
  IGroupProjectListRaw,
  IProjectIdReqConfig,
  IProjectListReqConfig,
  IProjectWaterDetail,
  IProjectWaterDetailRaw,
  IProjectWaterReqConfig,
} from './types'

import formatDate from '../utils/format-date'

function getTimeStr(time: string | Date): string {
  if (time instanceof Date) {
    //
    return formatDate(time, 'yyyy-MM-dd hh:mm:ss')
  }

  return time
}

export class TenpayGroupAccountService {
  /**
   * 获取项目流水
   */
  public static async projectWater(config: IProjectWaterReqConfig): Promise<IProjectWaterDetail> {
    const payload = {
      limit: 10,
      offset: 0,
      type: 1,
      ...config,
      start_time: getTimeStr(config.start_time || '1970-01-01 00:00:00'),
      end_time: getTimeStr(config.end_time || new Date()),
    }

    const resp = await request.post<IProjectWaterDetailRaw>('grp_qry_group_water.fcgi', payload)

    const result: IProjectWaterDetail = {
      ...resp.data,
      water_array: JSON.parse(decodeURIComponent(resp.data.water_array || '{}')),
    }

    return result
  }

  public static async projectRank(): Promise<null> {
    return null
  }

  public static async projectComments(): Promise<null> {
    return null
  }

  public static async groupInfo(config: IProjectIdReqConfig): Promise<IGroupInfoDetail> {
    //
    const { data } = await request.post<IGroupInfoDetailRaw>('grp_qry_group_info.fcgi', config)

    const result: IGroupInfoDetail = {
      ...data,
      balance_array: JSON.parse(data.balance_array || '[]'),
    }

    return result
  }

  public static async groupProjects(config: IProjectListReqConfig): Promise<IGroupProjectList> {
    const { data } = await request.post<IGroupProjectListRaw>('grp_project_qry_list.fcgi', config)

    const result: IGroupProjectList = {
      ...data,
      project_array: JSON.parse(data.project_array || '[]'),
    }

    return result
  }
}
