//! Mempool Spam Vulnerability Demo
//!
//! PROBLEM: No limits on mempool transactions from a single address.
//! - An attacker floods the mempool with thousands of micro-transactions.
//! - Impact: Network congestion, legitimate tx delays, DoS.
//!
//! CORRECTION: Rate limit per address, minimum fee, maximum pool size.

pub struct VulnerableMempool {
    pub transactions: Vec<String>,
}

impl VulnerableMempool {
    /// VULNERABLE: No limits at all
    pub fn add_transaction(&mut self, tx: String) {
        self.transactions.push(tx);
    }
}

pub struct SecureMempool {
    pub transactions: Vec<String>,
    pub max_size: usize,
    pub max_per_address: usize,
    pub address_count: std::collections::HashMap<String, usize>,
    pub minimum_fee: u64,
}

impl SecureMempool {
    pub fn new(max_size: usize, max_per_address: usize, minimum_fee: u64) -> Self {
        SecureMempool {
            transactions: Vec::new(),
            max_size,
            max_per_address,
            address_count: std::collections::HashMap::new(),
            minimum_fee,
        }
    }

    /// SECURE: Rate limiting and size bounds
    pub fn add_transaction(
        &mut self,
        tx: String,
        from: &str,
        fee: u64,
    ) -> Result<(), &'static str> {
        if self.transactions.len() >= self.max_size {
            return Err("Mempool full");
        }
        if fee < self.minimum_fee {
            return Err("Fee too low");
        }
        let count = self.address_count.get(from).copied().unwrap_or(0);
        if count >= self.max_per_address {
            return Err("Spam detected: too many transactions");
        }
        self.address_count
            .entry(from.to_string())
            .and_modify(|c| *c += 1)
            .or_insert(1);
        self.transactions.push(tx);
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_vulnerable_unlimited_spam() {
        let mut mempool = VulnerableMempool {
            transactions: Vec::new(),
        };
        for _ in 0..100_000 {
            mempool.add_transaction("spam".to_string());
        }
        assert_eq!(mempool.transactions.len(), 100_000);
    }

    #[test]
    fn test_secure_spam_blocked() {
        let mut mempool = SecureMempool::new(1000, 5, 1);
        for i in 0..5 {
            assert!(mempool
                .add_transaction(format!("tx_{}", i), "attacker", 1)
                .is_ok());
        }
        assert!(mempool
            .add_transaction("spam_tx".to_string(), "attacker", 1)
            .is_err());
    }

    #[test]
    fn test_secure_low_fee_rejected() {
        let mut mempool = SecureMempool::new(1000, 5, 1);
        assert!(mempool
            .add_transaction("tx".to_string(), "user", 0)
            .is_err());
    }

    #[test]
    fn test_secure_mempool_full() {
        let mut mempool = SecureMempool::new(3, 10, 1);
        assert!(mempool.add_transaction("tx1".to_string(), "a", 1).is_ok());
        assert!(mempool.add_transaction("tx2".to_string(), "b", 1).is_ok());
        assert!(mempool.add_transaction("tx3".to_string(), "c", 1).is_ok());
        assert!(mempool.add_transaction("tx4".to_string(), "d", 1).is_err());
    }
}
