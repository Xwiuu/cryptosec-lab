use std::collections::HashMap;

use serde::{Deserialize, Serialize};

use crate::config::BlockchainConfig;
use crate::errors::BlockchainError;
use crate::transaction::Transaction;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Mempool {
    transactions: Vec<Transaction>,
    max_size: usize,
    max_per_address: usize,
    minimum_fee: u64,
    seen_hashes: HashMap<String, bool>,
    tx_count_per_address: HashMap<String, usize>,
}

impl Mempool {
    pub fn new(config: &BlockchainConfig) -> Self {
        Mempool {
            transactions: Vec::new(),
            max_size: config.mempool_max_size,
            max_per_address: config.max_tx_per_address,
            minimum_fee: config.minimum_fee,
            seen_hashes: HashMap::new(),
            tx_count_per_address: HashMap::new(),
        }
    }

    pub fn add_transaction(&mut self, tx: Transaction) -> Result<(), BlockchainError> {
        if self.seen_hashes.contains_key(&tx.tx_hash) {
            return Err(BlockchainError::DuplicateTransaction);
        }
        if tx.is_coinbase() {
            return Err(BlockchainError::InvalidTransaction(
                "Coinbase transactions cannot be added to mempool".to_string(),
            ));
        }
        if self.transactions.len() >= self.max_size {
            return Err(BlockchainError::MempoolFull);
        }
        if tx.fee < self.minimum_fee {
            return Err(BlockchainError::FeeTooLow(self.minimum_fee, tx.fee));
        }
        tx.validate()?;

        if let Some(ref from) = tx.from {
            let count = self.tx_count_per_address.get(from).copied().unwrap_or(0);
            if count >= self.max_per_address {
                return Err(BlockchainError::SpamDetected(from.clone()));
            }
            self.tx_count_per_address
                .entry(from.clone())
                .and_modify(|c| *c += 1)
                .or_insert(1);
        }

        self.seen_hashes.insert(tx.tx_hash.clone(), true);
        self.transactions.push(tx);
        Ok(())
    }

    pub fn remove_transaction(&mut self, tx_hash: &str) -> Option<Transaction> {
        if let Some(pos) = self.transactions.iter().position(|t| t.tx_hash == tx_hash) {
            let tx = self.transactions.remove(pos);
            if let Some(ref from) = tx.from {
                if let Some(count) = self.tx_count_per_address.get_mut(from) {
                    *count = count.saturating_sub(1);
                    if *count == 0 {
                        self.tx_count_per_address.remove(from);
                    }
                }
            }
            self.seen_hashes.remove(tx_hash);
            return Some(tx);
        }
        None
    }

    pub fn order_by_fee(&mut self) {
        self.transactions.sort_by_key(|b| std::cmp::Reverse(b.fee));
    }

    pub fn clear_confirmed(&mut self, confirmed_hashes: &[String]) {
        for hash in confirmed_hashes {
            self.remove_transaction(hash);
        }
    }

    pub fn get_pending(&self, limit: usize) -> Vec<Transaction> {
        let mut sorted = self.transactions.clone();
        sorted.sort_by_key(|b| std::cmp::Reverse(b.fee));
        sorted.into_iter().take(limit).collect()
    }

    pub fn len(&self) -> usize {
        self.transactions.len()
    }

    pub fn is_empty(&self) -> bool {
        self.transactions.is_empty()
    }

    pub fn contains(&self, tx_hash: &str) -> bool {
        self.seen_hashes.contains_key(tx_hash)
    }

    pub fn has_transaction(&self) -> bool {
        !self.transactions.is_empty()
    }

    pub fn all(&self) -> &[Transaction] {
        &self.transactions
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::crypto::generate_keypair;

    fn setup_mempool() -> Mempool {
        let config = BlockchainConfig::default();
        Mempool::new(&config)
    }

    fn signed_tx(
        sk: &ed25519_dalek::SigningKey,
        pk: &ed25519_dalek::VerifyingKey,
        from: &str,
        to: &str,
        amount: u64,
        fee: u64,
        nonce: u64,
    ) -> Transaction {
        let mut tx = Transaction::new(
            Some(from.to_string()),
            to.to_string(),
            amount,
            fee,
            nonce,
            1337,
        );
        tx.sign(sk, pk);
        tx
    }

    #[test]
    fn test_add_transaction() {
        let (sk, pk) = generate_keypair();
        let addr = crate::crypto::generate_address(&pk);
        let mut mempool = setup_mempool();
        let tx = signed_tx(&sk, &pk, &addr, "recipient", 100, 1, 0);
        assert!(mempool.add_transaction(tx).is_ok());
        assert_eq!(mempool.len(), 1);
    }

    #[test]
    fn test_reject_duplicate() {
        let (sk, pk) = generate_keypair();
        let addr = crate::crypto::generate_address(&pk);
        let mut mempool = setup_mempool();
        let tx = signed_tx(&sk, &pk, &addr, "recipient", 100, 1, 0);
        assert!(mempool.add_transaction(tx.clone()).is_ok());
        assert!(mempool.add_transaction(tx).is_err());
    }

    #[test]
    fn test_reject_coinbase() {
        let mut mempool = setup_mempool();
        let tx = Transaction::new(None, "miner".to_string(), 50, 0, 0, 1337);
        assert!(mempool.add_transaction(tx).is_err());
    }

    #[test]
    fn test_order_by_fee() {
        let (sk, pk) = generate_keypair();
        let addr = crate::crypto::generate_address(&pk);
        let mut mempool = setup_mempool();

        let tx1 = signed_tx(&sk, &pk, &addr, "bob", 100, 1, 0);
        let tx10 = signed_tx(&sk, &pk, &addr, "bob", 100, 10, 1);
        let tx5 = signed_tx(&sk, &pk, &addr, "bob", 100, 5, 2);

        mempool.add_transaction(tx1.clone()).unwrap();
        mempool.add_transaction(tx10.clone()).unwrap();
        mempool.add_transaction(tx5.clone()).unwrap();

        mempool.order_by_fee();
        let pending = mempool.get_pending(10);
        assert_eq!(pending[0].fee, 10);
        assert_eq!(pending[1].fee, 5);
        assert_eq!(pending[2].fee, 1);
    }

    #[test]
    fn test_reject_low_fee() {
        let (sk, pk) = generate_keypair();
        let addr = crate::crypto::generate_address(&pk);
        let mut mempool = setup_mempool();
        let tx = signed_tx(&sk, &pk, &addr, "bob", 100, 0, 0);
        assert!(mempool.add_transaction(tx).is_err());
    }

    #[test]
    fn test_remove_transaction() {
        let (sk, pk) = generate_keypair();
        let addr = crate::crypto::generate_address(&pk);
        let mut mempool = setup_mempool();
        let tx = signed_tx(&sk, &pk, &addr, "bob", 100, 1, 0);
        let tx_hash = tx.tx_hash.clone();
        mempool.add_transaction(tx).unwrap();
        assert_eq!(mempool.len(), 1);
        let removed = mempool.remove_transaction(&tx_hash);
        assert!(removed.is_some());
        assert_eq!(mempool.len(), 0);
    }
}
