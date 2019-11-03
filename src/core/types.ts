export enum EnumBoolean {
  FALSE, TRUE
}
/** 单条集资 */
export interface IProjectWaterSingleItem {
  audits_nickname: string
  /** 当前项目总金额 */
  balance: string
  /** 啥玩意儿我也不知道 */
  bkid: string
  /** 啥玩意儿我也不知道 */
  curtype: number
  /**
   * 支持金额
   * 单位：支持金额 * 100
   */
  fee: string
  /**
   * 项目名
   */
  project_name: string
  /** 项目ID */
  project_id: string
  /**
   * 微信昵称
   */
  nickname: string
  /**
   * 小程序中昵称
   */
  remark?: string
  /**
   * 打赏时间 DateTime 格式
   */
  time: string
  subject_desc: string
  pic_list: string
  headurl: string
  /**
   * 订单ID
   */
  listid: string
  subject: number
  user_memo: string
  water_type: number
}

export interface IBaseResponse {
  /**
   * 请求返回代码， 为 '0' 时代表响应正常。
   */
  retcode: string
  retmsg: string
}

/**
 * 项目订单流水-Base
 */
interface IProjectWaterDetailBase extends IBaseResponse {
  balance: string
  water_num: string
}

/**
 * 项目订单流水-Raw
 */
export interface IProjectWaterDetailRaw extends IProjectWaterDetailBase {
  water_array: string
}

/**
 * 项目订单流水
 */
export interface IProjectWaterDetail extends IProjectWaterDetailBase {
  water_array: {
    water_array: IProjectWaterSingleItem[]
  }
}

/**
 * 项目状态
 */
export enum ProjectState {
  /** 未开始 */
  PENDING = 0,
  /** 进行中 */
  PROCESSING = 1,
  /** 自动到期 */
  EXPIRED = 3,
  /** 提前关闭，资金转入资金池 */
  CLOSED = 4,
}

/**
 * 圈子信息-Base
 */
interface IGroupInfoDetailBase extends IBaseResponse {
  /** 圈子名 */
  name: string
  /** 描述 */
  desc: string
  /** 圈子ID */
  group_account_id: string
  /**
   * 总募集金额
   */
  balance: string

  balance_in: string
  /** 已提现/支出（似乎是） */
  balance_out: string
}

/**
 * 圈子信息-Raw
 */
export interface IGroupInfoDetailRaw extends IGroupInfoDetailBase {
  /** 所有含有资金的项目/圈子资金池本身 */
  balance_array: string
}

export enum IGroupBalanceType {
  /** 圈子资金池内资金（项目结束/被关闭之后主动转入） */
  GROUP_BALANCE = 1,
  /** 项目内资金（进行中/到期结束中） */
  PROJECT_BALANCE = 2
}

/** 项目内资金 */
export interface IGroupProjectBalanceItem {
  balance: number
  type: IGroupBalanceType.PROJECT_BALANCE
  name: string
  pic_url: string
  project_id: string
}

/** 圈子资金池 */
export interface IGroupGroupBalanceItem {
  balance: number
  type: IGroupBalanceType.GROUP_BALANCE
  name: string
  parent_guid: string
}

export type IGroupBalanceItem = IGroupGroupBalanceItem | IGroupProjectBalanceItem

/**
 * 圈子信息
 */
export interface IGroupInfoDetail extends IGroupInfoDetailBase {
  balance_array: IGroupBalanceItem[]
}

/**
 * 圈子内项目列表-Base
 */
interface IGroupProjectListBase extends IBaseResponse {
  /** 是否有更多, '0' 无 '1' 有 */
  have_more: '0' | '1'
}

/**
 * 圈子内项目列表-Raw
 */
export interface IGroupProjectListRaw extends IGroupProjectListBase {
  project_array: string
}

/**
 * 项目详情
 */
export interface IProjectDetail {
  /** 当前已募集金额 */
  balance: number
  /** 开始时间, 标准时间格式 */
  begin_time: string
  /** 结束时间, 标准时间格式 */
  expire_time: string
  /** 项目描述 */
  desc: string
  /** 订单数量 */
  pay_num: number
  /** 项目进度,已*100, 可以直接加%显示 */
  percent: string
  /** 项目头图 */
  pic_url: string
  /** 项目ID */
  project_id: string
  /** 发起者头像 */
  sponsor_headurl: string
  /** 发起者昵称 */
  sponsor_nickname: string
  /** 发起者ID */
  sponsor_unionid: string
  /** 项目状态 */
  state: ProjectState
  /** 目标金额 */
  target_amount: number
  /** 项目标题 */
  title: string
  /** 当前已募集金额-不知道和balance有什么区别 */
  total_amount: number
}

export interface IGroupProjectList extends IGroupProjectListBase {
  project_array: IProjectDetail[]
}

interface IPageReqConfig {
  /**
   * 偏移量
   * @default 0
   */
  offset?: number
  /**
   * 数量限制
   * @default 10
   */
  limit?: number
}

export interface IProjectIdReqConfig {
  /** 小经费项目ID */
  group_account_id: string
}

export interface IProjectWaterReqConfig extends IPageReqConfig, IProjectIdReqConfig {
  /**
   * 开始时间
   * 字符串时格式：YYYY-MM-DD hh:mm:ss
   * @default 1970-01-01 00:00:00
   */
  start_time?: string | Date
  /**
   * 结束时间
   * 字符串时格式：YYYY-MM-DD hh:mm:ss
   * @default new Date()
   */
  end_time?: string | Date

  /**
   * 啥玩意儿我也不知道
   * @default 1
   */
  type?: 1 | 2
  /** 啥玩意儿我也不知道 */
  lastbkid?: string
  /** 啥玩意儿我也不知道 */
  qry_ver?: string
}

export interface IProjectListReqConfig extends IPageReqConfig {
  parent_guid: string
}

export interface ICommentDetail {
  /**
   * 是否为系统发送
   */
  by_sys: EnumBoolean
  /**
   * 评论时间
   * 字符串时格式：YYYY-MM-DD hh:mm:ss
   * @default new Date()
   */
  create_time: string
  group_role: number
  have_praise: number
  headurl: string
  more_sub: 0
  /** 评论文字 */
  msg_content: string
  /** 评论图片 */
  msg_pictrueurl: string[]
  /** 评论视频 */
  msg_videourl: string
  /** 评论ID */
  msgid: string
  /** 小经费内昵称 */
  nickname: string
  /** 微信昵称 */
  origin_name: string
  /** 不知道啥list */
  praise_list: any[]
  /** */
  praise_num: number
  /** 子评论 */
  subcomment_list: ICommentDetail[]
  subcomment_num: number
  /** 是否制定 */ 
  top_set: EnumBoolean
  unionid: string
}
