
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Stack, router } from 'expo-router';
import { colors, commonStyles } from '../styles/commonStyles';
import { useVendingData } from '../hooks/useVendingData';
import { ProductCard } from '../components/ProductCard';
import { StatCard } from '../components/StatCard';

export default function Inventory() {
  const { machines, updateProductQuantity, getLowStockAlerts } = useVendingData();
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  
  const lowStockAlerts = getLowStockAlerts();
  const currentMachine = selectedMachine 
    ? machines.find(m => m.id === selectedMachine)
    : null;

  const allProducts = machines.flatMap(machine => 
    machine.products.map(product => ({
      ...product,
      machineId: machine.id,
      machineName: machine.name
    }))
  );

  const totalProducts = allProducts.length;
  const lowStockCount = lowStockAlerts.length;
  const totalValue = allProducts.reduce((sum, product) => 
    sum + (product.quantity * product.price), 0
  );

  console.log('Inventory loaded with', totalProducts, 'products across', machines.length, 'machines');

  return (
    <View style={commonStyles.wrapper}>
      <Stack.Screen 
        options={{
          title: 'Inventory Management',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerBackTitle: 'Back',
        }} 
      />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Overview Stats */}
          <View style={styles.statsContainer}>
            <StatCard
              title="Total Inventory Value"
              value={`$${totalValue.toFixed(2)}`}
              subtitle="Current stock value"
              emoji="💰"
              color="#22c55e"
            />
            
            <View style={styles.statsRow}>
              <View style={styles.halfCard}>
                <StatCard
                  title="Total Products"
                  value={totalProducts}
                  subtitle="Across all machines"
                  emoji="📦"
                  color="#3b82f6"
                />
              </View>
              
              <View style={styles.halfCard}>
                <StatCard
                  title="Low Stock Items"
                  value={lowStockCount}
                  subtitle="Need restocking"
                  emoji="⚠️"
                  color={lowStockCount > 0 ? "#ef4444" : "#22c55e"}
                />
              </View>
            </View>
          </View>

          {/* Machine Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Machine</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.machineSelector}>
              <Pressable
                style={[
                  styles.machineButton,
                  !selectedMachine && styles.activeMachineButton
                ]}
                onPress={() => setSelectedMachine(null)}
              >
                <Text style={styles.machineButtonText}>All Machines</Text>
              </Pressable>
              
              {machines.map((machine) => (
                <Pressable
                  key={machine.id}
                  style={[
                    styles.machineButton,
                    selectedMachine === machine.id && styles.activeMachineButton
                  ]}
                  onPress={() => setSelectedMachine(machine.id)}
                >
                  <Text style={styles.machineButtonText}>{machine.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Low Stock Alerts */}
          {lowStockAlerts.length > 0 && !selectedMachine && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: '#ef4444' }]}>
                🚨 Low Stock Alerts ({lowStockAlerts.length})
              </Text>
              {lowStockAlerts.map((alert, index) => (
                <View key={index} style={styles.alertCard}>
                  <View style={styles.alertHeader}>
                    <Text style={styles.alertProduct}>
                      {alert.product.emoji} {alert.product.name}
                    </Text>
                    <Text style={styles.alertMachine}>{alert.machine.name}</Text>
                  </View>
                  <Text style={styles.alertText}>
                    Only {alert.product.quantity} left (Threshold: {alert.machine.lowStockThreshold})
                  </Text>
                  <Pressable
                    style={styles.restockButton}
                    onPress={() => {
                      updateProductQuantity(
                        alert.machine.id, 
                        alert.product.id, 
                        alert.product.maxCapacity
                      );
                    }}
                  >
                    <Text style={styles.restockButtonText}>🔄 Restock to Full</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          {/* Products List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {currentMachine ? `${currentMachine.name} Products` : 'All Products'}
            </Text>
            
            {currentMachine ? (
              // Show products for selected machine
              currentMachine.products.map((product) => (
                <ProductCard
                  key={`${currentMachine.id}-${product.id}`}
                  product={product}
                  onUpdateQuantity={(productId, quantity) => 
                    updateProductQuantity(currentMachine.id, productId, quantity)
                  }
                  lowStockThreshold={currentMachine.lowStockThreshold}
                />
              ))
            ) : (
              // Show all products grouped by machine
              machines.map((machine) => (
                <View key={machine.id} style={styles.machineGroup}>
                  <View style={styles.machineGroupHeader}>
                    <Text style={styles.machineGroupTitle}>{machine.name}</Text>
                    <Text style={styles.machineGroupSubtitle}>{machine.location}</Text>
                  </View>
                  
                  {machine.products.map((product) => (
                    <ProductCard
                      key={`${machine.id}-${product.id}`}
                      product={product}
                      onUpdateQuantity={(productId, quantity) => 
                        updateProductQuantity(machine.id, productId, quantity)
                      }
                      lowStockThreshold={machine.lowStockThreshold}
                    />
                  ))}
                </View>
              ))
            )}
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
  statsContainer: {
    marginBottom: 32,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfCard: {
    flex: 1,
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
  machineSelector: {
    marginBottom: 8,
  },
  machineButton: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.grey + '30',
  },
  activeMachineButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  machineButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  alertCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertProduct: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  alertMachine: {
    fontSize: 12,
    color: colors.grey,
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  alertText: {
    fontSize: 14,
    color: colors.grey,
    marginBottom: 12,
  },
  restockButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  restockButtonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  machineGroup: {
    marginBottom: 24,
  },
  machineGroupHeader: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey + '30',
  },
  machineGroupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  machineGroupSubtitle: {
    fontSize: 14,
    color: colors.grey,
    marginTop: 2,
  },
});
