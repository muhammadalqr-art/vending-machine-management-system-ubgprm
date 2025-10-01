
import { useState, useEffect } from 'react';
import { VendingMachine, Sale, MaintenanceLog } from '../types/VendingMachine';
import { mockMachines, mockSales, mockMaintenanceLogs } from '../data/mockData';

export const useVendingData = () => {
  const [machines, setMachines] = useState<VendingMachine[]>(mockMachines);
  const [sales, setSales] = useState<Sale[]>(mockSales);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>(mockMaintenanceLogs);
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

  return {
    machines,
    sales,
    maintenanceLogs,
    loading,
    updateMachineStatus,
    updateProductQuantity,
    getLowStockAlerts,
    getTotalSales,
    getOperationalMachines
  };
};
