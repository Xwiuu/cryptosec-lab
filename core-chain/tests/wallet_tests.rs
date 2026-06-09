use core_chain::crypto;
use core_chain::wallet::Wallet;

#[test]
fn test_wallet_generates_valid_address() {
    let wallet = Wallet::generate();
    let addr = wallet.address();
    assert!(crypto::is_valid_address(addr));
    assert_eq!(addr.len(), 34);
}

#[test]
fn test_wallet_sign_and_verify() {
    let wallet = Wallet::generate();
    let message = b"test_message";
    let sig = crypto::sign_message(
        &crypto::signing_key_from_bytes(&hex::decode(wallet.private_key_hex()).unwrap()).unwrap(),
        message,
    );
    let sig_hex = hex::encode(sig.to_bytes());
    assert!(wallet.verify_message(message, &sig_hex));
}

#[test]
fn test_wallet_from_seed_deterministic() {
    let seed = [42u8; 32];
    let wallet1 = Wallet::from_seed(&seed);
    let wallet2 = Wallet::from_seed(&seed);
    assert_eq!(wallet1.address(), wallet2.address());
    assert_eq!(wallet1.public_key_hex(), wallet2.public_key_hex());
}

#[test]
fn test_different_seeds_different_addresses() {
    let seed1 = [1u8; 32];
    let seed2 = [2u8; 32];
    let w1 = Wallet::from_seed(&seed1);
    let w2 = Wallet::from_seed(&seed2);
    assert_ne!(w1.address(), w2.address());
}

#[test]
fn test_encrypt_decrypt_roundtrip() {
    let wallet = Wallet::generate();
    let password = "secure_password_123";
    let encrypted = wallet.encrypt_private_key(password);
    let decrypted = Wallet::decrypt_private_key(&encrypted, password).unwrap();
    let recovered = Wallet::from_private_key_bytes(&decrypted).unwrap();
    assert_eq!(wallet.address(), recovered.address());
}
