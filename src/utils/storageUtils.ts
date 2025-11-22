// src/utils/storageUtils.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  // Wallet
  BALANCE: '@entregador:wallet:balance',
  TRANSACTIONS: '@entregador:wallet:transactions',
  EARNINGS: '@entregador:wallet:earnings',
  // Auth
  USER: '@MedBoxDelivery:user',
  TEMP_SIGNUP: '@MedBoxDelivery:temp_signup',
  // Deliveries
  DELIVERIES: '@entregador:deliveries',
  // Bank
  PIX_KEYS: '@entregador:bank:pixkeys',
  BANK_ACCOUNT: '@entregador:bank:account',
};

/**
 * Limpa todos os dados salvos (útil para desenvolvimento/testes)
 */
export const clearAllData = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.BALANCE,
      STORAGE_KEYS.TRANSACTIONS,
      STORAGE_KEYS.EARNINGS,
      STORAGE_KEYS.USER,
      STORAGE_KEYS.TEMP_SIGNUP,
      STORAGE_KEYS.DELIVERIES,
      STORAGE_KEYS.PIX_KEYS,
      STORAGE_KEYS.BANK_ACCOUNT,
    ]);
    console.log('Todos os dados foram limpos');
    return true;
  } catch (error) {
    console.error('Erro ao limpar dados:', error);
    return false;
  }
};

/**
 * Limpa apenas os dados da carteira
 */
export const clearWalletData = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.BALANCE,
      STORAGE_KEYS.TRANSACTIONS,
      STORAGE_KEYS.EARNINGS,
    ]);
    console.log('Dados da carteira foram limpos');
    return true;
  } catch (error) {
    console.error('Erro ao limpar dados da carteira:', error);
    return false;
  }
};

/**
 * Exporta todos os dados (útil para backup ou debug)
 */
export const exportAllData = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const data = await AsyncStorage.multiGet(keys);
    
    const exportData: { [key: string]: any } = {};
    data.forEach(([key, value]) => {
      if (value) {
        try {
          exportData[key] = JSON.parse(value);
        } catch {
          exportData[key] = value;
        }
      }
    });
    
    console.log('Dados exportados:', exportData);
    return exportData;
  } catch (error) {
    console.error('Erro ao exportar dados:', error);
    return null;
  }
};