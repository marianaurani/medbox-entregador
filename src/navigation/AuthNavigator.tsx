// src/navigation/AuthNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types';

import SplashScreen from '../screens/auth/SplashScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import VerificationMethodScreen from '../screens/auth/VerificationMethodScreen';
import SecurityCodeScreen from '../screens/auth/SecurityCodeScreen';
import CreatePasswordScreen from '../screens/auth/CreatePasswordScreen';
import VehicleSelectionScreen from '../screens/auth/VehicleSelectionScreen';
import PhotoUploadScreen from '../screens/auth/PhotoUploadScreen';
import CNHUploadScreen from '../screens/auth/CNHUploadScreen';
import IDUploadScreen from '../screens/auth/IDUploadScreen'; // ✅ NOVO
import RegistrationCompleteScreen from '../screens/auth/RegistrationCompleteScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="VerificationMethod" component={VerificationMethodScreen} />
      <Stack.Screen name="SecurityCode" component={SecurityCodeScreen} />
      <Stack.Screen name="CreatePassword" component={CreatePasswordScreen} />
      <Stack.Screen name="VehicleSelection" component={VehicleSelectionScreen} />
      <Stack.Screen name="PhotoUpload" component={PhotoUploadScreen} />
      <Stack.Screen name="CNHUpload" component={CNHUploadScreen} />
      <Stack.Screen name="IDUpload" component={IDUploadScreen} />
      <Stack.Screen name="RegistrationComplete" component={RegistrationCompleteScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;