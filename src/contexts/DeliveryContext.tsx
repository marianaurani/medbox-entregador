// src/contexts/DeliveryContext.tsx
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

  // Carregar entregas salvas ao iniciar
  useEffect(() => {
    loadDeliveries();
  }, []);

  const loadDeliveries = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedDeliveries = JSON.parse(stored);
        // Reconverte as datas de string para Date
        const deliveriesWithDates = parsedDeliveries.map((d: any) => ({
          ...d,
          createdAt: d.createdAt ? new Date(d.createdAt) : new Date(),
          acceptedAt: d.acceptedAt ? new Date(d.acceptedAt) : undefined,
          collectedAt: d.collectedAt ? new Date(d.collectedAt) : undefined,
          deliveredAt: d.deliveredAt ? new Date(d.deliveredAt) : undefined,
        }));
        setDeliveries(deliveriesWithDates);
      }
    } catch (error) {
      console.error('Erro ao carregar entregas:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveDeliveries = async (newDeliveries: Delivery[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newDeliveries));
      setDeliveries(newDeliveries);
    } catch (error) {
      console.error('Erro ao salvar entregas:', error);
    }
  };

  const acceptDelivery = useCallback(async (deliveryId: string) => {
    try {
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
    } catch (error) {
      console.error('Erro ao aceitar pedido:', error);
      throw error;
    }
  }, [deliveries]);

  const collectDelivery = useCallback(async (deliveryId: string, code: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      if (code.length < 4 || code.length > 6) {
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
      return true;
    } catch (error) {
      console.error('Erro ao coletar pedido:', error);
      throw error;
    }
  }, [deliveries]);

  const completeDelivery = useCallback(async (deliveryId: string, code: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      if (code.length < 4 || code.length > 6) {
        return false;
      }

      const updatedDeliveries = deliveries.map(delivery =>
        delivery.id === deliveryId
          ? {
              ...delivery,
              status: 'entregue' as const,
              deliveredAt: new Date(),
            }
          : delivery
      );

      await saveDeliveries(updatedDeliveries);
      return true;
    } catch (error) {
      console.error('Erro ao finalizar entrega:', error);
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
    return deliveries.filter(d => d.status === 'entregue');
  }, [deliveries]);

  // ✅ NOVA FUNÇÃO: Adicionar um pedido novo
  const addNewDelivery = useCallback(async (delivery: Delivery) => {
    try {
      const updatedDeliveries = [delivery, ...deliveries];
      await saveDeliveries(updatedDeliveries);
      console.log('✅ Novo pedido adicionado:', delivery.id);
    } catch (error) {
      console.error('Erro ao adicionar nova entrega:', error);
      throw error;
    }
  }, [deliveries]);

  // ✅ NOVA FUNÇÃO: Adicionar vários pedidos de uma vez
  const addMultipleDeliveries = useCallback(async (newDeliveries: Delivery[]) => {
    try {
      const updatedDeliveries = [...newDeliveries, ...deliveries];
      await saveDeliveries(updatedDeliveries);
      console.log(`✅ ${newDeliveries.length} pedidos adicionados`);
    } catch (error) {
      console.error('Erro ao adicionar entregas:', error);
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
    console.error('useDelivery deve ser usado dentro de um DeliveryProvider');
    return {} as DeliveryContextData;
  }

  return context;
};