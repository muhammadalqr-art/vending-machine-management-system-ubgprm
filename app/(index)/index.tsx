
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { colors, commonStyles } from '../../styles/commonStyles';
import { useVendingData } from '../../hooks/useVendingData';
import { StatCard } from '../../components/StatCard';
import { MachineCard } from '../../components/MachineCard';
import { Button } from '../../components/button';

export default function Dashboard() {
  const { 
    machines, 
    getTotalSales, 
    getOperationalMachines, 
    getLowStockAlerts 
  } = useVendingData();

  const totalSales = getTotalSales();
  const operationalMachines = getOperationalMachines();
  const lowStockAlerts = getLowStockAlerts();

  console.log('Dashboard loaded with', machines.length, 'machines');

  return (
    <View style={commonStyles.wrapper}>
      <Stack.Screen 
        options={{
          title: 'Vending Machine Manager',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: 'bold' },
        }} 
      />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.welcomeText}>Welcome back! 👋</Text>
          <Text style={styles.subtitle}>Here&apos;s your vending machine overview</Text>

          {/* Stats Overview */}
          <View style={styles.statsContainer}>
            <StatCard
              title="Total Sales"
              value={`$${totalSales.toFixed(2)}`}
              subtitle="All time revenue"
              emoji="💰"
              color="#22c55e"
            />
            
            <View style={styles.statsRow}>
              <View style={styles.halfCard}>
                <StatCard
                  title="Operational"
                  value={`${operationalMachines}/${machines.length}`}
                  subtitle="Machines running"
                  emoji="✅"
                  color="#3b82f6"
                />
              </View>
              
              <View style={styles.halfCard}>
                <StatCard
                  title="Low Stock Alerts"
                  value={lowStockAlerts.length}
                  subtitle="Items need restocking"
                  emoji="⚠️"
                  color={lowStockAlerts.length > 0 ? "#ef4444" : "#22c55e"}
                />
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.buttonRow}>
              <Button
                style={styles.actionButton}
                onPress={() => router.push('/inventory')}
              >
                📦 Inventory
              </Button>
              <Button
                style={styles.actionButton}
                onPress={() => router.push('/maintenance')}
              >
                🔧 Maintenance
              </Button>
            </View>
          </View>

          {/* Machines List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Machines</Text>
            {machines.map((machine) => (
              <MachineCard key={machine.id} machine={machine} />
            ))}
          </View>

          {/* Low Stock Alerts */}
          {lowStockAlerts.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: '#ef4444' }]}>
                🚨 Low Stock Alerts
              </Text>
              {lowStockAlerts.slice(0, 3).map((alert, index) => (
                <View key={index} style={styles.alertCard}>
                  <Text style={styles.alertText}>
                    {alert.product.emoji} {alert.product.name} in {alert.machine.name}
                  </Text>
                  <Text style={styles.alertSubtext}>
                    Only {alert.product.quantity} left
                  </Text>
                </View>
              ))}
              {lowStockAlerts.length > 3 && (
                <Button
                  style={styles.viewAllButton}
                  onPress={() => router.push('/inventory')}
                >
                  View All Alerts ({lowStockAlerts.length})
                </Button>
              )}
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
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.grey,
    marginBottom: 24,
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
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  alertCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  alertText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  alertSubtext: {
    fontSize: 12,
    color: colors.grey,
    marginTop: 2,
  },
  viewAllButton: {
    backgroundColor: colors.secondary,
    marginTop: 8,
  },
});
