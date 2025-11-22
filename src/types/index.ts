// src/types/index.ts

// ==================== VEHICLE TYPE ====================
export type VehicleType = 'moto' | 'carro' | 'bike';

// ==================== NAVIGATION TYPES ====================
export type AuthStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  VerificationMethod: { email: string; phone: string };
  SecurityCode: { method: 'email' | 'sms'; contact: string };
  CreatePassword: undefined;
  VehicleSelection: undefined; // ✅ ADICIONADO
  PhotoUpload: { vehicleType: VehicleType }; // ✅ ATUALIZADO
  CNHUpload: { vehicleType: VehicleType }; // ✅ ATUALIZADO
  RegistrationComplete: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Delivery: undefined;
  Wallet: undefined;
  Menu: undefined;
};

export type DeliveryStackParamList = {
  DeliveryList: undefined;
  DeliveryDetails: { deliveryId: string };
  DeliveryInProgress: { deliveryId: string };
};

export type WalletStackParamList = {
  WalletMain: undefined;
  Transactions: undefined;
  Withdraw: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  BankData: undefined;
  BankAccount: undefined;
  AddPixKey: undefined;
};

// ==================== USER TYPES ====================
export type UserStatus = 
  | 'disponivel' 
  | 'indisponivel' 
  | 'em_entrega' 
  | 'pendente_aprovacao' 
  | 'bloqueado';

export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  status: UserStatus;
  photo?: string;
  cnhPhoto?: string;
  vehicleType?: VehicleType; // ✅ ADICIONADO
  registrationStatus?: 'pendente' | 'aprovado' | 'rejeitado';
  approvedAt?: Date;
}

// ==================== AUTH TYPES ====================
export interface SignUpData {
  name: string;
  cpf: string;
  phone: string;
  email: string;
  password: string;
  vehicleType?: VehicleType; // ✅ ADICIONADO
}

export interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (cpf: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  updateStatus: (status: UserStatus) => Promise<void>;
  updateProfile?: (data: Partial<User>) => Promise<void>;
  completeSignUp?: () => Promise<void>;
  saveTempVehicleType?: (vehicleType: VehicleType) => Promise<void>;
  getTempVehicleType?: () => Promise<VehicleType | null>;
}

// ==================== DELIVERY TYPES ====================
export type DeliveryStatus = 
  | 'disponivel'
  | 'aceito'
  | 'coletado'
  | 'em_rota'
  | 'entregue'
  | 'cancelado';

export interface DeliveryItem {
  id: string;
  name: string;
  quantity: number;
  requiresPrescription: boolean;
}

export interface Delivery {
  id: string;
  orderId: string;
  status: DeliveryStatus;
  pharmacy: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    phone: string;
  };
  customer: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    phone: string;
    complement?: string;
  };
  items: DeliveryItem[];
  distance: number;
  estimatedTime: number;
  deliveryFee: number;
  createdAt: Date;
  acceptedAt?: Date;
  collectedAt?: Date;
  deliveredAt?: Date;
}

// ==================== WALLET TYPES ====================
export type TransactionType = 'entrega' | 'saque' | 'bonus' | 'estorno' | 'ajuste';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: Date;
  status: 'concluido' | 'pendente' | 'cancelado';
  deliveryId?: string;
}

export interface Earnings {
  today: number;
  week: number;
  month: number;
  deliveriesToday: number;
  routesAccepted: number;
  routesCompleted: number;
}

export interface WalletBalance {
  available: number;
  pending: number;
  total: number;
}

export interface WalletContextData {
  balance: number;
  isLoading: boolean;
  transactions: Transaction[];
  withdraw: (amount: number) => Promise<void>;
  refreshBalance: () => Promise<void>;
}

// ==================== BANK TYPES ====================
export type PixKeyType = 'cpf' | 'telefone' | 'email' | 'aleatoria';

export interface BankAccount {
  id?: string;
  bank: string;
  agency: string;
  account: string;
  accountType: 'corrente' | 'poupanca';
}

export interface PixKey {
  id?: string;
  type: PixKeyType;
  key: string;
}

export interface BankContextData {
  bankAccount: BankAccount | null;
  pixKeys: PixKey[];
  isLoading: boolean;
  saveBankAccount: (data: BankAccount) => Promise<void>;
  addPixKey: (data: PixKey) => Promise<void>;
  removePixKey: (id: string) => Promise<void>;
  refreshBankData: () => Promise<void>;
}

// ==================== DELIVERY CONTEXT TYPES ====================
export interface DeliveryContextData {
  availableDeliveries: Delivery[];
  activeDelivery: Delivery | null;
  completedDeliveries: Delivery[];
  isLoading: boolean;
  acceptDelivery: (deliveryId: string) => Promise<void>;
  startDelivery: (deliveryId: string) => Promise<void>;
  completeDelivery: (deliveryId: string) => Promise<void>;
  cancelDelivery: (deliveryId: string, reason: string) => Promise<void>;
  refreshDeliveries: () => Promise<void>;
  getAvailableDeliveries: () => Delivery[];
}