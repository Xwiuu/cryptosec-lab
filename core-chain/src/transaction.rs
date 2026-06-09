use serde::{Deserialize, Serialize};

use crate::crypto::{bytes_to_public_key, hash_sha256_hex, signature_from_bytes, verify_signature};
use crate::errors::BlockchainError;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Transaction {
    pub from: Option<String>,
    pub to: String,
    pub amount: u64,
    pub fee: u64,
    pub timestamp: u64,
    pub nonce: u64,
    pub chain_id: u64,
    pub public_key: Option<String>,
    pub signature: Option<String>,
    pub tx_hash: String,
}

impl Transaction {
    pub fn new(
        from: Option<String>,
        to: String,
        amount: u64,
        fee: u64,
        nonce: u64,
        chain_id: u64,
    ) -> Self {
        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();
        let mut tx = Transaction {
            from,
            to,
            amount,
            fee,
            timestamp,
            nonce,
            chain_id,
            public_key: None,
            signature: None,
            tx_hash: String::new(),
        };
        tx.tx_hash = tx.calculate_hash();
        tx
    }

    pub fn calculate_hash(&self) -> String {
        let data = format!(
            "{}:{}:{}:{}:{}:{}:{}",
            self.from.as_deref().unwrap_or("coinbase"),
            self.to,
            self.amount,
            self.fee,
            self.timestamp,
            self.nonce,
            self.chain_id,
        );
        hash_sha256_hex(data.as_bytes())
    }

    pub fn sign(
        &mut self,
        signing_key: &ed25519_dalek::SigningKey,
        public_key: &ed25519_dalek::VerifyingKey,
    ) {
        let sig = ed25519_dalek::Signer::sign(signing_key, self.tx_hash.as_bytes());
        self.public_key = Some(hex::encode(public_key.as_bytes()));
        self.signature = Some(hex::encode(sig.to_bytes()));
    }

    pub fn verify_signature(&self) -> Result<bool, BlockchainError> {
        if self.is_coinbase() {
            return Ok(true);
        }
        let pub_hex = self
            .public_key
            .as_ref()
            .ok_or(BlockchainError::InvalidSignature)?;
        let sig_hex = self
            .signature
            .as_ref()
            .ok_or(BlockchainError::InvalidSignature)?;

        let pub_bytes = hex::decode(pub_hex).map_err(|_| BlockchainError::InvalidSignature)?;
        let sig_bytes = hex::decode(sig_hex).map_err(|_| BlockchainError::InvalidSignature)?;

        let pk = bytes_to_public_key(&pub_bytes)?;
        let sig = signature_from_bytes(&sig_bytes)?;

        Ok(verify_signature(&pk, self.tx_hash.as_bytes(), &sig))
    }

    pub fn validate(&self) -> Result<(), BlockchainError> {
        if self.amount == 0 && !self.is_coinbase() {
            return Err(BlockchainError::AmountMustBePositive);
        }
        if !self.is_coinbase() && self.from.is_none() {
            return Err(BlockchainError::InvalidTransaction(
                "Non-coinbase transaction must have a sender".to_string(),
            ));
        }
        if self.tx_hash.is_empty() {
            return Err(BlockchainError::InvalidTransaction(
                "Transaction hash is empty".to_string(),
            ));
        }
        if self.tx_hash != self.calculate_hash() {
            return Err(BlockchainError::InvalidTransaction(
                "Transaction hash mismatch".to_string(),
            ));
        }
        if !self.is_coinbase() && !self.verify_signature()? {
            return Err(BlockchainError::InvalidSignature);
        }
        Ok(())
    }

    pub fn is_coinbase(&self) -> bool {
        self.from.is_none()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::crypto::generate_keypair;

    #[test]
    fn test_create_coinbase() {
        let tx = Transaction::new(None, "addr123".to_string(), 50, 0, 0, 1337);
        assert!(tx.is_coinbase());
        assert!(!tx.tx_hash.is_empty());
    }

    #[test]
    fn test_create_normal_tx() {
        let (sk, pk) = generate_keypair();
        let addr = crate::crypto::generate_address(&pk);
        let mut tx = Transaction::new(Some(addr.clone()), "recipient".to_string(), 100, 1, 0, 1337);
        tx.sign(&sk, &pk);
        assert!(!tx.is_coinbase());
        assert!(tx.signature.is_some());
    }

    #[test]
    fn test_verify_signature_valid() {
        let (sk, pk) = generate_keypair();
        let addr = crate::crypto::generate_address(&pk);
        let mut tx = Transaction::new(Some(addr), "recipient".to_string(), 100, 1, 0, 1337);
        tx.sign(&sk, &pk);
        assert!(tx.verify_signature().unwrap());
    }

    #[test]
    fn test_verify_signature_invalid() {
        let (sk1, _) = generate_keypair();
        let (_, pk2) = generate_keypair();
        let addr = crate::crypto::generate_address(&pk2);
        let mut tx = Transaction::new(Some(addr), "recipient".to_string(), 100, 1, 0, 1337);
        tx.sign(&sk1, &pk2);
        assert!(!tx.verify_signature().unwrap());
    }

    #[test]
    fn test_validate_normal_tx() {
        let (sk, pk) = generate_keypair();
        let addr = crate::crypto::generate_address(&pk);
        let mut tx = Transaction::new(Some(addr), "recipient".to_string(), 100, 1, 0, 1337);
        tx.sign(&sk, &pk);
        assert!(tx.validate().is_ok());
    }

    #[test]
    fn test_validate_coinbase() {
        let tx = Transaction::new(None, "miner".to_string(), 50, 0, 0, 1337);
        assert!(tx.validate().is_ok());
    }

    #[test]
    fn test_validate_zero_amount_non_coinbase() {
        let (sk, pk) = generate_keypair();
        let addr = crate::crypto::generate_address(&pk);
        let mut tx = Transaction::new(Some(addr), "recipient".to_string(), 0, 1, 0, 1337);
        tx.sign(&sk, &pk);
        assert!(tx.validate().is_err());
    }

    #[test]
    fn test_different_chain_id_different_hash() {
        let tx1 = Transaction::new(Some("a".to_string()), "b".to_string(), 100, 1, 0, 1337);
        let tx2 = Transaction::new(Some("a".to_string()), "b".to_string(), 100, 1, 0, 1);
        assert_ne!(tx1.tx_hash, tx2.tx_hash);
    }
}
