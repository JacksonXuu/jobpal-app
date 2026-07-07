/**
 * uni.request 拦截器封装（骨架）
 * 当前为 mock 阶段，后续接入真实 API 时完善：
 * - 自动从 Pinia store 读取 token 附加到 Authorization 头
 * - 响应 code !== 0 时统一 toast 错误
 * - 401 时清除登录态并跳转登录页
 */
import { useAuthStore } from '@/stores/auth'

/** 请求配置 */
interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: Record<string, unknown>
  header?: Record<string, string>
}

/** 统一响应格式 */
interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

/** Base URL（由环境变量注入） */
const BASE_URL = import.meta.env.VITE_API_BASE_URL

/**
 * 通用请求方法
 * - 自动附加 Bearer token
 * - 401 时自动登出并跳转登录页
 * - 响应 code !== 0 时 toast 错误信息
 */
export function request<T = unknown>(options: RequestOptions): Promise<ApiResponse<T>> {
  return new Promise((resolve, reject) => {
    const token = useAuthStore().token

    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.header,
      },
      success: (res) => {
        const { statusCode, data } = res
        const body = data as ApiResponse<T>

        if (statusCode === 401) {
          // 登录/注册接口的 401 是密码错误或用户不存在，透传后端消息
          const isAuthEndpoint = options.url.includes('/v1/auth/')
          if (isAuthEndpoint) {
            uni.showToast({ title: body.message || '认证失败', icon: 'none' })
            reject(new Error(body.message || '认证失败'))
            return
          }
          // 其他接口的 401 是 token 过期，清除登录态
          try {
            useAuthStore().logout()
          } catch {
            console.warn('[request] logout failed on 401')
          }
          // 避免在登录页重复跳转
          const pages = getCurrentPages()
          const currentPage = pages[pages.length - 1]
          if (currentPage && currentPage.route !== 'pages/login/login') {
            uni.reLaunch({ url: '/pages/login/login' })
          }
          reject(new Error('登录已过期'))
          return
        }

        if (body.code !== 0) {
          uni.showToast({ title: body.message || '请求失败', icon: 'none' })
          reject(new Error(body.message))
          return
        }

        resolve(body)
      },
      fail: (err) => {
        uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
        reject(err)
      },
    })
  })
}
