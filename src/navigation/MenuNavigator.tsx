// src/navigation/MenuNavigator.tsx (FINAL)
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MenuScreen from '../screens/menu/MenuScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import BankDataScreen from '../screens/profile/BankDataScreen'; // ✅ ADICIONADO
import BankAccountScreen from '../screens/profile/BankAccountScreen'; // ✅ ADICIONADO
import AddPixKeyScreen from '../screens/profile/AddPixKeyScreen'; // ✅ ADICIONADO
import ChatScreen from '../screens/chat/ChatScreen';
import ReportsScreen from '../screens/menu/ReportsScreen';
import NotificationsScreen from '../screens/menu/NotificationsScreen';
import HelpScreen from '../screens/menu/HelpScreen';
import { MenuStackParamList } from '../types';

const Stack = createNativeStackNavigator<MenuStackParamList>();

export const MenuNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="MenuHome" 
        component={MenuScreen}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
      />
      {/* ✅ NOVAS ROTAS - Dados Bancários acessíveis direto do Menu */}
      <Stack.Screen 
        name="BankData" 
        component={BankDataScreen}
      />
      <Stack.Screen 
        name="BankAccount" 
        component={BankAccountScreen}
      />
      <Stack.Screen 
        name="AddPixKey" 
        component={AddPixKeyScreen}
      />
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen}
      />
      <Stack.Screen 
        name="Reports" 
        component={ReportsScreen}
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen}
      />
      <Stack.Screen 
        name="Help" 
        component={HelpScreen}
      />
    </Stack.Navigator>
  );
};