# The Stage

## Sobre o Projeto
**The Stage** é um aplicativo focado em auxiliar palestrantes, apresentadores e criadores de conteúdo a gerenciarem seu tempo com precisão e elegância. O lema do app é: **"O palco é seu. Nós cuidamos do ritmo."**
Ele permite a criação de roteiros de apresentação cronometrados e anotações livres, focando em manter a atenção de quem apresenta onde deve estar: no público. Tudo isso envelopado em uma interface luxuosa, projetada com *Glassmorphism*, gradientes em malha orgânicos (Mesh Gradients) monocromáticos e micro-interações fluidas.

## Features Principais

- **Apresentações Cronometradas**: Crie blocos de apresentação e defina o tempo de cada tópico. O Stage avisa discretamente com avisos visuais e feedback tátil (vibração) quando o tempo se esgotar. Para forçar o avanço, basta dar 2 toques ("taps"), na tela.
- **Anotações Livres**: Um modo focado apenas em texto para quando a apresentação não exige rigidez de tempo.
- **Feedback Tátil Inteligente**: Uso estratégico do Expo Haptics (vibrações leves, médias e de sucesso) para orientar ações sem exigir atenção visual.
- **Dark/Light Mode Integrado**: Totalmente suportado, com o fundo reagindo e se adaptando estruturalmente.
- **Offline First**: Os dados de apresentações e blocos são persistidos diretamente no celular usando `AsyncStorage`.
- **Configurações Inline Modernas**: Confirmações elegantes (como apagar dados) direto no componente, dispensando os alertas padrão feios dos sistemas operacionais.

## Tecnologias Utilizadas

- **[React Native](https://reactnative.dev/)** + **[Expo (SDK 54)](https://expo.dev/)**: Base sólida e atualizada.
- **[React Native Reanimated (v3/4)](https://docs.swmansion.com/react-native-reanimated/)**: Animações complexas e loops contínuos de 60fps puramente nativos (UI Thread).
- **[React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/)**: Detecção precisa do Swipe to Back e Tap duplo.
- **[Expo Blur](https://docs.expo.dev/versions/latest/sdk/blur-view/)**: Aplicação em hardware de vidro fosco em cima das animações.
- **Tipografia Premium**: Uso das fontes Google `Cormorant Garamond` para títulos (sofisticação clássica) e `Inter` para legibilidade técnica.

## Como Executar

### Pré-requisitos
- Node.js (v18+)
- Seu gerenciador de pacotes favorito (`npm`, `yarn` ou `pnpm`)
- Expo Go instalado no seu smartphone, ou Emulador nativo (Android Studio / Xcode).

### Instalação
```bash
# 1. Clone este repositório
git clone https://github.com/devfreitas/stage.git

# 2. Acesse a pasta do projeto
cd stage

# 3. Instale as dependências do projeto
npm install
```

### Rodando o App
```bash
# Inicie o servidor local do Expo
npx expo start -c # Intessante utilizar o '- c' para limpar caches anteriores
```
Após executar este comando:
1. Para rodar no seu celular físico, escaneie o **QR Code** no terminal usando a câmera (iOS) ou o app **Expo Go** (Android).
2. Para rodar no emulador de computador, aperte `a` para Android ou `i` para iOS.

##  Apoie o Projeto 

O The Stage é um aplicativo desenvolvido com carinho e focado em oferecer uma experiência premium e sem distrações. Para que possamos arcar com os custos das licenças de desenvolvedor e publicar o app oficialmente nas lojas para download gratuito, preciso do seu apoio! Se você curtiu o projeto, ou acredita na ideia, considere nos apoiar com um café!

<div align="center">
  <a href="https://buymeacoffee.com/devfreitas" target="_blank">
    <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 50px !important;width: 181px !important;" >
  </a>
</div>

<br />

---

<div align="center">
  Desenvolvido por <a href="https://freitasdev-psi.vercel.app/">DevFreitas</a>☕
</div>
