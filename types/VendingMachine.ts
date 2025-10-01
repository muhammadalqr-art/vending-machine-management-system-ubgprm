
export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  maxCapacity: number;
  emoji: string;
  category: 'drinks' | 'snacks' | 'food' | 'other';
}

export interface VendingMachine {
  id: string;
  name: string;
  location: string;
  status: 'operational' | 'maintenance' | 'out-of-service';
  products: Product[];
  totalSales: number;
  lastMaintenance: string;
  lowStockThreshold: number;
}

export interface Sale {
  id: string;
  machineId: string;
  productId: string;
  quantity: number;
  amount: number;
  timestamp: string;
}

export interface MaintenanceLog {
  id: string;
  machineId: string;
  type: 'routine' | 'repair' | 'restock';
  description: string;
  timestamp: string;
  technician: string;
}

export interface Transaction {
  id: string;
  type: 'in' | 'out' | 'transfer';
  machineId: string;
  productId: string;
  quantity: number;
  timestamp: string;
  reason: string;
  // For transfers
  fromMachineId?: string;
  toMachineId?: string;
  // For tracking
  operatorName: string;
}

export interface TransferRequest {
  id: string;
  productId: string;
  fromMachineId: string;
  toMachineId: string;
  quantity: number;
  reason: string;
  status: 'pending' | 'completed' | 'cancelled';
  requestedBy: string;
  timestamp: string;
  completedAt?: string;
}
