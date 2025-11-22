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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import colors from '../../constants/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

const { width, height } = Dimensions.get('window');

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundLight} />
      
      {/* Ilustração */}
      <Image 
        source={require('../../../assets/images/3685917.jpg')}
        style={styles.illustration}
        resizeMode="cover"
      />

      {/* Conteúdo com efeito de sobreposição */}
      <View style={styles.overlayContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>
            Boas-vindas ao MedBox para entregadores
          </Text>
          
          <Text style={styles.subtitle}>
            Entre para a família MedBox e transforme suas entregas em saúde para milhares de pessoas. 
            Ganhe de forma justa, trabalhe com flexibilidade e faça parte de uma rede que conecta farmácias 
            e clientes por todo o Brasil.
          </Text>
        </View>

        {/* Botões */}
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  illustration: {
    width: width,
    height: height * 0.45, // 45% da altura
    position: 'absolute',
    top: 0,
  },
  overlayContainer: {
    flex: 1,
    marginTop: height * 0.40, // Começa em 40%
    backgroundColor: colors.backgroundLight,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  buttonPrimary: {
    backgroundColor: colors.buttonSecondary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
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
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});

export default WelcomeScreen;