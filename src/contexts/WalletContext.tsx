// src/contexts/WalletContext.tsx (CORRIGIDO - Atualização automática)
import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, WalletBalance, Earnings } from '../types';
import { mockTransactions, mockWalletBalance, mockEarnings } from '../utils/mockData';
import { useDelivery } from './DeliveryContext';

interface WalletContextData {
  balance: WalletBalance;
  transactions: Transaction[];
  earnings: Earnings;
  isBalanceVisible: boolean;
  toggleBalanceVisibility: () => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => Promise<void>;
  withdraw: (amount: number, pixKey: string) => Promise<boolean>;
  getFilteredTransactions: (type?: string) => Transaction[];
  getTransactionById: (id: string) => Transaction | undefined;
  resetWallet: () => Promise<void>; // ✅ NOVO
  loading: boolean;
}

const WalletContext = createContext<WalletContextData>({} as WalletContextData);

const STORAGE_KEYS = {
  BALANCE: '@entregador:wallet:balance',
  TRANSACTIONS: '@entregador:wallet:transactions',
  EARNINGS: '@entregador:wallet:earnings',
  PROCESSED_DELIVERIES: '@entregador:wallet:processedDeliveries',
};

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState<WalletBalance>(mockWalletBalance);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [earnings, setEarnings] = useState<Earnings>(mockEarnings);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [processedDeliveries, setProcessedDeliveries] = useState<Set<string>>(new Set());

  const { deliveries } = useDelivery();

  // Carregar dados salvos ao iniciar
  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const [storedBalance, storedTransactions, storedEarnings, storedProcessed] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.BALANCE),
        AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS),
        AsyncStorage.getItem(STORAGE_KEYS.EARNINGS),
        AsyncStorage.getItem(STORAGE_KEYS.PROCESSED_DELIVERIES),
      ]);

      if (storedBalance) {
        setBalance(JSON.parse(storedBalance));
      }

      if (storedTransactions) {
        const parsed = JSON.parse(storedTransactions);
        const withDates = parsed.map((t: any) => ({
          ...t,
          date: new Date(t.date),
        }));
        
        // ✅ CORREÇÃO: Filtra apenas transações de entregas (remove saques antigos problemáticos)
        const deliveryTransactions = withDates.filter((t: Transaction) => t.type === 'entrega');
        console.log(`📋 [WalletContext] Transações carregadas: ${withDates.length} (${deliveryTransactions.length} de entregas)`);
        
        setTransactions(withDates);
      }

      if (storedEarnings) {
        setEarnings(JSON.parse(storedEarnings));
      }

      if (storedProcessed) {
        setProcessedDeliveries(new Set(JSON.parse(storedProcessed)));
      }
    } catch (error) {
      console.error('Erro ao carregar dados da carteira:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveBalance = async (newBalance: WalletBalance) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BALANCE, JSON.stringify(newBalance));
      setBalance(newBalance);
    } catch (error) {
      console.error('Erro ao salvar saldo:', error);
    }
  };

  const saveTransactions = async (newTransactions: Transaction[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(newTransactions));
      setTransactions(newTransactions);
    } catch (error) {
      console.error('Erro ao salvar transações:', error);
    }
  };

  const saveEarnings = async (newEarnings: Earnings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.EARNINGS, JSON.stringify(newEarnings));
      setEarnings(newEarnings);
    } catch (error) {
      console.error('Erro ao salvar ganhos:', error);
    }
  };

  const saveProcessedDeliveries = async (processed: Set<string>) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.PROCESSED_DELIVERIES,
        JSON.stringify(Array.from(processed))
      );
      setProcessedDeliveries(processed);
    } catch (error) {
      console.error('Erro ao salvar deliveries processadas:', error);
    }
  };

  // ✅ CORREÇÃO PRINCIPAL: Recalcula tudo quando deliveries mudam
  useEffect(() => {
    const updateWalletFromDeliveries = async () => {
      if (loading) {
        console.log('⏳ WalletContext ainda está carregando...');
        return;
      }

      console.log('🔄 [WalletContext] Verificando entregas...');
      console.log('📦 [WalletContext] Total de entregas:', deliveries.length);
      
      const completedDeliveries = deliveries.filter(d => d.status === 'entregue');
      console.log('✅ [WalletContext] Entregas concluídas:', completedDeliveries.length);
      
      if (completedDeliveries.length === 0) {
        console.log('⚠️ [WalletContext] Nenhuma entrega concluída ainda');
        return;
      }

      // Lista as entregas concluídas
      completedDeliveries.forEach(d => {
        console.log(`   📦 Entrega ${d.orderId}: R$ ${d.deliveryFee.toFixed(2)} - Status: ${d.status}`);
      });

      // Verifica se há novas entregas concluídas
      let hasNewDeliveries = false;
      const newTransactionsList: Transaction[] = [...transactions];
      const newProcessed = new Set(processedDeliveries);

      console.log('🔍 [WalletContext] Entregas já processadas:', Array.from(processedDeliveries));

      for (const delivery of completedDeliveries) {
        if (!processedDeliveries.has(delivery.id)) {
          hasNewDeliveries = true;
          
          // Cria transação para a entrega
          const newTransaction: Transaction = {
            id: `tx_${delivery.id}_${Date.now()}`,
            type: 'entrega',
            amount: delivery.deliveryFee,
            description: `Entrega #${delivery.orderId} - ${delivery.customer.name}`,
            date: delivery.deliveredAt || new Date(),
            status: 'concluido',
            deliveryId: delivery.id,
          };

          newTransactionsList.unshift(newTransaction);
          newProcessed.add(delivery.id);

          console.log('✅ [WalletContext] Nova transação criada:', {
            id: newTransaction.id,
            valor: delivery.deliveryFee,
            pedido: delivery.orderId
          });
        }
      }

      // Se houver novas entregas, salva as transações
      if (hasNewDeliveries) {
        console.log('💾 [WalletContext] Salvando novas transações...');
        await saveTransactions(newTransactionsList);
        await saveProcessedDeliveries(newProcessed);
        console.log('✅ [WalletContext] Transações salvas!');
      } else {
        console.log('ℹ️ [WalletContext] Nenhuma nova entrega para processar');
      }

      // ✅ SEMPRE recalcula o saldo baseado nas entregas concluídas
      const totalEarnings = completedDeliveries.reduce((sum, d) => sum + d.deliveryFee, 0);
      
      // Calcula o total sacado
      const withdrawnAmount = newTransactionsList
        .filter(t => t.type === 'saque' && t.status === 'concluido')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      // Calcula saldo disponível
      const availableBalance = Math.max(0, totalEarnings - withdrawnAmount);

      console.log('💰 [WalletContext] Cálculo do saldo:', {
        totalGanho: totalEarnings.toFixed(2),
        totalSacado: withdrawnAmount.toFixed(2),
        saldoDisponivel: availableBalance.toFixed(2),
        entregasConcluidas: completedDeliveries.length
      });

      // Atualiza saldo
      const newBalance: WalletBalance = {
        available: availableBalance,
        pending: 0,
        total: availableBalance,
      };
      await saveBalance(newBalance);
      console.log('✅ [WalletContext] Saldo atualizado!');

      // Atualiza ganhos do dia
      const today = new Date();
      const todayDeliveries = completedDeliveries.filter(d => {
        if (!d.deliveredAt) return false;
        const deliveryDate = new Date(d.deliveredAt);
        return deliveryDate.toDateString() === today.toDateString();
      });

      const todayEarnings = todayDeliveries.reduce((sum, d) => sum + d.deliveryFee, 0);

      // Conta entregas aceitas (não apenas concluídas)
      const acceptedDeliveries = deliveries.filter(d => 
        d.status === 'aceito' || d.status === 'coletado' || d.status === 'em_rota' || d.status === 'entregue'
      );

      // ✅ CORREÇÃO: Mantém a estrutura correta do tipo Earnings
      const newEarnings: Earnings = {
        today: todayEarnings,
        week: totalEarnings,
        month: totalEarnings,
        deliveriesToday: todayDeliveries.length,
        routesAccepted: acceptedDeliveries.length,
        routesCompleted: completedDeliveries.length,
      };
      await saveEarnings(newEarnings);

      console.log('📊 [WalletContext] Ganhos atualizados:', {
        hoje: todayEarnings.toFixed(2),
        entregasHoje: todayDeliveries.length
      });
      console.log('✅ [WalletContext] Atualização completa!');
    };

    updateWalletFromDeliveries();
  }, [deliveries, loading]); // ✅ Dispara quando deliveries mudar

  const toggleBalanceVisibility = useCallback(() => {
    setIsBalanceVisible(prev => !prev);
  }, []);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `tx_${Date.now()}`,
      date: new Date(),
    };

    const updatedTransactions = [newTransaction, ...transactions];
    await saveTransactions(updatedTransactions);

    // ✅ Atualiza saldo corretamente baseado no tipo de transação
    if (transaction.status === 'concluido') {
      let newAvailable = balance.available;
      
      // Se for saque (amount negativo), subtrai o valor absoluto
      if (transaction.type === 'saque') {
        newAvailable = Math.max(0, balance.available - Math.abs(transaction.amount));
      } else {
        // Se for ganho (amount positivo), adiciona
        newAvailable = balance.available + transaction.amount;
      }

      const newBalance: WalletBalance = {
        ...balance,
        available: newAvailable,
        total: newAvailable,
      };
      await saveBalance(newBalance);
    }
  }, [transactions, balance]);

  const withdraw = useCallback(async (amount: number, pixKey: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (amount > balance.available) {
        return false;
      }

      if (amount < 10) {
        return false;
      }

      // ✅ Passa o valor negativo corretamente
      await addTransaction({
        type: 'saque',
        amount: -Math.abs(amount),
        description: `Saque via PIX - ${pixKey}`,
        status: 'concluido',
      });

      return true;
    } catch (error) {
      console.error('Erro ao realizar saque:', error);
      return false;
    }
  }, [balance, addTransaction]);

  const getFilteredTransactions = useCallback((type?: string) => {
    if (!type || type === 'todas') {
      return transactions;
    }
    return transactions.filter(t => t.type === type);
  }, [transactions]);

  const getTransactionById = useCallback((id: string) => {
    return transactions.find(t => t.id === id);
  }, [transactions]);

  // ✅ FUNÇÃO PARA RESETAR DADOS CORROMPIDOS
  const resetWallet = useCallback(async () => {
    try {
      console.log('🔄 [WalletContext] Resetando carteira...');
      
      // Remove transações de saque
      const deliveryOnlyTransactions = transactions.filter(t => t.type === 'entrega');
      await saveTransactions(deliveryOnlyTransactions);
      
      // Recalcula saldo baseado apenas nas entregas concluídas
      const completedDeliveries = deliveries.filter(d => d.status === 'entregue');
      const totalEarnings = completedDeliveries.reduce((sum, d) => sum + d.deliveryFee, 0);
      
      const newBalance: WalletBalance = {
        available: totalEarnings,
        pending: 0,
        total: totalEarnings,
      };
      await saveBalance(newBalance);
      
      console.log('✅ [WalletContext] Carteira resetada com sucesso!');
      console.log(`💰 [WalletContext] Novo saldo: R$ ${totalEarnings.toFixed(2)}`);
    } catch (error) {
      console.error('❌ [WalletContext] Erro ao resetar carteira:', error);
    }
  }, [transactions, deliveries]);

  return (
    <WalletContext.Provider
      value={{
        balance,
        transactions,
        earnings,
        isBalanceVisible,
        toggleBalanceVisibility,
        addTransaction,
        withdraw,
        getFilteredTransactions,
        getTransactionById,
        resetWallet, // ✅ NOVO
        loading,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error('useWallet deve ser usado dentro de um WalletProvider');
  }

  return context;
};