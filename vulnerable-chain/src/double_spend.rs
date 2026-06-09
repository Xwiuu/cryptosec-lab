//! Double Spend Vulnerability Demo
//!
//! PROBLEM: Spending the same UTXO or balance twice before the network detects it.
//! - Without nonce tracking, an attacker can submit two transactions with the same balance.
//! - Impact: Attacker receives goods from two parties for the same coins.
//!
//! CORRECTION: Track account nonces or use UTXO model.
//! Each transaction must have an incrementing nonce.

pub struct VulnerableAccountState {
    pub balance: u64,
}

impl VulnerableAccountState {
    /// VULNERABLE: No nonce tracking
    pub fn process_transaction(&mut self, amount: u64) -> bool {
        if amount > self.balance {
            return false;
        }
        self.balance -= amount;
        true
    }
}

pub struct SecureAccountState {
    pub balance: u64,
    pub nonce: u64,
}

impl SecureAccountState {
    /// SECURE: Requires correct nonce
    pub fn process_transaction(&mut self, amount: u64, nonce: u64) -> Result<(), &'static str> {
        if nonce != self.nonce {
            return Err("Invalid nonce");
        }
        if amount > self.balance {
            return Err("Insufficient balance");
        }
        self.balance -= amount;
        self.nonce += 1;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_vulnerable_double_spend_possible() {
        let mut account = VulnerableAccountState { balance: 100 };
        assert!(account.process_transaction(100));
        assert_eq!(account.balance, 0);
        account.balance = 100;
        assert!(account.process_transaction(100));
        assert_eq!(account.balance, 0);
    }

    #[test]
    fn test_secure_double_spend_impossible() {
        let mut account = SecureAccountState {
            balance: 100,
            nonce: 0,
        };
        assert!(account.process_transaction(50, 0).is_ok());
        assert!(account.process_transaction(50, 1).is_ok());
        assert!(account.process_transaction(50, 1).is_err());
    }

    #[test]
    fn test_secure_wrong_nonce_rejected() {
        let mut account = SecureAccountState {
            balance: 100,
            nonce: 0,
        };
        assert!(account.process_transaction(10, 5).is_err());
    }

    #[test]
    fn test_secure_insufficient_balance() {
        let mut account = SecureAccountState {
            balance: 10,
            nonce: 0,
        };
        assert!(account.process_transaction(100, 0).is_err());
    }
}
