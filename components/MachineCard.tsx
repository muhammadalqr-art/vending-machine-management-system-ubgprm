
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { VendingMachine } from '../types/VendingMachine';
import { colors } from '../styles/commonStyles';
import { router } from 'expo-router';

interface MachineCardProps {
  machine: VendingMachine;
}

export const MachineCard: React.FC<MachineCardProps> = ({ machine }) => {
  const getStatusColor = (status: VendingMachine['status']) => {
    switch (status) {
      case 'operational':
        return '#22c55e';
      case 'maintenance':
        return '#f59e0b';
      case 'out-of-service':
        return '#ef4444';
      default:
        return colors.grey;
    }
  };

  const getStatusEmoji = (status: VendingMachine['status']) => {
    switch (status) {
      case 'operational':
        return '✅';
      case 'maintenance':
        return '🔧';
      case 'out-of-service':
        return '❌';
      default:
        return '❓';
    }
  };

  const lowStockCount = machine.products.filter(
    product => product.quantity <= machine.lowStockThreshold
  ).length;

  const handlePress = () => {
    router.push(`/machine/${machine.id}`);
  };

  return (
    <Pressable style={styles.card} onPress={handlePress}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.name}>{machine.name}</Text>
          <Text style={styles.location}>{machine.location}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(machine.status) }]}>
          <Text style={styles.statusEmoji}>{getStatusEmoji(machine.status)}</Text>
        </View>
      </View>
      
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>${machine.totalSales.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Total Sales</Text>
        </View>
        
        <View style={styles.stat}>
          <Text style={styles.statValue}>{machine.products.length}</Text>
          <Text style={styles.statLabel}>Products</Text>
        </View>
        
        {lowStockCount > 0 && (
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: '#ef4444' }]}>{lowStockCount}</Text>
            <Text style={styles.statLabel}>Low Stock</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.grey + '20',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: colors.grey,
  },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 12,
  },
  statusEmoji: {
    fontSize: 16,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.grey,
    marginTop: 2,
  },
});
