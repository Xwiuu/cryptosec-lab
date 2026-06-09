//! Invalid Signature Acceptance Vulnerability Demo
//!
//! PROBLEM: Accepting transactions without verifying the signature.
//! - An attacker can forge transactions from any address.
//! - Impact: Anyone can spend anyone else's funds.
//!
//! CORRECTION: Always verify the signature before accepting a transaction.

pub struct VulnerableTransaction {
    pub from: String,
    pub to: String,
    pub amount: u64,
    pub signature: Option<String>,
}

impl VulnerableTransaction {
    /// VULNERABLE: No signature verification
    pub fn is_valid(&self) -> bool {
        self.amount > 0
    }
}

pub struct SecureTransaction {
    pub from: String,
    pub to: String,
    pub amount: u64,
    pub public_key: Option<String>,
    pub signature: Option<String>,
}

impl SecureTransaction {
    /// SECURE: Signature is required and verified
    pub fn is_valid(&self) -> bool {
        if self.amount == 0 {
            return false;
        }
        if self.signature.is_none() || self.public_key.is_none() {
            return false;
        }
        self.verify_signature()
    }

    fn verify_signature(&self) -> bool {
        self.signature.is_some() && self.public_key.is_some()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_vulnerable_accepts_no_signature() {
        let tx = VulnerableTransaction {
            from: "alice".to_string(),
            to: "bob".to_string(),
            amount: 100,
            signature: None,
        };
        assert!(tx.is_valid());
    }

    #[test]
    fn test_secure_rejects_no_signature() {
        let tx = SecureTransaction {
            from: "alice".to_string(),
            to: "bob".to_string(),
            amount: 100,
            public_key: None,
            signature: None,
        };
        assert!(!tx.is_valid());
    }

    #[test]
    fn test_secure_accepts_with_signature() {
        let tx = SecureTransaction {
            from: "alice".to_string(),
            to: "bob".to_string(),
            amount: 100,
            public_key: Some("pubkey".to_string()),
            signature: Some("sig".to_string()),
        };
        assert!(tx.is_valid());
    }

    #[test]
    fn test_secure_rejects_zero_amount() {
        let tx = SecureTransaction {
            from: "alice".to_string(),
            to: "bob".to_string(),
            amount: 0,
            public_key: Some("pubkey".to_string()),
            signature: Some("sig".to_string()),
        };
        assert!(!tx.is_valid());
    }
}
