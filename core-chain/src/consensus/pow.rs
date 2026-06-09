use crate::crypto::hash_sha256_hex;

pub fn mine_hash(
    data: &str,
    difficulty: u32,
    start_nonce: u64,
    max_nonce: u64,
) -> Option<(u64, String)> {
    let target = "0".repeat(difficulty as usize);
    let mut nonce = start_nonce;
    while nonce < max_nonce {
        let input = format!("{}:{}", data, nonce);
        let hash = hash_sha256_hex(input.as_bytes());
        if hash.starts_with(&target) {
            return Some((nonce, hash));
        }
        nonce += 1;
    }
    None
}

pub fn validate_pow(hash: &str, difficulty: u32) -> bool {
    let target = "0".repeat(difficulty as usize);
    hash.starts_with(&target)
}

pub fn difficulty_target(difficulty: u32) -> String {
    "0".repeat(difficulty as usize)
}

pub fn adjust_difficulty(
    current_difficulty: u32,
    actual_time_secs: u64,
    target_time_secs: u64,
) -> u32 {
    if actual_time_secs < target_time_secs / 2 {
        current_difficulty.saturating_add(1)
    } else if actual_time_secs > target_time_secs * 2 && current_difficulty > 1 {
        current_difficulty.saturating_sub(1)
    } else {
        current_difficulty
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_mine_valid() {
        let result = mine_hash("block_data", 2, 0, 1_000_000);
        assert!(result.is_some());
        let (_nonce, hash) = result.unwrap();
        assert!(hash.starts_with("00"));
    }

    #[test]
    fn test_validate_pow_valid() {
        let hash = "00abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
        assert!(validate_pow(hash, 2));
    }

    #[test]
    fn test_validate_pow_invalid() {
        let hash = "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
        assert!(!validate_pow(hash, 2));
    }

    #[test]
    fn test_adjust_difficulty_increase() {
        let new_diff = adjust_difficulty(4, 2, 10);
        assert_eq!(new_diff, 5);
    }

    #[test]
    fn test_adjust_difficulty_decrease() {
        let new_diff = adjust_difficulty(4, 30, 10);
        assert_eq!(new_diff, 3);
    }

    #[test]
    fn test_adjust_difficulty_stable() {
        let new_diff = adjust_difficulty(4, 10, 10);
        assert_eq!(new_diff, 4);
    }

    #[test]
    fn test_difficulty_target() {
        assert_eq!(difficulty_target(4), "0000");
        assert_eq!(difficulty_target(0), "");
    }
}
