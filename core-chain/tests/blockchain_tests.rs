use core_chain::block::Block;
use core_chain::blockchain::Blockchain;
use core_chain::config::BlockchainConfig;
use core_chain::transaction::Transaction;

fn setup() -> Blockchain {
    let config = BlockchainConfig::dev();
    Blockchain::new(config)
}

#[test]
fn test_genesis_block_created() {
    let bc = setup();
    assert_eq!(bc.chain.len(), 1);
    assert_eq!(bc.chain[0].index, 0);
    assert!(bc.chain[0].transactions[0].is_coinbase());
}

#[test]
fn test_valid_chain() {
    let bc = setup();
    assert!(bc.validate_chain().is_ok());
}

#[test]
fn test_tampered_chain() {
    let mut bc = setup();
    assert!(bc.validate_chain().is_ok());
    let (_sk, pk) = core_chain::crypto::generate_keypair();
    let addr = core_chain::crypto::generate_address(&pk);
    let (sk_g, pk_g) = core_chain::crypto::generate_keypair();
    let mut fund = core_chain::transaction::Transaction::new(
        Some("genesis".to_string()),
        addr.clone(),
        40,
        1,
        0,
        1337,
    );
    fund.sign(&sk_g, &pk_g);
    bc.pending_transactions.add_transaction(fund).unwrap();
    bc.mine_pending_transactions("miner").unwrap();
    assert!(bc.validate_chain().is_ok());
    bc.chain[1].hash =
        "0000fakehash0000000000000000000000000000000000000000000000000000".to_string();
    let result = bc.validate_chain();
    assert!(result.is_err());
}

#[test]
fn test_invalid_previous_hash() {
    let bc = setup();
    let coinbase = Transaction::new(None, "miner".to_string(), 50, 0, 0, 1337);
    let mut block = Block::new(
        1,
        vec![coinbase],
        "invalid_prev_hash".to_string(),
        2,
        "miner".to_string(),
    );
    block.mine(1_000_000).unwrap();
    let result = bc.chain[0].validate(&block);
    assert!(result.is_err());
}

#[test]
fn test_balance_initial() {
    let bc = setup();
    let balance = bc.get_balance("genesis");
    assert_eq!(balance, 50);
}

#[test]
fn test_replace_chain_longer() {
    let mut bc = setup();
    let mut longer = bc.clone();
    longer.chain.pop();
    let result = bc.replace_chain(longer.chain);
    assert!(result.is_err());
}
