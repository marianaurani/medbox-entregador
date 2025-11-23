// src/screens/auth/RegisterScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import colors from '../../constants/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    phone: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCPF = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return text;
  };

  const formatPhone = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
    return text;
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

 // src/screens/auth/RegisterScreen.tsx
  const handleContinue = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Atenção', 'Digite seu nome completo');
      return;
    }
    if (!formData.cpf.trim() || formData.cpf.replace(/\D/g, '').length !== 11) {
      Alert.alert('Atenção', 'Digite um CPF válido');
      return;
    }
    if (!formData.phone.trim() || formData.phone.replace(/\D/g, '').length < 10) {
      Alert.alert('Atenção', 'Digite um telefone válido');
      return;
    }
    if (!formData.email.trim()) {
      Alert.alert('Atenção', 'Digite seu e-mail');
      return;
    }
    if (!validateEmail(formData.email)) {
      Alert.alert('Atenção', 'Digite um e-mail válido');
      return;
    }

  try {
    setLoading(true);
    
    // ✅ AGUARDA salvar os dados temporários
    await signUp({
      name: formData.name,
      cpf: formData.cpf,
      phone: formData.phone,
      email: formData.email,
      password: '', // Será preenchido depois
    });

    // ✅ SÓ NAVEGA APÓS SALVAR
    navigation.navigate('VerificationMethod', {
      email: formData.email,
      phone: formData.phone,
    });
    
  } catch (error: any) {
    Alert.alert('Erro', error.message || 'Não foi possível continuar');
  } finally {
    setLoading(false);
  }
};

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundLight} />
      
      {/* Header Padronizado */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          disabled={loading}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cadastro</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ✅ TÍTULO PADRONIZADO - altura 32px */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Crie sua conta</Text>
          <Text style={styles.subtitle}>
            Preencha os dados abaixo para começar a fazer entregas
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome completo</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu nome completo"
              value={formData.name}
              onChangeText={(value) => updateField('name', value)}
              editable={!loading}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CPF</Text>
            <TextInput
              style={styles.input}
              placeholder="000.000.000-00"
              value={formData.cpf}
              onChangeText={(text) => updateField('cpf', formatCPF(text))}
              keyboardType="numeric"
              maxLength={14}
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefone</Text>
            <TextInput
              style={styles.input}
              placeholder="(00) 00000-0000"
              value={formData.phone}
              onChangeText={(text) => updateField('phone', formatPhone(text))}
              keyboardType="phone-pad"
              maxLength={15}
              editable={!loading}
            />
          </View>

          {/* ✅ EMAIL AGORA É OBRIGATÓRIO */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="seuemail@exemplo.com"
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <Text style={styles.info}>
            💡 Enviaremos um código de segurança para validar sua identidade
          </Text>

          <Text style={styles.terms}>
            Ao continuar, você concorda com os 
            <Text style={styles.termsLink}> Termos e Condições de uso.</Text>
          </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ✅ BOTÃO PADRONIZADO - altura 52px */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.buttonText}>Continuar</Text>
          )}
        </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.backgroundLight,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  titleContainer: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  // ✅ TÍTULO PADRONIZADO
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 32, // Altura padronizada
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  input: {
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
  },
  info: {
    fontSize: 13,
    color: colors.primary,
    lineHeight: 18,
    marginTop: 8,
    backgroundColor: colors.primary + '10',
    padding: 12,
    borderRadius: 8,
  },
  terms: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: '600',
  },
  footer: {
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 0 : 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  // ✅ BOTÃO PADRONIZADO
  button: {
    backgroundColor: colors.buttonSecondary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    height: 52, // Altura padronizada
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});

export default RegisterScreen;