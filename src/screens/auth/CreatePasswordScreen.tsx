// src/screens/auth/CreatePasswordScreen.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import colors from '../../constants/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'CreatePassword'>;

const CreatePasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { getTempSignupData, signUp } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);

  const validatePassword = () => {
    if (password.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter no mínimo 6 caracteres');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Atenção', 'As senhas não coincidem');
      return false;
    }
    return true;
  };

  const handleContinue = async () => {
    if (!validatePassword()) return;

    try {
      setLoading(true);
      Keyboard.dismiss();
      
      // ✅ ATUALIZA OS DADOS TEMPORÁRIOS COM A SENHA
      if (getTempSignupData) {
        const tempData = await getTempSignupData();
        if (tempData) {
          await signUp({
            ...tempData,
            password: password, // Adiciona a senha
          });
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      navigation.navigate('VehicleSelection');
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível criar a senha');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordFocus = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: 150,
        animated: true,
      });
    }, 100);
  };

  const handleConfirmPasswordFocus = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: 300,
        animated: true,
      });
    }, 100);
  };

  const getPasswordStrength = () => {
    if (password.length === 0) return { text: '', color: '' };
    if (password.length < 6) return { text: 'Fraca', color: colors.error || '#F44336' };
    if (password.length < 8) return { text: 'Média', color: '#FFA500' };
    return { text: 'Forte', color: '#4CAF50' };
  };

  const strength = getPasswordStrength();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundLight} />

        {/* ✅ HEADER PADRONIZADO */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            disabled={loading}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Criar senha</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Conteúdo com Scroll */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="lock-closed" size={48} color={colors.primary} />
            </View>
          </View>

          {/* ✅ TÍTULO PADRONIZADO */}
          <Text style={styles.title}>Crie uma senha segura</Text>
          <Text style={styles.subtitle}>
            Sua senha deve ter no mínimo 6 caracteres
          </Text>

          {/* Campo senha */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nova senha</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Digite sua senha"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                onFocus={handlePasswordFocus}
                secureTextEntry={!showPassword}
                editable={!loading}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            {password.length > 0 && (
              <Text style={[styles.strengthText, { color: strength.color }]}>
                Força: {strength.text}
              </Text>
            )}
          </View>

          {/* Campo confirmar senha */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmar senha</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Digite novamente"
                placeholderTextColor={colors.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onFocus={handleConfirmPasswordFocus}
                secureTextEntry={!showConfirmPassword}
                editable={!loading}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Dicas */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Dicas para uma senha segura:</Text>
            <Text style={styles.tip}>• Use pelo menos 6 caracteres</Text>
            <Text style={styles.tip}>• Combine letras e números</Text>
            <Text style={styles.tip}>• Não use informações pessoais</Text>
          </View>

          {/* Espaço extra */}
          <View style={{ height: 200 }} />
        </ScrollView>

        {/* ✅ FOOTER E BOTÃO PADRONIZADOS */}
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
    paddingTop: 8,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // ✅ TÍTULO PADRONIZADO
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
  },
  eyeIcon: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  strengthText: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: '600',
  },
  tipsContainer: {
    backgroundColor: colors.primary + '10',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  tip: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
    lineHeight: 18,
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
    height: 52,
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

export default CreatePasswordScreen;