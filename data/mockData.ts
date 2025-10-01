
import { VendingMachine, Product, Sale, MaintenanceLog, Transaction, TransferRequest } from '../types/VendingMachine';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Coca Cola',
    price: 1.50,
    quantity: 8,
    maxCapacity: 12,
    emoji: '🥤',
    category: 'drinks'
  },
  {
    id: '2',
    name: 'Water',
    price: 1.00,
    quantity: 15,
    maxCapacity: 20,
    emoji: '💧',
    category: 'drinks'
  },
  {
    id: '3',
    name: 'Chips',
    price: 2.00,
    quantity: 3,
    maxCapacity: 10,
    emoji: '🍟',
    category: 'snacks'
  },
  {
    id: '4',
    name: 'Chocolate Bar',
    price: 1.75,
    quantity: 6,
    maxCapacity: 8,
    emoji: '🍫',
    category: 'snacks'
  },
  {
    id: '5',
    name: 'Coffee',
    price: 2.50,
    quantity: 12,
    maxCapacity: 15,
    emoji: '☕️',
    category: 'drinks'
  }
];

export const mockMachines: VendingMachine[] = [
  {
    id: '1',
    name: 'Main Lobby',
    location: 'Building A - Ground Floor',
    status: 'operational',
    products: mockProducts,
    totalSales: 1250.75,
    lastMaintenance: '2024-01-15',
    lowStockThreshold: 5
  },
  {
    id: '2',
    name: 'Cafeteria',
    location: 'Building B - 2nd Floor',
    status: 'operational',
    products: mockProducts.map(p => ({ ...p, quantity: p.quantity - 2 })),
    totalSales: 890.25,
    lastMaintenance: '2024-01-10',
    lowStockThreshold: 5
  },
  {
    id: '3',
    name: 'Break Room',
    location: 'Building C - 3rd Floor',
    status: 'maintenance',
    products: mockProducts.map(p => ({ ...p, quantity: Math.floor(p.quantity / 2) })),
    totalSales: 567.50,
    lastMaintenance: '2024-01-05',
    lowStockThreshold: 5
  }
];

export const mockSales: Sale[] = [
  {
    id: '1',
    machineId: '1',
    productId: '1',
    quantity: 1,
    amount: 1.50,
    timestamp: '2024-01-20T10:30:00Z'
  },
  {
    id: '2',
    machineId: '1',
    productId: '3',
    quantity: 2,
    amount: 4.00,
    timestamp: '2024-01-20T11:15:00Z'
  },
  {
    id: '3',
    machineId: '2',
    productId: '5',
    quantity: 1,
    amount: 2.50,
    timestamp: '2024-01-20T09:45:00Z'
  }
];

export const mockMaintenanceLogs: MaintenanceLog[] = [
  {
    id: '1',
    machineId: '1',
    type: 'routine',
    description: 'Regular cleaning and inspection',
    timestamp: '2024-01-15T14:00:00Z',
    technician: 'John Smith'
  },
  {
    id: '2',
    machineId: '3',
    type: 'repair',
    description: 'Fixed coin mechanism jam',
    timestamp: '2024-01-18T16:30:00Z',
    technician: 'Sarah Johnson'
  },
  {
    id: '3',
    machineId: '2',
    type: 'restock',
    description: 'Restocked all beverages',
    timestamp: '2024-01-19T08:00:00Z',
    technician: 'Mike Davis'
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'in',
    machineId: '1',
    productId: '1',
    quantity: 5,
    timestamp: '2024-01-20T08:00:00Z',
    reason: 'Weekly restock',
    operatorName: 'John Smith'
  },
  {
    id: '2',
    type: 'out',
    machineId: '2',
    productId: '3',
    quantity: 2,
    timestamp: '2024-01-19T16:30:00Z',
    reason: 'Expired products removal',
    operatorName: 'Sarah Johnson'
  },
  {
    id: '3',
    type: 'transfer',
    machineId: '3',
    productId: '2',
    quantity: 3,
    timestamp: '2024-01-18T14:15:00Z',
    reason: 'Slow moving inventory redistribution',
    fromMachineId: '3',
    toMachineId: '1',
    operatorName: 'Mike Davis'
  }
];

export const mockTransferRequests: TransferRequest[] = [
  {
    id: '1',
    productId: '3',
    fromMachineId: '3',
    toMachineId: '1',
    quantity: 2,
    reason: 'Low demand in Break Room, high demand in Main Lobby',
    status: 'pending',
    requestedBy: 'System Auto-Transfer',
    timestamp: '2024-01-20T12:00:00Z'
  },
  {
    id: '2',
    productId: '4',
    fromMachineId: '2',
    toMachineId: '3',
    quantity: 1,
    reason: 'Balancing inventory levels',
    status: 'completed',
    requestedBy: 'Mike Davis',
    timestamp: '2024-01-19T10:30:00Z',
    completedAt: '2024-01-19T15:45:00Z'
  }
];
