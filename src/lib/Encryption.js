import crypto from 'crypto'
import config from '../config'

export const decrypt = (encryptedText) => {
  if (!config.propnexAppKey) {
    throw new Error('PROPNEX_APP_KEY is not defined in configuration')
  }

  let key = config.propnexAppKey
  if (key.startsWith('base64:')) {
    key = Buffer.from(key.substring(7), 'base64')
  } else {
    if (key.length !== 32) {
      if (key.length === 64) {
        key = Buffer.from(key, 'hex')
      }
    }
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encryptedText, 'base64').toString('utf8')
    )

    if (!payload.iv || !payload.value) {
      throw new Error('Invalid encrypted payload structure')
    }

    const iv = Buffer.from(payload.iv, 'base64')
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)

    let decrypted = decipher.update(payload.value, 'base64', 'utf8')
    decrypted += decipher.final('utf8')

    return unserialize(decrypted)
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`)
  }
}

const unserialize = (data) => {
  if (typeof data !== 'string') return data

  // Handle PHP serialized string: s:length:"value";
  const stringMatch = data.match(/^s:(\d+):"([\s\S]*)";$/)
  if (stringMatch) {
    const len = parseInt(stringMatch[1], 10)
    const str = stringMatch[2]
    // Verify byte length matches the declared length
    if (Buffer.byteLength(str, 'utf8') === len) {
      return str
    }
  }

  // Handle PHP serialized integer: i:value;
  const intMatch = data.match(/^i:(\d+);$/)
  if (intMatch) {
    return parseInt(intMatch[1], 10)
  }

  return data
}
