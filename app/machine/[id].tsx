
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { colors, commonStyles } from '../../styles/commonStyles';
import { useVendingData } from '../../hooks/useVendingData';
import { ProductCard } from '../../components/ProductCard';
import { Button } from '../../components/button';

export default function MachineDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { machines, updateMachineStatus, updateProductQuantity } = useVendingData();
  
  const machine = machines.find(m => m.id === id);

  if (!machine) {
    return (
      <View style={commonStyles.container}>
        <Text style={commonStyles.text}>Machine not found</Text>
        <Button onPress={() => router.back()}>Go Back</Button>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return '#22c55e';
      case 'maintenance': return '#f59e0b';
      case 'out-of-service': return '#ef4444';
      default: return colors.grey;
    }
  };

  const lowStockProducts = machine.products.filter(
    product => product.quantity <= machine.lowStockThreshold
  );

  console.log('Machine detail loaded for:', machine.name);

  return (
    <View style={commonStyles.wrapper}>
      <Stack.Screen 
        options={{
          title: machine.name,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerBackTitle: 'Back',
        }} 
      />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Machine Info Header */}
          <View style={styles.headerCard}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.machineName}>{machine.name}</Text>
                <Text style={styles.location}>{machine.location}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(machine.status) }]}>
                <Text style={styles.statusText}>
                  {machine.status.charAt(0).toUpperCase() + machine.status.slice(1)}
                </Text>
              </View>
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>${machine.totalSales.toFixed(2)}</Text>
                <Text style={styles.statLabel}>Total Sales</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{machine.products.length}</Text>
                <Text style={styles.statLabel}>Products</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{lowStockProducts.length}</Text>
                <Text style={styles.statLabel}>Low Stock</Text>
              </View>
            </View>
          </View>

          {/* Status Controls */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Machine Status</Text>
            <View style={styles.statusButtons}>
              <Pressable
                style={[
                  styles.statusButton,
                  machine.status === 'operational' && styles.activeStatusButton
                ]}
                onPress={() => updateMachineStatus(machine.id, 'operational')}
              >
                <Text style={styles.statusButtonText}>✅ Operational</Text>
              </Pressable>
              
              <Pressable
                style={[
                  styles.statusButton,
                  machine.status === 'maintenance' && styles.activeStatusButton
                ]}
                onPress={() => updateMachineStatus(machine.id, 'maintenance')}
              >
                <Text style={styles.statusButtonText}>🔧 Maintenance</Text>
              </Pressable>
              
              <Pressable
                style={[
                  styles.statusButton,
                  machine.status === 'out-of-service' && styles.activeStatusButton
                ]}
                onPress={() => updateMachineStatus(machine.id, 'out-of-service')}
              >
                <Text style={styles.statusButtonText}>❌ Out of Service</Text>
              </Pressable>
            </View>
          </View>

          {/* Low Stock Alert */}
          {lowStockProducts.length > 0 && (
            <View style={styles.alertSection}>
              <Text style={styles.alertTitle}>⚠️ Low Stock Alert</Text>
              <Text style={styles.alertText}>
                {lowStockProducts.length} product{lowStockProducts.length > 1 ? 's' : ''} need restocking
              </Text>
            </View>
          )}

          {/* Products */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Products ({machine.products.length})</Text>
            {machine.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onUpdateQuantity={(productId, quantity) => 
                  updateProductQuantity(machine.id, productId, quantity)
                }
                lowStockThreshold={machine.lowStockThreshold}
              />
            ))}
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionButtons}>
              <Button
                style={styles.actionButton}
                onPress={() => {
                  // Restock all products to max capacity
                  machine.products.forEach(product => {
                    updateProductQuantity(machine.id, product.id, product.maxCapacity);
                  });
                }}
              >
                📦 Restock All
              </Button>
              
              <Button
                style={styles.actionButton}
                onPress={() => router.push(`/maintenance?machineId=${machine.id}`)}
              >
                🔧 Log Maintenance
              </Button>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.grey + '20',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  machineName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  location: {
    fontSize: 16,
    color: colors.grey,
  },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.grey,
    marginTop: 4,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  statusButton: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.grey + '30',
  },
  activeStatusButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  alertSection: {
    backgroundColor: '#ef4444' + '20',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 4,
  },
  alertText: {
    fontSize: 14,
    color: colors.text,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.primary,
  },
});
