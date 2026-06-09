use core_chain::block::Block;
use core_chain::transaction::Transaction;

fn make_coinbase(miner: &str) -> Transaction {
    Transaction::new(None, miner.to_string(), 50, 0, 0, 1337)
}

#[test]
fn test_create_genesis_block() {
    let tx = make_coinbase("genesis");
    let block = Block::new(0, vec![tx], "0".repeat(64), 4, "genesis".to_string());
    assert_eq!(block.index, 0);
    assert_eq!(block.previous_hash, "0".repeat(64));
    assert_eq!(block.difficulty, 4);
}

#[test]
fn test_calculate_hash() {
    let tx = make_coinbase("genesis");
    let mut block = Block::new(0, vec![tx], "0".repeat(64), 2, "genesis".to_string());
    block.mine(1_000_000).unwrap();
    let hash = block.calculate_hash();
    assert_eq!(hash.len(), 64);
    assert!(hash.chars().all(|c| c.is_ascii_hexdigit()));
}

#[test]
fn test_mine_block_with_difficulty() {
    let tx = make_coinbase("miner1");
    let mut block = Block::new(1, vec![tx], "abc".to_string(), 2, "miner1".to_string());
    assert!(block.mine(1_000_000).is_ok());
    assert!(block.hash.starts_with("00"));
    assert!(block.nonce > 0);
}

#[test]
fn test_mine_block_difficulty_4() {
    let tx = make_coinbase("miner1");
    let mut block = Block::new(1, vec![tx], "abc".to_string(), 3, "miner1".to_string());
    assert!(block.mine(10_000_000).is_ok());
    assert!(block.hash.starts_with("000"));
}
