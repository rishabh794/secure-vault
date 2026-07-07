# Master Password Flow

## Overview

The master password is a dedicated credential used to unlock a per-user vault key. Vault items are encrypted with the vault key, not with the master password directly. This provides consistent unlock behavior, enables rotation of the master password without re-encrypting all items, and supports safe migration of legacy items.

## Key Concepts

- Master password: User-entered secret used to unlock the vault key.
- Vault key: Random 256-bit key used to encrypt/decrypt vault items.
- Encryption version: Tracks the encryption scheme used for each item.
  - Version 1: Legacy items encrypted directly with master password.
  - Version 2: Current items encrypted with vault key.

## Data Model

- User fields:
  - masterPasswordHash: bcrypt hash of the master password (server validation only).
  - vaultKeyEncrypted: vault key encrypted with the master password.
  - vaultKeyVersion: reserved for future upgrades (current default: 1).
- VaultItem fields:
  - encryptedData: ciphertext payload.
  - encryptionVersion: version indicator (default 1, upgraded to 2 after migration).

## Core Flows

### 1) First-time setup (no master password)

1. Client collects master password.
2. Server generates a vault key and encrypts it with the master password.
3. Server stores masterPasswordHash + vaultKeyEncrypted.
4. Client decrypts vaultKeyEncrypted using the master password and keeps vault key in memory.

### 2) Unlock vault

1. Client submits master password to verify endpoint.
2. Server validates masterPasswordHash and returns vaultKeyEncrypted.
3. Client decrypts vaultKeyEncrypted and stores vault key in memory.
4. Client decrypts items with vault key (version 2).

### 3) Legacy migration (version 1 -> 2)

1. During unlock, items with encryptionVersion 1 are decrypted using the master password.
2. Client re-encrypts those items with the vault key.
3. Client updates each item with encryptionVersion 2.
4. Items that fail migration remain locked and are reported to the user.

### 4) Change master password

1. Client submits current + new master password.
2. Server validates current master password.
3. Server decrypts vaultKeyEncrypted using current master password.
4. Server re-encrypts vault key with new master password and updates masterPasswordHash.

## API Endpoints

- GET /api/master-password/status
  - Returns whether a master password is set.
- POST /api/master-password/setup
  - Sets the master password and creates vault key.
  - If the user has existing items, a legacy password can be accepted for migration.
- POST /api/master-password/verify
  - Validates the master password and returns vaultKeyEncrypted.
- POST /api/master-password/change
  - Changes the master password by re-encrypting the vault key.

## Security Notes

- The vault key is never stored in sessionStorage or localStorage.
- The master password is never stored; only its bcrypt hash is stored.
- The vault key is always encrypted at rest (vaultKeyEncrypted).
- Unlock operations should be rate-limited server-side in production.

## Export/Import

- Export: vault is unlocked with master password, items are decrypted with the vault key, and the backup file is encrypted using a separate backup password.
- Import: backup file is decrypted with the backup password, then items are encrypted with the vault key and stored as version 2.

## UX Summary

- Users set a master password once.
- Users unlock the vault with the master password each session.
- Legacy items are automatically upgraded after the first successful unlock.
- Users can change the master password without re-encrypting all items.

## Testing Checklist

- New user setup and unlock.
- Wrong master password handling.
- Legacy items migrate to version 2.
- Change master password preserves access to items.
- Export and import with backup password.
