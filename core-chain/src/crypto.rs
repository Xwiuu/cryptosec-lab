use ed25519_dalek::{
    Signature, Signer, SigningKey, Verifier, VerifyingKey, PUBLIC_KEY_LENGTH, SECRET_KEY_LENGTH,
    SIGNATURE_LENGTH,
};
use rand::rngs::OsRng;
use sha2::{Digest, Sha256};
use thiserror::Error;

pub const ADDRESS_LENGTH: usize = 32;

#[derive(Error, Debug)]
pub enum CryptoError {
    #[error("Invalid key length: {0}")]
    InvalidKeyLength(usize),
    #[error("Invalid signature")]
    InvalidSignature,
    #[error("Invalid address")]
    InvalidAddress,
    #[error("Hash error: {0}")]
    HashError(String),
}

pub fn hash_sha256(data: &[u8]) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(data);
    let result = hasher.finalize();
    let mut output = [0u8; 32];
    output.copy_from_slice(&result);
    output
}

pub fn hash_sha256_hex(data: &[u8]) -> String {
    hex::encode(hash_sha256(data))
}

pub fn hash_blake3(data: &[u8]) -> [u8; 32] {
    let hash = blake3::hash(data);
    let mut output = [0u8; 32];
    output.copy_from_slice(hash.as_bytes());
    output
}

pub fn hash_blake3_hex(data: &[u8]) -> String {
    hex::encode(hash_blake3(data))
}

pub fn generate_keypair() -> (SigningKey, VerifyingKey) {
    let secret = secure_random_bytes::<32>();
    let signing_key = SigningKey::from_bytes(&secret);
    let verifying_key = signing_key.verifying_key();
    (signing_key, verifying_key)
}

pub fn sign_message(signing_key: &SigningKey, message: &[u8]) -> Signature {
    signing_key.sign(message)
}

pub fn verify_signature(public_key: &VerifyingKey, message: &[u8], signature: &Signature) -> bool {
    public_key.verify(message, signature).is_ok()
}

pub fn generate_address(public_key: &VerifyingKey) -> String {
    let pub_bytes = public_key.as_bytes();
    let hash = hash_sha256(pub_bytes);
    let hash2 = hash_sha256(&hash);
    let mut addr_bytes = [0u8; 25];
    addr_bytes[0] = 0x00;
    addr_bytes[1..21].copy_from_slice(&hash2[..20]);
    let checksum = hash_sha256(&addr_bytes[..21])[..4].to_vec();
    addr_bytes[21..25].copy_from_slice(&checksum);
    bs58::encode(&addr_bytes[..25]).into_string()
}

pub fn public_key_to_bytes(pk: &VerifyingKey) -> Vec<u8> {
    pk.as_bytes().to_vec()
}

pub fn bytes_to_public_key(bytes: &[u8]) -> Result<VerifyingKey, CryptoError> {
    if bytes.len() != PUBLIC_KEY_LENGTH {
        return Err(CryptoError::InvalidKeyLength(bytes.len()));
    }
    let mut arr = [0u8; PUBLIC_KEY_LENGTH];
    arr.copy_from_slice(bytes);
    VerifyingKey::from_bytes(&arr).map_err(|_| CryptoError::InvalidKeyLength(bytes.len()))
}

pub fn signing_key_from_bytes(bytes: &[u8]) -> Result<SigningKey, CryptoError> {
    if bytes.len() != SECRET_KEY_LENGTH {
        return Err(CryptoError::InvalidKeyLength(bytes.len()));
    }
    let mut arr = [0u8; SECRET_KEY_LENGTH];
    arr.copy_from_slice(bytes);
    Ok(SigningKey::from_bytes(&arr))
}

pub fn signature_from_bytes(bytes: &[u8]) -> Result<Signature, CryptoError> {
    if bytes.len() != SIGNATURE_LENGTH {
        return Err(CryptoError::InvalidKeyLength(bytes.len()));
    }
    let mut arr = [0u8; SIGNATURE_LENGTH];
    arr.copy_from_slice(bytes);
    Signature::from_slice(&arr).map_err(|_| CryptoError::InvalidSignature)
}

pub fn secure_random_bytes<const N: usize>() -> [u8; N] {
    use rand::RngCore;
    let mut rng = OsRng;
    let mut bytes = [0u8; N];
    rng.fill_bytes(&mut bytes);
    bytes
}

pub fn derive_key_from_password(password: &str, salt: &[u8]) -> [u8; 32] {
    let mut data = Vec::new();
    data.extend_from_slice(password.as_bytes());
    data.extend_from_slice(salt);
    hash_sha256(&data)
}

pub fn encrypt_data(key: &[u8; 32], data: &[u8]) -> Vec<u8> {
    let xor_key = hash_sha256(key);
    data.iter()
        .enumerate()
        .map(|(i, b)| b ^ xor_key[i % 32])
        .collect()
}

pub fn decrypt_data(key: &[u8; 32], data: &[u8]) -> Vec<u8> {
    encrypt_data(key, data)
}

pub fn is_valid_address(address: &str) -> bool {
    let bytes = match bs58::decode(address).into_vec() {
        Ok(b) => b,
        Err(_) => return false,
    };
    if bytes.len() != 25 {
        return false;
    }
    let checksum = hash_sha256(&bytes[..21])[..4].to_vec();
    bytes[21..25] == checksum
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hash_sha256() {
        let hash = hash_sha256_hex(b"hello");
        assert_eq!(hash.len(), 64);
        assert_eq!(
            hash,
            "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
        );
    }

    #[test]
    fn test_generate_keypair() {
        let (sk, pk) = generate_keypair();
        assert_eq!(sk.as_bytes().len(), 32);
        assert_eq!(pk.as_bytes().len(), 32);
    }

    #[test]
    fn test_sign_and_verify() {
        let (sk, pk) = generate_keypair();
        let message = b"test message";
        let signature = sign_message(&sk, message);
        assert!(verify_signature(&pk, message, &signature));
    }

    #[test]
    fn test_verify_fails_wrong_key() {
        let (sk, _) = generate_keypair();
        let (_, pk2) = generate_keypair();
        let message = b"test message";
        let signature = sign_message(&sk, message);
        assert!(!verify_signature(&pk2, message, &signature));
    }

    #[test]
    fn test_generate_address() {
        let (_, pk) = generate_keypair();
        let address = generate_address(&pk);
        assert!(is_valid_address(&address));
    }

    #[test]
    fn test_encrypt_decrypt() {
        let key = secure_random_bytes::<32>();
        let data = b"sensitive data";
        let encrypted = encrypt_data(&key, data);
        let decrypted = decrypt_data(&key, &encrypted);
        assert_eq!(&decrypted, data);
    }

    #[test]
    fn test_blake3() {
        let hash = hash_blake3_hex(b"hello");
        assert_eq!(hash.len(), 64);
    }
}
