// src/contexts/WalletContext.tsx (VERSÃO CORRIGIDA)
import React, { createContext, useState, useContext, useCallback, useEffect, useRef } from 'react';
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
  resetWallet: () => Promise<void>;
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
  
  // Refs para evitar loops e rastrear mudanças
  const isUpdatingRef = useRef(false);
  const lastDeliveryCountRef = useRef(0);
  const lastCompletedIdsRef = useRef<string>('');

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
        
        console.log(`📋 [WalletContext] Transações carregadas: ${withDates.length}`);
        setTransactions(withDates);
      }

      if (storedEarnings) {
        setEarnings(JSON.parse(storedEarnings));
      }

      if (storedProcessed) {
        setProcessedDeliveries(new Set(JSON.parse(storedProcessed)));
      }
    } catch (error) {
      console.error('❌ [WalletContext] Erro ao carregar dados da carteira:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FUNÇÃO PARA RECALCULAR SALDO (SEM DEPENDÊNCIAS CIRCULARES)
  const recalculateBalance = useCallback((currentTransactions: Transaction[]) => {
    const totalEarnings = currentTransactions
      .filter(t => t.type === 'entrega' && t.status === 'concluido')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalWithdrawn = currentTransactions
      .filter(t => t.type === 'saque' && t.status === 'concluido')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const availableBalance = Math.max(0, totalEarnings - totalWithdrawn);

    console.log('💰 [WalletContext] Recalculando saldo:', {
      totalGanho: totalEarnings.toFixed(2),
      totalSacado: totalWithdrawn.toFixed(2),
      saldoDisponivel: availableBalance.toFixed(2),
      transacoesTotal: currentTransactions.length,
    });

    const newBalance: WalletBalance = {
      available: availableBalance,
      pending: 0,
      total: availableBalance,
    };

    // Salva e atualiza
    AsyncStorage.setItem(STORAGE_KEYS.BALANCE, JSON.stringify(newBalance));
    setBalance(newBalance);
    
    console.log('✅ [WalletContext] Saldo atualizado para:', availableBalance.toFixed(2));
    
    return availableBalance;
  }, []);

  // ✅ ATUALIZAÇÃO AUTOMÁTICA QUANDO ENTREGAS MUDAM (SEM DEPENDÊNCIAS CIRCULARES)
  useEffect(() => {
    const updateWalletFromDeliveries = async () => {
      // Evita execução durante carregamento ou se já estiver atualizando
      if (loading || isUpdatingRef.current) return;

      const completedDeliveries = deliveries.filter(d => d.status === 'entregue');
      
      // ✅ Gera hash único dos IDs das entregas concluídas
      const currentCompletedIds = completedDeliveries.map(d => d.id).sort().join(',');
      
      // ✅ Verifica se houve mudança real nas entregas
      if (currentCompletedIds === lastCompletedIdsRef.current) {
        return; // Nada mudou, não precisa atualizar
      }

      isUpdatingRef.current = true;
      
      try {
        console.log('🔄 [WalletContext] Verificando entregas...');
        console.log('✅ [WalletContext] Entregas concluídas:', completedDeliveries.length);

        // ✅ Busca transações atuais do AsyncStorage (fonte única da verdade)
        const storedTransactions = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
        let currentTransactions: Transaction[] = [];
        
        if (storedTransactions) {
          const parsed = JSON.parse(storedTransactions);
          currentTransactions = parsed.map((t: any) => ({
            ...t,
            date: new Date(t.date),
          }));
        }

        // Verifica novas entregas e adiciona transações
        let hasNewDeliveries = false;
        const currentProcessed = new Set(processedDeliveries);
        const newTransactionsToAdd: Transaction[] = [];

        for (const delivery of completedDeliveries) {
          if (!currentProcessed.has(delivery.id)) {
            hasNewDeliveries = true;
            
            const newTransaction: Transaction = {
              id: `tx_${delivery.id}_${Date.now()}`,
              type: 'entrega',
              amount: delivery.deliveryFee,
              description: `Entrega ${delivery.orderId} - ${delivery.customer.name}`,
              date: delivery.deliveredAt || new Date(),
              status: 'concluido',
              deliveryId: delivery.id,
            };

            newTransactionsToAdd.push(newTransaction);
            currentProcessed.add(delivery.id);

            console.log('✅ [WalletContext] Nova transação criada:', {
              id: newTransaction.id,
              valor: delivery.deliveryFee,
              pedido: delivery.orderId
            });
          }
        }

        // Atualiza as transações se houver novas
        if (hasNewDeliveries) {
          console.log('💾 [WalletContext] Salvando novas transações...');
          
          const updatedTransactions = [...newTransactionsToAdd, ...currentTransactions];
          
          // ✅ Salva no AsyncStorage
          await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTransactions));
          
          // ✅ Atualiza state
          setTransactions(updatedTransactions);
          
          // ✅ Salva entregas processadas
          await AsyncStorage.setItem(
            STORAGE_KEYS.PROCESSED_DELIVERIES,
            JSON.stringify(Array.from(currentProcessed))
          );
          setProcessedDeliveries(currentProcessed);

          // ✅ RECALCULA SALDO COM AS NOVAS TRANSAÇÕES
          recalculateBalance(updatedTransactions);
        }

        // Atualiza ganhos
        const today = new Date();
        const todayDeliveries = completedDeliveries.filter(d => {
          if (!d.deliveredAt) return false;
          const deliveryDate = new Date(d.deliveredAt);
          return deliveryDate.toDateString() === today.toDateString();
        });

        const todayEarnings = todayDeliveries.reduce((sum, d) => sum + d.deliveryFee, 0);
        const totalEarnings = completedDeliveries.reduce((sum, d) => sum + d.deliveryFee, 0);

        const acceptedDeliveries = deliveries.filter(d => 
          d.status === 'aceito' || d.status === 'coletado' || d.status === 'em_rota' || d.status === 'entregue'
        );

        const newEarnings: Earnings = {
          today: todayEarnings,
          week: totalEarnings,
          month: totalEarnings,
          deliveriesToday: todayDeliveries.length,
          routesAccepted: acceptedDeliveries.length,
          routesCompleted: completedDeliveries.length,
        };
        
        await AsyncStorage.setItem(STORAGE_KEYS.EARNINGS, JSON.stringify(newEarnings));
        setEarnings(newEarnings);

        // ✅ Atualiza refs
        lastDeliveryCountRef.current = completedDeliveries.length;
        lastCompletedIdsRef.current = currentCompletedIds;

        console.log('✅ [WalletContext] Atualização completa!');
      } catch (error) {
        console.error('❌ [WalletContext] Erro ao atualizar carteira:', error);
      } finally {
        isUpdatingRef.current = false;
      }
    };

    updateWalletFromDeliveries();
  }, [deliveries, loading, processedDeliveries, recalculateBalance]);

  const toggleBalanceVisibility = useCallback(() => {
    setIsBalanceVisible(prev => !prev);
  }, []);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `tx_${Date.now()}`,
      date: new Date(),
    };

    // ✅ Busca transações atuais do AsyncStorage
    const storedTransactions = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    let currentTransactions: Transaction[] = [];
    
    if (storedTransactions) {
      const parsed = JSON.parse(storedTransactions);
      currentTransactions = parsed.map((t: any) => ({
        ...t,
        date: new Date(t.date),
      }));
    }

    const updatedTransactions = [newTransaction, ...currentTransactions];
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTransactions));
    setTransactions(updatedTransactions);

    // Recalcula saldo
    recalculateBalance(updatedTransactions);
  }, [recalculateBalance]);

  const withdraw = useCallback(async (amount: number, pixKey: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (amount > balance.available) {
        console.error('❌ Saldo insuficiente');
        return false;
      }

      if (amount < 10) {
        console.error('❌ Valor mínimo é R$ 10,00');
        return false;
      }

      // ✅ Busca transações atuais do AsyncStorage
      const storedTransactions = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      let currentTransactions: Transaction[] = [];
      
      if (storedTransactions) {
        const parsed = JSON.parse(storedTransactions);
        currentTransactions = parsed.map((t: any) => ({
          ...t,
          date: new Date(t.date),
        }));
      }

      const newTransaction: Transaction = {
        id: `tx_saque_${Date.now()}`,
        type: 'saque',
        amount: -Math.abs(amount),
        description: `Saque via PIX - ${pixKey}`,
        date: new Date(),
        status: 'concluido',
      };

      const updatedTransactions = [newTransaction, ...currentTransactions];
      await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTransactions));
      setTransactions(updatedTransactions);

      // Recalcula saldo
      recalculateBalance(updatedTransactions);
      
      console.log('✅ [WalletContext] Saque realizado com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao realizar saque:', error);
      return false;
    }
  }, [balance, recalculateBalance]);

  const getFilteredTransactions = useCallback((type?: string) => {
    if (!type || type === 'todas') {
      return transactions;
    }
    return transactions.filter(t => t.type === type);
  }, [transactions]);

  const getTransactionById = useCallback((id: string) => {
    return transactions.find(t => t.id === id);
  }, [transactions]);

  const resetWallet = useCallback(async () => {
    try {
      console.log('🔄 [WalletContext] Forçando recálculo do saldo...');
      
      // ✅ Busca transações atuais do AsyncStorage
      const storedTransactions = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      let currentTransactions: Transaction[] = [];
      
      if (storedTransactions) {
        const parsed = JSON.parse(storedTransactions);
        currentTransactions = parsed.map((t: any) => ({
          ...t,
          date: new Date(t.date),
        }));
      }

      console.log('📋 [WalletContext] Total de transações encontradas:', currentTransactions.length);
      console.log('   - Entregas:', currentTransactions.filter(t => t.type === 'entrega').length);
      console.log('   - Saques:', currentTransactions.filter(t => t.type === 'saque').length);
      
      // ✅ Mantém TODAS as transações reais (entregas E saques)
      setTransactions([...currentTransactions]);
      
      // ✅ Recalcula saldo com todas as transações
      const newBalance = recalculateBalance(currentTransactions);
      
      console.log('✅ [WalletContext] Saldo recalculado:', newBalance);
      console.log('✅ [WalletContext] Reset completo!');
    } catch (error) {
      console.error('❌ Erro ao resetar carteira:', error);
    }
  }, [recalculateBalance]);

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
        resetWallet,
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