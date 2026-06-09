# Glosario CryptoSec Lab

## Blockchain

**Simple:** Un libro de contabilidad digital compartido y descentralizado donde cada pagina (bloque) esta sellada criptograficamente.

**Tecnico:** Estructura de datos distribuida donde los datos se almacenan en bloques encadenados por hashes criptograficos. Cada nodo en la red mantiene una copia del ledger. La seguridad deriva del consenso distribuido y la inmutabilidad criptografica.

**Riesgo:** 51% attack, chain reorg, eclipse attack, sybil attack.

## Block

**Simple:** Una "pagina" del libro de blockchain que contiene un conjunto de transacciones.

**Tecnico:** Estructura con index, timestamp, transacciones, previous_hash, hash, nonce, difficulty y miner. El hash del bloque se calcula sobre todos los campos y debe cumplir con la difficulty target (PoW).

**Ejemplo:** `Block { index: 0, hash: "0000abc...", transactions: [...], nonce: 12345 }`

**Riesgo:** Chain tampering, timestamp manipulation.

## Hash

**Simple:** Una huella digital unica de datos. Cualquier cambio en los datos produce un hash completamente diferente.

**Tecnico:** Funcion unidireccional que mapea datos de tamano arbitrario a una salida de tamanio fijo (256 bits para SHA-256). Propiedades: deterministica, rapida de calcular, preimagen resistente, colision resistente.

**Ejemplo:** SHA-256("hello") = "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"

**Riesgo:** Colision attacks, length extension attacks (SHA-256 no afectado), weak hash functions (MD5, SHA-1).

## SHA-256

**Simple:** Algoritmo de hash seguro de 256 bits, usado en Bitcoin y la mayoria de blockchains.

**Tecnico:** Secure Hash Algorithm 256-bit, parte de la familia SHA-2. Produce salida de 32 bytes (64 caracteres hex). Es la base del PoW en Bitcoin.

**Riesgo:** Teoricamente vulnerable a computacion cuantica (Grover's algorithm reduce seguridad de 256 a 128 bits).

## Nonce

**Simple:** Un numero que los mineros modifican para encontrar un hash valido que cumpla con la dificultad.

**Tecnico:** "Number used once". En PoW, el nonce se incrementa hasta que el hash del bloque comienza con N ceros (donde N es la difficulty). En transacciones, el nonce previene double spending y replay attacks.

**Riesgo:** Nonce reuse en wallets, nonce leakage en firmas ECDSA (llevo a hackeo de PS3).

## Mining

**Simple:** El proceso de resolver un problema matematico (encontrar un hash valido) para agregar un bloque a la blockchain.

**Tecnico:** En PoW, los mineros compiten para encontrar un nonce tal que `SHA-256(block_data + nonce)` comience con N ceros. El primero en encontrar gana la recompensa del bloque (coinbase + fees).

**Riesgo:** 51% attack, selfish mining, mining centralization.

## Proof of Work (PoW)

**Simple:** Un mecanismo donde los mineros demuestran que gastaron poder computacional para proponer un bloque valido.

**Tecnico:** El minero debe encontrar un nonce que haga que el hash del bloque sea menor que un target. La dificultad se ajusta para mantener un tiempo de bloque constante. Es costoso de producir pero barato de verificar.

**Implementacion en core-chain:** `consensus::pow::mine_hash()` busca un nonce donde `SHA-256(data + nonce).starts_with("0".repeat(difficulty))`.

**Riesgo:** 51% attack, wasteful energy consumption, ASIC centralization.

## Proof of Stake (PoS)

**Simple:** Los validadores son seleccionados para proponer bloques segun la cantidad de tokens que tienen "apostados" (staked).

**Tecnico:** Los validadores registran un stake. La seleccion del validador es ponderada por el stake. Si un validador actua mal, su stake es "slashed" (cortado). Es mas eficiente que PoW pero introduce nuevos riesgos.

**Implementacion en core-chain:** `consensus::pos::PoS` con registro de validadores, seleccion ponderada por stake, slashing y rewards.

**Riesgo:** Nothing at stake, long-range attack, stake grinding, centralizacion por stake grande.

## Validator

**Simple:** Un nodo que asegura la red mediante staking y validacion de bloques.

**Tecnico:** En PoS, un validador registra un stake minimo, propone y vota bloques, y recibe recompensas. Puede ser "slashed" por comportamiento malicioso.

**Riesgo:** Validador malicioso, collusion, slashing por errores.

## Node

**Simple:** Una computadora conectada a la red blockchain que mantiene una copia del ledger.

**Tecnico:** Un nodo puede ser full node (valida toda la cadena), light client (solo verifica headers), o miner/validator node. Los nodos se comunican via protocolo peer-to-peer.

**Riesgo:** Eclipse attack, sybil attack, DoS.

## Mempool

**Simple:** Una "sala de espera" para transacciones que aun no han sido incluidas en un bloque.

**Tecnico:** Pool de transacciones pendientes. Las transacciones se ordenan por fee (gas price). Los mineros/validadores seleccionan las de mayor fee para incluirlas en el siguiente bloque.

**Riesgo:** Mempool spam, front-running, MEV, transaction censorship.

## Transaction

**Simple:** Una transferencia de valor entre dos direcciones en la blockchain.

**Tecnico:** Estructura con from, to, amount, fee, nonce, signature. Las transacciones son firmadas digitalmente para probar autenticidad. Las coinbase no tienen from (son la recompensa del minero).

**Riesgo:** Double spend, replay attack, malleability, front-running.

## Fee

**Simple:** El costo pagado al minero/validador por incluir la transaccion en un bloque.

**Tecnico:** Tarifa en tokens nativos que incentiva a los mineros/validadores a incluir la transaccion. A mayor fee, mayor prioridad. En mempool, `order_by_fee()` ordena las transacciones de mayor a menor fee.

**Riesgo:** Fee estimation, fee sniping, dust attacks.

## Wallet

**Simple:** Un programa que guarda tus claves privadas y te permite enviar/recibir criptomonedas.

**Tecnico:** Genera y almacena un par de claves (privada/publica). La clave privada firma transacciones. La clave publica deriva en una direccion. La wallet nunca expone la clave privada.

**Implementacion en core-chain:** `Wallet::generate()` crea un par de claves Ed25519. `Wallet::encrypt_private_key()` cifra la clave privada con password.

**Riesgo:** Exposicion de private key, seed phrase, phishing, clipboard hijacking, malicious dApps.

## Private Key

**Simple:** La clave secreta que controla tus fondos. Quien la tiene, controla la wallet. Nunca compartirla.

**Tecnico:** Un numero aleatorio de 256 bits (32 bytes) usado para firmar transacciones. En Ed25519, es un escalar de 32 bytes. La seguridad de toda la wallet depende del secreto de esta clave.

**Ejemplo:** `0x4f3edf983279636c3f1c3c3f1c3f1c3f1c3f1c3f1c3f1c3f1c3f1c3f1c3f`

**Riesgo:** Exposicion, robo,遗失, malware, keylogger.

## Public Key

**Simple:** La clave que compartes con otros para recibir pagos. Derivada de la private key.

**Tecnico:** En Ed25519, es un punto en la curva Curve25519 de 32 bytes. Se deriva deterministicamente de la private key. De la public key se genera la direccion.

**Riesgo:** Quantum computing (Shor's algorithm), pero Ed25519 es mas resistente que ECDSA.

## Address

**Simple:** Tu "numero de cuenta" en la blockchain. Lo compartes para recibir fondos.

**Tecnico:** Hash de la clave publica con checksum. En core-chain: `SHA-256(SHA-256(pubkey))[..20]` + checksum, codificado en Base58. 25 bytes totales.

**Formato:** Comienza con "1", "3" o "bc1" dependiendo del formato. En core-chain: prefijo 0x00 + 20 bytes hash + 4 bytes checksum.

**Riesgo:** Address poisoning, typosquatting, collision (extremadamente raro).

## Seed Phrase

**Simple:** 12 o 24 palabras que representan toda tu wallet. Con ellas puedes recuperar todas tus claves.

**Tecnico:** BIP-39 mnemonic. 128-256 bits de entropia codificados como palabras de un diccionario de 2048 palabras. Se usa para derivar deterministicamente todas las claves de una wallet.

**Riesgo:** Exposicion fisica, phishing, social engineering, malware.

## Signature

**Simple:** Tu "firma digital" que prueba que autorizas una transaccion sin revelar tu clave privada.

**Tecnico:** En Ed25519, la firma es de 64 bytes. Se calcula como `R = r * B` (donde r es nonce deterministico) y `S = r + H(R, A, M) * a` (donde a es private key). Permite verificacion sin conocer la clave privada.

**Riesgo:** Nonce reuse, biased nonce, side-channel attacks.

## Replay Attack

**Simple:** Re-enviar una transaccion valida en otra red o blockchain para gastar fondos nuevamente.

**Tecnico:** Una transaccion firmada en la chain A (chain_id=1) se reenvia en la chain B (chain_id=1337). Sin proteccion, la transaccion seria valida en ambas redes. **Solucion:** Incluir chain_id y nonce en el hash de la transaccion.

**Implementacion en core-chain:** `Transaction::calculate_hash()` incluye `chain_id`. `Blockchain::validate_transaction_in_chain()` verifica `tx.chain_id == self.chain_id`.

**Riesgo:** Perdida total de fondos durante hard forks.

## Double Spend

**Simple:** Gastar el mismo saldo dos veces antes de que la red detecte el fraude.

**Tecnico:** Un atacante envia dos transacciones con el mismo saldo a diferentes destinatarios. Solo una puede ser confirmada. La proteccion incluye: nonce (cada transaccion tiene nonce unico), UTXO model, account state, y confirmaciones multiples.

**Implementacion en core-chain:** `Blockchain::get_nonce()` y `Blockchain::add_transaction()` verifican que el nonce sea exactamente el esperado.

**Riesgo:** 0-confirmation attacks, race attacks, Finney attacks.

## 51% Attack

**Simple:** Cuando un minero o grupo controla mas del 50% del poder de mineria y puede reorgaizar la cadena.

**Tecnico:** Un atacante con >50% del hashrate puede: (1) minar bloques en privado mas rapido que la red, (2) gastar coins en la cadena publica, (3) publicar la cadena privada mas larga, revirtiendo las transacciones. **Mitigacion:** Aumentar confirmaciones requeridas, usar checkpoints, PoS.

**Simulacion en core-chain:** `Blockchain::replace_chain()` acepta una cadena mas larga como valida (simplificacion educacional).

**Riesgo:** Reversiones de transacciones, double spend, censura.

## Altcoin

**Simple:** Cualquier criptomoneda que no es Bitcoin.

**Tecnico:** Criptomonedas alternativas que se bifurcan de Bitcoin o se crean desde cero con diferentes parametros (consenso, supply, velocidad, privacidad, etc.).

**Riesgo:** Liquidez baja, dev rug pull, vulnerabilidades en codigo nuevo.

## Stablecoin

**Simple:** Una criptomoneda diseñada para mantener un valor estable (usualmente 1 USD).

**Tecnico:** Tipos: colateralizada (USDC, DAI), algoritmica (UST - fallida), commodity-backed (PAXG). Mantiene el peg mediante mecanismos de arbitraje, colateralizacion excesiva o algoritmos de expansion/contraccion de supply.

**Riesgo:** De-peg, colapso de colateral, riesgo de contraparte, regulacion.

## Smart Contract

**Simple:** Un programa que se ejecuta automaticamente en la blockchain cuando se cumplen ciertas condiciones.

**Tecnico:** Codigo inmutable desplegado en la blockchain (Ethereum, Solana, etc.). Escrito en Solidity, Vyper, Rust, etc. Se ejecuta en la EVM. No puede ser modificado una vez desplegado (a menos que sea upgradable via proxy).

**Riesgo:** Reentrancy, access control, oracle manipulation, flash loan attacks, integer overflow.

## DeFi

**Simple:** Finanzas descentralizadas - servicios financieros sin intermediarios tradicionales (bancos, brokers).

**Tecnico:** Ecosistema de protocolos financieros en blockchain que ofrecen lending, borrowing, trading, yield farming, insurance, derivatives. Todo gobernado por smart contracts.

**Riesgo:** Smart contract bugs, oracle manipulation, impermanent loss, rug pull, liquidation risk.

## DEX

**Simple:** Un exchange descentralizado donde puedes intercambiar tokens directamente sin un intermediario.

**Tecnico:** Exchange peer-to-peer automatizado por smart contracts. Usa AMM (Automated Market Maker) con formula x*y=k para determinar precios. Los usuarios proveen liquidez y ganan fees.

**Riesgo:** Impermanent loss, price manipulation, sandwich attacks, liquidity rug pull.

## AMM

**Simple:** Un algoritmo automatico que determina el precio de un token basado en la liquidez disponible.

**Tecnico:** Automated Market Maker. Formula `x * y = k` donde x y y son las reservas de dos tokens en el pool y k es constante. El precio se calcula como `x / y`. Los swaps cambian las reservas manteniendo k constante (mas fees).

**Formula:** `Precio Token A = Reserve B / Reserve A`, `Cantidad Output = Reserve_out * (1 - (Reserve_in / (Reserve_in + Amount_in)))`

**Riesgo:** Slippage, price impact, manipulation en pools con baja liquidez.

## Liquidity Pool

**Simple:** Un fondo comun de tokens que los usuarios aportan para permitir trading en un DEX.

**Tecnico:** Pool de dos o mas tokens bloqueados en un smart contract. Los Liquidity Providers (LPs) depositan tokens en proporcion y reciben LP tokens como recibo. Ganan fees de trading proporcionalmente a su share.

**Riesgo:** Impermanent loss, rug pull, pool draining, price manipulation.

## Slippage

**Simple:** La diferencia entre el precio esperado de un trade y el precio real ejecutado.

**Tecnico:** Ocurre porque el precio cambia entre que se envia la transaccion y se ejecuta (por otros trades, volatilidad, o front-running). Se expresa como porcentaje. En DEXs, se configura un slippage tolerance.

**Riesgo:** Sandwich attacks, MEV, front-running, perdida por alta volatilidad.

## Impermanent Loss

**Simple:** Perdida temporal que sufren los proveedores de liquidez cuando el precio de los tokens cambia respecto a cuando los depositaron.

**Tecnico:** Ocurre cuando el precio en el AMM diverge del precio externo. Los arbitrajistas explotan la diferencia, dejando al LP con mas del token que bajo y menos del que subio. La perdida es "impermanente" si el precio regresa, pero se vuelve permanente si se retira la liquidez.

**Riesgo:** Perdida financiera significativa en pools volatiles.

## Oracle

**Simple:** Un servicio que trae datos del mundo real a la blockchain.

**Tecnico:** Bridge entre datos off-chain y on-chain. Provee precios, clima, resultados deportivos, etc. a smart contracts. Puede ser centralizado (un proveedor) o descentralizado (Chainlink, multiple fuentes).

**Riesgo:** Oracle manipulation, stale prices, flash loan attacks, centralizacion.

## Flash Loan

**Simple:** Un prestamo que debe ser devuelto en la misma transaccion. No requiere colateral.

**Tecnico:** Prestamo instantaneo sin colateral que se toma y devuelve en una unica transaccion atomica. Si no se devuelve, toda la transaccion se revierte. Usado para arbitraje, liquidaciones, y... ataques.

**Riesgo:** Oracle manipulation, governance attacks, price manipulation, sandwich attacks.

## DAO

**Simple:** Una organizacion descentralizada gobernada por sus miembros mediante votacion.

**Tecnico:** Decentralized Autonomous Organization. Organizacion governada por smart contracts y tokens de governance. Los miembros proponen y votan cambios. Las decisiones se ejecutan automaticamente si pasan el quorum y la mayoria.

**Riesgo:** Low quorum attacks, flash loan governance, malicious proposals, no timelock, vote buying.

## NFT

**Simple:** Un token unico que representa propiedad de un activo digital (arte, musica, coleccionables, etc.).

**Tecnico:** Non-Fungible Token. Token ERC-721 (o ERC-1155) en Ethereum. Cada token tiene un token_id unico y metadata (tokenURI). No son intercambiables 1:1 como los tokens ERC-20.

**Riesgo:** Metadata manipulable, mint infinito, royalty bypass, phishing, wash trading.

## Exchange (CEX)

**Simple:** Un exchange centralizado como Binance o Coinbase donde un tercero custodia tus fondos.

**Tecnico:** Plataforma centralizada que mantiene un order book, custodia fondos de usuarios y facilita trading. Requiere KYC/AML. Vulnerable a hacks, rug pulls, y congelamiento de fondos.

**Riesgo:** Hack de exchange, withdrawal freeze, insider trading, perdida de fondos.

## MEV

**Simple:** Maximal Extractable Value - la maxima ganancia que un validador/minero puede obtener reordenando transacciones.

**Tecnico:** Anteriormente "Miner Extractable Value". Los validadores/mineros pueden reordenar, incluir o excluir transacciones para extraer valor. Incluye front-running, sandwich attacks, liquidations, arbitrage.

**Riesgo:** Front-running, sandwich attack, censorship, protocol instability.

## Front-running

**Simple:** Ver una transaccion pendiente y ejecutar la tuya primero para beneficiarte.

**Tecnico:** Observar una transaccion en el mempool y enviar otra con mayor fee para que sea minada primero. En DEXs, comprar antes de una orden grande para venderle luego a mejor precio.

**Riesgo:** Perdidas para usuarios, manipulacion de mercado, unfair advantage.

## Sandwich Attack

**Simple:** Comprar justo antes de una transaccion grande y vender inmediatamente despues para ganar del slippage.

**Tecnico:** Tipo de MEV. El atacante coloca una orden de compra antes de la victima (front-run) y una de venta despues (back-run). La victima compra a precio inflado. Comum en AMMs con slippage tolerance alto.

**Riesgo:** Perdidas sistematicas en DEXs.

## Multisig

**Simple:** Una wallet que requiere multiples firmas para autorizar una transaccion.

**Tecnico:** Multi-signature wallet. Requiere M-de-N firmas para ejecutar (ej: 2-de-3). Comun en treasuries de DAOs, exchanges, y equipos de desarrollo.

**Riesgo:** Key management, perdida de keys, social engineering.

## Timelock

**Simple:** Un retraso forzado antes de que una accion pueda ejecutarse (ej: retiro, cambio de parametros).

**Tecnico:** Mecanismo de seguridad que impone un delay minimo entre cuando una propuesta es aprobada y cuando se ejecuta. Permite a los usuarios revisar y salir si la propuesta es maliciosa.

**Riesgo:** Timelock insuficiente, bypass, centralizacion.

## Governance

**Simple:** El sistema de votacion que controla como se actualiza un protocolo descentralizado.

**Tecnico:** Mecanismo donde los holders de tokens de governance votan propuestas para cambiar parametros del protocolo, asignar fondos del treasury, o upgradear contratos.

**Riesgo:** Flash loan voting, low quorum, vote buying, whale dominance, proposal spam.
