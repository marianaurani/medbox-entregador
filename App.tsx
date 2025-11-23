import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { DeliveryProvider } from './src/contexts/DeliveryContext';
import { WalletProvider } from './src/contexts/WalletContext';
import { BankProvider } from './src/contexts/BankContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import AutoDeliveryGenerator from './src/components/AutoDeliveryGenerator';
import { ChatProvider } from './src/contexts/ChatContext';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useEffect } from 'react';

// App.tsx
export default function App() {
  // useEffect(() => {
  // const clearOldDeliveries = async () => {
  //   try {
  //     // Limpa apenas os pedidos salvos (mantém usuário, carteira, etc)
  //     await AsyncStorage.removeItem('@entregador:deliveries');
  //     console.log('✅ Pedidos antigos limpos! Os novos pedidos terão IDs corretos.');
  //   } catch (error) {
  //     console.error('Erro ao limpar pedidos:', error);
  //   }
  // };
  
//   clearOldDeliveries();
// }, []);
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ChatProvider>
            <DeliveryProvider>
              <WalletProvider>
                <BankProvider>
                  {/* 🎲 Sistema automático de geração de pedidos */}
                  <AutoDeliveryGenerator 
                    enabled={true}           // true = ligado, false = desligado
                    minAvailable={2}         // Gera quando tiver menos de 2 pedidos
                    maxAvailable={8}         // Máximo de 8 pedidos disponíveis
                    checkInterval={3}        // Verifica a cada 3 minutos
                    randomInterval={true}    // Intervalo aleatório (mais realista)
                  />
                  
                  <RootNavigator />
                  <StatusBar style="auto" />
                </BankProvider>
              </WalletProvider>
            </DeliveryProvider>
        </ChatProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}