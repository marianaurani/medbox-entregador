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

      {/* Logo MedBox - MENOR */}
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
    width: 200, // Reduzido
    height: 200, // Reduzido
    marginBottom: 40, // Reduzido de 60
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoPlus: {
    fontSize: 24, // Reduzido de 32
    fontWeight: 'bold',
    color: colors.primary,
  },
  logoText: {
    fontSize: 28, // Reduzido de 36
    fontWeight: 'bold',
    color: colors.primary,
    marginHorizontal: 6, // Reduzido de 8
  },
});

export default SplashScreen;