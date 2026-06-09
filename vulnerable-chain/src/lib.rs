pub mod chain_tampering;
pub mod difficulty_bypass;
pub mod double_spend;
pub mod fifty_one_percent;
pub mod invalid_signature;
pub mod mempool_spam;
pub mod overflow_underflow;
pub mod replay_attack;
pub mod timestamp_manipulation;
pub mod weak_hash;

pub mod prelude {
    pub use crate::chain_tampering::{
        SecureBlock as ChainSecureBlock, VulnerableBlock as ChainVulnBlock,
    };
    pub use crate::difficulty_bypass::{
        SecureBlock as DiffSecureBlock, VulnerableBlock as DiffVulnBlock,
    };
    pub use crate::double_spend::{SecureAccountState, VulnerableAccountState};
    pub use crate::fifty_one_percent::{SimpleBlock, SimpleChain};
    pub use crate::invalid_signature::{
        SecureTransaction as SigSecureTx, VulnerableTransaction as SigVulnTx,
    };
    pub use crate::mempool_spam::{SecureMempool, VulnerableMempool};
    pub use crate::overflow_underflow::{SecureToken, VulnerableToken};
    pub use crate::replay_attack::{
        SecureTransaction as ReplaySecureTx, VulnerableTransaction as ReplayVulnTx,
    };
    pub use crate::timestamp_manipulation::{
        SecureBlock as TsSecureBlock, VulnerableBlock as TsVulnBlock,
    };
    pub use crate::weak_hash::{strong_hash_sha256, weak_hash_md5, weak_hash_sha1};
}
