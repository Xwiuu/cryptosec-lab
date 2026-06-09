use ed25519_dalek::{SigningKey, VerifyingKey};

use crate::crypto;
use crate::errors::BlockchainError;
use crate::transaction::Transaction;

#[derive(Debug, Clone)]
pub struct Wallet {
    signing_key: SigningKey,
    verifying_key: VerifyingKey,
    address: String,
}

impl Wallet {
    pub fn generate() -> Self {
        let (signing_key, verifying_key) = crypto::generate_keypair();
        let address = crypto::generate_address(&verifying_key);
        Wallet {
            signing_key,
            verifying_key,
            address,
        }
    }

    pub fn from_seed(seed: &[u8; 32]) -> Self {
        let signing_key = SigningKey::from_bytes(seed);
        let verifying_key = signing_key.verifying_key();
        let address = crypto::generate_address(&verifying_key);
        Wallet {
            signing_key,
            verifying_key,
            address,
        }
    }

    pub fn from_private_key_bytes(bytes: &[u8]) -> Result<Self, BlockchainError> {
        let signing_key =
            crypto::signing_key_from_bytes(bytes).map_err(|_| BlockchainError::InvalidSignature)?;
        let verifying_key = signing_key.verifying_key();
        let address = crypto::generate_address(&verifying_key);
        Ok(Wallet {
            signing_key,
            verifying_key,
            address,
        })
    }

    pub fn private_key_hex(&self) -> String {
        hex::encode(self.signing_key.to_bytes())
    }

    pub fn public_key_hex(&self) -> String {
        hex::encode(self.verifying_key.as_bytes())
    }

    pub fn address(&self) -> &str {
        &self.address
    }

    pub fn public_key(&self) -> &VerifyingKey {
        &self.verifying_key
    }

    pub fn signing_key(&self) -> &SigningKey {
        &self.signing_key
    }

    pub fn sign_transaction(&self, tx: &mut Transaction) {
        tx.sign(&self.signing_key, &self.verifying_key);
    }

    pub fn verify_message(&self, message: &[u8], signature_hex: &str) -> bool {
        let sig_bytes = match hex::decode(signature_hex) {
            Ok(b) => b,
            Err(_) => return false,
        };
        let sig = match crypto::signature_from_bytes(&sig_bytes) {
            Ok(s) => s,
            Err(_) => return false,
        };
        crypto::verify_signature(&self.verifying_key, message, &sig)
    }

    pub fn encrypt_private_key(&self, password: &str) -> Vec<u8> {
        let salt = crypto::secure_random_bytes::<16>();
        let key = crypto::derive_key_from_password(password, &salt);
        let sk_bytes = self.signing_key.to_bytes();
        let encrypted = crypto::encrypt_data(&key, &sk_bytes);
        let mut result = salt.to_vec();
        result.extend_from_slice(&encrypted);
        result
    }

    pub fn decrypt_private_key(
        encrypted: &[u8],
        password: &str,
    ) -> Result<[u8; 32], BlockchainError> {
        if encrypted.len() < 16 {
            return Err(BlockchainError::InvalidSignature);
        }
        let salt = &encrypted[..16];
        let data = &encrypted[16..];
        let key = crypto::derive_key_from_password(password, salt);
        let decrypted = crypto::decrypt_data(&key, data);
        if decrypted.len() != 32 {
            return Err(BlockchainError::InvalidSignature);
        }
        let mut sk_bytes = [0u8; 32];
        sk_bytes.copy_from_slice(&decrypted);
        Ok(sk_bytes)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_wallet() {
        let wallet = Wallet::generate();
        assert!(!wallet.address().is_empty());
        assert!(crypto::is_valid_address(wallet.address()));
    }

    #[test]
    fn test_wallet_from_seed() {
        let seed = crypto::secure_random_bytes::<32>();
        let wallet = Wallet::from_seed(&seed);
        assert!(crypto::is_valid_address(wallet.address()));
    }

    #[test]
    fn test_private_key_hex() {
        let wallet = Wallet::generate();
        let pk_hex = wallet.private_key_hex();
        assert_eq!(pk_hex.len(), 64);
    }

    #[test]
    fn test_recover_from_private_key() {
        let wallet1 = Wallet::generate();
        let pk_bytes = hex::decode(wallet1.private_key_hex()).unwrap();
        let wallet2 = Wallet::from_private_key_bytes(&pk_bytes).unwrap();
        assert_eq!(wallet1.address(), wallet2.address());
    }

    #[test]
    fn test_sign_transaction() {
        let wallet = Wallet::generate();
        let mut tx = Transaction::new(
            Some(wallet.address().to_string()),
            "recipient".to_string(),
            100,
            1,
            0,
            1337,
        );
        wallet.sign_transaction(&mut tx);
        assert!(tx.signature.is_some());
        assert!(tx.verify_signature().unwrap());
    }

    #[test]
    fn test_encrypt_decrypt_private_key() {
        let wallet = Wallet::generate();
        let password = "strong_password_123";
        let encrypted = wallet.encrypt_private_key(password);

        let decrypted = Wallet::decrypt_private_key(&encrypted, password).unwrap();
        let recovered = Wallet::from_private_key_bytes(&decrypted).unwrap();
        assert_eq!(wallet.address(), recovered.address());
    }

    #[test]
    fn test_decrypt_wrong_password() {
        let wallet = Wallet::generate();
        let encrypted = wallet.encrypt_private_key("correct_password");
        let result = Wallet::decrypt_private_key(&encrypted, "wrong_password");
        assert!(result.is_ok());
        let recovered = Wallet::from_private_key_bytes(&result.unwrap()).unwrap();
        assert_ne!(wallet.address(), recovered.address());
    }

    #[test]
    fn test_verify_message() {
        let wallet = Wallet::generate();
        let message = b"hello world";
        let sig = crypto::sign_message(wallet.signing_key(), message);
        let sig_hex = hex::encode(sig.to_bytes());
        assert!(wallet.verify_message(message, &sig_hex));
        assert!(!wallet.verify_message(b"other message", &sig_hex));
    }
}
