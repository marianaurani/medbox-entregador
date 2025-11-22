// src/screens/wallet/TransactionsScreen.tsx
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useWallet } from '../../contexts/WalletContext';
import colors from '../../constants/colors';

type FilterType = 'todas' | 'entrega' | 'saque' | 'bonus';
type PeriodType = 'hoje' | 'semana' | 'mes' | 'todos';

const TransactionsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { transactions, isBalanceVisible } = useWallet();
  
  const [filterType, setFilterType] = useState<FilterType>('todas');
  const [filterPeriod, setFilterPeriod] = useState<PeriodType>('todos');

  // Filtros
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Filtro por tipo
    if (filterType !== 'todas') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    // Filtro por período
    if (filterPeriod !== 'todos') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date);
        
        switch (filterPeriod) {
          case 'hoje':
            return transactionDate >= today;
          case 'semana':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return transactionDate >= weekAgo;
          case 'mes':
            const monthAgo = new Date(today);
            monthAgo.setDate(monthAgo.getDate() - 30);
            return transactionDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    return filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [transactions, filterType, filterPeriod]);

  // Estatísticas
  const stats = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const outcome = Math.abs(
      filteredTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0)
    );

    return { income, outcome, total: income - outcome };
  }, [filteredTransactions]);

  const formatCurrency = (value: number) => {
    if (!isBalanceVisible) {
      return 'R$ ••••••';
    }
    return `R$ ${Math.abs(value).toFixed(2).replace('.', ',')}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateFull = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'entrega':
        return 'Entrega';
      case 'saque':
        return 'Saque';
      case 'bonus':
        return 'Bônus';
      default:
        return 'Outro';
    }
  };

  const typeFilters = [
    { type: 'todas' as FilterType, label: 'Todas', icon: 'list', width: 120 },
    { type: 'entrega' as FilterType, label: 'Entregas', icon: 'bicycle', width: 135 },
    { type: 'saque' as FilterType, label: 'Saques', icon: 'arrow-up-circle', width: 125 },
    { type: 'bonus' as FilterType, label: 'Bônus', icon: 'gift', width: 115 },
  ];

  const periodFilters = [
    { period: 'todos' as PeriodType, label: 'Todos', width: 95 },
    { period: 'hoje' as PeriodType, label: 'Hoje', width: 85 },
    { period: 'semana' as PeriodType, label: '7 dias', width: 95 },
    { period: 'mes' as PeriodType, label: '30 dias', width: 105 },
  ];

  // Agrupa transações por data
  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: typeof filteredTransactions } = {};
    
    filteredTransactions.forEach(transaction => {
      const dateKey = formatDateFull(transaction.date);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(transaction);
    });

    return Object.entries(groups).map(([date, items]) => ({ date, items }));
  }, [filteredTransactions]);

  const renderTransaction = ({ item }: any) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        <View style={[
          styles.transactionIcon,
          { backgroundColor: item.amount > 0 ? colors.medboxLightGreen : colors.backgroundCard }
        ]}>
          <Ionicons
            name={getTransactionIcon(item.type)}
            size={20}
            color={item.amount > 0 ? colors.primary : colors.textSecondary}
          />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.transactionMeta}>
            <Text style={styles.transactionType}>{getTypeLabel(item.type)}</Text>
            <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
          </View>
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Text style={[
          styles.transactionAmount,
          { color: item.amount > 0 ? colors.success : colors.error }
        ]}>
          {item.amount > 0 ? '+' : ''}{formatCurrency(item.amount)}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>
            {item.status === 'concluido' ? 'Concluído' : item.status === 'pendente' ? 'Pendente' : 'Cancelado'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderDateGroup = ({ item }: any) => (
    <View style={styles.dateGroup}>
      <Text style={styles.dateHeader}>{item.date}</Text>
      <View style={styles.transactionsGroupContainer}>
        {item.items.map((transaction: any, index: number) => (
          <View key={transaction.id}>
            {renderTransaction({ item: transaction })}
            {index < item.items.length - 1 && <View style={styles.separator} />}
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transações</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Cards de Resumo */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Ionicons name="arrow-down-circle" size={20} color={colors.success} />
          <Text style={styles.summaryLabel}>Recebido</Text>
          <Text style={[styles.summaryValue, { color: colors.success }]}>
            {formatCurrency(stats.income)}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="arrow-up-circle" size={20} color={colors.error} />
          <Text style={styles.summaryLabel}>Sacado</Text>
          <Text style={[styles.summaryValue, { color: colors.error }]}>
            {formatCurrency(stats.outcome)}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="cash" size={20} color={colors.primary} />
          <Text style={styles.summaryLabel}>Saldo</Text>
          <Text style={[styles.summaryValue, { color: colors.primary }]}>
            {formatCurrency(stats.total)}
          </Text>
        </View>
      </View>

      {/* Filtros por Tipo */}
      <View style={styles.filtersContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {typeFilters.map((filter) => (
            <TouchableOpacity
              key={filter.type}
              style={[
                styles.filterButton,
                { width: filter.width },
                filterType === filter.type && styles.filterButtonActive,
              ]}
              onPress={() => setFilterType(filter.type)}
            >
              <Ionicons
                name={filter.icon as any}
                size={16}
                color={filterType === filter.type ? 'white' : colors.textSecondary}
              />
              <Text
                style={[
                  styles.filterButtonText,
                  filterType === filter.type && styles.filterButtonTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Filtros por Período */}
      <View style={styles.periodFiltersContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {periodFilters.map((filter) => (
            <TouchableOpacity
              key={filter.period}
              style={[
                styles.periodButton,
                { width: filter.width },
                filterPeriod === filter.period && styles.periodButtonActive,
              ]}
              onPress={() => setFilterPeriod(filter.period)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  filterPeriod === filter.period && styles.periodButtonTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Lista de Transações */}
      {filteredTransactions.length > 0 ? (
        <FlatList
          data={groupedTransactions}
          renderItem={renderDateGroup}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color={colors.textLight} />
          <Text style={styles.emptyTitle}>Nenhuma transação encontrada</Text>
          <Text style={styles.emptyText}>
            Tente ajustar os filtros ou fazer sua primeira entrega
          </Text>
        </View>
      )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: colors.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  filtersContainer: {
    marginBottom: 12,
    height: 60,
  },
  filtersContent: {
    paddingHorizontal: 20,
    gap: 8,
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 22,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 110,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterButtonTextActive: {
    color: 'white',
  },
  periodFiltersContainer: {
    marginBottom: 16,
    height: 60,
  },
  periodButton: {
    paddingHorizontal: 20,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 85,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodButtonActive: {
    backgroundColor: colors.medboxLightGreen,
    borderColor: colors.primary,
  },
  periodButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  periodButtonTextActive: {
    color: colors.primary,
  },
  listContent: {
    paddingBottom: 20,
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateHeader: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.textSecondary,
    textTransform: 'capitalize',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 12,
    backgroundColor: colors.background,
  },
  transactionsGroupContainer: {
    backgroundColor: colors.backgroundLight,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.backgroundLight,
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
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  transactionType: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  transactionDate: {
    fontSize: 11,
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
    marginHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default TransactionsScreen;