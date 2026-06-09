# Direção Visual e Design System — CryptoSec

Este documento estabelece as diretrizes de design visual, paleta de cores, tipografia e sensação estética (look & feel) recomendadas para a Landing Page e os materiais comerciais do **CryptoSec Lab**.

---

## 1. Conceito Estético Geral (Look & Feel)
O design deve transmitir **Rigor Técnico, Segurança Sólida e Estética Premium**. Devemos nos posicionar como uma empresa de engenharia de software confiável e de alta tecnologia.

### O que EVITAR (Sinal Vermelho):
*   **Imagens de caveiras, capuzes de hacker ou cadeados gigantes piscando.**
*   **Fundos pretos com códigos verdes caindo estilo Matrix (clichê adolescente).**
*   **Cores neon fluorescentes exageradas e fontes decorativas ilegíveis.**

### Referências de Sensação Visual (Benchmarks de Mercado):
*   **Linear:** Minimalismo, cantos arredondados finos, bordas cinza claro com baixa opacidade e tipografia limpa.
*   **Vercel:** Contraste preto e branco marcante, grades de layout bem delineadas e tipografia sem serifa geométrica.
*   **Stripe / OpenAI Dashboard:** Visual corporativo premium, uso sutil de degradês coloridos nas áreas de CTA e diagramação técnica limpa.
*   **Tenderly:** Interfaces focadas em dados de transações on-chain, fontes monoespaçadas finas e gráficos de fluxos.

---

## 2. Paleta de Cores (Design System Escuro)

Utilizaremos uma paleta essencialmente escura baseada em escalas de cinzas frios e toques sutis de cores funcionais:

```text
Background Principal  : #090A0F (Preto Azulado Profundo)
Cards & Containers    : #131520 (Cinza Escuro com leve saturação azul)
Bordas e Divisores     : #212535 (Cinza Médio Frio com transparência)
Text Primary (Títulos): #FFFFFF (Branco Puro)
Text Secondary (Corpo): #94A3B8 (Cinza Slate Claro)
Cor de Acento (CTAs)  : #38BDF8 (Azul Céu) ou Gradiente Premium (#38BDF8 -> #818CF8)
Cor de Sucesso (Safe) : #34D399 (Verde Esmeralda Sutil)
Cor de Erro (Vulner)  : #F87171 (Vermelho Coral Sutil)
```

---

## 3. Tipografia

Recomenda-se o uso de duas famílias de fontes do Google Fonts para manter o contraste entre o institucional e o técnico:

*   **Títulos e Textos Principais (Sem Serifa):** **Inter** ou **Outfit** (modernas, limpas e altamente legíveis).
*   **Elementos Técnicos e Detalhes (Monoespaçada):** **JetBrains Mono** ou **Fira Code** (utilizada em hashes de commits, trechos de código Solidity/Rust, tags, tabelas de escopo e marcações de severidade).

---

## 4. Elementos Visuais e Diagramação

### Grades Técnicas (Technical Grid Layout):
Utilizar grades limpas de 1px de espessura com opacidade reduzida para separar as seções, remetendo a interfaces de engenharia e blueprints de software.

### Grafos de Fluxo e Diagramas:
Em vez de fotos genéricas de bancos de dados, usar diagramas de blocos vetoriais limpos (SVG ou Mermaid) que ilustram o fluxo lógico de uma transação. Isso demonstra de forma tangível a complexidade da auditoria.

### Efeito Glassmorphism:
Utilizar fundos de cartões levemente translúcidos com efeito de desfoque de fundo (`backdrop-filter: blur(12px)`) e bordas finas com gradiente linear sutil, gerando sensação de profundidade e sofisticação visual.
