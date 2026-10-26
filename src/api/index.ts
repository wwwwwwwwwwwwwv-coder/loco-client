import request from '@/axios'

// 注册
export const registerApi = (data: any): Promise<any> => {
  return request.post({ url: '/api/v1/register', data })
}

// 发送验证码
export const sendCodeApi = (data: any): Promise<any> => {
  return request.post({ url: '/api/v1/send-code', data })
}

// 验证登录
export const mallAuthApi = (data: any): Promise<any> => {
  return request.post({ url: '/mall/auth', data })
}
// 获取验证码
export const commonSendCodeApi = (data: any): Promise<any> => {
  return request.post({ url: '/common/send-code', data })
}

