// src/components/AutoDeliveryGenerator.tsx
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useDelivery } from '../contexts/DeliveryContext';
import { generateRandomDelivery, generateMultipleDeliveries } from '../utils/deliveryGenerator';

interface AutoDeliveryGeneratorProps {
  enabled?: boolean; // Se false, desativa a geração automática
  minAvailable?: number; // Número mínimo de pedidos disponíveis antes de gerar novos
  maxAvailable?: number; // Número máximo de pedidos disponíveis
  checkInterval?: number; // Intervalo de verificação em minutos
  randomInterval?: boolean; // Se true, usa intervalo aleatório
}

export const AutoDeliveryGenerator: React.FC<AutoDeliveryGeneratorProps> = ({
  enabled = true,
  minAvailable = 2, // Quando tiver menos de 2, gera novos
  maxAvailable = 8, // Não passa de 8 pedidos disponíveis
  checkInterval = 1, // Verifica a cada 3 minutos
  randomInterval = true, // Usa intervalo aleatório para simular realidade
}) => {
  const { getAvailableDeliveries, addNewDelivery, addMultipleDeliveries, loading } = useDelivery();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef(AppState.currentState);

  // Função para gerar novos pedidos automaticamente
  const generateNewDeliveries = async () => {
    if (!enabled || loading) return;

    try {
      const available = getAvailableDeliveries();
      const currentCount = available.length;

      console.log(`📊 Pedidos disponíveis: ${currentCount}`);

      // Se já tem muitos pedidos, não gera mais
      if (currentCount >= maxAvailable) {
        console.log(`⏸️ Já existem ${currentCount} pedidos disponíveis (máximo: ${maxAvailable})`);
        return;
      }

      // Se tem poucos pedidos, gera novos
      if (currentCount < minAvailable) {
        const toGenerate = Math.min(
          Math.floor(Math.random() * 3) + 1, // Gera de 1 a 3 pedidos
          maxAvailable - currentCount // Não ultrapassa o máximo
        );

        console.log(`🎲 Gerando ${toGenerate} novo(s) pedido(s)...`);

        if (toGenerate === 1) {
          const newDelivery = generateRandomDelivery();
          await addNewDelivery(newDelivery);
          console.log(`✅ Novo pedido adicionado: ${newDelivery.orderId}`);
        } else {
          const newDeliveries = generateMultipleDeliveries(toGenerate);
          await addMultipleDeliveries(newDeliveries);
          console.log(`✅ ${toGenerate} pedidos adicionados`);
        }
      } else {
        // Às vezes gera pedido mesmo tendo alguns disponíveis (30% de chance)
        if (Math.random() < 0.3 && currentCount < maxAvailable) {
          const newDelivery = generateRandomDelivery();
          await addNewDelivery(newDelivery);
          console.log(`✅ Pedido extra adicionado: ${newDelivery.orderId}`);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao gerar pedidos automaticamente:', error);
    }
  };

  // Calcula intervalo (aleatório ou fixo)
  const getNextInterval = () => {
    if (randomInterval) {
      // Intervalo entre 2 e 5 minutos (em milissegundos)
      return (Math.random() * 3 + 2) * 60 * 1000;
    }
    return checkInterval * 60 * 1000;
  };

  // Inicia o timer
  const startTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const interval = getNextInterval();
    console.log(`⏰ Próxima verificação em ${Math.round(interval / 60000)} minuto(s)`);

    intervalRef.current = setInterval(() => {
      generateNewDeliveries();
      
      // Se usa intervalo aleatório, reconfigura o timer
      if (randomInterval) {
        startTimer();
      }
    }, interval);
  };

  // Monitora estado do app (pausa quando app está em background)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('📱 App voltou ao foreground - verificando pedidos...');
        generateNewDeliveries(); // Verifica imediatamente ao voltar
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Inicia o sistema
  useEffect(() => {
    if (!enabled) {
      console.log('⏹️ Gerador automático desabilitado');
      return;
    }

    console.log('🚀 Sistema de geração automática iniciado');
    console.log(`📋 Config: Min=${minAvailable}, Max=${maxAvailable}, Intervalo=${checkInterval}min`);

    // Verifica imediatamente ao iniciar
    setTimeout(() => {
      generateNewDeliveries();
    }, 5000); // Aguarda 5 segundos após o app iniciar

    // Inicia o timer
    startTimer();

    // Limpa ao desmontar
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        console.log('🛑 Sistema de geração automática parado');
      }
    };
  }, [enabled, minAvailable, maxAvailable, checkInterval, loading]);

  return null; // Componente invisível
};

export default AutoDeliveryGenerator;