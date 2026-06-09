# Transaction Security

## Validacao de Transacao

Transacoes devem ser validadas antes de serem aceitas:

1. **Assinatura**: Deve ser valida para o from address
2. **Nonce**: Deve ser o proximo nonce esperado
3. **Saldo**: Sender deve ter saldo suficiente (amount + fee)
4. **Hash**: tx_hash deve corresponder ao conteudo
5. **Chain ID**: Deve corresponder a chain atual
6. **Amount**: Deve ser > 0 (exceto coinbase)

## Replay Protection

Incluir chain_id no hash da transacao:

```rust
let data = format!(
    "{}:{}:{}:{}:{}:{}",
    from, to, amount, fee, nonce, chain_id
);
tx_hash = hash_sha256_hex(data.as_bytes());
```

## Double Spend Prevention

Nonce tracking garante que cada transacao e unica:

```
Account: Alice
Nonce atual: 5

TX1: nonce=5 (aceita, nonce vira 6)
TX2: nonce=5 (rejeitada - ja usado)
TX3: nonce=6 (aceita, nonce vira 7)
```

## Mempool Security

- Rejeitar duplicatas
- Rate limit por endereco
- Fee minima para evitar spam
- Ordenacao por fee
- Tamanho maximo do pool
