//! 51% Attack Simulation
//!
//! PROBLEM: A single entity controls >50% of the network hashrate.
//! - Can mine blocks faster than the rest of the network.
//! - Can reverse confirmed transactions by creating a longer chain.
//! - Impact: Double spending, chain reorganization, censorship.
//!
//! CORRECTION: Decentralized mining, monitoring hashrate distribution,
//! checkpoints, increased confirmation requirements for large tx.

pub struct SimpleChain {
    pub blocks: Vec<SimpleBlock>,
}

#[derive(Clone)]
pub struct SimpleBlock {
    pub index: u64,
    pub transactions: Vec<String>,
    pub previous_hash: String,
    pub hash: String,
}

impl SimpleBlock {
    pub fn new(index: u64, transactions: Vec<String>, previous_hash: &str) -> Self {
        let hash = format!("hash_{}", index);
        SimpleBlock {
            index,
            transactions,
            previous_hash: previous_hash.to_string(),
            hash,
        }
    }
}

impl SimpleChain {
    pub fn new() -> Self {
        let genesis = SimpleBlock::new(0, vec!["genesis".to_string()], "0");
        SimpleChain {
            blocks: vec![genesis],
        }
    }
}

impl Default for SimpleChain {
    fn default() -> Self {
        Self::new()
    }
}

impl SimpleChain {
    /// VULNERABLE: Accepts any longer chain without validation
    pub fn vulnerable_replace_chain(&mut self, new_chain: Vec<SimpleBlock>) -> bool {
        if new_chain.len() > self.blocks.len() {
            self.blocks = new_chain;
            return true;
        }
        false
    }

    /// SECURE: Validates chain integrity before replacing
    pub fn secure_replace_chain(&mut self, new_chain: Vec<SimpleBlock>) -> bool {
        if new_chain.len() <= self.blocks.len() {
            return false;
        }
        for i in 1..new_chain.len() {
            if new_chain[i].previous_hash != new_chain[i - 1].hash {
                return false;
            }
        }
        self.blocks = new_chain;
        true
    }

    pub fn get_balance(&self, address: &str) -> usize {
        let mut balance = 0;
        for block in &self.blocks {
            for tx in &block.transactions {
                if tx.contains(address) {
                    if tx.starts_with(address) {
                        balance -= 1;
                    } else {
                        balance += 1;
                    }
                }
            }
        }
        balance
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_51_percent_attack_simulation() {
        let mut honest_chain = SimpleChain::new();
        let block1 = SimpleBlock::new(
            1,
            vec!["alice -> bob".to_string()],
            &honest_chain.blocks[0].hash,
        );
        honest_chain.blocks.push(block1);
        assert_eq!(honest_chain.blocks.len(), 2);

        // Attacker creates a longer chain that reverses alice's payment
        let attacker_chain = vec![
            SimpleBlock::new(0, vec!["genesis".to_string()], "0"),
            SimpleBlock::new(1, vec!["alice -> attacker".to_string()], "hash_0"),
            SimpleBlock::new(2, vec!["attacker -> exchange".to_string()], "hash_1"),
        ];

        // VULNERABLE: Honest chain accepts the longer chain without validation
        let replaced = honest_chain.vulnerable_replace_chain(attacker_chain.clone());
        assert!(replaced);
        assert_eq!(honest_chain.blocks.len(), 3);
        // Alice's payment to bob was reverted, now she paid attacker
    }

    #[test]
    fn test_secure_rejects_invalid_chain() {
        let mut chain = SimpleChain::new();
        let malicious = vec![
            SimpleBlock::new(0, vec!["genesis".to_string()], "0"),
            SimpleBlock::new(1, vec!["alice -> attacker".to_string()], "wrong_hash"),
        ];
        assert!(!chain.secure_replace_chain(malicious));
    }

    #[test]
    fn test_secure_accepts_valid_chain() {
        let mut chain = SimpleChain::new();
        let valid = vec![
            SimpleBlock::new(0, vec!["genesis".to_string()], "0"),
            SimpleBlock::new(1, vec!["alice -> bob".to_string()], "hash_0"),
            SimpleBlock::new(2, vec!["bob -> carol".to_string()], "hash_1"),
        ];
        assert!(chain.secure_replace_chain(valid));
    }
}
