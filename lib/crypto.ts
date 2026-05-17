import CryptoJS from 'crypto-js';

const SALT_SIZE = 128 / 8; 
const KEY_SIZE = 256 / 32; 
const ITERATIONS = 10000; 
const VAULT_ITEM_ENCRYPTION_VERSION = 2;

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
    if (!jsonString) {
        throw new Error('Invalid master password or corrupted data.');
    }
    return JSON.parse(jsonString) as T;
}

/**
 * Generates a random 256-bit vault key encoded as hex.
 */
function generateVaultKey(): string {
    return CryptoJS.lib.WordArray.random(32).toString();
}

/**
 * Encrypts data with a raw vault key (hex), storing iv:ciphertext.
 */
function encryptWithKey(data: object, vaultKeyHex: string): string {
    const key = CryptoJS.enc.Hex.parse(vaultKeyHex);
    const iv = CryptoJS.lib.WordArray.random(128 / 8);
    const jsonString = JSON.stringify(data);

    const encrypted = CryptoJS.AES.encrypt(jsonString, key, {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
    });

    return iv.toString() + encrypted.toString();
}

/**
 * Decrypts data with a raw vault key (hex) from iv:ciphertext.
 */
function decryptWithKey<T>(encryptedString: string, vaultKeyHex: string): T {
    const iv = CryptoJS.enc.Hex.parse(encryptedString.substring(0, 32));
    const encrypted = encryptedString.substring(32);
    const key = CryptoJS.enc.Hex.parse(vaultKeyHex);

    const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
    });

    const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
    if (!jsonString) {
        throw new Error('Invalid vault key or corrupted data.');
    }
    return JSON.parse(jsonString) as T;
}

export {
    encryptData,
    decryptData,
    generateVaultKey,
    encryptWithKey,
    decryptWithKey,
    VAULT_ITEM_ENCRYPTION_VERSION
};