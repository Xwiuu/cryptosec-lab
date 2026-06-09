# Proof of Work (PoW)

## Conceito

Miners competem para encontrar um nonce que satisfaca:

```
SHA-256(block_data + nonce) < target
```

Onde target e definido pela difficulty. Quanto maior a difficulty, mais zeros o hash precisa comecar.

## Implementacao em core-chain

```rust
pub fn mine_hash(data: &str, difficulty: u32, start_nonce: u64, max_nonce: u64)
    -> Option<(u64, String)>
{
    let target = "0".repeat(difficulty as usize);
    let mut nonce = start_nonce;
    while nonce < max_nonce {
        let input = format!("{}:{}", data, nonce);
        let hash = hash_sha256_hex(input.as_bytes());
        if hash.starts_with(&target) {
            return Some((nonce, hash));
        }
        nonce += 1;
    }
    None
}
```

## Difficulty Adjustment

A difficulty e ajustada periodicamente para manter tempo de bloco constante:

- Se blocks sao muito rapidos: aumenta difficulty
- Se blocks sao muito lentos: diminui difficulty

## Seguranca

- 51% attack: Se >50% hashrate, pode reorg chain
- Selfish mining: Minerar em privado e publicar estrategicamente
- Nao e resistente a ASICs
