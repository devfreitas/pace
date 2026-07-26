# DESIGN

<!-- SEED: re-run /impeccable document once there's code to capture the actual tokens and components. -->
---
name: Pace
description: Assistente Visual de Palestras
---

# Design System: Pace

## 1. Overview

**Creative North Star: "O Monolito Arquitetônico"**

Pace é um assistente visual que troca a ansiedade dos cronômetros tradicionais por formas e cores fluidas. Inspirado na sofisticação tátil de hardware premium e interfaces editoriais limpas, a experiência prioriza coreografias visuais em vez de elementos utilitários ruidosos. O design rejeita a fofura de formas arredondadas, preferindo pontas finas, linhas geométricas nítidas e uma elegância glacial. 

**Key Characteristics:**
- **Atmosfera:** Fria, clara, arquitetônica e extremamente sofisticada.
- **Movimento:** Transições de estado coreografadas em 3D e orquestração de ritmo.
- **Redução:** Minimalismo radical, onde menos elementos ampliam o foco na apresentação. Geometria afiada (4px radius).

## 2. Colors

**The Ice Canvas Rule.** A base da interface repousa sobre a claridade: brancos gélidos e tons de azul acinzentado super claros (Ice/Slate White), evocando um ambiente diurno, clínico e de extrema sofisticação. O contraste absoluto vem da tipografia, que usa um "Preto Frio" (Slate Black escuro). É uma interface que parece esculpida em mármore claro ou alumínio, transmitindo conforto respirável e precisão.

*[Hex/OKLCH values to be resolved during implementation]*

## 3. Typography

**Direction:** Unified Serif (`CormorantGaramond`)

A tipografia da aplicação agora é unificada em uma única família Serif elegante e arquitetônica (`CormorantGaramond`). Isso elimina o ar de "sistema utilitário" de uma fonte Sans-Serif comum e veste a interface inteira — de grandes títulos a pequenos botões de ação e rótulos — com uma aura editorial, refinada e majestosa.

*[font pairing to be chosen at implementation]*

## 4. Elevation

Para suportar o movimento coreografado e as entradas orquestradas de tela, o sistema utiliza camadas estruturais e sobreposições orgânicas. Superfícies flutuam suavemente umas sobre as outras, garantindo profundidade ambiente sem a rigidez de dezenas de *cards* em formato de grade.

## 5. Components

*(Components to be populated once implemented in code)*

## 6. Do's and Don'ts

### Do:
- **Do** priorizar comunicação sensorial usando ritmo de cor, formas orgânicas e haptics no lugar de contadores numéricos.
- **Do** focar em animações de 60fps ininterruptas (Skia/Reanimated).
- **Do** manter a interface do palco 100% voltada ao foco: uma tela sem bloqueios, alertas ou interrupções.

### Don't:
- **Don't** criar interfaces que pareçam relógios digitais genéricos ou apps de cronômetro de academia.
- **Don't** utilizar uma estética utilitária fria (painéis técnicos, dashboards de aviação).
- **Don't** cair nos clichês de produtividade SaaS (uso abusivo de cards, excesso de botões, barras de ferramentas densas, textos miúdos).
- **Don't** usar notificações ou animações que quebrem a imersão do apresentador.
