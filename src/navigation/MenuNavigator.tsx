// src/navigation/MenuNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MenuScreen from '../screens/menu/MenuScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ChatScreen from '../screens/chat/ChatScreen'; // ✅ NOVO
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
      {/* ✅ NOVO - Tela de Chat */}
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen}
      />
    </Stack.Navigator>
  );
};