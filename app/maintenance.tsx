
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { colors, commonStyles } from '../styles/commonStyles';
import { useVendingData } from '../hooks/useVendingData';
import { Button } from '../components/button';
import { MaintenanceLog } from '../types/VendingMachine';

export default function Maintenance() {
  const { machineId } = useLocalSearchParams<{ machineId?: string }>();
  const { machines, maintenanceLogs } = useVendingData();
  
  const [selectedMachine, setSelectedMachine] = useState<string>(machineId || '');
  const [maintenanceType, setMaintenanceType] = useState<'routine' | 'repair' | 'restock'>('routine');
  const [description, setDescription] = useState('');
  const [technician, setTechnician] = useState('');

  const selectedMachineData = machines.find(m => m.id === selectedMachine);
  const machineLogs = maintenanceLogs.filter(log => log.machineId === selectedMachine);

  const handleLogMaintenance = () => {
    if (!selectedMachine || !description.trim() || !technician.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // In a real app, this would save to a database
    console.log('Logging maintenance:', {
      machineId: selectedMachine,
      type: maintenanceType,
      description,
      technician,
      timestamp: new Date().toISOString()
    });

    Alert.alert(
      'Success',
      'Maintenance log has been recorded successfully!',
      [
        {
          text: 'OK',
          onPress: () => {
            setDescription('');
            setTechnician('');
          }
        }
      ]
    );
  };

  const getMaintenanceTypeColor = (type: string) => {
    switch (type) {
      case 'routine': return '#3b82f6';
      case 'repair': return '#ef4444';
      case 'restock': return '#22c55e';
      default: return colors.grey;
    }
  };

  const getMaintenanceTypeEmoji = (type: string) => {
    switch (type) {
      case 'routine': return '🔧';
      case 'repair': return '⚠️';
      case 'restock': return '📦';
      default: return '📝';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  console.log('Maintenance screen loaded for machine:', selectedMachine);

  return (
    <View style={commonStyles.wrapper}>
      <Stack.Screen 
        options={{
          title: 'Maintenance Logs',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerBackTitle: 'Back',
        }} 
      />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Machine Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Machine</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.machineSelector}>
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

          {/* Log New Maintenance */}
          {selectedMachine && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Log New Maintenance</Text>
              <View style={styles.logForm}>
                <Text style={styles.fieldLabel}>Machine</Text>
                <Text style={styles.selectedMachine}>
                  {selectedMachineData?.name} - {selectedMachineData?.location}
                </Text>

                <Text style={styles.fieldLabel}>Maintenance Type</Text>
                <View style={styles.typeSelector}>
                  {(['routine', 'repair', 'restock'] as const).map((type) => (
                    <Pressable
                      key={type}
                      style={[
                        styles.typeButton,
                        maintenanceType === type && styles.activeTypeButton,
                        { borderColor: getMaintenanceTypeColor(type) }
                      ]}
                      onPress={() => setMaintenanceType(type)}
                    >
                      <Text style={styles.typeButtonText}>
                        {getMaintenanceTypeEmoji(type)} {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.fieldLabel}>Description</Text>
                <TextInput
                  style={styles.textInput}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Describe the maintenance work performed..."
                  placeholderTextColor={colors.grey}
                  multiline
                  numberOfLines={3}
                />

                <Text style={styles.fieldLabel}>Technician</Text>
                <TextInput
                  style={styles.textInput}
                  value={technician}
                  onChangeText={setTechnician}
                  placeholder="Enter technician name"
                  placeholderTextColor={colors.grey}
                />

                <Button
                  style={styles.logButton}
                  onPress={handleLogMaintenance}
                >
                  📝 Log Maintenance
                </Button>
              </View>
            </View>
          )}

          {/* Maintenance History */}
          {selectedMachine && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Maintenance History ({machineLogs.length})
              </Text>
              
              {machineLogs.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    No maintenance logs found for this machine
                  </Text>
                </View>
              ) : (
                machineLogs
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((log) => (
                    <View key={log.id} style={styles.logCard}>
                      <View style={styles.logHeader}>
                        <View style={styles.logTypeContainer}>
                          <View 
                            style={[
                              styles.logTypeBadge, 
                              { backgroundColor: getMaintenanceTypeColor(log.type) }
                            ]}
                          >
                            <Text style={styles.logTypeEmoji}>
                              {getMaintenanceTypeEmoji(log.type)}
                            </Text>
                          </View>
                          <Text style={styles.logType}>
                            {log.type.charAt(0).toUpperCase() + log.type.slice(1)}
                          </Text>
                        </View>
                        <Text style={styles.logDate}>{formatDate(log.timestamp)}</Text>
                      </View>
                      
                      <Text style={styles.logDescription}>{log.description}</Text>
                      
                      <View style={styles.logFooter}>
                        <Text style={styles.logTechnician}>👤 {log.technician}</Text>
                      </View>
                    </View>
                  ))
              )}
            </View>
          )}

          {/* All Machines Overview */}
          {!selectedMachine && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>All Machines Overview</Text>
              {machines.map((machine) => {
                const logs = maintenanceLogs.filter(log => log.machineId === machine.id);
                const lastMaintenance = logs.length > 0 
                  ? Math.max(...logs.map(log => new Date(log.timestamp).getTime()))
                  : new Date(machine.lastMaintenance).getTime();
                const daysSinceLastMaintenance = Math.floor(
                  (Date.now() - lastMaintenance) / (1000 * 60 * 60 * 24)
                );

                return (
                  <Pressable
                    key={machine.id}
                    style={styles.machineOverviewCard}
                    onPress={() => setSelectedMachine(machine.id)}
                  >
                    <View style={styles.machineOverviewHeader}>
                      <Text style={styles.machineOverviewName}>{machine.name}</Text>
                      <Text style={styles.machineOverviewLocation}>{machine.location}</Text>
                    </View>
                    
                    <View style={styles.machineOverviewStats}>
                      <View style={styles.overviewStat}>
                        <Text style={styles.overviewStatValue}>{logs.length}</Text>
                        <Text style={styles.overviewStatLabel}>Total Logs</Text>
                      </View>
                      
                      <View style={styles.overviewStat}>
                        <Text style={[
                          styles.overviewStatValue,
                          daysSinceLastMaintenance > 30 && { color: '#ef4444' }
                        ]}>
                          {daysSinceLastMaintenance}
                        </Text>
                        <Text style={styles.overviewStatLabel}>Days Since Last</Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
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
  logForm: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.grey + '20',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  selectedMachine: {
    fontSize: 16,
    color: colors.grey,
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  typeButton: {
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 2,
  },
  activeTypeButton: {
    backgroundColor: colors.primary + '20',
  },
  typeButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.grey + '30',
    textAlignVertical: 'top',
  },
  logButton: {
    backgroundColor: colors.primary,
    marginTop: 16,
  },
  logCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.grey + '20',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  logTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logTypeBadge: {
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  logTypeEmoji: {
    fontSize: 16,
  },
  logType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  logDate: {
    fontSize: 12,
    color: colors.grey,
  },
  logDescription: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  logFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.grey + '20',
    paddingTop: 8,
  },
  logTechnician: {
    fontSize: 12,
    color: colors.grey,
  },
  emptyState: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.grey,
    textAlign: 'center',
  },
  machineOverviewCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.grey + '20',
  },
  machineOverviewHeader: {
    marginBottom: 12,
  },
  machineOverviewName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  machineOverviewLocation: {
    fontSize: 14,
    color: colors.grey,
    marginTop: 2,
  },
  machineOverviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  overviewStat: {
    alignItems: 'center',
  },
  overviewStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  overviewStatLabel: {
    fontSize: 12,
    color: colors.grey,
    marginTop: 2,
  },
});
