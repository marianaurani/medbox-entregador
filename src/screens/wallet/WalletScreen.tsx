// src/screens/wallet/WalletScreen.tsx (VERSÃO CORRIGIDA)
import React, { useEffect } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useWallet } from '../../contexts/WalletContext';
import { WalletStackParamList } from '../../types';
import colors from '../../constants/colors';

const WalletScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<WalletStackParamList>>();
  
  const handleSettings = () => {
    navigation.navigate('WalletSettings');
  };
  
  const { balance, earnings, transactions, isBalanceVisible, toggleBalanceVisibility, resetWallet } = useWallet();
  
  const recentTransactions = transactions.slice(0, 5);

  // ✅ DEBUG: Força verificação quando a tela é aberta
  useEffect(() => {
    console.log('🔄 WalletScreen montada - Verificando saldo...');
    console.log('💰 Saldo atual:', balance.available);
    console.log('📋 Total de transações:', transactions.length);
    
    // Calcula manualmente para comparar
    const totalEarnings = transactions
      .filter(t => t.type === 'entrega' && t.status === 'concluido')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalWithdrawn = transactions
      .filter(t => t.type === 'saque' && t.status === 'concluido')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const calculatedBalance = totalEarnings - totalWithdrawn;
    
    console.log('🧮 Saldo calculado manualmente:', calculatedBalance);
    console.log('📊 Total ganho:', totalEarnings);
    console.log('💸 Total sacado:', totalWithdrawn);
    console.log('📋 Transações de entrega:', transactions.filter(t => t.type === 'entrega').length);
    console.log('💳 Transações de saque:', transactions.filter(t => t.type === 'saque').length);
    
    if (Math.abs(balance.available - calculatedBalance) > 0.01) {
      console.log('⚠️ SALDO DESATUALIZADO!');
      console.log('   Deveria ser:', calculatedBalance);
      console.log('   Está mostrando:', balance.available);
      console.log('   Diferença:', calculatedBalance - balance.available);
    } else {
      console.log('✅ Saldo está correto!');
    }
  }, [balance, transactions]);

  const formatCurrency = (value: number) => {
    if (!isBalanceVisible) {
      return 'R$ ••••••';
    }
    return `R$ ${value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      if (!dateObj || isNaN(dateObj.getTime())) {
        return 'Data inválida';
      }
      
      return dateObj.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'entrega':
        return 'bicycle';
      case 'saque':
        return 'arrow-up-circle';
      case 'bonus':
        return 'gift';
      default:
        return 'cash';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluido':
        return colors.success;
      case 'pendente':
        return colors.warning;
      case 'cancelado':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const handleWithdraw = () => {
    navigation.navigate('Withdraw');
  };

  const handleSeeAllTransactions = () => {
    navigation.navigate('Transactions');
  };

  const handleTransactionPress = (transactionId: string) => {
    navigation.navigate('TransactionDetails', { transactionId });
  };

  // ✅ BOTÃO DE RECALCULAR SALDO (NÃO APAGA NADA)
  const handleRecalculateBalance = async () => {
    Alert.alert(
      'Recalcular Saldo',
      'Isso irá forçar o recálculo do saldo com base nas transações existentes. Nenhuma transação será apagada.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Recalcular',
          onPress: async () => {
            console.log('🔄 Recalculando saldo...');
            if (resetWallet) {
              await resetWallet();
              Alert.alert('✅ Sucesso', 'Saldo recalculado com sucesso!');
            }
          },
        },
      ]
    );
  };

  const renderTransaction = ({ item }: any) => {
    // ✅ Define se é entrada ou saída baseado no TIPO
    const isIncome = item.type === 'entrega' || item.type === 'bonus';
    const displayAmount = Math.abs(item.amount);

    return (
      <TouchableOpacity 
        style={styles.transactionItem}
        onPress={() => handleTransactionPress(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.transactionLeft}>
          <View style={[
            styles.transactionIcon,
            { backgroundColor: isIncome ? colors.medboxLightGreen : colors.backgroundCard }
          ]}>
            <Ionicons
              name={getTransactionIcon(item.type)}
              size={20}
              color={isIncome ? colors.primary : colors.textSecondary}
            />
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionDescription} numberOfLines={1}>
              {item.description}
            </Text>
            <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
          </View>
        </View>
        <View style={styles.transactionRight}>
          <Text style={[
            styles.transactionAmount,
            { color: isIncome ? colors.success : colors.error }
          ]}>
            {isIncome ? '+' : '-'}{formatCurrency(displayAmount)}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>
              {item.status === 'concluido' ? 'Concluído' : item.status === 'pendente' ? 'Pendente' : 'Cancelado'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Carteira</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {/* ✅ BOTÃO RECALCULAR (NÃO APAGA TRANSAÇÕES) */}
          <TouchableOpacity 
            onPress={handleRecalculateBalance}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="calculator-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleSettings}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="settings-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Card de Saldo */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Saldo disponível</Text>
            <TouchableOpacity onPress={toggleBalanceVisibility} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons 
                name={isBalanceVisible ? "eye-outline" : "eye-off-outline"} 
                size={20} 
                color="rgba(255, 255, 255, 0.9)" 
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceAmount}>{formatCurrency(balance.available)}</Text>
          
          <View style={styles.pendingContainer}>
            <Ionicons name="time-outline" size={16} color="rgba(255, 255, 255, 0.8)" />
            <Text style={styles.pendingText}>
              {formatCurrency(balance.pending)} pendente
            </Text>
          </View>

          {/* Botão de Saque */}
          <TouchableOpacity 
            style={[
              styles.withdrawButton,
              balance.available < 10 && styles.withdrawButtonDisabled
            ]} 
            onPress={handleWithdraw}
            disabled={balance.available < 10}
          >
            <Ionicons name="arrow-up-circle-outline" size={20} color="white" />
            <Text style={styles.withdrawButtonText}>
              {balance.available < 10 ? 'Saldo mínimo R$ 10,00' : 'Sacar'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Cards de Resumo */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Hoje</Text>
            <Text style={styles.summaryValue}>{formatCurrency(earnings.today)}</Text>
            <Text style={styles.summarySubtext}>{earnings.deliveriesToday} entregas</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Semana</Text>
            <Text style={styles.summaryValue}>{formatCurrency(earnings.week)}</Text>
            <Text style={styles.summarySubtext}>7 dias</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Mês</Text>
            <Text style={styles.summaryValue}>{formatCurrency(earnings.month)}</Text>
            <Text style={styles.summarySubtext}>30 dias</Text>
          </View>
        </View>

        {/* Histórico de Transações */}
        <View style={styles.transactionsContainer}>
          <View style={styles.transactionsHeader}>
            <Text style={styles.transactionsTitle}>Transações Recentes</Text>
            <TouchableOpacity onPress={handleSeeAllTransactions}>
              <Text style={styles.seeAllText}>Ver todas</Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.length > 0 ? (
            <FlatList
              data={recentTransactions}
              renderItem={renderTransaction}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="wallet-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyText}>Nenhuma transação ainda</Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: colors.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  balanceCard: {
    backgroundColor: colors.primary,
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  pendingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  pendingText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  withdrawButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.6,
  },
  withdrawButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 11,
    color: colors.textLight,
  },
  transactionsContainer: {
    backgroundColor: colors.backgroundLight,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  transactionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
    marginRight: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: colors.textLight,
  },
  transactionRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: colors.divider,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 12,
  },
});

export default WalletScreen;