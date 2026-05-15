import os
import base64

from cryptography.hazmat.primitives.ciphers.aead import AESGCM


def _get_key() -> bytes:
    hex_key = os.environ["PLAID_TOKEN_ENCRYPTION_KEY"]
    return bytes.fromhex(hex_key)


def encrypt_token(plaintext: str) -> str:
    """Encrypt a Plaid access token. Returns a base64-encoded nonce+ciphertext string."""
    key = _get_key()
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)  # 96-bit nonce required for GCM
    ciphertext = aesgcm.encrypt(nonce, plaintext.encode(), None)
    return base64.b64encode(nonce + ciphertext).decode()


def decrypt_token(encrypted: str) -> str:
    """Decrypt a Plaid access token from its base64-encoded nonce+ciphertext string."""
    key = _get_key()
    aesgcm = AESGCM(key)
    raw = base64.b64decode(encrypted)
    nonce, ciphertext = raw[:12], raw[12:]
    return aesgcm.decrypt(nonce, ciphertext, None).decode()
