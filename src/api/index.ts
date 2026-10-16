import request from '@/axios'

// 注册
export const registerApi = (data: any): Promise<any> => {
  return request.post({ url: '/api/v1/register', data })
}

// 发送验证码
export const sendCodeApi = (data: any): Promise<any> => {
  return request.post({ url: '/api/v1/send-code', data })
}
