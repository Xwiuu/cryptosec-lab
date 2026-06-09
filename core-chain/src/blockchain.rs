use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use crate::block::Block;
use crate::config::BlockchainConfig;
use crate::consensus::pow::adjust_difficulty;
use crate::errors::BlockchainError;
use crate::mempool::Mempool;
use crate::transaction::Transaction;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Blockchain {
    pub chain: Vec<Block>,
    pub pending_transactions: Mempool,
    pub difficulty: u32,
    pub mining_reward: u64,
    pub chain_id: u64,
    pub config: BlockchainConfig,
    utxo_set: HashMap<String, Vec<UtxoEntry>>,
    nonce_tracker: HashMap<String, u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UtxoEntry {
    pub tx_hash: String,
    pub amount: u64,
    pub spent: bool,
}

impl Blockchain {
    pub fn new(config: BlockchainConfig) -> Self {
        let mut blockchain = Blockchain {
            chain: Vec::new(),
            pending_transactions: Mempool::new(&config),
            difficulty: config.initial_difficulty,
            mining_reward: config.mining_reward,
            chain_id: config.chain_id,
            utxo_set: HashMap::new(),
            nonce_tracker: HashMap::new(),
            config,
        };
        let genesis = blockchain.create_genesis_block();
        blockchain.chain.push(genesis);
        blockchain
    }

    pub fn create_genesis_block(&self) -> Block {
        let coinbase = Transaction::new(
            None,
            "genesis".to_string(),
            self.mining_reward,
            0,
            0,
            self.chain_id,
        );
        let mut genesis = Block::new(
            0,
            vec![coinbase],
            "0".repeat(64),
            self.difficulty,
            "genesis".to_string(),
        );
        genesis.timestamp = 0;
        genesis.hash = "0".repeat(64);
        genesis
    }

    pub fn latest_block(&self) -> &Block {
        self.chain.last().expect("Blockchain has no blocks")
    }

    pub fn add_block(&mut self, block: Block) -> Result<(), BlockchainError> {
        let previous = self.latest_block().clone();
        block.validate(&previous)?;

        for tx in &block.transactions {
            if !tx.is_coinbase() {
                self.validate_transaction_in_chain(tx)?;
                self.apply_transaction(tx)?;
            }
        }

        self.chain.push(block);
        Ok(())
    }

    pub fn mine_pending_transactions(
        &mut self,
        miner_address: &str,
    ) -> Result<Block, BlockchainError> {
        if !self.pending_transactions.has_transaction() {
            return Err(BlockchainError::InvalidTransaction(
                "No transactions to mine".to_string(),
            ));
        }

        let reward_tx = Transaction::new(
            None,
            miner_address.to_string(),
            self.mining_reward,
            0,
            0,
            self.chain_id,
        );

        let mut pending = self
            .pending_transactions
            .get_pending(self.config.max_transactions_per_block);
        pending.insert(0, reward_tx);

        let previous_hash = self.latest_block().hash.clone();
        let next_index = self.chain.len() as u64;

        let mut block = Block::new(
            next_index,
            pending,
            previous_hash,
            self.difficulty,
            miner_address.to_string(),
        );

        block.mine(10_000_000)?;

        let confirmed: Vec<String> = block.transactions[1..]
            .iter()
            .map(|t| t.tx_hash.clone())
            .collect();

        for tx in &block.transactions {
            if !tx.is_coinbase() {
                self.validate_transaction_in_chain(tx)?;
                self.apply_transaction(tx)?;
            }
        }

        self.pending_transactions.clear_confirmed(&confirmed);
        self.difficulty = self.calculate_new_difficulty();
        self.chain.push(block.clone());
        Ok(block)
    }

    pub fn validate_chain(&self) -> Result<(), BlockchainError> {
        if self.chain.is_empty() {
            return Err(BlockchainError::InvalidBlock("Empty chain".to_string()));
        }

        let genesis = &self.chain[0];
        if genesis.index != 0 {
            return Err(BlockchainError::InvalidBlock(
                "Genesis block must have index 0".to_string(),
            ));
        }
        if genesis.previous_hash != "0".repeat(64) {
            return Err(BlockchainError::InvalidPreviousHash);
        }

        for i in 1..self.chain.len() {
            let current = &self.chain[i];
            let previous = &self.chain[i - 1];
            current
                .validate(previous)
                .map_err(|_| BlockchainError::ChainTampered(current.index))?;
        }

        Ok(())
    }

    pub fn get_balance(&self, address: &str) -> u64 {
        let mut balance = 0u64;
        for block in &self.chain {
            for tx in &block.transactions {
                if let Some(ref from) = tx.from {
                    if from == address {
                        balance = balance.saturating_sub(tx.amount + tx.fee);
                    }
                }
                if tx.to == address {
                    balance = balance.saturating_add(tx.amount);
                }
            }
        }
        balance
    }

    pub fn get_nonce(&self, address: &str) -> u64 {
        self.nonce_tracker.get(address).copied().unwrap_or(0)
    }

    pub fn replace_chain(&mut self, new_chain: Vec<Block>) -> Result<(), BlockchainError> {
        if new_chain.len() <= self.chain.len() {
            return Err(BlockchainError::InvalidBlock(
                "New chain must be longer".to_string(),
            ));
        }

        let temp = Blockchain {
            chain: new_chain.clone(),
            ..self.clone()
        };
        temp.validate_chain()?;

        self.chain = new_chain;
        Ok(())
    }

    pub fn add_transaction(&mut self, tx: Transaction) -> Result<(), BlockchainError> {
        if tx.is_coinbase() {
            return Err(BlockchainError::InvalidTransaction(
                "Use mine_pending_transactions for coinbase".to_string(),
            ));
        }

        tx.validate()?;
        self.validate_transaction_in_chain(&tx)?;

        let from = tx.from.as_ref().unwrap();
        let expected_nonce = self.get_nonce(from);
        if tx.nonce != expected_nonce {
            return Err(BlockchainError::InvalidTransaction(format!(
                "Invalid nonce: expected {}, got {}",
                expected_nonce, tx.nonce
            )));
        }

        let balance = self.get_balance(from);
        if tx.amount + tx.fee > balance {
            return Err(BlockchainError::InsufficientBalance);
        }

        self.pending_transactions.add_transaction(tx)?;
        Ok(())
    }

    fn validate_transaction_in_chain(&self, tx: &Transaction) -> Result<(), BlockchainError> {
        if self.contains_tx_hash(&tx.tx_hash) {
            return Err(BlockchainError::DuplicateTransaction);
        }
        if tx.chain_id != self.chain_id {
            return Err(BlockchainError::ReplayAttack);
        }
        Ok(())
    }

    fn apply_transaction(&mut self, tx: &Transaction) -> Result<(), BlockchainError> {
        if let Some(ref from) = tx.from {
            self.nonce_tracker
                .entry(from.clone())
                .and_modify(|n| *n += 1)
                .or_insert(1);
        }
        Ok(())
    }

    fn contains_tx_hash(&self, tx_hash: &str) -> bool {
        for block in &self.chain {
            for tx in &block.transactions {
                if tx.tx_hash == tx_hash {
                    return true;
                }
            }
        }
        false
    }

    fn calculate_new_difficulty(&self) -> u32 {
        if self.chain.len() < 2 {
            return self.difficulty;
        }

        let interval = self.config.difficulty_adjustment_interval as usize;
        if !self.chain.len().is_multiple_of(interval) {
            return self.difficulty;
        }

        let last = &self.chain[self.chain.len() - 1];
        let prev = &self.chain[self.chain.len() - interval.min(self.chain.len() - 1)];

        let actual_time = last.timestamp.saturating_sub(prev.timestamp);
        let target_time = self.config.block_time_target_secs * interval as u64;

        adjust_difficulty(self.difficulty, actual_time, target_time)
    }

    pub fn chain_len(&self) -> usize {
        self.chain.len()
    }

    pub fn get_block(&self, index: u64) -> Option<&Block> {
        self.chain.get(index as usize)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::crypto::generate_keypair;

    fn setup_blockchain() -> Blockchain {
        let config = BlockchainConfig::dev();
        Blockchain::new(config)
    }

    #[allow(clippy::too_many_arguments)]
    fn signed_tx(
        sk: &ed25519_dalek::SigningKey,
        pk: &ed25519_dalek::VerifyingKey,
        from: &str,
        to: &str,
        amount: u64,
        fee: u64,
        nonce: u64,
        chain_id: u64,
    ) -> Transaction {
        let mut tx = Transaction::new(
            Some(from.to_string()),
            to.to_string(),
            amount,
            fee,
            nonce,
            chain_id,
        );
        tx.sign(sk, pk);
        tx
    }

    #[test]
    fn test_genesis_block_exists() {
        let bc = setup_blockchain();
        assert_eq!(bc.chain.len(), 1);
        assert_eq!(bc.chain[0].index, 0);
    }

    #[test]
    fn test_valid_chain() {
        let bc = setup_blockchain();
        assert!(bc.validate_chain().is_ok());
    }

    #[test]
    fn test_tampered_chain_detected() {
        let mut bc = setup_blockchain();
        let (_sk, pk) = generate_keypair();
        let addr = crate::crypto::generate_address(&pk);

        let (sk_genesis, pk_genesis) = generate_keypair();
        let mut fund_tx = Transaction::new(
            Some("genesis".to_string()),
            addr.clone(),
            40,
            1,
            0,
            bc.chain_id,
        );
        fund_tx.sign(&sk_genesis, &pk_genesis);
        bc.pending_transactions.add_transaction(fund_tx).unwrap();
        bc.mine_pending_transactions("miner1").unwrap();

        if let Some(block) = bc.chain.get_mut(1) {
            block.transactions[0].amount = 9999;
        }
        assert!(bc.validate_chain().is_err());
    }

    #[test]
    fn test_add_transaction_and_mine() {
        let mut bc = setup_blockchain();
        let (_sk, pk) = generate_keypair();
        let from_addr = crate::crypto::generate_address(&pk);

        let (sk_genesis, pk_genesis) = generate_keypair();
        let mut fund_tx = Transaction::new(
            Some("genesis".to_string()),
            from_addr.clone(),
            40,
            1,
            0,
            bc.chain_id,
        );
        fund_tx.sign(&sk_genesis, &pk_genesis);

        bc.pending_transactions
            .add_transaction(fund_tx.clone())
            .unwrap();
        let block = bc.mine_pending_transactions("miner1").unwrap();
        assert_eq!(block.index, 1);

        assert!(bc.validate_chain().is_ok());
    }

    #[test]
    fn test_reject_double_spend() {
        let mut bc = setup_blockchain();
        let (sk, pk) = generate_keypair();
        let addr = crate::crypto::generate_address(&pk);

        let (sk_genesis, pk_genesis) = generate_keypair();
        let mut fund_tx = Transaction::new(
            Some("genesis".to_string()),
            addr.clone(),
            40,
            1,
            0,
            bc.chain_id,
        );
        fund_tx.sign(&sk_genesis, &pk_genesis);

        bc.pending_transactions
            .add_transaction(fund_tx.clone())
            .unwrap();
        bc.mine_pending_transactions("miner1").unwrap();

        let balance = bc.get_balance(&addr);
        assert!(balance > 0);

        let tx1 = signed_tx(&sk, &pk, &addr, "bob", balance / 2, 1, 0, bc.chain_id);
        assert!(bc.add_transaction(tx1).is_ok());

        let tx1_dup = signed_tx(&sk, &pk, &addr, "bob", balance / 2, 0, 0, bc.chain_id);
        assert!(bc.add_transaction(tx1_dup).is_err());
    }

    #[test]
    fn test_reject_replay() {
        let mut bc = setup_blockchain();
        let (sk, pk) = generate_keypair();
        let addr = crate::crypto::generate_address(&pk);

        let (sk_genesis, pk_genesis) = generate_keypair();
        let mut fund_tx = Transaction::new(
            Some("genesis".to_string()),
            addr.clone(),
            40,
            1,
            0,
            bc.chain_id,
        );
        fund_tx.sign(&sk_genesis, &pk_genesis);

        bc.pending_transactions
            .add_transaction(fund_tx.clone())
            .unwrap();
        bc.mine_pending_transactions("miner1").unwrap();

        let balance = bc.get_balance(&addr);

        let tx = signed_tx(&sk, &pk, &addr, "bob", balance / 2, 1, 0, 1);

        assert!(bc.add_transaction(tx).is_err());
    }

    #[test]
    fn test_balance_calculation() {
        let mut bc = setup_blockchain();
        let (_sk, pk) = generate_keypair();
        let addr = crate::crypto::generate_address(&pk);

        let (sk_genesis, pk_genesis) = generate_keypair();
        let mut fund_tx = Transaction::new(
            Some("genesis".to_string()),
            addr.clone(),
            99,
            1,
            0,
            bc.chain_id,
        );
        fund_tx.sign(&sk_genesis, &pk_genesis);

        bc.pending_transactions.add_transaction(fund_tx).unwrap();
        bc.mine_pending_transactions("miner1").unwrap();

        let balance = bc.get_balance(&addr);
        assert_eq!(balance, 99);
    }

    #[test]
    fn test_reject_insufficient_balance() {
        let mut bc = setup_blockchain();
        let (sk, pk) = generate_keypair();
        let addr = crate::crypto::generate_address(&pk);

        let tx = signed_tx(&sk, &pk, &addr, "bob", 999_999, 1, 0, bc.chain_id);
        assert!(bc.add_transaction(tx).is_err());
    }

    #[test]
    fn test_chain_tampering_detected() {
        let mut bc = setup_blockchain();
        let (_sk, pk) = generate_keypair();
        let addr = crate::crypto::generate_address(&pk);

        let (sk_genesis, pk_genesis) = generate_keypair();
        let mut fund_tx = Transaction::new(
            Some("genesis".to_string()),
            addr.clone(),
            40,
            1,
            0,
            bc.chain_id,
        );
        fund_tx.sign(&sk_genesis, &pk_genesis);
        bc.pending_transactions.add_transaction(fund_tx).unwrap();
        bc.mine_pending_transactions("miner1").unwrap();

        if let Some(block) = bc.chain.get_mut(1) {
            block.hash =
                "0000fakehash0000000000000000000000000000000000000000000000000000".to_string();
        }
        assert!(bc.validate_chain().is_err());
    }
}
