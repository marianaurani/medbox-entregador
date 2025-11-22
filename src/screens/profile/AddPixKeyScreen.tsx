// src/screens/profile/AddPixKeyScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useBank, PixKeyType } from '../../contexts/BankContext';
import colors from '../../constants/colors';

const AddPixKeyScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as { pixKeyId?: string } | undefined;
  const pixKeyId = params?.pixKeyId;

  const { addPixKey, updatePixKey, getPixKeyById } = useBank();

  const [keyType, setKeyType] = useState<PixKeyType>('cpf');
  const [keyValue, setKeyValue] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!pixKeyId;

  useEffect(() => {
    if (isEditing && pixKeyId) {
      const pixKey = getPixKeyById(pixKeyId);
      if (pixKey) {
        setKeyType(pixKey.type);
        setKeyValue(pixKey.key);
        setIsDefault(pixKey.isDefault);
      }
    }
  }, [isEditing, pixKeyId]);

  const keyTypes = [
    { type: 'cpf' as PixKeyType, label: 'CPF', icon: 'person-outline', placeholder: '000.000.000-00' },
    { type: 'phone' as PixKeyType, label: 'Telefone', icon: 'call-outline', placeholder: '(00) 00000-0000' },
    { type: 'email' as PixKeyType, label: 'E-mail', icon: 'mail-outline', placeholder: 'seu@email.com' },
    { type: 'random' as PixKeyType, label: 'Aleatória', icon: 'key-outline', placeholder: 'Chave PIX aleatória' },
  ];

  const validatePixKey = (type: PixKeyType, value: string): boolean => {
    if (!value.trim()) return false;

    switch (type) {
      case 'cpf':
        const cpfNumbers = value.replace(/\D/g, '');
        return cpfNumbers.length === 11;
      
      case 'phone':
        const phoneNumbers = value.replace(/\D/g, '');
        return phoneNumbers.length >= 10 && phoneNumbers.length <= 11;
      
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
      
      case 'random':
        return value.length >= 10;
      
      default:
        return false;
    }
  };

  const formatPixKey = (type: PixKeyType, value: string): string => {
    switch (type) {
      case 'cpf':
        const cpf = value.replace(/\D/g, '');
        return cpf
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      
      case 'phone':
        const phone = value.replace(/\D/g, '');
        if (phone.length <= 10) {
          return phone
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{4})(\d)/, '$1-$2');
        } else {
          return phone
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2');
        }
      
      default:
        return value;
    }
  };

  const handleKeyValueChange = (text: string) => {
    if (keyType === 'cpf' || keyType === 'phone') {
      const formatted = formatPixKey(keyType, text);
      setKeyValue(formatted);
    } else {
      setKeyValue(text);
    }
  };

  const handleSave = async () => {
    if (!validatePixKey(keyType, keyValue)) {
      Alert.alert('Chave Inválida', 'Por favor, digite uma chave PIX válida.');
      return;
    }

    setIsSubmitting(true);

    try {
      let success = false;

      if (isEditing && pixKeyId) {
        success = updatePixKey(pixKeyId, keyValue);
        if (success) {
          Alert.alert('Sucesso!', 'Chave PIX atualizada com sucesso!', [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]);
        } else {
          Alert.alert('Erro', 'Esta chave já está cadastrada.');
        }
      } else {
        success = addPixKey(keyType, keyValue, isDefault);
        if (success) {
          Alert.alert('Sucesso!', 'Chave PIX adicionada com sucesso!', [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]);
        } else {
          Alert.alert('Erro', 'Esta chave já está cadastrada.');
        }
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao salvar a chave. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedKeyType = keyTypes.find(kt => kt.type === keyType);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Editar Chave PIX' : 'Adicionar Chave PIX'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Tipo de Chave */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tipo de Chave PIX</Text>
            <View style={styles.typeGrid}>
              {keyTypes.map((type) => (
                <TouchableOpacity
                  key={type.type}
                  style={[
                    styles.typeButton,
                    keyType === type.type && styles.typeButtonActive,
                    isEditing && styles.typeButtonDisabled,
                  ]}
                  onPress={() => !isEditing && setKeyType(type.type)}
                  disabled={isEditing}
                >
                  <Ionicons
                    name={type.icon as any}
                    size={24}
                    color={keyType === type.type ? colors.primary : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      keyType === type.type && styles.typeButtonTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Chave PIX */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Digite sua Chave PIX</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name={selectedKeyType?.icon as any}
                size={20}
                color={colors.textSecondary}
              />
              <TextInput
                style={styles.input}
                value={keyValue}
                onChangeText={handleKeyValueChange}
                placeholder={selectedKeyType?.placeholder}
                placeholderTextColor={colors.textLight}
                keyboardType={
                  keyType === 'phone' ? 'phone-pad' : 
                  keyType === 'email' ? 'email-address' : 
                  'default'
                }
                autoCapitalize={keyType === 'email' ? 'none' : 'none'}
              />
            </View>
          </View>

          {/* Chave Padrão */}
          {!isEditing && (
            <TouchableOpacity 
              style={styles.defaultOption}
              onPress={() => setIsDefault(!isDefault)}
            >
              <View style={styles.defaultLeft}>
                <View style={[styles.checkbox, isDefault && styles.checkboxActive]}>
                  {isDefault && <Ionicons name="checkmark" size={18} color="white" />}
                </View>
                <View>
                  <Text style={styles.defaultTitle}>Definir como chave padrão</Text>
                  <Text style={styles.defaultSubtitle}>
                    Esta chave será usada automaticamente nos saques
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}

          {/* Info */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color={colors.info} />
            <View style={styles.infoContent}>
              <Text style={styles.infoText}>
                {keyType === 'cpf' && 'Digite seu CPF no formato: 000.000.000-00'}
                {keyType === 'phone' && 'Digite seu telefone com DDD: (00) 00000-0000'}
                {keyType === 'email' && 'Digite um e-mail válido'}
                {keyType === 'random' && 'Cole aqui sua chave PIX aleatória'}
              </Text>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Botão Salvar */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSubmitting}
          >
            <Ionicons name="checkmark-circle" size={24} color="white" />
            <Text style={styles.saveButtonText}>
              {isSubmitting ? 'Salvando...' : isEditing ? 'Atualizar Chave' : 'Adicionar Chave'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
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
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    paddingVertical: 20,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: colors.border,
  },
  typeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.medboxLightGreen,
  },
  typeButtonDisabled: {
    opacity: 0.5,
  },
  typeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  typeButtonTextActive: {
    color: colors.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  defaultOption: {
    backgroundColor: colors.backgroundLight,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  defaultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  defaultTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  defaultSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.medboxLightGreen,
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
  saveButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddPixKeyScreen;