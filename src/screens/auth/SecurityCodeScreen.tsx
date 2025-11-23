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
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleCodeChange = (text: string, index: number) => {
    if (!/^\d*$/.test(text)) return;

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every(digit => digit !== '') && index === 5) {
      handleVerifyCode(newCode.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async (fullCode: string) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      navigation.navigate('CreatePassword');
    } catch (error: any) {
      Alert.alert('Erro', 'Código inválido. Tente novamente.');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;

    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setResendTimer(60);
      Alert.alert('Código reenviado', `Um novo código foi enviado para ${contact}`);
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível reenviar o código');
    } finally {
      setLoading(false);
    }
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
        <Text style={styles.headerTitle}>Verificação</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Conteúdo */}
      <View style={styles.content}>
        {/* Ícone */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons 
              name={method === 'email' ? 'mail-outline' : 'chatbox-outline'} 
              size={40} 
              color={colors.primary} 
            />
          </View>
        </View>

        {/* ✅ TÍTULO PADRONIZADO */}
        <Text style={styles.title}>Digite o código de segurança</Text>

        <Text style={styles.subtitle}>
          Enviamos um código de 6 dígitos para {'\n'}
          <Text style={styles.contact}>{contact}</Text>
        </Text>

        {/* Campos de código */}
        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={[
                styles.codeInput,
                digit && styles.codeInputFilled,
              ]}
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

        {/* Reenviar código */}
        <TouchableOpacity
          onPress={handleResendCode}
          disabled={resendTimer > 0 || loading}
          style={styles.resendButton}
        >
          <Text style={[
            styles.resendText,
            (resendTimer > 0 || loading) && styles.resendTextDisabled
          ]}>
            {resendTimer > 0
              ? `Reenviar código em ${resendTimer}s`
              : 'Reenviar código'
            }
          </Text>
        </TouchableOpacity>

        {/* Mudar método */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          disabled={loading}
          style={styles.changeMethodButton}
        >
          <Ionicons name="swap-horizontal" size={16} color={colors.primary} />
          <Text style={styles.changeMethodText}>
            Usar outro método de verificação
          </Text>
        </TouchableOpacity>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Verificando código...</Text>
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
  // ✅ HEADER PADRONIZADO
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
    lineHeight: 20,
    marginBottom: 32,
  },
  contact: {
    color: colors.primary,
    fontWeight: '600',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  codeInput: {
    width: 48,
    height: 56,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.text,
    backgroundColor: colors.backgroundLight,
  },
  codeInputFilled: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  resendButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  resendText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  resendTextDisabled: {
    color: colors.textSecondary,
  },
  changeMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  changeMethodText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
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

export default SecurityCodeScreen;