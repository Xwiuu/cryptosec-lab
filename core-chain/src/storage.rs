use crate::blockchain::Blockchain;
use crate::errors::BlockchainError;

pub fn serialize_chain(blockchain: &Blockchain) -> Result<Vec<u8>, BlockchainError> {
    serde_json::to_vec(blockchain)
        .map_err(|e| BlockchainError::StorageError(format!("Serialization failed: {}", e)))
}

pub fn deserialize_chain(data: &[u8]) -> Result<Blockchain, BlockchainError> {
    serde_json::from_slice(data)
        .map_err(|e| BlockchainError::StorageError(format!("Deserialization failed: {}", e)))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::config::BlockchainConfig;

    #[test]
    fn test_serialize_deserialize_blockchain() {
        let config = BlockchainConfig::dev();
        let bc = Blockchain::new(config);
        let data = serialize_chain(&bc).unwrap();
        let bc2 = deserialize_chain(&data).unwrap();
        assert_eq!(bc.chain.len(), bc2.chain.len());
    }
}
