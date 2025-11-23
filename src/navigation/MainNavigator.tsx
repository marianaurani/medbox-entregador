// src/navigation/MainNavigator.tsx
import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from '../types';
import colors from '../constants/colors';

import HomeScreen from '../screens/home/HomeScreen';
import { DeliveryNavigator } from './DeliveryNavigator';
import { WalletNavigator } from './WalletNavigator';
import { MenuNavigator } from './MenuNavigator'; // ✅ NOVO - Importar MenuNavigator

const Tab = createBottomTabNavigator<MainTabParamList>();

// Wrapper para garantir SafeArea no Tab Navigator
const TabNavigatorWrapper = () => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textLight,
          tabBarStyle: {
            backgroundColor: colors.backgroundLight,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            height: 65,
            paddingBottom: 8,
            paddingTop: 8,
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: 'Início',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        
        <Tab.Screen
          name="Delivery"
          component={DeliveryNavigator}
          options={{
            tabBarLabel: 'Pedidos',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="bicycle" size={size} color={color} />
            ),
          }}
        />
        
        <Tab.Screen
          name="Wallet"
          component={WalletNavigator}
          options={{
            tabBarLabel: 'Carteira',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="wallet" size={size} color={color} />
            ),
          }}
        />
        
        {/* ✅ ATUALIZADO - Usar MenuNavigator em vez de MenuScreen */}
        <Tab.Screen
          name="Menu"
          component={MenuNavigator}
          options={{
            tabBarLabel: 'Menu',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="menu" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

export const MainNavigator: React.FC = () => {
  return <TabNavigatorWrapper />;
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
});