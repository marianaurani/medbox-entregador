// src/screens/auth/SplashScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import colors from '../../constants/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Welcome');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Ilustração da farmacêutica */}
      <Image 
        source={require('../../../assets/images/img-telainicial.png')}
        style={styles.illustration}
        resizeMode="contain"
      />

      {/* ✅ Logo MedBox - MAIOR */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoPlus}>+</Text>
        <Text style={styles.logoText}>MedBox</Text>
        <Text style={styles.logoPlus}>+</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  illustration: {
    width: 300, // Aumentado de 200 para 300 (50% maior)
    height: 300, // Aumentado de 200 para 300 (50% maior)
    marginBottom: 60, // Aumentado de 40 para 60
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // ✅ LOGO MAIOR
  logoPlus: {
    fontSize: 36, // Aumentado de 24 para 36
    fontWeight: 'bold',
    color: colors.primary,
  },
  logoText: {
    fontSize: 42, // Aumentado de 28 para 42
    fontWeight: 'bold',
    color: colors.primary,
    marginHorizontal: 10, // Aumentado de 6 para 10
  },
});

export default SplashScreen;