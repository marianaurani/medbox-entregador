// src/screens/menu/ReportsScreen.tsx (CORRIGIDO)
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useWallet } from '../../contexts/WalletContext';
import colors from '../../constants/colors';

type Period = 'today' | 'week' | 'month';

interface DeliveryData {
  id: string;
  deliveryFee: number;
  deliveredAt: Date;
  distance: number;
}

const ReportsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { transactions, earnings } = useWallet();
  
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('week');

  // Converte transações de entrega em dados de delivery
  const completedDeliveries = useMemo(() => {
    return transactions
      .filter(t => t.type === 'entrega' && t.status === 'concluido')
      .map(t => ({
        id: t.deliveryId || t.id,
        deliveryFee: t.amount,
        deliveredAt: t.date,
        distance: 2.5, // Distância média (mock) - você pode ajustar
      }));
  }, [transactions]);

  // Calcula estatísticas
  const stats = useMemo(() => {
    const now = new Date();
    let filteredDeliveries = completedDeliveries;

    // Filtra por período
    if (selectedPeriod === 'today') {
      filteredDeliveries = completedDeliveries.filter(d => {
        const deliveryDate = new Date(d.deliveredAt);
        return deliveryDate.toDateString() === now.toDateString();
      });
    } else if (selectedPeriod === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredDeliveries = completedDeliveries.filter(d => {
        return new Date(d.deliveredAt) >= weekAgo;
      });
    } else if (selectedPeriod === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filteredDeliveries = completedDeliveries.filter(d => {
        return new Date(d.deliveredAt) >= monthAgo;
      });
    }

    const totalEarnings = filteredDeliveries.reduce((sum, d) => sum + d.deliveryFee, 0);
    const totalDeliveries = filteredDeliveries.length;
    const totalDistance = filteredDeliveries.reduce((sum, d) => sum + d.distance, 0);
    const avgEarningsPerDelivery = totalDeliveries > 0 ? totalEarnings / totalDeliveries : 0;
    const avgDistance = totalDeliveries > 0 ? totalDistance / totalDeliveries : 0;

    // Calcula entregas por dia
    const deliveriesByDay: { [key: string]: number } = {};
    filteredDeliveries.forEach(d => {
      const date = new Date(d.deliveredAt).toLocaleDateString('pt-BR');
      deliveriesByDay[date] = (deliveriesByDay[date] || 0) + 1;
    });

    const bestDay = Object.entries(deliveriesByDay).sort((a, b) => b[1] - a[1])[0];

    return {
      totalEarnings,
      totalDeliveries,
      totalDistance,
      avgEarningsPerDelivery,
      avgDistance,
      bestDay: bestDay ? { date: bestDay[0], count: bestDay[1] } : null,
    };
  }, [completedDeliveries, selectedPeriod]);

  const PeriodButton = ({ period, label }: { period: Period; label: string }) => (
    <TouchableOpacity
      style={[styles.periodButton, selectedPeriod === period && styles.periodButtonActive]}
      onPress={() => setSelectedPeriod(period)}
    >
      <Text style={[styles.periodButtonText, selectedPeriod === period && styles.periodButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const StatCard = ({ 
    icon, 
    label, 
    value, 
    color = colors.primary,
    subtitle,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
    color?: string;
    subtitle?: string;
  }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Relatórios</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          <PeriodButton period="today" label="Hoje" />
          <PeriodButton period="week" label="7 Dias" />
          <PeriodButton period="month" label="30 Dias" />
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Ionicons name="stats-chart" size={24} color={colors.primary} />
            <Text style={styles.summaryTitle}>Resumo do Período</Text>
          </View>
          
          <View style={styles.summaryStats}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                R$ {stats.totalEarnings.toFixed(2)}
              </Text>
              <Text style={styles.summaryLabel}>Total Ganho</Text>
            </View>
            
            <View style={styles.summaryDivider} />
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{stats.totalDeliveries}</Text>
              <Text style={styles.summaryLabel}>Entregas</Text>
            </View>
            
            <View style={styles.summaryDivider} />
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {stats.totalDistance.toFixed(1)} km
              </Text>
              <Text style={styles.summaryLabel}>Distância</Text>
            </View>
          </View>
        </View>

        {/* Detailed Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estatísticas Detalhadas</Text>
          
          <StatCard
            icon="cash-outline"
            label="Média por Entrega"
            value={`R$ ${stats.avgEarningsPerDelivery.toFixed(2)}`}
            color={colors.success}
            subtitle="Valor médio recebido"
          />
          
          <StatCard
            icon="navigate-outline"
            label="Distância Média"
            value={`${stats.avgDistance.toFixed(1)} km`}
            color={colors.info}
            subtitle="Por entrega realizada"
          />
          
          {stats.bestDay && (
            <StatCard
              icon="trophy-outline"
              label="Melhor Dia"
              value={stats.bestDay.date}
              color={colors.warning}
              subtitle={`${stats.bestDay.count} entregas realizadas`}
            />
          )}
        </View>

        {/* Performance Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Desempenho</Text>
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Ionicons name="bar-chart-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.chartTitle}>Entregas por Dia</Text>
            </View>
            
            <View style={styles.simpleChart}>
              {completedDeliveries.length === 0 ? (
                <View style={styles.emptyChart}>
                  <Ionicons name="analytics-outline" size={48} color={colors.textLight} />
                  <Text style={styles.emptyChartText}>Nenhuma entrega realizada</Text>
                  <Text style={styles.emptyChartSubtext}>
                    Complete entregas para ver suas estatísticas
                  </Text>
                </View>
              ) : (
                <View style={styles.chartBars}>
                  {Array.from({ length: 7 }).map((_, index) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (6 - index));
                    const dateStr = date.toLocaleDateString('pt-BR', { weekday: 'short' });
                    
                    const dayDeliveries = completedDeliveries.filter(d => {
                      const deliveryDate = new Date(d.deliveredAt);
                      return deliveryDate.toDateString() === date.toDateString();
                    }).length;
                    
                    const maxDeliveries = Math.max(...Array.from({ length: 7 }).map((_, i) => {
                      const d = new Date();
                      d.setDate(d.getDate() - (6 - i));
                      return completedDeliveries.filter(del => {
                        return new Date(del.deliveredAt).toDateString() === d.toDateString();
                      }).length;
                    }), 1);
                    
                    const barHeight = (dayDeliveries / maxDeliveries) * 100;
                    
                    return (
                      <View key={index} style={styles.chartBarContainer}>
                        <View style={styles.chartBarWrapper}>
                          <View 
                            style={[
                              styles.chartBar, 
                              { height: `${Math.max(barHeight, 5)}%` }
                            ]}
                          />
                        </View>
                        <Text style={styles.chartLabel}>{dateStr}</Text>
                        <Text style={styles.chartValue}>{dayDeliveries}</Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dicas para Melhorar</Text>
          <View style={styles.tipsCard}>
            <View style={styles.tipItem}>
              <Ionicons name="time-outline" size={20} color={colors.info} />
              <Text style={styles.tipText}>
                Trabalhe nos horários de pico (12h-14h e 19h-21h) para mais pedidos
              </Text>
            </View>
            <View style={styles.tipDivider} />
            <View style={styles.tipItem}>
              <Ionicons name="star-outline" size={20} color={colors.warning} />
              <Text style={styles.tipText}>
                Mantenha uma boa avaliação para receber mais oportunidades
              </Text>
            </View>
            <View style={styles.tipDivider} />
            <View style={styles.tipItem}>
              <Ionicons name="flash-outline" size={20} color={colors.success} />
              <Text style={styles.tipText}>
                Aceite pedidos rapidamente para aumentar sua taxa de aceitação
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
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
  periodSelector: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  periodButtonTextActive: {
    color: 'white',
  },
  summaryCard: {
    backgroundColor: colors.backgroundLight,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: colors.divider,
    marginHorizontal: 12,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  statCard: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 11,
    color: colors.textLight,
  },
  chartCard: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  simpleChart: {
    minHeight: 200,
  },
  emptyChart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyChartText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 12,
  },
  emptyChartSubtext: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 4,
    textAlign: 'center',
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 180,
    paddingTop: 20,
  },
  chartBarContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  chartBarWrapper: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  chartBar: {
    width: 24,
    backgroundColor: colors.primary,
    borderRadius: 4,
    minHeight: 8,
  },
  chartLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  chartValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  tipsCard: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  tipDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 12,
  },
});

export default ReportsScreen;