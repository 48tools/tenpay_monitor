import axios, { AxiosError, AxiosResponse } from 'axios'
import * as qs from 'querystring'
import isPlainObject from 'lodash/isPlainObject'
import sysConfig from '../config'
import { IBaseResponse } from './types'
import logger from '../logger'

const request = axios.create({
  baseURL: 'https://groupaccount.tenpay.com/fcgi-bin',
})

function onResponse(resp: AxiosResponse<IBaseResponse>): AxiosResponse<any> {
  const { data } = resp
  try {
    if (data.retcode !== '0') {
      logger.error({
        response: {
          data,
          headers: resp.headers,
          status: resp.status,
        },
        request: {
          url: resp.config.url,
          params: resp.config.params,
          data: resp.config.data,
        },
      }, 'Seems got an unexpected response data.')
    }
  } catch (e) {
    logger.error(e, 'Not valid response data but something went wrong when recording messages.')
  }
  return resp
}

request.interceptors.response.use(onResponse, (err: AxiosError) => {
  logger.fatal(err, 'Axios error, request failed.')

  return err
})

request.interceptors.request.use((config) => {
  const cookie = `grp_qlskey=${sysConfig.cookie.qlskey};grp_qluin=${sysConfig.cookie.qluin}`

  config.headers = {
    'host': 'groupaccount.tenpay.com',
    'accept': '*/*',
    'referer': 'https://servicewechat.com/wxcf8e5b328359cb7a/193/page-frame.html',
    // eslint-disable-next-line
    'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.5(0x17000523) NetType/WIFI Language/zh_CN',
    ...config.headers,
    cookie,
  }

  if (config.data && isPlainObject(config.data)) {
    config.data = qs.stringify(config.data)
  }

  return config
})

export default request

