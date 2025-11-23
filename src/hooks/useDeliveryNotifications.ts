// src/hooks/useDeliveryNotifications.ts
import { useEffect, useRef } from 'react';
import { useDelivery } from '../contexts/DeliveryContext';
import { useWallet } from '../contexts/WalletContext';
import { useNotifications } from '../contexts/NotificationContext';

/**
 * Hook que monitora mudanças em entregas e transações
 * e cria notificações automaticamente
 */
export const useDeliveryNotifications = () => {
  const { deliveries } = useDelivery();
  const { transactions } = useWallet();
  const { addNotification } = useNotifications();

  // Refs para rastrear estados anteriores
  const previousDeliveriesRef = useRef(deliveries);
  const previousTransactionsRef = useRef(transactions);

  useEffect(() => {
    const previousDeliveries = previousDeliveriesRef.current;
    const currentDeliveries = deliveries;

    // Detecta NOVOS pedidos disponíveis
    const newAvailableDeliveries = currentDeliveries.filter(
      delivery =>
        delivery.status === 'disponivel' &&
        !previousDeliveries.some(prev => prev.id === delivery.id)
    );

    newAvailableDeliveries.forEach(delivery => {
      addNotification({
        type: 'delivery',
        title: '🚀 Novo pedido disponível',
        message: `${delivery.orderId} • ${delivery.distance.toFixed(1)} km • R$ ${delivery.deliveryFee.toFixed(2)}`,
        deliveryId: delivery.id,
        data: { delivery },
      });
      console.log(`📬 Notificação: Novo pedido ${delivery.orderId}`);
    });

    // Detecta pedidos que foram ACEITOS
    currentDeliveries.forEach(delivery => {
      const previous = previousDeliveries.find(p => p.id === delivery.id);
      
      if (previous?.status === 'disponivel' && delivery.status === 'aceito') {
        addNotification({
          type: 'delivery',
          title: '✅ Pedido aceito',
          message: `Você aceitou o pedido ${delivery.orderId}. Dirija-se à ${delivery.pharmacy.name}`,
          deliveryId: delivery.id,
          data: { delivery },
        });
        console.log(`📬 Notificação: Pedido aceito ${delivery.orderId}`);
      }

      // Detecta pedidos que foram COLETADOS
      if (
        (previous?.status === 'aceito' || previous?.status === 'disponivel') &&
        delivery.status === 'coletado'
      ) {
        addNotification({
          type: 'delivery',
          title: '📦 Pedido coletado',
          message: `Medicamentos coletados. Entregue em ${delivery.customer.address}`,
          deliveryId: delivery.id,
          data: { delivery },
        });
        console.log(`📬 Notificação: Pedido coletado ${delivery.orderId}`);
      }

      // Detecta pedidos EM ROTA
      if (
        (previous?.status === 'coletado' || previous?.status === 'aceito') &&
        delivery.status === 'em_rota'
      ) {
        addNotification({
          type: 'delivery',
          title: '🚴 A caminho do cliente',
          message: `Você está a caminho de entregar ${delivery.orderId} para ${delivery.customer.name}`,
          deliveryId: delivery.id,
          data: { delivery },
        });
        console.log(`📬 Notificação: Em rota ${delivery.orderId}`);
      }

      // Detecta pedidos ENTREGUES
      if (previous?.status !== 'entregue' && delivery.status === 'entregue') {
        addNotification({
          type: 'delivery',
          title: '🎉 Entrega concluída!',
          message: `Pedido ${delivery.orderId} entregue com sucesso. Você ganhou R$ ${delivery.deliveryFee.toFixed(2)}`,
          deliveryId: delivery.id,
          data: { delivery },
        });
        console.log(`📬 Notificação: Entrega concluída ${delivery.orderId}`);
      }
    });

    // Atualiza a referência
    previousDeliveriesRef.current = currentDeliveries;
  }, [deliveries, addNotification]);

  // Monitora NOVAS TRANSAÇÕES (pagamentos)
  useEffect(() => {
    const previousTransactions = previousTransactionsRef.current;
    const currentTransactions = transactions;

    // Detecta novas transações de pagamento
    const newPayments = currentTransactions.filter(
      transaction =>
        transaction.type === 'entrega' &&
        transaction.status === 'concluido' &&
        transaction.amount > 0 &&
        !previousTransactions.some(prev => prev.id === transaction.id)
    );

    newPayments.forEach(transaction => {
      addNotification({
        type: 'payment',
        title: '💰 Pagamento recebido',
        message: `Você recebeu R$ ${transaction.amount.toFixed(2)} pela entrega ${transaction.description}`,
        transactionId: transaction.id,
        data: { transaction },
      });
      console.log(`📬 Notificação: Pagamento recebido R$ ${transaction.amount.toFixed(2)}`);
    });

    // Detecta saques concluídos
    const completedWithdrawals = currentTransactions.filter(
      transaction =>
        transaction.type === 'saque' &&
        transaction.status === 'concluido' &&
        !previousTransactions.some(
          prev => prev.id === transaction.id && prev.status === 'concluido'
        )
    );

    completedWithdrawals.forEach(transaction => {
      addNotification({
        type: 'payment',
        title: '🏦 Saque concluído',
        message: `Seu saque de R$ ${Math.abs(transaction.amount).toFixed(2)} foi processado com sucesso`,
        transactionId: transaction.id,
        data: { transaction },
      });
      console.log(`📬 Notificação: Saque concluído R$ ${Math.abs(transaction.amount).toFixed(2)}`);
    });

    // Detecta bônus recebidos
    const newBonuses = currentTransactions.filter(
      transaction =>
        transaction.type === 'bonus' &&
        transaction.status === 'concluido' &&
        !previousTransactions.some(prev => prev.id === transaction.id)
    );

    newBonuses.forEach(transaction => {
      addNotification({
        type: 'promotion',
        title: '🎁 Bônus recebido!',
        message: `Parabéns! Você ganhou R$ ${transaction.amount.toFixed(2)} de bônus`,
        transactionId: transaction.id,
        data: { transaction },
      });
      console.log(`📬 Notificação: Bônus recebido R$ ${transaction.amount.toFixed(2)}`);
    });

    // Atualiza a referência
    previousTransactionsRef.current = currentTransactions;
  }, [transactions, addNotification]);
};

export default useDeliveryNotifications;