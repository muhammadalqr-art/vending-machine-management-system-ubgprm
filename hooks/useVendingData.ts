
import { useState, useEffect } from 'react';
import { VendingMachine, Sale, MaintenanceLog, Transaction, TransferRequest } from '../types/VendingMachine';
import { mockMachines, mockSales, mockMaintenanceLogs, mockTransactions, mockTransferRequests } from '../data/mockData';

export const useVendingData = () => {
  const [machines, setMachines] = useState<VendingMachine[]>(mockMachines);
  const [sales, setSales] = useState<Sale[]>(mockSales);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>(mockMaintenanceLogs);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [transferRequests, setTransferRequests] = useState<TransferRequest[]>(mockTransferRequests);
  const [loading, setLoading] = useState(false);

  const updateMachineStatus = (machineId: string, status: VendingMachine['status']) => {
    setMachines(prev => 
      prev.map(machine => 
        machine.id === machineId ? { ...machine, status } : machine
      )
    );
  };

  const updateProductQuantity = (machineId: string, productId: string, quantity: number) => {
    setMachines(prev => 
      prev.map(machine => 
        machine.id === machineId 
          ? {
              ...machine,
              products: machine.products.map(product =>
                product.id === productId ? { ...product, quantity } : product
              )
            }
          : machine
      )
    );
  };

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    console.log('Added transaction:', newTransaction.type, 'for product', newTransaction.productId);
    
    // Update machine inventory based on transaction type
    if (transaction.type === 'in') {
      updateProductQuantity(
        transaction.machineId, 
        transaction.productId, 
        getMachineProduct(transaction.machineId, transaction.productId)?.quantity + transaction.quantity || transaction.quantity
      );
    } else if (transaction.type === 'out') {
      const currentQuantity = getMachineProduct(transaction.machineId, transaction.productId)?.quantity || 0;
      updateProductQuantity(
        transaction.machineId, 
        transaction.productId, 
        Math.max(0, currentQuantity - transaction.quantity)
      );
    }
  };

  const getMachineProduct = (machineId: string, productId: string) => {
    const machine = machines.find(m => m.id === machineId);
    return machine?.products.find(p => p.id === productId);
  };

  const createTransferRequest = (request: Omit<TransferRequest, 'id' | 'timestamp'>) => {
    const newRequest: TransferRequest = {
      ...request,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    
    setTransferRequests(prev => [newRequest, ...prev]);
    console.log('Created transfer request from machine', request.fromMachineId, 'to', request.toMachineId);
    return newRequest;
  };

  const completeTransfer = (transferId: string) => {
    const transfer = transferRequests.find(t => t.id === transferId);
    if (!transfer || transfer.status !== 'pending') {
      console.log('Transfer not found or already completed');
      return;
    }

    const fromProduct = getMachineProduct(transfer.fromMachineId, transfer.productId);
    const toProduct = getMachineProduct(transfer.toMachineId, transfer.productId);
    
    if (!fromProduct || fromProduct.quantity < transfer.quantity) {
      console.log('Insufficient quantity in source machine');
      return;
    }

    // Update quantities
    updateProductQuantity(
      transfer.fromMachineId, 
      transfer.productId, 
      fromProduct.quantity - transfer.quantity
    );
    
    updateProductQuantity(
      transfer.toMachineId, 
      transfer.productId, 
      (toProduct?.quantity || 0) + transfer.quantity
    );

    // Mark transfer as completed
    setTransferRequests(prev => 
      prev.map(t => 
        t.id === transferId 
          ? { ...t, status: 'completed' as const, completedAt: new Date().toISOString() }
          : t
      )
    );

    // Add transaction record
    addTransaction({
      type: 'transfer',
      machineId: transfer.toMachineId,
      productId: transfer.productId,
      quantity: transfer.quantity,
      reason: transfer.reason,
      fromMachineId: transfer.fromMachineId,
      toMachineId: transfer.toMachineId,
      operatorName: transfer.requestedBy
    });

    console.log('Transfer completed:', transferId);
  };

  const cancelTransfer = (transferId: string) => {
    setTransferRequests(prev => 
      prev.map(t => 
        t.id === transferId 
          ? { ...t, status: 'cancelled' as const }
          : t
      )
    );
    console.log('Transfer cancelled:', transferId);
  };

  const getLowStockAlerts = () => {
    const alerts: Array<{ machine: VendingMachine; product: any }> = [];
    machines.forEach(machine => {
      machine.products.forEach(product => {
        if (product.quantity <= machine.lowStockThreshold) {
          alerts.push({ machine, product });
        }
      });
    });
    return alerts;
  };

  const getTotalSales = () => {
    return machines.reduce((total, machine) => total + machine.totalSales, 0);
  };

  const getOperationalMachines = () => {
    return machines.filter(machine => machine.status === 'operational').length;
  };

  const getPendingTransfers = () => {
    return transferRequests.filter(t => t.status === 'pending');
  };

  const getRecentTransactions = (limit: number = 10) => {
    return transactions
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  };

  return {
    machines,
    sales,
    maintenanceLogs,
    transactions,
    transferRequests,
    loading,
    updateMachineStatus,
    updateProductQuantity,
    addTransaction,
    createTransferRequest,
    completeTransfer,
    cancelTransfer,
    getLowStockAlerts,
    getTotalSales,
    getOperationalMachines,
    getPendingTransfers,
    getRecentTransactions,
    getMachineProduct
  };
};
