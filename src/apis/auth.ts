import { request } from '@/utils/request'

// ── 校验常量 ──
export const USERNAME_MIN = 2
export const USERNAME_MAX = 20
export const PASSWORD_MIN = 6
export const PASSWORD_MAX = 20

// ── 类型 ──
/** 登录请求参数 */
export interface LoginParams {
  username: string
  password: string
}

/** 注册请求参数 */
export interface RegisterParams {
  username: string
  password: string
}

/** 认证成功返回 */
export interface AuthResult {
  token: string
  userInfo: {
    id: string
    username: string
  }
}

// ── 校验 ──
/**
 * 用户名校验
 * @returns null 表示通过，string 为错误提示
 */
export function validateUsername(username: string): string | null {
  if (!username || username.length < USERNAME_MIN || username.length > USERNAME_MAX) {
    return `用户名需 ${USERNAME_MIN}-${USERNAME_MAX} 位`
  }
  if (!/^[\w一-龥]+$/.test(username)) {
    return '用户名只能包含字母、数字、下划线或中文'
  }
  if (username.toLowerCase() === 'admin') {
    return '该用户名已被保留'
  }
  return null
}

/**
 * 密码校验
 * @returns null 表示通过，string 为错误提示
 */
export function validatePassword(password: string): string | null {
  if (!password || password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
    return `密码需 ${PASSWORD_MIN}-${PASSWORD_MAX} 位`
  }
  return null
}

// ── API ──
/**
 * 用户登录
 * POST /v1/auth/login → { access_token, user: { id, username } }
 * @throws 用户名或密码错误
 */
export async function login(params: LoginParams): Promise<AuthResult> {
  const res = await request<{ access_token: string; user: { id: string; username: string } }>({
    url: '/v1/auth/login',
    method: 'POST',
    data: params as unknown as Record<string, unknown>,
  })
  return {
    token: res.data.access_token,
    userInfo: res.data.user,
  }
}

/**
 * 用户注册（注册成功后自动登录）
 * POST /v1/auth/register → POST /v1/auth/login
 * @throws 校验失败 / 用户名已存在
 */
export async function register(params: RegisterParams): Promise<AuthResult> {
  await request({
    url: '/v1/auth/register',
    method: 'POST',
    data: params as unknown as Record<string, unknown>,
  })
  // 注册不返回 token，自动登录
  return login(params)
}

/**
 * 退出登录
 * POST /v1/auth/logout → 服务端注销 token
 */
export async function logoutApi(): Promise<void> {
  await request({
    url: '/v1/auth/logout',
    method: 'POST',
  })
}

/**
 * 注销账号
 * DELETE /v1/auth/account → 永久删除账号
 */
export async function deleteAccount(): Promise<void> {
  await request({
    url: '/v1/auth/account',
    method: 'DELETE',
  })
}
