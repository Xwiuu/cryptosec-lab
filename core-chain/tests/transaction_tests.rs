use core_chain::crypto::generate_keypair;
use core_chain::transaction::Transaction;

#[test]
fn test_accept_signed_transaction() {
    let (sk, pk) = generate_keypair();
    let addr = core_chain::crypto::generate_address(&pk);
    let mut tx = Transaction::new(Some(addr), "recipient".to_string(), 100, 1, 0, 1337);
    tx.sign(&sk, &pk);
    assert!(tx.validate().is_ok());
}

#[test]
fn test_reject_unsigned_transaction() {
    let tx = Transaction::new(
        Some("sender".to_string()),
        "recipient".to_string(),
        100,
        1,
        0,
        1337,
    );
    assert!(tx.validate().is_err());
}

#[test]
fn test_reject_replay_different_chain() {
    let (sk, pk) = generate_keypair();
    let addr = core_chain::crypto::generate_address(&pk);
    let mut tx = Transaction::new(Some(addr), "recipient".to_string(), 100, 1, 0, 1337);
    tx.sign(&sk, &pk);
    let tx_replay = Transaction::new(
        Some("sender".to_string()),
        "recipient".to_string(),
        100,
        1,
        0,
        1,
    );
    assert_ne!(tx.tx_hash, tx_replay.tx_hash);
}

#[test]
fn test_reject_zero_amount() {
    let (sk, pk) = generate_keypair();
    let addr = core_chain::crypto::generate_address(&pk);
    let mut tx = Transaction::new(Some(addr), "recipient".to_string(), 0, 1, 0, 1337);
    tx.sign(&sk, &pk);
    assert!(tx.validate().is_err());
}

#[test]
fn test_coinbase_no_from() {
    let tx = Transaction::new(None, "miner".to_string(), 50, 0, 0, 1337);
    assert!(tx.is_coinbase());
    assert!(tx.validate().is_ok());
}

#[test]
fn test_transaction_chain_id_protection() {
    let tx1 = Transaction::new(Some("a".to_string()), "b".to_string(), 100, 1, 0, 1337);
    let tx2 = Transaction::new(Some("a".to_string()), "b".to_string(), 100, 1, 0, 1);
    assert_ne!(tx1.tx_hash, tx2.tx_hash);
}
