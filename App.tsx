// App.tsx - VERSÃO PARA PRODUÇÃO
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// import AsyncStorage from '@react-native-async-storage/async-storage'; // ⚠️ Comentado - não é mais necessário
import { AuthProvider } from './src/contexts/AuthContext';
import { DeliveryProvider } from './src/contexts/DeliveryContext';
import { WalletProvider } from './src/contexts/WalletContext';
import { BankProvider } from './src/contexts/BankContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import AutoDeliveryGenerator from './src/components/AutoDeliveryGenerator';
import { ChatProvider } from './src/contexts/ChatContext';
import { NotificationProvider } from './src/contexts/NotificationContext';

export default function App() {
  // ⚠️ CÓDIGO DE LIMPEZA COMENTADO PARA PRODUÇÃO
  // Este código era necessário apenas durante o desenvolvimento para corrigir bugs
  // Em produção, os dados da carteira devem persistir entre as sessões
  
  /*
  useEffect(() => {
    const clearWalletData = async () => {
      try {
        console.log('🧹 Limpando dados corrompidos da carteira...');
        
        await AsyncStorage.multiRemove([
          '@entregador:wallet:balance',
          '@entregador:wallet:transactions',
          '@entregador:wallet:earnings',
          '@entregador:wallet:processedDeliveries',
        ]);
        
        console.log('✅ Dados da carteira limpos com sucesso!');
        console.log('💡 Agora complete algumas entregas para testar');
      } catch (error) {
        console.error('❌ Erro ao limpar dados:', error);
      }
    };
    
    clearWalletData();
  }, []);
  */

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NotificationProvider>
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
        </NotificationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

/* 
📝 NOTAS IMPORTANTES PARA DESENVOLVIMENTO:

✅ VERSÃO ATUAL: PRODUÇÃO
- Os dados da carteira agora persistem entre sessões
- Saldo, transações e entregas são salvos automaticamente
- Use o botão "calculadora" na tela da carteira se precisar recalcular o saldo

⚠️ SE PRECISAR LIMPAR DADOS DURANTE TESTES:
Descomente o bloco useEffect acima e adicione de volta:
import AsyncStorage from '@react-native-async-storage/async-storage';

Ou use este comando no terminal para limpar manualmente:
npx react-native start --reset-cache

🔧 LEMBRE-SE: Comente novamente antes de fazer commit para produção!
*/