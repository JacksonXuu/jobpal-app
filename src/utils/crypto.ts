/**
 * RSA 加解密工具（基于 jsencrypt 纯 JS 实现，跨平台兼容）
 * Mock 阶段：浏览器本地生成密钥对，生产环境替换为服务端公钥
 */
import JSEncrypt from 'jsencrypt'

let publicKeyPem: string | null = null
let privateKeyPem: string | null = null
let ensureKeysPromise: Promise<void> | null = null

/**
 * 加载或生成 RSA 密钥对（带异步锁防竞态）
 */
async function ensureKeys(): Promise<void> {
  if (publicKeyPem && privateKeyPem) return
  if (ensureKeysPromise) return ensureKeysPromise

  ensureKeysPromise = (async () => {
    // 尝试从 localStorage 恢复
    const storedPub = uni.getStorageSync('rsa_pub_pem')
    const storedPrv = uni.getStorageSync('rsa_prv_pem')

    if (storedPub && storedPrv) {
      publicKeyPem = storedPub
      privateKeyPem = storedPrv
      return
    }

    // 生成新密钥对（2048 位，兼容 Firefox 和现代安全标准）
    const crypt = new JSEncrypt({ default_key_size: '2048' })
    crypt.getKey()

    publicKeyPem = crypt.getPublicKey()
    privateKeyPem = crypt.getPrivateKey()

    if (!publicKeyPem || !privateKeyPem) {
      throw new Error('密钥生成失败')
    }

    uni.setStorageSync('rsa_pub_pem', publicKeyPem)
    uni.setStorageSync('rsa_prv_pem', privateKeyPem)
  })()

  await ensureKeysPromise
  ensureKeysPromise = null
}

/**
 * RSA 加密（OAEP 填充，跨平台兼容）
 */
export async function encryptPassword(password: string): Promise<string> {
  await ensureKeys()
  const crypt = new JSEncrypt()
  crypt.setPublicKey(publicKeyPem!)
  const encrypted = crypt.encrypt(password)
  if (encrypted === false) {
    throw new Error('密码加密失败')
  }
  return encrypted as string
}

/**
 * RSA 解密（仅 mock 阶段使用，生产环境由服务端解密）
 */
export async function decryptPassword(ciphertext: string): Promise<string> {
  await ensureKeys()
  const crypt = new JSEncrypt()
  crypt.setPrivateKey(privateKeyPem!)
  const decrypted = crypt.decrypt(ciphertext)
  if (decrypted === false || decrypted === null) {
    throw new Error('密码解密失败')
  }
  return decrypted
}
