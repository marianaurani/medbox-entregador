// src/screens/auth/WelcomeScreen.tsx
import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import colors from '../../constants/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

const { width, height } = Dimensions.get('window');

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundLight} />
      
      {/* Ilustração */}
      <Image 
        source={require('../../../assets/images/3685917.jpg')}
        style={styles.illustration}
        resizeMode="cover"
      />

      {/* Conteúdo com efeito de sobreposição */}
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.overlayContainer}>
          <View style={styles.content}>
            {/* ✅ TÍTULO PADRONIZADO */}
            <Text style={styles.title}>
              Boas-vindas ao MedBox para entregadores
            </Text>
            
            <Text style={styles.subtitle}>
              Entre para a família MedBox e transforme suas entregas em saúde para milhares de pessoas. 
              Ganhe de forma justa, trabalhe com flexibilidade e faça parte de uma rede que conecta farmácias 
              e clientes por todo o Brasil.
            </Text>
          </View>

          {/* ✅ BOTÕES PADRONIZADOS */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.buttonPrimary}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.buttonPrimaryText}>Cadastrar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.buttonSecondary}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.buttonSecondaryText}>Já tenho conta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  illustration: {
    width: width,
    height: height * 0.45,
    position: 'absolute',
    top: 0,
  },
  safeArea: {
    flex: 1,
    marginTop: height * 0.40,
  },
  overlayContainer: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    // ✅ REMOVIDO shadowColor que causava o sombreamento
    paddingTop: 24, // ✅ Padding interno ao invés de margin
    justifyContent: 'space-between',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16, // ✅ AJUSTADO - Menos espaço superior
    paddingBottom: 20, // ✅ Espaço inferior para não grudar nos botões
  },
  // ✅ TÍTULO PADRONIZADO
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    lineHeight: 32, // Altura padronizada
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 20, // ✅ AUMENTADO - Mais espaço entre conteúdo e botões
    paddingBottom: Platform.OS === 'ios' ? 20 : 20, // ✅ Padding consistente
    gap: 12,
  },
  // ✅ BOTÕES PADRONIZADOS
  buttonPrimary: {
    backgroundColor: colors.buttonSecondary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    height: 52, // Altura padronizada
    justifyContent: 'center',
  },
  buttonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    height: 52, // Altura padronizada
    justifyContent: 'center',
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});

export default WelcomeScreen;