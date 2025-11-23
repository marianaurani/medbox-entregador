// src/screens/auth/SecurityCodeScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../types';
import colors from '../../constants/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'SecurityCode'>;

const SecurityCodeScreen: React.FC<Props> = ({ navigation, route }) => {
  const { method, contact } = route.params;
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCodeChange = (text: string, index: number) => {
    if (text.length > 1) {
      text = text[text.length - 1];
    }

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      Alert.alert('Atenção', 'Digite o código completo');
      return;
    }

    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      navigation.navigate('CreatePassword');
    } catch (error: any) {
      Alert.alert('Erro', 'Código inválido');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    
    setResendTimer(60);
    Alert.alert('Código reenviado', 'Um novo código foi enviado');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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
        <Text style={styles.headerTitle}>Código de segurança</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons 
              name={method === 'email' ? 'mail' : 'chatbox'} 
              size={48} 
              color={colors.primary} 
            />
          </View>
        </View>

        {/* ✅ TÍTULO PADRONIZADO */}
        <Text style={styles.title}>Digite o código de verificação</Text>
        <Text style={styles.subtitle}>
          Enviamos um código de 6 dígitos para{'\n'}
          <Text style={styles.contact}>{contact}</Text>
        </Text>

        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={[styles.codeInput, digit && styles.codeInputFilled]}
              value={digit}
              onChangeText={(text) => handleCodeChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              editable={!loading}
              autoFocus={index === 0}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.resendButton}
          onPress={handleResend}
          disabled={resendTimer > 0 || loading}
        >
          <Text style={[styles.resendText, resendTimer > 0 && styles.resendTextDisabled]}>
            {resendTimer > 0
              ? `Reenviar código em ${resendTimer}s`
              : 'Reenviar código'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 200 }} />
      </ScrollView>

      {/* ✅ FOOTER PADRONIZADO */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.buttonText}>Verificar código</Text>
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
    marginBottom: 40,
    lineHeight: 20,
  },
  contact: {
    color: colors.primary,
    fontWeight: '600',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  codeInput: {
    flex: 1,
    height: 56,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    backgroundColor: colors.backgroundLight,
  },
  codeInputFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  resendButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  resendText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  resendTextDisabled: {
    color: colors.textSecondary,
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

export default SecurityCodeScreen;