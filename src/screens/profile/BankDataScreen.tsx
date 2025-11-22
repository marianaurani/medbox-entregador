// src/screens/profile/BankDataScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useBank, PixKeyType } from '../../contexts/BankContext';
import colors from '../../constants/colors';

type ProfileStackParamList = {
  ProfileHome: undefined;
  BankData: undefined;
  BankAccount: undefined;
  AddPixKey: { pixKeyId?: string } | undefined;
};

const BankDataScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<ProfileStackParamList>>();
  const { pixKeys, defaultPixKey, deletePixKey, setDefaultPixKey, bankAccount, hasBankAccount } = useBank();

  const getPixIcon = (type: PixKeyType) => {
    switch (type) {
      case 'cpf':
        return 'person-outline';
      case 'phone':
        return 'call-outline';
      case 'email':
        return 'mail-outline';
      case 'random':
        return 'key-outline';
      default:
        return 'cash-outline';
    }
  };

  const getPixLabel = (type: PixKeyType) => {
    switch (type) {
      case 'cpf':
        return 'CPF';
      case 'phone':
        return 'Telefone';
      case 'email':
        return 'E-mail';
      case 'random':
        return 'Chave Aleatória';
      default:
        return 'Outro';
    }
  };

  const handleDeletePixKey = (id: string, key: string) => {
    Alert.alert(
      'Excluir Chave PIX',
      `Deseja realmente excluir a chave ${key}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            const success = deletePixKey(id);
            if (success) {
              Alert.alert('Sucesso', 'Chave PIX excluída com sucesso!');
            } else {
              Alert.alert('Erro', 'Você precisa ter pelo menos uma chave PIX cadastrada.');
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = (id: string) => {
    setDefaultPixKey(id);
    Alert.alert('Sucesso', 'Chave padrão atualizada!');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dados Bancários</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={colors.info} />
          <View style={styles.infoContent}>
            <Text style={styles.infoText}>
              Cadastre suas chaves PIX para receber pagamentos de forma rápida e segura. 
              A chave marcada como padrão será usada automaticamente nos saques.
            </Text>
          </View>
        </View>

        {/* Chave Padrão */}
        {defaultPixKey && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chave Padrão</Text>
            <View style={styles.defaultCard}>
              <View style={styles.defaultHeader}>
                <View style={styles.pixIconContainer}>
                  <Ionicons 
                    name={getPixIcon(defaultPixKey.type)} 
                    size={24} 
                    color={colors.primary} 
                  />
                </View>
                <View style={styles.defaultInfo}>
                  <Text style={styles.defaultLabel}>{getPixLabel(defaultPixKey.type)}</Text>
                  <Text style={styles.defaultKey}>{defaultPixKey.key}</Text>
                </View>
                <View style={styles.defaultBadge}>
                  <Ionicons name="star" size={16} color="white" />
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Todas as Chaves */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Todas as Chaves ({pixKeys.length})
          </Text>
          
          {pixKeys.map((pixKey, index) => (
            <View key={pixKey.id}>
              <View style={styles.pixKeyCard}>
                <View style={styles.pixKeyLeft}>
                  <View style={styles.pixIconContainer}>
                    <Ionicons 
                      name={getPixIcon(pixKey.type)} 
                      size={20} 
                      color={colors.primary} 
                    />
                  </View>
                  <View style={styles.pixKeyInfo}>
                    <View style={styles.pixKeyHeader}>
                      <Text style={styles.pixKeyLabel}>{getPixLabel(pixKey.type)}</Text>
                      {pixKey.isDefault && (
                        <View style={styles.defaultTag}>
                          <Text style={styles.defaultTagText}>Padrão</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.pixKeyValue}>{pixKey.key}</Text>
                  </View>
                </View>
                
                <View style={styles.pixKeyActions}>
                  {!pixKey.isDefault && (
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleSetDefault(pixKey.id)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="star-outline" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('AddPixKey', { pixKeyId: pixKey.id })}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleDeletePixKey(pixKey.id, pixKey.key)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
              {index < pixKeys.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Botão Adicionar */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddPixKey')}
        >
          <Ionicons name="add-circle" size={24} color="white" />
          <Text style={styles.addButtonText}>Adicionar Nova Chave PIX</Text>
        </TouchableOpacity>
      </View>
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
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.medboxLightGreen,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
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
  defaultCard: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  defaultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pixIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultInfo: {
    flex: 1,
  },
  defaultLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  defaultKey: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  defaultBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pixKeyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundLight,
    paddingVertical: 16,
  },
  pixKeyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  pixKeyInfo: {
    flex: 1,
  },
  pixKeyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  pixKeyLabel: {
    fontSize: 12,
    color: colors.textLight,
    textTransform: 'uppercase',
  },
  defaultTag: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  defaultTagText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  pixKeyValue: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  pixKeyActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 8,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.backgroundLight,
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BankDataScreen;