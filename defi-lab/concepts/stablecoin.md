# Stablecoin

## O Que É

Uma **Stablecoin** é um token cripto projetado para manter um valor estável, geralmente atrelado a um ativo externo como o dólar americano (1 USDC = 1 USD). Stablecoins são a espinha dorsal do DeFi, servindo como unidade de conta, reserva de valor e meio de troca com baixa volatilidade.

## Como Funciona Tecnicamente

### Tipos de Stablecoin

#### 1. Fiat-Backed (Garantia Centralizada)

São lastreadas 1:1 por moeda fiduciária mantida em reservas bancárias.

- **Exemplos**: USDC (Circle), USDT (Tether), BUSD (Binance).
- **Garantia**: USD ou equivalents mantidos em bancos tradicionais.
- **Risco**: contraparte (a empresa emissora pode falir ou ser congelada).

#### 2. Crypto-Backed (Garantia Descentralizada)

São lastreadas por criptoativos depositados como colateral, geralmente com sobrecolateralização.

- **Exemplo**: DAI (MakerDAO) — colateralizado por ETH, wBTC, USDC etc.
- **Garantia**: criptoativos em smart contracts.
- **Overcollateralization**: para emitir US$ 100 de DAI, o usuário deposita, por exemplo, US$ 150 de ETH.

```
Colateral Mínimo = Valor Emitido / (Preço do Colateral × Ratio de Colateralização)
```

#### 3. Algorithmic (Algorítmica)

Mantêm a paridade via algoritmos que expandem e contraem a oferta, sem lastro direto.

- **Exemplo**: UST (Terra) — falhou em maio de 2022; FRAX — híbrido (parcialmente colateralizado).
- **Mecanismo**: arbitragem entre token estável e token de governança.
- **Risco**: loop de morte (death spiral) se a confiança quebra.

### Redemption (Resgate)

Em stablecoins colateralizadas, o usuário pode **queimar** stablecoins para resgatar o colateral subjacente:

- **DAI**: queimar DAI no protocolo Maker para liberar ETH ou USDC depositado.
- **USDC**: resgatar por USD na Circle (sujeito a KYC).

### Circuit Breaker (Disjuntor)

Mecanismo de segurança que pausa emissão/resgate se houver anomalias (ex.: USDC congelando emissões durante o depeg de março de 2023). Também presente em protocols como o Compound para pausar mercados em emergência.

## Exemplo

1. Alice deposita 10 ETH (US$ 20.000) no Maker Vault com 150% de colateralização.
2. O protocolo permite cunhar até US$ 13.333 de DAI.
3. Alice cunha 10.000 DAI e paga uma taxa de estabilidade (juros).
4. Para liberar o ETH, Alice precisa devolver + queimar os 10.000 DAI mais os juros acumulados.

## Risco

- **Depeg**: perda da paridade (ex.: USDC caindo para US$ 0,88 durante crise bancária em 2023; UST colapsando para US$ 0,02 em 2022).
- **Risco de Contraparte**: stablecoins centralizadas podem congelar endereços ou ser bloqueadas por reguladores.
- **Risco de Colateral**: queda brusca do ativo que lastreia a stablecoin pode levar a liquidações em massa e subcolateralização.
- **Risco Algorítmico**: deaths piral — se a demanda cai, o mecanismo de expansão/contração falha e o token perde valor irreversivelmente.

## Mitigação

- **Escolher Stablecoins Auditadas**: dar preferência a stablecoins com auditorias públicas de reservas (USDC, USDT com attestations regulares).
- **Diversificar em Múltiplas Stablecoins**: não manter exposição concentrada em uma única stablecoin.
- **Monitorar Depeg com Oracles**: usar feeds que detectam desancoragem (ex.: Chainlink, RedStone) para reagir rapidamente.
- **Preferir Overcollateralization**: stablecoins como DAI são mais resistentes a pânicos porque têm colateral em excesso nos vaults.
- **Circuit Breakers**: verificar se o protocolo tem mecanismos de pausa para emergências.
