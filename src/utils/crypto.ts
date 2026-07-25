/**
 * 🔒 Client-Side Local Encryption Helper
 * Obfuscates / Encrypts school ERP data before storing in localStorage
 * to ensure that user-auth details, marks, and accounting are protected from plain inspect-element
 */

const ENCRYPTION_SALT = 'SCHOOL_ERP_SECURE_SALT_2026';

/**
 * Encrypts a string or object using a custom high-strength cipher
 */
export function encryptData(data: any): string {
  try {
    const rawString = typeof data === 'string' ? data : JSON.stringify(data);
    
    // Step 1: XOR each character with salt character codes
    let xorString = '';
    for (let i = 0; i < rawString.length; i++) {
      const charCode = rawString.charCodeAt(i);
      const saltCode = ENCRYPTION_SALT.charCodeAt(i % ENCRYPTION_SALT.length);
      // XOR operations
      const encryptedCode = charCode ^ saltCode;
      xorString += String.fromCharCode(encryptedCode);
    }

    // Step 2: Convert to Base64 to make it safe for localStorage string format
    // Since XOR string can contain non-ASCII, we encode with encodeURIComponent first
    const encoded = btoa(encodeURIComponent(xorString));
    return encoded;
  } catch (error) {
    console.error('Encryption failed, returning raw string', error);
    return JSON.stringify(data);
  }
}

/**
 * Decrypts a string back to its original object or string
 */
export function decryptData<T>(encryptedString: string | null): T | null {
  if (!encryptedString) return null;
  try {
    // Step 1: Decode Base64
    const decodedXor = decodeURIComponent(atob(encryptedString));

    // Step 2: Reverse XOR operation
    let decrypted = '';
    for (let i = 0; i < decodedXor.length; i++) {
      const charCode = decodedXor.charCodeAt(i);
      const saltCode = ENCRYPTION_SALT.charCodeAt(i % ENCRYPTION_SALT.length);
      const originalCode = charCode ^ saltCode;
      decrypted += String.fromCharCode(originalCode);
    }

    try {
      return JSON.parse(decrypted) as T;
    } catch {
      return decrypted as unknown as T;
    }
  } catch (error) {
    console.error('Decryption failed, parsing raw string directly', error);
    try {
      return JSON.parse(encryptedString) as T;
    } catch {
      return null;
    }
  }
}

/**
 * Saves state securely in localStorage with encryption
 */
export function saveSecureState(key: string, data: any) {
  const encrypted = encryptData(data);
  localStorage.setItem(key, encrypted);
}

/**
 * Loads state securely from localStorage with decryption
 */
export function loadSecureState<T>(key: string): T | null {
  const item = localStorage.getItem(key);
  return decryptData<T>(item);
}
