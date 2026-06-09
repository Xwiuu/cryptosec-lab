use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlockchainConfig {
    pub initial_difficulty: u32,
    pub mining_reward: u64,
    pub coinbase_maturity: u64,
    pub max_transactions_per_block: usize,
    pub mempool_max_size: usize,
    pub max_tx_per_address: usize,
    pub minimum_fee: u64,
    pub chain_id: u64,
    pub block_time_target_secs: u64,
    pub difficulty_adjustment_interval: u64,
    pub allowed_timestamp_delta_secs: u64,
    pub pos_min_stake: u64,
    pub pos_slash_amount: u64,
    pub api_host: String,
    pub api_port: u16,
}

impl Default for BlockchainConfig {
    fn default() -> Self {
        Self {
            initial_difficulty: 4,
            mining_reward: 50,
            coinbase_maturity: 100,
            max_transactions_per_block: 100,
            mempool_max_size: 10_000,
            max_tx_per_address: 50,
            minimum_fee: 1,
            chain_id: 1337,
            block_time_target_secs: 10,
            difficulty_adjustment_interval: 10,
            allowed_timestamp_delta_secs: 300,
            pos_min_stake: 100,
            pos_slash_amount: 50,
            api_host: "127.0.0.1".to_string(),
            api_port: 8545,
        }
    }
}

impl BlockchainConfig {
    pub fn dev() -> Self {
        Self {
            initial_difficulty: 2,
            ..Default::default()
        }
    }
}
