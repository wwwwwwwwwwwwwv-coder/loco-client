import type {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosRequestHeaders
} from 'axios'
import axios from 'axios'
import {config} from './config'

import {notification} from 'ant-design-vue';
// import {useConfigStore} from "@/stores/config.ts";
// import {useLocaleStoreWithOut} from "@/stores/locale.ts";

const {result_code, base_url} = config
const basePath: BasePathType = import.meta.env.VITE_API_BASEPATH
const PATH_URL = base_url[basePath]

// const configStore = useConfigStore()
// const localeStore = useLocaleStoreWithOut()
// const locale = localeStore.getLocale

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: PATH_URL,
  timeout: config.request_timeout
})

// request拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    ;(config.headers as AxiosRequestHeaders)['version'] = '1.0.0+1'
    // ;(config.headers as AxiosRequestHeaders)['gat-api-token'] = configStore.token
    // ;(config.headers as AxiosRequestHeaders)['lang'] = locale.lang
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// response 拦截器
service.interceptors.response.use(
  async (response: AxiosResponse) => {
    const _data = response.data
    if (response.config.responseType === 'blob') {
      return response
    } else if (_data.code === result_code) {
      return _data
    } else {
      notification.error({
        message: 'Network error',
        description: _data?.message || 'Unknown Error',
      });
      return Promise.reject(_data.message)
    }
  },
  (error: AxiosError) => {
    console.log(`err${error}`) // for debug
    return Promise.reject(error)
  }
)

export {service}
