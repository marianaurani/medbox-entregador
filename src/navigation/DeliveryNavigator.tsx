// src/navigation/DeliveryNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DeliveryListScreen from '../screens/delivery/DeliveryListScreen';
import DeliveryDetailsScreen from '../screens/delivery/DeliveryDetailsScreen';
import DeliveryInProgressScreen from '../screens/delivery/DeliveryInProgressScreen';

export type DeliveryStackParamList = {
  DeliveryList: undefined;
  DeliveryDetails: { deliveryId: string };
  DeliveryInProgress: { deliveryId: string };
};

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
    </Stack.Navigator>
  );
};