// src/contexts/DeliveryContext.tsx
import React, { createContext, useState, useContext, useCallback } from 'react';
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
}

const DeliveryContext = createContext<DeliveryContextData>({} as DeliveryContextData);

export const DeliveryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deliveries, setDeliveries] = useState<Delivery[]>(mockDeliveries);

  const acceptDelivery = useCallback(async (deliveryId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      setDeliveries(prev =>
        prev.map(delivery =>
          delivery.id === deliveryId
            ? {
                ...delivery,
                status: 'aceito' as const,
                acceptedAt: new Date(),
              }
            : delivery
        )
      );
    } catch (error) {
      console.error('Erro ao aceitar pedido:', error);
      throw error;
    }
  }, []);

  const collectDelivery = useCallback(async (deliveryId: string, code: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      if (code.length < 4 || code.length > 6) {
        return false;
      }

      setDeliveries(prev =>
        prev.map(delivery =>
          delivery.id === deliveryId
            ? {
                ...delivery,
                status: 'em_rota' as const,
                collectedAt: new Date(),
              }
            : delivery
        )
      );

      return true;
    } catch (error) {
      console.error('Erro ao coletar pedido:', error);
      throw error;
    }
  }, []);

  const completeDelivery = useCallback(async (deliveryId: string, code: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      if (code.length < 4 || code.length > 6) {
        return false;
      }

      setDeliveries(prev =>
        prev.map(delivery =>
          delivery.id === deliveryId
            ? {
                ...delivery,
                status: 'entregue' as const,
                deliveredAt: new Date(),
              }
            : delivery
        )
      );

      return true;
    } catch (error) {
      console.error('Erro ao finalizar entrega:', error);
      throw error;
    }
  }, []);

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
      }}
    >
      {children}
    </DeliveryContext.Provider>
  );
};

export const useDelivery = () => {
  const context = useContext(DeliveryContext);

  if (!context) {
    // throw new Error('useDelivery deve ser usado dentro de um DeliveryProvider');
    console.error('useDelivery deve ser usado dentro de um DeliveryProvider');
    return {} as DeliveryContextData; // Retorna vazio temporariamente
  }

  return context;
};