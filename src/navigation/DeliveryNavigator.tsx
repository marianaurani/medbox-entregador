// src/navigation/DeliveryNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DeliveryListScreen from '../screens/delivery/DeliveryListScreen';
import DeliveryDetailsScreen from '../screens/delivery/DeliveryDetailsScreen';
import DeliveryInProgressScreen from '../screens/delivery/DeliveryInProgressScreen';
import ChatScreen from '../screens/chat/ChatScreen'; // ✅ NOVO
import { DeliveryStackParamList } from '../types';

const Stack = createNativeStackNavigator<DeliveryStackParamList>();

export const DeliveryNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="DeliveryList" 
        component={DeliveryListScreen}
      />
      <Stack.Screen 
        name="DeliveryDetails" 
        component={DeliveryDetailsScreen}
      />
      <Stack.Screen 
        name="DeliveryInProgress" 
        component={DeliveryInProgressScreen}
      />
      {/* ✅ NOVO - Tela de Chat */}
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen}
      />
    </Stack.Navigator>
  );
};