use thiserror::Error;

use crate::crypto::CryptoError;

#[derive(Error, Debug, Clone, PartialEq)]
pub enum BlockchainError {
    #[error("Invalid block: {0}")]
    InvalidBlock(String),

    #[error("Invalid transaction: {0}")]
    InvalidTransaction(String),

    #[error("Invalid signature")]
    InvalidSignature,

    #[error("Insufficient balance")]
    InsufficientBalance,

    #[error("Double spend detected")]
    DoubleSpend,

    #[error("Replay attack detected")]
    ReplayAttack,

    #[error("Invalid previous hash")]
    InvalidPreviousHash,

    #[error("Chain tampered: block {0} hash mismatch")]
    ChainTampered(u64),

    #[error("Difficulty not met")]
    DifficultyNotMet,

    #[error("Transaction not found")]
    TransactionNotFound,

    #[error("Duplicate transaction")]
    DuplicateTransaction,

    #[error("Fee too low. Minimum: {0}, got: {1}")]
    FeeTooLow(u64, u64),

    #[error("Amount must be positive")]
    AmountMustBePositive,

    #[error("Mempool full")]
    MempoolFull,

    #[error("Address not found")]
    AddressNotFound,

    #[error("Invalid address")]
    InvalidAddress,

    #[error("Spam detected: too many transactions from {0}")]
    SpamDetected(String),

    #[error("Stake validation error: {0}")]
    StakeError(String),

    #[error("Storage error: {0}")]
    StorageError(String),

    #[error("Consensus error: {0}")]
    ConsensusError(String),

    #[error("Configuration error: {0}")]
    ConfigError(String),
}

impl From<CryptoError> for BlockchainError {
    fn from(_e: CryptoError) -> Self {
        BlockchainError::InvalidSignature
    }
}
