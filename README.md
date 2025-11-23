# 📦 Mobile Entregador

> Aplicativo mobile para entregadores de farmácias gerenciarem entregas, carteira digital e perfil profissional.

<div align="center">

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

</div>

---

## 📱 Sobre o Projeto

Aplicativo desenvolvido para **fins acadêmicos** como parte da disciplina de Desenvolvimento Mobile.

Sistema para entregadores que permite:
- 🗺️ **Visualizar heat areas** (áreas com mais demanda) no mapa
- 📦 **Aceitar, visualizar detalhes e finalizar pedidos**
- 💰 Gerenciar carteira digital e realizar saques
- 📄 Upload de documentos (CNH e foto do entregador)
- 🚗 Navegar até destinos e acompanhar rotas

---

## 🚀 Tecnologias Utilizadas

- **React Native** `0.81.5`
- **Expo SDK** `~54.0.23`
- **TypeScript** `~5.9.2`
- **React Navigation** (Bottom Tabs + Stack Navigator)
- **React Native Maps** (visualização de heat areas)
- **Expo Image Picker** (upload de documentos)
- **AsyncStorage** (persistência de dados local)

---

## ⚠️ Observações Importantes

- 📱 **O aplicativo funciona APENAS em dispositivos móveis** (celular físico ou emulador)
- 🚫 **Não funciona na web** devido ao uso de bibliotecas nativas (câmera, mapas)
- 💾 **Não possui backend** - todos os dados são armazenados localmente com AsyncStorage

---

## 📋 Pré-requisitos

Certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) versão 18 ou superior
- [Git](https://git-scm.com/)

---

## 🔧 Passo a Passo para Executar

### **1️⃣ Clone o repositório**

```bash
git clone https://github.com/marianaurani/medbox-entregador.git
```

### **2️⃣ Acesse a pasta do projeto**

```bash
cd mobile-entregador
```

### **3️⃣ Instale as dependências**

```bash
npm install
```

### **4️⃣ Inicie o projeto**

```bash
npm start
```

---

## 📱 Como Executar no Expo Go (RECOMENDADO)

> **🎯 Forma recomendada pelo professor para testar o aplicativo**

### **Passo 1: Instale o Expo Go no seu celular**

<div align="center">

| Android | iOS |
|---------|-----|
| [<img src="https://play.google.com/intl/en_us/badges/static/images/badges/pt-br_badge_web_generic.png" width="200">](https://play.google.com/store/apps/details?id=host.exp.exponent) | [<img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" width="180">](https://apps.apple.com/br/app/expo-go/id982107779) |

</div>

### **Passo 2: Execute o projeto**

```bash
npm start
```

### **Passo 3: Escaneie o QR Code**

- **Android:** Abra o app Expo Go e toque em "Scan QR Code"
- **iOS:** Use a câmera nativa do iPhone para escanear o QR Code

### **Pronto!** 🎉

O aplicativo será carregado automaticamente no seu celular!

---

## 🖥️ Executar no Emulador (Alternativa)

Se preferir usar emulador:

**Android:**
```bash
npm run android
```

**iOS:** *(somente macOS)*
```bash
npm run ios
```

> ⚠️ **Atenção:** É necessário ter o Android Studio (Android) ou Xcode (iOS) configurado.

---

## ✨ Funcionalidades do App

### 🔐 **Autenticação**
- Login e cadastro de entregadores
- Verificação por código de segurança
- Upload de CNH e foto usando câmera
- Seleção de tipo de veículo

### 📦 **Gestão de Pedidos**
- Visualizar lista de pedidos disponíveis
- **Aceitar pedidos**
- **Ver detalhes completos** (endereço, valor, distância)
- **Finalizar entregas**
- Visualizar histórico de entregas

### 🗺️ **Mapa e Navegação**
- Visualização de **heat areas** (regiões com mais demanda)
- Localização em tempo real
- Navegação GPS integrada
- Rotas otimizadas

### 💳 **Carteira Digital**
- Visualizar saldo disponível
- Histórico completo de transações
- Solicitar saques
- Gerenciar chaves PIX

### 👤 **Perfil**
- Dados pessoais do entregador
- Dados bancários (banco, agência, conta)
- Configurações de notificações

---

## 📂 Estrutura do Projeto

```
entregador/
├── src/
│   ├── components/       # Componentes reutilizáveis
│   ├── constants/        # Cores e constantes
│   ├── contexts/         # Context API (Auth, Delivery, Wallet, Bank)
│   ├── navigation/       # Navegação (Bottom Tabs + Stack)
│   ├── screens/          # Telas da aplicação
│   │   ├── auth/         # Autenticação e cadastro
│   │   ├── delivery/     # Pedidos e entregas
│   │   ├── home/         # Tela principal com mapa
│   │   ├── menu/         # Menu e notificações
│   │   ├── profile/      # Perfil e dados bancários
│   │   └── wallet/       # Carteira digital
│   ├── types/            # Tipos TypeScript
│   └── utils/            # Funções auxiliares
├── assets/               # Imagens e ícones
├── App.tsx               # Componente raiz
└── package.json          # Dependências
```

---

## 🛠️ Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm start` | Inicia o servidor de desenvolvimento |
| `npm run android` | Executa no emulador Android |
| `npm run ios` | Executa no emulador iOS |

---

## 📄 Licença

Este projeto foi desenvolvido para **fins acadêmicos**.

---

⭐ **Se este projeto te ajudou, considere dar uma estrela!**