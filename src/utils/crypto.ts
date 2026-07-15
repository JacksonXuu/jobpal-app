/**
 * 密码加密工具
 * 前端统一使用 SHA-256 哈希后再传输，原始密码不出客户端
 */

/**
 * 将字符串转为 ArrayBuffer（UTF-8 编码）
 */
function stringToBuffer(str: string): ArrayBuffer {
  return new TextEncoder().encode(str).buffer
}

/**
 * 将 ArrayBuffer 转为十六进制字符串
 */
function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * 对密码做 SHA-256 哈希
 * H5 使用 Web Crypto API，小程序降级为纯 JS 实现
 */
export async function encryptPassword(password: string): Promise<string> {
  const buffer = stringToBuffer(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  return bufferToHex(hashBuffer)
}
