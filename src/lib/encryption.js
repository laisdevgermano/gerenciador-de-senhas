import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'

function getKey() {
  const key = process.env.ENCRYPTION_KEY
  if (!key || key.length < 64) {
    throw new Error('ENCRYPTION_KEY must be a 32-byte hex string (64 chars)')
  }
  return Buffer.from(key, 'hex')
}

export function encrypt(plaintext) {
  const key = getKey()
  const iv = randomBytes(16)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`
}

export function decrypt(ciphertext) {
  if (!ciphertext || !ciphertext.includes(':')) return ciphertext
  const key = getKey()
  const [ivHex, authTagHex, encHex] = ciphertext.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const encrypted = Buffer.from(encHex, 'hex')
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
  return decrypted.toString('utf8')
}
