use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use crate::crypto::hash_sha256_hex;
use crate::errors::BlockchainError;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Validator {
    pub address: String,
    pub stake: u64,
    pub first_block: u64,
    pub last_active: u64,
    pub rewards: u64,
    pub slashed: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PoS {
    pub validators: HashMap<String, Validator>,
    pub total_stake: u64,
    pub min_stake: u64,
    pub slash_amount: u64,
    pub epoch: u64,
    pub blocks_per_epoch: u64,
}

impl PoS {
    pub fn new(min_stake: u64, slash_amount: u64) -> Self {
        PoS {
            validators: HashMap::new(),
            total_stake: 0,
            min_stake,
            slash_amount,
            epoch: 0,
            blocks_per_epoch: 10,
        }
    }

    pub fn register_validator(
        &mut self,
        address: &str,
        stake: u64,
        current_block: u64,
    ) -> Result<(), BlockchainError> {
        if stake < self.min_stake {
            return Err(BlockchainError::StakeError(format!(
                "Stake {} is below minimum {}",
                stake, self.min_stake
            )));
        }

        if self.validators.contains_key(address) {
            let validator = self.validators.get_mut(address).unwrap();
            validator.stake = validator.stake.saturating_add(stake);
            validator.last_active = current_block;
        } else {
            self.validators.insert(
                address.to_string(),
                Validator {
                    address: address.to_string(),
                    stake,
                    first_block: current_block,
                    last_active: current_block,
                    rewards: 0,
                    slashed: false,
                },
            );
        }

        self.total_stake = self.total_stake.saturating_add(stake);
        Ok(())
    }

    pub fn select_validator(&self, seed: &str, current_block: u64) -> Option<&Validator> {
        if self.validators.is_empty() || self.total_stake == 0 {
            return None;
        }

        if current_block > 0 && current_block.is_multiple_of(self.blocks_per_epoch) {
            let hash = hash_sha256_hex(
                format!("{}{}", seed, current_block / self.blocks_per_epoch).as_bytes(),
            );
            let hash_int = u64::from_str_radix(&hash[..16], 16).unwrap_or(0);
            let target = hash_int % self.total_stake;

            let mut cumulative = 0u64;
            for validator in self.validators.values() {
                if validator.slashed {
                    continue;
                }
                cumulative = cumulative.saturating_add(validator.stake);
                if target < cumulative {
                    return Some(validator);
                }
            }
        }

        self.validators.values().find(|v| !v.slashed)
    }

    pub fn validate_stake(&self, address: &str) -> Result<(), BlockchainError> {
        let validator = self
            .validators
            .get(address)
            .ok_or_else(|| BlockchainError::StakeError("Validator not found".to_string()))?;

        if validator.slashed {
            return Err(BlockchainError::StakeError(
                "Validator was slashed".to_string(),
            ));
        }

        if validator.stake < self.min_stake {
            return Err(BlockchainError::StakeError(
                "Validator below minimum stake".to_string(),
            ));
        }

        Ok(())
    }

    pub fn slash_validator(&mut self, address: &str) -> Result<(), BlockchainError> {
        let validator = self
            .validators
            .get_mut(address)
            .ok_or_else(|| BlockchainError::StakeError("Validator not found".to_string()))?;

        let slashed_amount = self.slash_amount.min(validator.stake);
        validator.stake = validator.stake.saturating_sub(slashed_amount);
        self.total_stake = self.total_stake.saturating_sub(slashed_amount);

        if validator.stake < self.min_stake {
            validator.slashed = true;
        }

        Ok(())
    }

    pub fn reward_validator(&mut self, address: &str, reward: u64) -> Result<(), BlockchainError> {
        let validator = self
            .validators
            .get_mut(address)
            .ok_or_else(|| BlockchainError::StakeError("Validator not found".to_string()))?;

        if validator.slashed {
            return Err(BlockchainError::StakeError(
                "Cannot reward slashed validator".to_string(),
            ));
        }

        validator.stake = validator.stake.saturating_add(reward);
        validator.rewards = validator.rewards.saturating_add(reward);
        self.total_stake = self.total_stake.saturating_add(reward);
        Ok(())
    }

    pub fn validator_count(&self) -> usize {
        self.validators.len()
    }

    pub fn active_validator_count(&self) -> usize {
        self.validators.values().filter(|v| !v.slashed).count()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn setup_pos() -> PoS {
        PoS::new(100, 50)
    }

    #[test]
    fn test_register_validator() {
        let mut pos = setup_pos();
        assert!(pos.register_validator("addr1", 100, 0).is_ok());
        assert_eq!(pos.validator_count(), 1);
        assert_eq!(pos.total_stake, 100);
    }

    #[test]
    fn test_reject_below_minimum() {
        let mut pos = setup_pos();
        assert!(pos.register_validator("addr1", 50, 0).is_err());
    }

    #[test]
    fn test_select_validator() {
        let mut pos = setup_pos();
        pos.register_validator("addr1", 500, 0).unwrap();
        pos.register_validator("addr2", 300, 0).unwrap();
        let validator = pos.select_validator("seed", 10);
        assert!(validator.is_some());
    }

    #[test]
    fn test_no_validators() {
        let pos = setup_pos();
        assert!(pos.select_validator("seed", 10).is_none());
    }

    #[test]
    fn test_slash_validator() {
        let mut pos = setup_pos();
        pos.register_validator("addr1", 200, 0).unwrap();
        assert!(pos.slash_validator("addr1").is_ok());
        assert!(!pos.validators.get("addr1").unwrap().slashed);
        assert_eq!(pos.validators.get("addr1").unwrap().stake, 150);
    }

    #[test]
    fn test_slash_below_minimum() {
        let mut pos = setup_pos();
        pos.register_validator("addr1", 120, 0).unwrap();
        pos.slash_validator("addr1").unwrap();
        assert!(pos.validators.get("addr1").unwrap().slashed);
    }

    #[test]
    fn test_reward_validator() {
        let mut pos = setup_pos();
        pos.register_validator("addr1", 100, 0).unwrap();
        pos.reward_validator("addr1", 10).unwrap();
        assert_eq!(pos.validators.get("addr1").unwrap().stake, 110);
        assert_eq!(pos.total_stake, 110);
    }
}
