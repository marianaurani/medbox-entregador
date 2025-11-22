# 📦 Mobile Entregador

Aplicativo mobile para entregadores gerenciarem suas entregas, carteira digital e dados bancários.

## 🚀 Tecnologias

- **React Native** com **Expo SDK 54**
- **TypeScript**
- **React Navigation** (Bottom Tabs + Native Stack)
- **Context API** para gerenciamento de estado
- **React Native Maps** para mapas e localização
- **Expo Image Picker** para upload de fotos
- **AsyncStorage** para armazenamento local

## 📋 Pré-requisitos

Antes de começar, você precisa ter instalado:

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [Git](https://git-scm.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

```bash
npm install -g expo-cli
```

## 🔧 Instalação

1. **Clone o repositório**

```bash
git clone https://github.com/SEU-USUARIO/mobile-entregador.git
cd mobile-entregador/entregador
```

2. **Instale as dependências**

```bash
npm install
```

> **Nota:** Todas as dependências necessárias já estão listadas no `package.json`, incluindo:
> - `react-native-maps` para exibição de mapas
> - `expo-image-picker` para captura e upload de fotos (CNH e foto do entregador)
> - `@react-navigation/*` para navegação entre telas
> - `@react-native-async-storage/async-storage` para persistência de dados local

### ⚠️ Configurações importantes

O projeto usa **React Native Maps**. Se você tiver problemas ao executar:

- **No Android**: geralmente funciona sem configuração adicional com Expo
- **No iOS**: pode ser necessário aceitar permissões de localização no simulador
- **Para build nativo**: consulte a [documentação do react-native-maps](https://github.com/react-native-maps/react-native-maps)

## ▶️ Como executar

### Iniciar o projeto

```bash
npm start
```

ou

```bash
expo start
```

### Executar no dispositivo físico

1. Instale o aplicativo **Expo Go** no seu celular:
   - [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS](https://apps.apple.com/br/app/expo-go/id982107779)

2. Escaneie o QR Code que aparece no terminal ou no navegador

### Executar no emulador

- **Android:**
```bash
npm run android
```

- **iOS:** (apenas no macOS)
```bash
npm run ios
```

## 📱 Funcionalidades

### Autenticação
- Login e cadastro de entregadores
- Verificação por código de segurança (email/SMS)
- Upload de CNH usando `expo-image-picker`
- Upload de foto do entregador
- Seleção de veículo

### Entregas
- Lista de entregas disponíveis
- Detalhes da entrega com mapa (`react-native-maps`)
- Acompanhamento de entregas em andamento
- Navegação e rotas no mapa

### Carteira Digital
- Visualização de saldo
- Histórico de transações
- Solicitação de saque

### Perfil
- Dados pessoais
- Dados bancários
- Gerenciamento de chaves PIX

## 📂 Estrutura do projeto

```
entregador/
├── src/
│   ├── constants/        # Constantes (cores, etc)
│   ├── contexts/         # Contextos (Auth, Delivery, Wallet, Bank)
│   ├── navigation/       # Navegação (stacks e navigators)
│   ├── screens/          # Telas da aplicação
│   │   ├── auth/         # Telas de autenticação
│   │   ├── delivery/     # Telas de entregas
│   │   ├── home/         # Tela inicial
│   │   ├── menu/         # Menu
│   │   ├── profile/      # Perfil e dados bancários
│   │   └── wallet/       # Carteira digital
│   ├── types/            # Tipos TypeScript
│   └── utils/            # Utilitários e dados mock
├── assets/               # Imagens e ícones
├── App.tsx               # Componente principal
└── package.json          # Dependências do projeto
```

## 🛠️ Scripts disponíveis

- `npm start` - Inicia o servidor de desenvolvimento
- `npm run android` - Executa no emulador Android
- `npm run ios` - Executa no emulador iOS
- `npm run web` - Executa no navegador

## 📄 Licença

Este projeto é desenvolvido para fins acadêmicos.

---

⭐ Se este projeto te ajudou, considere dar uma estrela!