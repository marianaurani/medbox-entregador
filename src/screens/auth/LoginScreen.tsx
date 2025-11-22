// src/screens/auth/LoginScreen.tsx
import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Keyboard,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import colors from '../../constants/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { signIn } = useAuth();
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);

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

  const handleInputFocus = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 150, animated: true });
    }, 100);
  };

  const handleLogin = async () => {
    if (!cpf.trim() || cpf.replace(/\D/g, '').length !== 11) {
      Alert.alert('Atenção', 'Digite um CPF válido');
      return;
    }

    Keyboard.dismiss();

    try {
      setLoading(true);
      await signIn(cpf);
      Alert.alert('Bem-vindo de volta! 👋', 'Login realizado com sucesso.');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundLight} />
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Header Padronizado */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            disabled={loading}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Trocar de conta</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="person-circle-outline" size={80} color={colors.primary} />
          </View>

          <Text style={styles.title}>Acessar outra conta</Text>
          <Text style={styles.subtitle}>
            Digite o CPF cadastrado para acessar
          </Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>CPF</Text>
              <TextInput
                style={styles.input}
                placeholder="000.000.000-00"
                value={cpf}
                onChangeText={(text) => setCpf(formatCPF(text))}
                keyboardType="numeric"
                maxLength={14}
                editable={!loading}
                onFocus={handleInputFocus}
              />
            </View>

            <Text style={styles.info}>
              ℹ️ Caso não tenha cadastro, crie uma nova conta primeiro.
            </Text>
          </View>

          <View style={{ height: 200 }} />
        </ScrollView>

        {/* Footer Padronizado */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.registerButton}
            onPress={() => navigation.navigate('Register')}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>
              Não tem conta? <Text style={styles.registerLink}>Cadastre-se</Text>
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
    backgroundColor: colors.backgroundLight,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
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
  iconContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
  },
  form: {
    gap: 15,
  },
  inputGroup: {
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    fontWeight: '600',
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
    color: colors.textSecondary,
    lineHeight: 18,
    backgroundColor: colors.backgroundLight,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  footer: {
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: Platform.OS === 'ios' ? 0 : 15,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    backgroundColor: colors.buttonSecondary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  registerButton: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  registerButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  registerLink: {
    color: colors.primary,
    fontWeight: '600',
  },
});

export default LoginScreen;