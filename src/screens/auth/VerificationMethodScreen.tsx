// src/screens/auth/VerificationMethodScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../types';
import colors from '../../constants/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'VerificationMethod'>;

const VerificationMethodScreen: React.FC<Props> = ({ navigation, route }) => {
  const { email, phone } = route.params;
  const [loading, setLoading] = useState(false);

  const handleSelectMethod = async (method: 'email' | 'sms') => {
    try {
      setLoading(true);
      // Simula envio do código
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      navigation.navigate('SecurityCode', {
        method,
        contact: method === 'email' ? email : phone,
      });
    } catch (error) {
      console.error('Erro ao enviar código:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundLight} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          disabled={loading}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MEDBOX PARA ENTREGADORES</Text>
      </View>

      {/* Conteúdo */}
      <View style={styles.content}>
        <Text style={styles.title}>
          Como deseja receber o seu código de segurança?
        </Text>

        <Text style={styles.subtitle}>
          Enviaremos um código de verificação para confirmar sua identidade
        </Text>

        {/* Opção Email */}
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => handleSelectMethod('email')}
          disabled={loading}
        >
          <View style={styles.optionIcon}>
            <Ionicons name="mail-outline" size={24} color={colors.primary} />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>E-mail</Text>
            <Text style={styles.optionDescription}>
              Enviaremos um e-mail com o código para o endereço cadastrado.
            </Text>
            {email && (
              <Text style={styles.optionContact}>{email}</Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Opção SMS */}
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => handleSelectMethod('sms')}
          disabled={loading}
        >
          <View style={styles.optionIcon}>
            <Ionicons name="chatbox-outline" size={24} color={colors.primary} />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>SMS</Text>
            <Text style={styles.optionDescription}>
              Enviaremos uma mensagem SMS com o código para o número cadastrado.
            </Text>
            {phone && (
              <Text style={styles.optionContact}>{phone}</Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Enviando código...</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 20,
    padding: 4,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 32,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  optionContact: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
    marginTop: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
  },
});

export default VerificationMethodScreen;