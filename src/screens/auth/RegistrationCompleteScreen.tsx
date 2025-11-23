// src/screens/auth/RegistrationCompleteScreen.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import colors from '../../constants/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'RegistrationComplete'>;

const RegistrationCompleteScreen: React.FC<Props> = ({ navigation }) => {
  const { completeSignUp } = useAuth();

  // ✅ CORRIGIDO - Função simplificada sem try/catch desnecessário
  const handleEnterApp = async () => {
    if (completeSignUp) {
      await completeSignUp();
    }
    // Se completeSignUp não existir, o AuthContext já está gerenciando o estado
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundLight} />

      {/* Conteúdo com Scroll */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ✅ TÍTULO PADRONIZADO */}
        <Text style={styles.title}>Cadastro enviado{'\n'}com sucesso!</Text>
        
        {/* Ícone de sucesso */}
        <View style={styles.iconContainer}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={64} color={colors.backgroundLight} />
          </View>
        </View>
        
        <Text style={styles.subtitle}>
          Seu cadastro foi enviado para análise. Nossa equipe irá verificar suas informações e você
          receberá uma notificação quando for aprovado.
        </Text>

        {/* Cards informativos */}
        <View style={styles.infoCards}>
          <View style={styles.infoCard}>
            <Ionicons name="time-outline" size={32} color={colors.primary} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Análise em até 24h</Text>
              <Text style={styles.infoDescription}>
                Geralmente aprovamos em poucas horas
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="notifications-outline" size={32} color={colors.primary} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Você será notificado</Text>
              <Text style={styles.infoDescription}>
                Enviaremos uma notificação quando aprovarmos
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="checkmark-circle-outline" size={32} color={colors.primary} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Complete seu perfil</Text>
              <Text style={styles.infoDescription}>
                Adicione dados bancários para receber pagamentos
              </Text>
            </View>
          </View>
        </View>

        {/* Próximos passos */}
        <View style={styles.nextStepsContainer}>
          <Text style={styles.nextStepsTitle}>Próximos passos:</Text>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>
              Aguarde a aprovação do cadastro
            </Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>
              Complete seus dados bancários no perfil
            </Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>
              Comece a receber e aceitar entregas!
            </Text>
          </View>
        </View>

        {/* Espaço extra */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ✅ FOOTER E BOTÃO PADRONIZADOS */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.buttonPrimary}
          onPress={handleEnterApp}
        >
          <Text style={styles.buttonPrimaryText}>Entrar no aplicativo</Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          Você já pode explorar o app enquanto aguarda a aprovação
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  // ✅ TÍTULO PADRONIZADO
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 32, // Altura padronizada
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
    paddingHorizontal: 10,
  },
  infoCards: {
    gap: 12,
    marginBottom: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    gap: 14,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  nextStepsContainer: {
    backgroundColor: colors.primary + '10',
    padding: 18,
    borderRadius: 12,
  },
  nextStepsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 14,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.backgroundLight,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
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
  buttonPrimary: {
    backgroundColor: colors.buttonSecondary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    height: 52, // Altura padronizada
    justifyContent: 'center',
    marginBottom: 10,
  },
  buttonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  footerNote: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default RegistrationCompleteScreen;