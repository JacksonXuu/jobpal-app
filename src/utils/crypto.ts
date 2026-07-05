/**
 * 密码加密工具
 * 当前后端使用 bcrypt 服务端哈希，前端暂不做客户端加密。
 * 后续如需客户端 RSA 加密，服务端下发公钥后在此实现。
 */

/**
 * 透传密码（占位，后续替换为 RSA 加密）
 */
export async function encryptPassword(password: string): Promise<string> {
  return password
}

/**
 * 客户端解密已废弃（服务端使用 bcrypt 单向哈希）
 * @deprecated
 */
export async function decryptPassword(_ciphertext: string): Promise<string> {
  throw new Error('客户端解密已废弃，密码验证由服务端处理')
}
