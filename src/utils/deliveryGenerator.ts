// src/utils/deliveryGenerator.ts
import { Delivery, DeliveryItem } from '../types';

// Dados para gerar pedidos aleatórios
const PHARMACIES = [
  { name: 'Farmácia Drogasil', phone: '(61) 3321-1234' },
  { name: 'Farmácia São Paulo', phone: '(61) 3322-5678' },
  { name: 'Drogaria Pacheco', phone: '(61) 3323-9012' },
  { name: 'Farmácia Pague Menos', phone: '(61) 3324-3456' },
  { name: 'Drogaria Araujo', phone: '(61) 3325-7890' },
];

const PHARMACY_ADDRESSES = [
  'SCS Quadra 1, Bloco A, Loja 10',
  'SHCS 103, Bloco B, Loja 25',
  'CLN 203, Bloco A, Loja 5',
  'CLS 402, Bloco C, Loja 15',
  'Águas Claras, Rua 7, Loja 30',
];

const CUSTOMER_NAMES = [
  'João Silva',
  'Maria Santos',
  'Pedro Oliveira',
  'Ana Costa',
  'Carlos Souza',
  'Juliana Lima',
  'Rafael Alves',
  'Beatriz Rocha',
  'Lucas Ferreira',
  'Camila Rodrigues',
];

const CUSTOMER_ADDRESSES = [
  'SQN 203, Bloco D, Apto 305',
  'SQSW 304, Bloco B, Apto 102',
  'SQS 410, Bloco F, Apto 501',
  'SHIS QI 15, Conjunto 5, Casa 12',
  'Águas Claras, Rua 20, Casa 45',
  'Taguatinga Norte, QNL 8, Casa 22',
  'Guará 2, QE 32, Casa 18',
];

const COMPLEMENTS = [
  'Portaria 24h',
  'Interfone 305',
  'Casa azul',
  'Ao lado da padaria',
  'Prédio com portão preto',
  undefined,
  undefined, // Mais chances de não ter complemento
];

const MEDICINE_NAMES = [
  'Dipirona 500mg',
  'Paracetamol 750mg',
  'Ibuprofeno 600mg',
  'Omeprazol 20mg',
  'Losartana 50mg',
  'Amoxicilina 500mg',
  'Dorflex',
  'Vitamina D3',
  'Complexo B',
];

// Gera um número aleatório entre min e max
const random = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Pega um item aleatório de um array
const randomItem = <T,>(array: T[]): T => {
  return array[random(0, array.length - 1)];
};

// Gera coordenadas aleatórias próximas a Brasília
const generateCoordinates = () => {
  const baseLat = -15.7939; // Latitude de Brasília
  const baseLng = -47.8828; // Longitude de Brasília
  
  return {
    latitude: baseLat + (Math.random() - 0.5) * 0.1,
    longitude: baseLng + (Math.random() - 0.5) * 0.1,
  };
};

// Gera itens do pedido
const generateItems = (): DeliveryItem[] => {
  const itemCount = random(1, 3);
  const items: DeliveryItem[] = [];
  
  for (let i = 0; i < itemCount; i++) {
    items.push({
      id: `ITEM${Date.now()}${random(100, 999)}`,
      name: randomItem(MEDICINE_NAMES),
      quantity: random(1, 3),
      requiresPrescription: Math.random() < 0.3, // 30% requer receita
    });
  }
  
  return items;
};

/**
 * Gera um novo pedido aleatório
 */
export const generateRandomDelivery = (): Delivery => {
  const pharmacyCoords = generateCoordinates();
  const customerCoords = generateCoordinates();
  const pharmacy = randomItem(PHARMACIES);
  const distance = random(2, 15);
  
  // ✅ Gera ID curto no formato correto (#20085)
  const shortId = random(10000, 99999);
  
  const delivery: Delivery = {
    id: shortId.toString(),        // "20085"
    orderId: `#${shortId}`,         // "#20085"
    status: 'disponivel',
    pharmacy: {
      name: pharmacy.name,
      address: randomItem(PHARMACY_ADDRESSES),
      latitude: pharmacyCoords.latitude,
      longitude: pharmacyCoords.longitude,
      phone: pharmacy.phone,
    },
    customer: {
      name: randomItem(CUSTOMER_NAMES),
      address: randomItem(CUSTOMER_ADDRESSES),
      latitude: customerCoords.latitude,
      longitude: customerCoords.longitude,
      phone: `(61) 9${random(1000, 9999)}-${random(1000, 9999)}`,
      complement: randomItem(COMPLEMENTS),
    },
    items: generateItems(),
    distance,
    estimatedTime: Math.ceil(distance * 3), // 3 minutos por km
    deliveryFee: random(8, 25),
    createdAt: new Date(),
  };

  return delivery;
};

/**
 * Gera múltiplos pedidos de uma vez
 */
export const generateMultipleDeliveries = (count: number): Delivery[] => {
  const deliveries: Delivery[] = [];
  
  for (let i = 0; i < count; i++) {
    // Pequeno delay para evitar IDs duplicados
    const delivery = generateRandomDelivery();
    deliveries.push(delivery);
  }
  
  return deliveries;
};