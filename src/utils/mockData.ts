// src/utils/mockData.ts
import { User, Delivery, Transaction, Earnings, WalletBalance } from '../types';

// ============= USUÁRIO MOCKADO =============
export const mockUser: User = {
  id: '1',
  name: 'João Silva',
  email: 'joao.silva@email.com',
  cpf: '123.456.789-00',
  phone: '(61) 99999-9999',
  status: 'disponivel',
};

// ============= ENTREGAS MOCKADAS =============
export const mockDeliveries: Delivery[] = [
  {
    id: '1',
    orderId: '#12345',
    status: 'disponivel',
    pharmacy: {
      name: 'Farmácia São Paulo',
      address: 'Rua das Flores, 123 - Centro',
      latitude: -15.7942,
      longitude: -47.8822,
      phone: '(61) 3333-4444',
    },
    customer: {
      name: 'Maria Santos',
      address: 'Quadra 15, Lote 10 - Águas Claras',
      latitude: -15.8344,
      longitude: -48.0266,
      phone: '(61) 98888-7777',
      complement: 'Apto 302, Bloco B',
    },
    items: [
      { id: '1', name: 'Dipirona 500mg', quantity: 2, requiresPrescription: false },
      { id: '2', name: 'Amoxicilina 500mg', quantity: 1, requiresPrescription: true },
    ],
    distance: 8.5,
    estimatedTime: 25,
    deliveryFee: 12.5,
    createdAt: new Date('2024-11-16T10:30:00'),
  },
  {
    id: '2',
    orderId: '#12346',
    status: 'disponivel',
    pharmacy: {
      name: 'Drogaria Brasil',
      address: 'Av. W3 Sul, 456 - Asa Sul',
      latitude: -15.8267,
      longitude: -47.9218,
      phone: '(61) 3333-5555',
    },
    customer: {
      name: 'Carlos Oliveira',
      address: 'SQS 308, Bloco A - Asa Sul',
      latitude: -15.8209,
      longitude: -47.9050,
      phone: '(61) 97777-6666',
    },
    items: [
      { id: '3', name: 'Paracetamol 750mg', quantity: 1, requiresPrescription: false },
      { id: '4', name: 'Vitamina C', quantity: 2, requiresPrescription: false },
    ],
    distance: 5.2,
    estimatedTime: 15,
    deliveryFee: 8.0,
    createdAt: new Date('2024-11-16T11:00:00'),
  },
  {
    id: '3',
    orderId: '#12347',
    status: 'em_rota',
    pharmacy: {
      name: 'Farmácia Popular',
      address: 'CLN 203, Loja 15 - Asa Norte',
      latitude: -15.7441,
      longitude: -47.8826,
      phone: '(61) 3333-6666',
    },
    customer: {
      name: 'Ana Paula Costa',
      address: 'CLN 205, Bloco B - Asa Norte',
      latitude: -15.7401,
      longitude: -47.8797,
      phone: '(61) 96666-5555',
      complement: 'Casa 12',
    },
    items: [
      { id: '5', name: 'Losartana 50mg', quantity: 3, requiresPrescription: true },
    ],
    distance: 3.1,
    estimatedTime: 10,
    deliveryFee: 6.5,
    createdAt: new Date('2024-11-16T09:45:00'),
    acceptedAt: new Date('2024-11-16T09:50:00'),
    collectedAt: new Date('2024-11-16T10:00:00'),
  },
];

// ============= GANHOS MOCKADOS =============
export const mockEarnings: Earnings = {
  today: 125.50,
  week: 650.00,
  month: 2450.00,
  deliveriesToday: 8,
  routesAccepted: 20,
  routesCompleted: 18,
};

// ============= SALDO DA CARTEIRA MOCKADO =============
export const mockWalletBalance: WalletBalance = {
  available: 1250.00,
  pending: 85.50,
  total: 1335.50,
};

// ============= TRANSAÇÕES MOCKADAS =============
export const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'entrega',
    amount: 12.50,
    description: 'Entrega #12345 - Farmácia São Paulo',
    status: 'concluido',
    date: new Date('2024-11-16T14:30:00'),
    deliveryId: '1',
  },
  {
    id: '2',
    type: 'entrega',
    amount: 8.00,
    description: 'Entrega #12346 - Drogaria Brasil',
    status: 'concluido',
    date: new Date('2024-11-16T13:15:00'),
    deliveryId: '2',
  },
  {
    id: '3',
    type: 'bonus',
    amount: 15.00,
    description: 'Bônus por 10 entregas no dia',
    status: 'concluido',
    date: new Date('2024-11-16T12:00:00'),
  },
  {
    id: '4',
    type: 'entrega',
    amount: 6.50,
    description: 'Entrega #12344 - Farmácia Popular',
    status: 'pendente',
    date: new Date('2024-11-16T11:30:00'),
    deliveryId: '3',
  },
  {
    id: '5',
    type: 'saque',
    amount: -500.00,
    description: 'Saque via PIX',
    status: 'concluido',
    date: new Date('2024-11-15T16:00:00'),
  },
  {
    id: '6',
    type: 'entrega',
    amount: 10.00,
    description: 'Entrega #12343 - Drogasil',
    status: 'concluido',
    date: new Date('2024-11-15T15:20:00'),
  },
];

// ============= FUNÇÕES HELPER =============
export const getAvailableDeliveries = (): Delivery[] => {
  return mockDeliveries.filter(d => d.status === 'disponivel');
};

export const getActiveDelivery = (): Delivery | undefined => {
  return mockDeliveries.find(d => d.status === 'aceito' || d.status === 'coletado' || d.status === 'em_rota');
};

export const getDeliveryById = (id: string): Delivery | undefined => {
  return mockDeliveries.find(d => d.id === id);
};

export const getRecentTransactions = (limit: number = 10): Transaction[] => {
  return mockTransactions
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit);
};