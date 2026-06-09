use core_chain::consensus::pos::PoS;
use core_chain::consensus::pow;

#[test]
fn test_pow_validates_hash() {
    let hash = "0000abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
    assert!(pow::validate_pow(hash, 4));
}

#[test]
fn test_pow_rejects_invalid_hash() {
    let hash = "abcd0000ef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
    assert!(!pow::validate_pow(hash, 4));
}

#[test]
fn test_pow_adjust_difficulty() {
    assert_eq!(pow::adjust_difficulty(4, 2, 10), 5);
    assert_eq!(pow::adjust_difficulty(4, 30, 10), 3);
    assert_eq!(pow::adjust_difficulty(4, 10, 10), 4);
}

#[test]
fn test_pos_register_and_select() {
    let mut pos = PoS::new(100, 50);
    pos.register_validator("alice", 500, 0).unwrap();
    pos.register_validator("bob", 300, 0).unwrap();
    assert_eq!(pos.validator_count(), 2);
    let selected = pos.select_validator("seed", 10);
    assert!(selected.is_some());
}

#[test]
fn test_pos_no_validators() {
    let pos = PoS::new(100, 50);
    assert!(pos.select_validator("seed", 10).is_none());
}

#[test]
fn test_pos_slash() {
    let mut pos = PoS::new(100, 50);
    pos.register_validator("alice", 200, 0).unwrap();
    pos.slash_validator("alice").unwrap();
    assert_eq!(pos.validators.get("alice").unwrap().stake, 150);
}

#[test]
fn test_pos_reward() {
    let mut pos = PoS::new(100, 50);
    pos.register_validator("alice", 100, 0).unwrap();
    pos.reward_validator("alice", 10).unwrap();
    assert_eq!(pos.total_stake, 110);
}
