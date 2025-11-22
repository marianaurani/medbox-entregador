// // App.tsx
// import React from 'react';
// import { StatusBar } from 'expo-status-bar';
// import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { AuthProvider } from './src/contexts/AuthContext';
// import { DeliveryProvider } from './src/contexts/DeliveryContext';
// import { WalletProvider } from './src/contexts/WalletContext';
// import { BankProvider } from './src/contexts/BankContext';
// import { RootNavigator } from './src/navigation/RootNavigator'; // MUDOU AQUI

// export default function App() {
//   return (
//     <SafeAreaProvider>
//       <AuthProvider>
//         <DeliveryProvider>
//           <WalletProvider>
//             <BankProvider>
//               <StatusBar style="auto" />
//               <RootNavigator /> {/* MUDOU AQUI */}
//             </BankProvider>
//           </WalletProvider>
//         </DeliveryProvider>
//       </AuthProvider>
//     </SafeAreaProvider>
//   );
// }
// App.tsx - TESTE 1

// App.tsx - TESTE
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { DeliveryProvider } from './src/contexts/DeliveryContext';
import { WalletProvider } from './src/contexts/WalletContext';
import { BankProvider } from './src/contexts/BankContext';
import { RootNavigator } from './src/navigation/RootNavigator';

// App.tsx
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <DeliveryProvider>
          <WalletProvider>
            <BankProvider>
              <RootNavigator />
              <StatusBar style="auto" />
            </BankProvider>
          </WalletProvider>
        </DeliveryProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
