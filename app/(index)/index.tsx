
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { colors, commonStyles } from '../../styles/commonStyles';
import { Button } from '../../components/button';
import { useVendingData } from '../../hooks/useVendingData';
import { MachineCard } from '../../components/MachineCard';
import { StatCard } from '../../components/StatCard';

export default function Dashboard() {
  const { 
    machines, 
    getTotalSales, 
    getOperationalMachines, 
    getLowStockAlerts,
    getPendingTransfers,
    getRecentTransactions
  } = useVendingData();

  const totalSales = getTotalSales();
  const operationalMachines = getOperationalMachines();
  const lowStockAlerts = getLowStockAlerts();
  const pendingTransfers = getPendingTransfers();
  const recentTransactions = getRecentTransactions(5);

  console.log('Dashboard loaded with', machines.length, 'machines,', pendingTransfers.length, 'pending transfers');

  return (
    <View style={commonStyles.wrapper}>
      <Stack.Screen 
        options={{
          title: 'Vending Machine Dashboard',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }} 
      />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Dashboard</Text>
            <Text style={styles.subtitle}>Manage your vending machine network</Text>
          </View>

          {/* Key Stats */}
          <View style={styles.statsContainer}>
            <StatCard
              title="Total Sales"
              value={`$${totalSales.toFixed(2)}`}
              subtitle="All machines"
              emoji="💰"
              color="#22c55e"
            />
            
            <View style={styles.statsRow}>
              <View style={styles.halfCard}>
                <StatCard
                  title="Operational"
                  value={`${operationalMachines}/${machines.length}`}
                  subtitle="Machines online"
                  emoji="✅"
                  color="#22c55e"
                />
              </View>
              
              <View style={styles.halfCard}>
                <StatCard
                  title="Low Stock"
                  value={lowStockAlerts.length}
                  subtitle="Items need restock"
                  emoji="⚠️"
                  color={lowStockAlerts.length > 0 ? "#ef4444" : "#22c55e"}
                />
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.halfCard}>
                <StatCard
                  title="Pending Transfers"
                  value={pendingTransfers.length}
                  subtitle="Awaiting completion"
                  emoji="🔄"
                  color={pendingTransfers.length > 0 ? "#f59e0b" : "#22c55e"}
                />
              </View>
              
              <View style={styles.halfCard}>
                <StatCard
                  title="Recent Activity"
                  value={recentTransactions.length}
                  subtitle="Last transactions"
                  emoji="📊"
                  color="#3b82f6"
                />
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <Button 
                onPress={() => router.push('/inventory')}
                style={styles.actionButton}
              >
                📦 Inventory
              </Button>
              
              <Button 
                onPress={() => router.push('/transactions')}
                style={styles.actionButton}
              >
                📋 Transactions
              </Button>
              
              <Button 
                onPress={() => router.push('/maintenance')}
                style={styles.actionButton}
              >
                🔧 Maintenance
              </Button>
            </View>
          </View>

          {/* Alerts Section */}
          {(lowStockAlerts.length > 0 || pendingTransfers.length > 0) && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: '#ef4444' }]}>
                🚨 Alerts & Notifications
              </Text>
              
              {lowStockAlerts.length > 0 && (
                <View style={styles.alertCard}>
                  <Text style={styles.alertTitle}>Low Stock Alert</Text>
                  <Text style={styles.alertText}>
                    {lowStockAlerts.length} item(s) need restocking across your machines
                  </Text>
                  <Button 
                    onPress={() => router.push('/inventory')}
                    size="small"
                    style={styles.alertButton}
                  >
                    View Inventory
                  </Button>
                </View>
              )}

              {pendingTransfers.length > 0 && (
                <View style={styles.alertCard}>
                  <Text style={styles.alertTitle}>Pending Transfers</Text>
                  <Text style={styles.alertText}>
                    {pendingTransfers.length} transfer request(s) awaiting completion
                  </Text>
                  <Button 
                    onPress={() => router.push('/transactions')}
                    size="small"
                    style={styles.alertButton}
                  >
                    View Transfers
                  </Button>
                </View>
              )}
            </View>
          )}

          {/* Machines Overview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Machines Overview</Text>
            {machines.map((machine) => (
              <MachineCard key={machine.id} machine={machine} />
            ))}
          </View>

          {/* Recent Activity */}
          {recentTransactions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              {recentTransactions.slice(0, 3).map((transaction) => {
                const machine = machines.find(m => m.id === transaction.machineId);
                const product = machine?.products.find(p => p.id === transaction.productId);
                
                return (
                  <View key={transaction.id} style={styles.activityCard}>
                    <View style={styles.activityHeader}>
                      <Text style={styles.activityType}>
                        {transaction.type === 'in' ? '📥' : transaction.type === 'out' ? '📤' : '🔄'} 
                        {transaction.type.toUpperCase()}
                      </Text>
                      <Text style={styles.activityTime}>
                        {new Date(transaction.timestamp).toLocaleTimeString()}
                      </Text>
                    </View>
                    <Text style={styles.activityDetails}>
                      {product?.emoji} {product?.name} × {transaction.quantity} at {machine?.name}
                    </Text>
                    <Text style={styles.activityReason}>{transaction.reason}</Text>
                  </View>
                );
              })}
              
              <Button 
                onPress={() => router.push('/transactions')}
                variant="outline"
                style={styles.viewAllButton}
              >
                View All Transactions
              </Button>
            </View>
          )}
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
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.grey,
  },
  statsContainer: {
    marginBottom: 32,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
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
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  alertCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  alertText: {
    fontSize: 14,
    color: colors.grey,
    marginBottom: 12,
  },
  alertButton: {
    alignSelf: 'flex-start',
  },
  activityCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.grey + '20',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  activityTime: {
    fontSize: 12,
    color: colors.grey,
  },
  activityDetails: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  activityReason: {
    fontSize: 12,
    color: colors.grey,
    fontStyle: 'italic',
  },
  viewAllButton: {
    marginTop: 8,
  },
});
