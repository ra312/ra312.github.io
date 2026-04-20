/**
 * Master-password encryption for private posts (Web Crypto).
 * AES-GCM-256 + PBKDF2 (SHA-256, 100000 iterations).
 */
(function (global) {
  const PBKDF2_ITERATIONS = 100000;
  const SALT_BYTES = 16;
  const IV_BYTES = 12;
  const KEY_BITS = 256;

  function bytesToBase64(bytes) {
    let binary = '';
    bytes.forEach(function (b) { binary += String.fromCharCode(b); });
    return btoa(binary);
  }

  function base64ToBytes(b64) {
    const binary = atob(b64);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
    return out;
  }

  async function deriveKey(password, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: PBKDF2_ITERATIONS,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: KEY_BITS },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * @returns {Promise<{ v: number, salt: string, iv: string, ciphertext: string }>}
   */
  async function encryptPrivateBody(password, plaintext) {
    const enc = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
    const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
    const key = await deriveKey(password, salt);
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      enc.encode(plaintext)
    );
    return {
      v: 1,
      salt: bytesToBase64(salt),
      iv: bytesToBase64(iv),
      ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
    };
  }

  /**
   * @param {object} blob — output of encryptPrivateBody
   * @returns {Promise<string>} decrypted UTF-8 text
   */
  async function decryptPrivateBody(password, blob) {
    if (!blob || blob.v !== 1) throw new Error('Unsupported encrypted payload');
    const salt = base64ToBytes(blob.salt);
    const iv = base64ToBytes(blob.iv);
    const raw = base64ToBytes(blob.ciphertext);
    const key = await deriveKey(password, salt);
    const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, raw);
    return new TextDecoder().decode(plainBuf);
  }

  global.BlogCrypto = {
    encryptPrivateBody: encryptPrivateBody,
    decryptPrivateBody: decryptPrivateBody,
  };
})(typeof window !== 'undefined' ? window : globalThis);
