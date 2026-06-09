use std::sync::Arc;

use parking_lot::RwLock;
use serde::{Deserialize, Serialize};

use crate::block::Block;
use crate::blockchain::Blockchain;
use crate::config::BlockchainConfig;
use crate::consensus::pos::PoS;
use crate::errors::BlockchainError;
use crate::transaction::Transaction;
use crate::wallet::Wallet;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NodeInfo {
    pub chain_height: usize,
    pub difficulty: u32,
    pub mempool_size: usize,
    pub validator_count: usize,
    pub chain_id: u64,
}

pub struct Node {
    pub blockchain: Arc<RwLock<Blockchain>>,
    pub pos: Arc<RwLock<PoS>>,
}

impl Node {
    pub fn new(config: BlockchainConfig) -> Self {
        let pos_system = PoS::new(config.pos_min_stake, config.pos_slash_amount);
        Node {
            blockchain: Arc::new(RwLock::new(Blockchain::new(config))),
            pos: Arc::new(RwLock::new(pos_system)),
        }
    }

    pub fn info(&self) -> NodeInfo {
        let bc = self.blockchain.read();
        let pos = self.pos.read();
        NodeInfo {
            chain_height: bc.chain_len(),
            difficulty: bc.difficulty,
            mempool_size: bc.pending_transactions.len(),
            validator_count: pos.active_validator_count(),
            chain_id: bc.chain_id,
        }
    }

    pub fn get_chain(&self) -> Vec<Block> {
        self.blockchain.read().chain.clone()
    }

    pub fn get_block(&self, index: u64) -> Option<Block> {
        self.blockchain.read().get_block(index).cloned()
    }

    pub fn latest_block(&self) -> Option<Block> {
        let bc = self.blockchain.read();
        if bc.chain.is_empty() {
            return None;
        }
        Some(bc.latest_block().clone())
    }

    pub fn get_balance(&self, address: &str) -> Result<u64, BlockchainError> {
        if address.is_empty() {
            return Err(BlockchainError::InvalidAddress);
        }
        Ok(self.blockchain.read().get_balance(address))
    }

    pub fn get_mempool(&self) -> Vec<Transaction> {
        self.blockchain.read().pending_transactions.all().to_vec()
    }

    pub fn add_transaction(&self, tx: Transaction) -> Result<(), BlockchainError> {
        let mut bc = self.blockchain.write();
        bc.add_transaction(tx)
    }

    pub fn mine_block(&self, miner_address: &str) -> Result<Block, BlockchainError> {
        let mut bc = self.blockchain.write();
        bc.mine_pending_transactions(miner_address)
    }

    pub fn create_wallet(&self) -> Wallet {
        Wallet::generate()
    }

    pub fn validate_chain(&self) -> Result<(), BlockchainError> {
        self.blockchain.read().validate_chain()
    }

    pub fn register_validator(&self, address: &str, stake: u64) -> Result<(), BlockchainError> {
        let block_height = self.blockchain.read().chain_len() as u64;
        let mut pos = self.pos.write();
        pos.register_validator(address, stake, block_height)
    }

    pub fn get_nonce(&self, address: &str) -> u64 {
        self.blockchain.read().get_nonce(address)
    }
}
