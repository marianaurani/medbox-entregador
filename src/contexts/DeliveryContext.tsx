// src/contexts/DeliveryContext.tsx (COM LOGS DE DEBUG)
import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Delivery } from '../types';
import { mockDeliveries } from '../utils/mockData';

interface DeliveryContextData {
  deliveries: Delivery[];
  acceptDelivery: (deliveryId: string) => Promise<void>;
  collectDelivery: (deliveryId: string, code: string) => Promise<boolean>;
  completeDelivery: (deliveryId: string, code: string) => Promise<boolean>;
  getDeliveryById: (deliveryId: string) => Delivery | undefined;
  getAvailableDeliveries: () => Delivery[];
  getOngoingDeliveries: () => Delivery[];
  getCompletedDeliveries: () => Delivery[];
  addNewDelivery: (delivery: Delivery) => Promise<void>;
  addMultipleDeliveries: (deliveries: Delivery[]) => Promise<void>;
  loading: boolean;
}

const DeliveryContext = createContext<DeliveryContextData>({} as DeliveryContextData);

const STORAGE_KEY = '@entregador:deliveries';

export const DeliveryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deliveries, setDeliveries] = useState<Delivery[]>(mockDeliveries);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeliveries();
  }, []);

  const loadDeliveries = async () => {
    try {
      console.log('📦 [DeliveryContext] Carregando entregas...');
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedDeliveries = JSON.parse(stored);
        const deliveriesWithDates = parsedDeliveries.map((d: any) => ({
          ...d,
          createdAt: d.createdAt ? new Date(d.createdAt) : new Date(),
          acceptedAt: d.acceptedAt ? new Date(d.acceptedAt) : undefined,
          collectedAt: d.collectedAt ? new Date(d.collectedAt) : undefined,
          deliveredAt: d.deliveredAt ? new Date(d.deliveredAt) : undefined,
        }));
        setDeliveries(deliveriesWithDates);
        console.log(`✅ [DeliveryContext] ${deliveriesWithDates.length} entregas carregadas`);
      } else {
        console.log('ℹ️ [DeliveryContext] Nenhuma entrega salva, usando dados mock');
      }
    } catch (error) {
      console.error('❌ [DeliveryContext] Erro ao carregar entregas:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveDeliveries = async (newDeliveries: Delivery[]) => {
    try {
      console.log(`💾 [DeliveryContext] Salvando ${newDeliveries.length} entregas...`);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newDeliveries));
      setDeliveries(newDeliveries);
      
      // Log do resumo de status
      const statusCount = {
        disponivel: newDeliveries.filter(d => d.status === 'disponivel').length,
        aceito: newDeliveries.filter(d => d.status === 'aceito').length,
        coletado: newDeliveries.filter(d => d.status === 'coletado').length,
        em_rota: newDeliveries.filter(d => d.status === 'em_rota').length,
        entregue: newDeliveries.filter(d => d.status === 'entregue').length,
      };
      console.log('📊 [DeliveryContext] Status das entregas:', statusCount);
      console.log('✅ [DeliveryContext] Entregas salvas com sucesso!');
    } catch (error) {
      console.error('❌ [DeliveryContext] Erro ao salvar entregas:', error);
    }
  };

  const acceptDelivery = useCallback(async (deliveryId: string) => {
    try {
      console.log(`🤝 [DeliveryContext] Aceitando entrega ${deliveryId}...`);
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedDeliveries = deliveries.map(delivery =>
        delivery.id === deliveryId
          ? {
              ...delivery,
              status: 'aceito' as const,
              acceptedAt: new Date(),
            }
          : delivery
      );

      await saveDeliveries(updatedDeliveries);
      console.log(`✅ [DeliveryContext] Entrega ${deliveryId} aceita!`);
    } catch (error) {
      console.error('❌ [DeliveryContext] Erro ao aceitar pedido:', error);
      throw error;
    }
  }, [deliveries]);

  const collectDelivery = useCallback(async (deliveryId: string, code: string) => {
    try {
      console.log(`📦 [DeliveryContext] Coletando entrega ${deliveryId}...`);
      await new Promise(resolve => setTimeout(resolve, 800));

      if (code.length < 4 || code.length > 6) {
        console.log('❌ [DeliveryContext] Código inválido');
        return false;
      }

      const updatedDeliveries = deliveries.map(delivery =>
        delivery.id === deliveryId
          ? {
              ...delivery,
              status: 'em_rota' as const,
              collectedAt: new Date(),
            }
          : delivery
      );

      await saveDeliveries(updatedDeliveries);
      console.log(`✅ [DeliveryContext] Entrega ${deliveryId} coletada!`);
      return true;
    } catch (error) {
      console.error('❌ [DeliveryContext] Erro ao coletar pedido:', error);
      throw error;
    }
  }, [deliveries]);

  const completeDelivery = useCallback(async (deliveryId: string, code: string) => {
    try {
      console.log(`🎯 [DeliveryContext] Finalizando entrega ${deliveryId}...`);
      await new Promise(resolve => setTimeout(resolve, 800));

      if (code.length < 4 || code.length > 6) {
        console.log('❌ [DeliveryContext] Código inválido');
        return false;
      }

      const delivery = deliveries.find(d => d.id === deliveryId);
      if (!delivery) {
        console.error('❌ [DeliveryContext] Entrega não encontrada');
        throw new Error('Entrega não encontrada');
      }

      console.log(`📋 [DeliveryContext] Detalhes da entrega:`, {
        id: delivery.id,
        orderId: delivery.orderId,
        statusAtual: delivery.status,
        valor: delivery.deliveryFee
      });

      const updatedDeliveries = deliveries.map(d =>
        d.id === deliveryId
          ? {
              ...d,
              status: 'entregue' as const,
              deliveredAt: new Date(),
            }
          : d
      );

      await saveDeliveries(updatedDeliveries);
      
      console.log(`✅ [DeliveryContext] Entrega ${deliveryId} finalizada!`);
      console.log(`💰 [DeliveryContext] Valor da entrega: R$ ${delivery.deliveryFee.toFixed(2)}`);
      
      return true;
    } catch (error) {
      console.error('❌ [DeliveryContext] Erro ao finalizar entrega:', error);
      throw error;
    }
  }, [deliveries]);

  const getDeliveryById = useCallback(
    (deliveryId: string) => {
      return deliveries.find(d => d.id === deliveryId);
    },
    [deliveries]
  );

  const getAvailableDeliveries = useCallback(() => {
    return deliveries.filter(d => d.status === 'disponivel');
  }, [deliveries]);

  const getOngoingDeliveries = useCallback(() => {
    return deliveries.filter(
      d => d.status === 'aceito' || d.status === 'coletado' || d.status === 'em_rota'
    );
  }, [deliveries]);

  const getCompletedDeliveries = useCallback(() => {
    const completed = deliveries.filter(d => d.status === 'entregue');
    console.log(`📊 [DeliveryContext] Entregas concluídas: ${completed.length}`);
    return completed;
  }, [deliveries]);

  const addNewDelivery = useCallback(async (delivery: Delivery) => {
    try {
      const updatedDeliveries = [delivery, ...deliveries];
      await saveDeliveries(updatedDeliveries);
      console.log('✅ [DeliveryContext] Novo pedido adicionado:', delivery.id);
    } catch (error) {
      console.error('❌ [DeliveryContext] Erro ao adicionar nova entrega:', error);
      throw error;
    }
  }, [deliveries]);

  const addMultipleDeliveries = useCallback(async (newDeliveries: Delivery[]) => {
    try {
      const updatedDeliveries = [...newDeliveries, ...deliveries];
      await saveDeliveries(updatedDeliveries);
      console.log(`✅ [DeliveryContext] ${newDeliveries.length} pedidos adicionados`);
    } catch (error) {
      console.error('❌ [DeliveryContext] Erro ao adicionar entregas:', error);
      throw error;
    }
  }, [deliveries]);

  return (
    <DeliveryContext.Provider
      value={{
        deliveries,
        acceptDelivery,
        collectDelivery,
        completeDelivery,
        getDeliveryById,
        getAvailableDeliveries,
        getOngoingDeliveries,
        getCompletedDeliveries,
        addNewDelivery,
        addMultipleDeliveries,
        loading,
      }}
    >
      {children}
    </DeliveryContext.Provider>
  );
};

export const useDelivery = () => {
  const context = useContext(DeliveryContext);

  if (!context) {
    console.error('❌ [DeliveryContext] useDelivery deve ser usado dentro de um DeliveryProvider');
    return {} as DeliveryContextData;
  }

  return context;
};