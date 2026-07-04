import Mock from 'mockjs'
import { encryptPassword, decryptPassword } from '@/utils/crypto'

// ── 校验常量 ──
export const USERNAME_MIN = 3
export const USERNAME_MAX = 20
export const PASSWORD_MIN = 6
export const PASSWORD_MAX = 20

// ── 类型 ──
/** 本地存储的用户记录（明文密码不入库，仅存 RSA 密文） */
interface StoredUser {
  id: string
  username: string
  encryptedPassword: string
}

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

// ── 模拟数据库 ──
/** 从 localStorage 读取用户列表 */
function getUsers(): StoredUser[] {
  try {
    const data = uni.getStorageSync('mock_users')
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

/** 持久化用户列表到 localStorage */
function saveUsers(users: StoredUser[]) {
  uni.setStorageSync('mock_users', JSON.stringify(users))
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

/** 生成 mock token，接入真实后端后替换为 JWT */
function generateToken(): string {
  return 'mock_token_' + Mock.Random.guid()
}

// ── API ──
/**
 * 用户登录
 * - 从 localStorage 查找用户
 * - RSA 解密存储的密文后比对明文（OAEP 每次加密结果不同，不能直接比密文）
 * @throws 用户不存在 / 密码错误
 */
export async function login(params: LoginParams): Promise<AuthResult> {
  // 模拟网络延迟
  await new Promise((r) => setTimeout(r, Mock.Random.integer(200, 500)))

  const users = getUsers()
  const user = users.find((u) => u.username === params.username)

  if (!user) {
    throw new Error('用户不存在')
  }

  try {
    const decrypted = await decryptPassword(user.encryptedPassword)
    if (params.password !== decrypted) {
      throw new Error('密码错误')
    }
  } catch {
    throw new Error('密码错误')
  }

  return {
    token: generateToken(),
    userInfo: { id: user.id, username: user.username },
  }
}

/**
 * 用户注册
 * - 校验用户名和密码格式
 * - 检查用户名是否已存在
 * - RSA 加密后存储密文
 * @throws 校验失败 / 用户名已存在
 */
export async function register(params: RegisterParams): Promise<AuthResult> {
  // 模拟网络延迟
  await new Promise((r) => setTimeout(r, Mock.Random.integer(200, 500)))

  const nameError = validateUsername(params.username)
  if (nameError) throw new Error(nameError)

  const pwdError = validatePassword(params.password)
  if (pwdError) throw new Error(pwdError)

  const users = getUsers()

  if (users.some((u) => u.username === params.username)) {
    throw new Error('用户名已存在')
  }

  const newUser: StoredUser = {
    id: Mock.Random.guid(),
    username: params.username,
    encryptedPassword: await encryptPassword(params.password),
  }

  users.push(newUser)
  saveUsers(users)

  return {
    token: generateToken(),
    userInfo: { id: newUser.id, username: newUser.username },
  }
}
