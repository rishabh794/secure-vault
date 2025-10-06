import CryptoJS from 'crypto-js';

const SALT_SIZE = 128 / 8; 
const KEY_SIZE = 256 / 32; 
const ITERATIONS = 10000; 

/**
 * Encrypts data object using a master password.
 * @param data The object to encrypt.
 * @param masterPassword The user's master password.
 * @returns A string containing salt:iv:ciphertext.
 */
function encryptData(data: object, masterPassword: string): string {
    const salt = CryptoJS.lib.WordArray.random(SALT_SIZE);

    const key = CryptoJS.PBKDF2(masterPassword, salt, {
        keySize: KEY_SIZE,
        iterations: ITERATIONS
    });

    const iv = CryptoJS.lib.WordArray.random(128 / 8);
    const jsonString = JSON.stringify(data);
    
    const encrypted = CryptoJS.AES.encrypt(jsonString, key, { 
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
    });

    const combined = salt.toString() + iv.toString() + encrypted.toString();
    return combined;
}

/**
 * Decrypts a string into an object using a master password.
 * @param encryptedString The string to decrypt (salt:iv:ciphertext).
 * @param masterPassword The user's master password.
 * @returns The decrypted data object.
 */
function decryptData<T>(encryptedString: string, masterPassword: string): T {
    const salt = CryptoJS.enc.Hex.parse(encryptedString.substr(0, 32));
    const iv = CryptoJS.enc.Hex.parse(encryptedString.substr(32, 32));
    const encrypted = encryptedString.substring(64);

    const key = CryptoJS.PBKDF2(masterPassword, salt, {
        keySize: KEY_SIZE,
        iterations: ITERATIONS
    });

    const decrypted = CryptoJS.AES.decrypt(encrypted, key, { 
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
    });

    const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
    return JSON.parse(jsonString) as T;
}

export {encryptData , decryptData};