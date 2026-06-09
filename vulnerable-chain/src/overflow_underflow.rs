//! Integer Overflow/Underflow Vulnerability Demo
//!
//! PROBLEM: Arithmetic operations that exceed type bounds.
//! - u64 overflow: 18446744073709551615 + 1 = 0 (wrapping)
//! - u64 underflow: 0 - 1 = 18446744073709551615 (wrapping)
//! - Impact: Attacker can mint infinite tokens or steal funds.
//!
//! CORRECTION: Use checked_add/checked_sub (panic on overflow in debug).
//! In Solidity ^0.8.x, overflow is checked by default.

pub struct VulnerableToken {
    pub balances: std::collections::HashMap<String, u64>,
    pub total_supply: u64,
}

impl VulnerableToken {
    /// VULNERABLE: Wrapping arithmetic
    pub fn transfer(&mut self, from: &str, to: &str, amount: u64) -> bool {
        let from_bal = self.balances.get(from).copied().unwrap_or(0);
        let to_bal = self.balances.get(to).copied().unwrap_or(0);
        if from_bal < amount {
            return false;
        }
        self.balances
            .insert(from.to_string(), from_bal.wrapping_sub(amount));
        self.balances
            .insert(to.to_string(), to_bal.wrapping_add(amount));
        true
    }

    /// VULNERABLE: Overflow in total supply (wrapping)
    pub fn mint(&mut self, to: &str, amount: u64) {
        let bal = self.balances.get(to).copied().unwrap_or(0);
        self.balances
            .insert(to.to_string(), bal.wrapping_add(amount));
        self.total_supply = self.total_supply.wrapping_add(amount);
    }

    /// VULNERABLE: Underflow (wrapping)
    pub fn burn(&mut self, from: &str, amount: u64) {
        let bal = self.balances.get(from).copied().unwrap_or(0);
        self.balances
            .insert(from.to_string(), bal.wrapping_sub(amount));
        self.total_supply = self.total_supply.wrapping_sub(amount);
    }
}

pub struct SecureToken {
    pub balances: std::collections::HashMap<String, u64>,
    pub total_supply: u64,
}

impl SecureToken {
    /// SECURE: Checked arithmetic
    pub fn transfer(&mut self, from: &str, to: &str, amount: u64) -> Result<(), &'static str> {
        let from_bal = self.balances.get(from).copied().unwrap_or(0);
        let to_bal = self.balances.get(to).copied().unwrap_or(0);
        if from_bal < amount {
            return Err("Insufficient balance");
        }
        self.balances
            .insert(from.to_string(), from_bal.checked_sub(amount).unwrap());
        self.balances
            .insert(to.to_string(), to_bal.checked_add(amount).unwrap());
        Ok(())
    }

    pub fn mint(&mut self, to: &str, amount: u64) -> Result<(), &'static str> {
        let bal = self.balances.get(to).copied().unwrap_or(0);
        self.balances
            .insert(to.to_string(), bal.checked_add(amount).ok_or("Overflow")?);
        self.total_supply = self
            .total_supply
            .checked_add(amount)
            .ok_or("Supply overflow")?;
        Ok(())
    }

    pub fn burn(&mut self, from: &str, amount: u64) -> Result<(), &'static str> {
        let bal = self.balances.get(from).copied().unwrap_or(0);
        if bal < amount {
            return Err("Insufficient balance");
        }
        self.balances
            .insert(from.to_string(), bal.checked_sub(amount).unwrap());
        self.total_supply = self
            .total_supply
            .checked_sub(amount)
            .ok_or("Supply underflow")?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_vulnerable_mint_overflow() {
        let mut token = VulnerableToken {
            balances: std::collections::HashMap::new(),
            total_supply: u64::MAX,
        };
        token.mint("victim", 1);
        // VULNERABLE: overflow wraps to 0
        assert_eq!(token.total_supply, 0);
        // Balance also wrapped
        assert_eq!(token.balances.get("victim").copied().unwrap_or(0), 1);
    }

    #[test]
    fn test_secure_mint_overflow_rejected() {
        let mut token = SecureToken {
            balances: std::collections::HashMap::new(),
            total_supply: u64::MAX,
        };
        assert!(token.mint("victim", 1).is_err());
    }

    #[test]
    fn test_vulnerable_burn_underflow() {
        let mut token = VulnerableToken {
            balances: std::collections::HashMap::new(),
            total_supply: 0,
        };
        token.balances.insert("alice".to_string(), 5);
        // total_supply = 0, alice has 5
        // VULNERABLE: no balance check before burn
        token.burn("alice", 1);
        assert_eq!(token.total_supply, u64::MAX);
        assert_eq!(token.balances.get("alice").copied().unwrap_or(0), 4);
    }

    #[test]
    fn test_secure_burn_underflow_rejected() {
        let mut token = SecureToken {
            balances: std::collections::HashMap::new(),
            total_supply: 0,
        };
        assert!(token.burn("alice", 1).is_err());
    }

    #[test]
    fn test_secure_transfer_works() {
        let mut token = SecureToken {
            balances: std::collections::HashMap::from([("alice".to_string(), 100)]),
            total_supply: 100,
        };
        assert!(token.transfer("alice", "bob", 50).is_ok());
        assert_eq!(token.balances.get("alice").copied().unwrap_or(0), 50);
        assert_eq!(token.balances.get("bob").copied().unwrap_or(0), 50);
    }
}
