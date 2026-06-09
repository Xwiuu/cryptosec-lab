//! Weak Hash Vulnerability Demo
//!
//! PROBLEM: Using MD5 or SHA-1 for blockchain hashing.
//! - MD5: Collision resistance broken (2^18 operations for collision)
//! - SHA-1: SHAttered attack (2^63 -> 2^61 operations)
//! - Impact: Two different blocks can have the same hash
//!
//! RISK: An attacker can create a malicious block with the same hash as a valid one.
//!
//! CORRECTION: Use SHA-256 or Blake3 with sufficient security margin.

use sha2::{Digest, Sha256};

pub fn weak_hash_md5(data: &[u8]) -> String {
    let hash = md5::compute(data);
    format!("{:x}", hash)
}

pub fn weak_hash_sha1(data: &[u8]) -> String {
    use sha1::Digest as _;
    let hash = sha1::Sha1::digest(data);
    format!("{:x}", hash)
}

pub fn strong_hash_sha256(data: &[u8]) -> String {
    let mut hasher = Sha256::new();
    hasher.update(data);
    hex::encode(hasher.finalize())
}

/// DEMO: Show collision resistance difference
pub fn demonstrate_weak_collision() -> bool {
    let data1 = b"block_data_1";
    let data2 = b"block_data_2";
    weak_hash_md5(data1) == weak_hash_md5(data2)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_weak_hash_collision_risk() {
        let data1 = b"legitimate_block";
        let data2 = b"malicious_block";
        let hash1 = weak_hash_md5(data1);
        let hash2 = weak_hash_md5(data2);
        assert_ne!(hash1, hash2);
        let hash1s = strong_hash_sha256(data1);
        let hash2s = strong_hash_sha256(data2);
        assert_ne!(hash1s, hash2s);
    }

    #[test]
    fn test_strong_hash_is_deterministic() {
        let data = b"test_data";
        let h1 = strong_hash_sha256(data);
        let h2 = strong_hash_sha256(data);
        assert_eq!(h1, h2);
    }

    #[test]
    fn test_weak_hash_length() {
        assert_eq!(weak_hash_md5(b"test").len(), 32);
        assert_eq!(weak_hash_sha1(b"test").len(), 40);
        assert_eq!(strong_hash_sha256(b"test").len(), 64);
    }
}
