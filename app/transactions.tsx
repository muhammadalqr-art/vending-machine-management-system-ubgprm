
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, Modal } from 'react-native';
import { Stack, router } from 'expo-router';
import { colors, commonStyles } from '../styles/commonStyles';
import { useVendingData } from '../hooks/useVendingData';
import { StatCard } from '../components/StatCard';
import { Button } from '../components/button';

export default function Transactions() {
  const { 
    machines, 
    transactions, 
    transferRequests, 
    addTransaction, 
    createTransferRequest, 
    completeTransfer, 
    cancelTransfer,
    getPendingTransfers,
    getRecentTransactions,
    getMachineProduct
  } = useVendingData();

  const [activeTab, setActiveTab] = useState<'transactions' | 'transfers'>('transactions');
  const [showAddModal, setShowAddModal] = useState(false);
  const [transactionType, setTransactionType] = useState<'in' | 'out' | 'transfer'>('in');
  
  // Form state
  const [selectedMachine, setSelectedMachine] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [operatorName, setOperatorName] = useState('');
  const [transferToMachine, setTransferToMachine] = useState('');

  const pendingTransfers = getPendingTransfers();
  const recentTransactions = getRecentTransactions(20);

  const resetForm = () => {
    setSelectedMachine('');
    setSelectedProduct('');
    setQuantity('');
    setReason('');
    setOperatorName('');
    setTransferToMachine('');
  };

  const handleSubmitTransaction = () => {
    if (!selectedMachine || !selectedProduct || !quantity || !reason || !operatorName) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    if (transactionType === 'transfer') {
      if (!transferToMachine) {
        Alert.alert('Error', 'Please select destination machine for transfer');
        return;
      }

      const fromProduct = getMachineProduct(selectedMachine, selectedProduct);
      if (!fromProduct || fromProduct.quantity < quantityNum) {
        Alert.alert('Error', 'Insufficient quantity in source machine');
        return;
      }

      createTransferRequest({
        productId: selectedProduct,
        fromMachineId: selectedMachine,
        toMachineId: transferToMachine,
        quantity: quantityNum,
        reason,
        status: 'pending',
        requestedBy: operatorName
      });

      Alert.alert('Success', 'Transfer request created successfully');
    } else {
      if (transactionType === 'out') {
        const currentProduct = getMachineProduct(selectedMachine, selectedProduct);
        if (!currentProduct || currentProduct.quantity < quantityNum) {
          Alert.alert('Error', 'Insufficient quantity in machine');
          return;
        }
      }

      addTransaction({
        type: transactionType,
        machineId: selectedMachine,
        productId: selectedProduct,
        quantity: quantityNum,
        reason,
        operatorName
      });

      Alert.alert('Success', `${transactionType.toUpperCase()} transaction recorded successfully`);
    }

    resetForm();
    setShowAddModal(false);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'in': return '📥';
      case 'out': return '📤';
      case 'transfer': return '🔄';
      default: return '📋';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'in': return '#22c55e';
      case 'out': return '#ef4444';
      case 'transfer': return '#3b82f6';
      default: return colors.grey;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const selectedMachineData = machines.find(m => m.id === selectedMachine);

  console.log('Transactions screen loaded with', recentTransactions.length, 'transactions and', pendingTransfers.length, 'pending transfers');

  return (
    <View style={commonStyles.wrapper}>
      <Stack.Screen 
        options={{
          title: 'Inventory Transactions',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerBackTitle: 'Back',
        }} 
      />

      <View style={styles.container}>
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <StatCard
                title="Pending Transfers"
                value={pendingTransfers.length}
                subtitle="Awaiting completion"
                emoji="⏳"
                color={pendingTransfers.length > 0 ? "#f59e0b" : "#22c55e"}
              />
            </View>
            <View style={styles.statCard}>
              <StatCard
                title="Recent Transactions"
                value={recentTransactions.length}
                subtitle="Last 20 entries"
                emoji="📊"
                color="#3b82f6"
              />
            </View>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <Pressable
            style={[styles.tab, activeTab === 'transactions' && styles.activeTab]}
            onPress={() => setActiveTab('transactions')}
          >
            <Text style={[styles.tabText, activeTab === 'transactions' && styles.activeTabText]}>
              📋 Transactions
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'transfers' && styles.activeTab]}
            onPress={() => setActiveTab('transfers')}
          >
            <Text style={[styles.tabText, activeTab === 'transfers' && styles.activeTabText]}>
              🔄 Transfers ({pendingTransfers.length})
            </Text>
          </Pressable>
        </View>

        {/* Add Transaction Button */}
        <View style={styles.addButtonContainer}>
          <Button onPress={() => setShowAddModal(true)}>
            ➕ Add Transaction
          </Button>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'transactions' ? (
            <View>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
              {recentTransactions.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No transactions yet</Text>
                  <Text style={styles.emptySubtext}>Add your first transaction to get started</Text>
                </View>
              ) : (
                recentTransactions.map((transaction) => {
                  const machine = machines.find(m => m.id === transaction.machineId);
                  const product = machine?.products.find(p => p.id === transaction.productId);
                  
                  return (
                    <View key={transaction.id} style={styles.transactionCard}>
                      <View style={styles.transactionHeader}>
                        <View style={styles.transactionInfo}>
                          <Text style={styles.transactionType}>
                            {getTransactionIcon(transaction.type)} {transaction.type.toUpperCase()}
                          </Text>
                          <Text style={styles.transactionDate}>
                            {formatDate(transaction.timestamp)}
                          </Text>
                        </View>
                        <View style={[styles.quantityBadge, { backgroundColor: getTransactionColor(transaction.type) }]}>
                          <Text style={styles.quantityText}>
                            {transaction.type === 'out' ? '-' : '+'}{transaction.quantity}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.transactionDetails}>
                        <Text style={styles.productName}>
                          {product?.emoji} {product?.name}
                        </Text>
                        <Text style={styles.machineName}>
                          📍 {machine?.name}
                        </Text>
                        {transaction.type === 'transfer' && transaction.fromMachineId && transaction.toMachineId && (
                          <Text style={styles.transferInfo}>
                            From: {machines.find(m => m.id === transaction.fromMachineId)?.name} → 
                            To: {machines.find(m => m.id === transaction.toMachineId)?.name}
                          </Text>
                        )}
                        <Text style={styles.reason}>💬 {transaction.reason}</Text>
                        <Text style={styles.operator}>👤 {transaction.operatorName}</Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          ) : (
            <View>
              <Text style={styles.sectionTitle}>Transfer Requests</Text>
              {transferRequests.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No transfer requests</Text>
                  <Text style={styles.emptySubtext}>Create a transfer to move inventory between machines</Text>
                </View>
              ) : (
                transferRequests.map((transfer) => {
                  const fromMachine = machines.find(m => m.id === transfer.fromMachineId);
                  const toMachine = machines.find(m => m.id === transfer.toMachineId);
                  const product = fromMachine?.products.find(p => p.id === transfer.productId);
                  
                  return (
                    <View key={transfer.id} style={styles.transferCard}>
                      <View style={styles.transferHeader}>
                        <View style={styles.transferInfo}>
                          <Text style={styles.transferStatus}>
                            {transfer.status === 'pending' ? '⏳' : transfer.status === 'completed' ? '✅' : '❌'} 
                            {transfer.status.toUpperCase()}
                          </Text>
                          <Text style={styles.transferDate}>
                            {formatDate(transfer.timestamp)}
                          </Text>
                        </View>
                        <View style={styles.transferQuantity}>
                          <Text style={styles.quantityText}>{transfer.quantity}</Text>
                        </View>
                      </View>
                      
                      <View style={styles.transferDetails}>
                        <Text style={styles.productName}>
                          {product?.emoji} {product?.name}
                        </Text>
                        <Text style={styles.transferRoute}>
                          📍 {fromMachine?.name} → {toMachine?.name}
                        </Text>
                        <Text style={styles.reason}>💬 {transfer.reason}</Text>
                        <Text style={styles.operator}>👤 {transfer.requestedBy}</Text>
                        {transfer.completedAt && (
                          <Text style={styles.completedAt}>
                            ✅ Completed: {formatDate(transfer.completedAt)}
                          </Text>
                        )}
                      </View>
                      
                      {transfer.status === 'pending' && (
                        <View style={styles.transferActions}>
                          <Pressable
                            style={[styles.actionButton, styles.completeButton]}
                            onPress={() => completeTransfer(transfer.id)}
                          >
                            <Text style={styles.actionButtonText}>✅ Complete</Text>
                          </Pressable>
                          <Pressable
                            style={[styles.actionButton, styles.cancelButton]}
                            onPress={() => cancelTransfer(transfer.id)}
                          >
                            <Text style={styles.actionButtonText}>❌ Cancel</Text>
                          </Pressable>
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </View>
          )}
        </ScrollView>

        {/* Add Transaction Modal */}
        <Modal
          visible={showAddModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Transaction</Text>
              <Pressable onPress={() => setShowAddModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Transaction Type */}
              <Text style={styles.fieldLabel}>Transaction Type</Text>
              <View style={styles.typeSelector}>
                {(['in', 'out', 'transfer'] as const).map((type) => (
                  <Pressable
                    key={type}
                    style={[
                      styles.typeButton,
                      transactionType === type && styles.activeTypeButton
                    ]}
                    onPress={() => setTransactionType(type)}
                  >
                    <Text style={styles.typeButtonText}>
                      {getTransactionIcon(type)} {type.toUpperCase()}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Machine Selection */}
              <Text style={styles.fieldLabel}>
                {transactionType === 'transfer' ? 'From Machine' : 'Machine'}
              </Text>
              <View style={styles.machineSelector}>
                {machines.map((machine) => (
                  <Pressable
                    key={machine.id}
                    style={[
                      styles.machineOption,
                      selectedMachine === machine.id && styles.activeMachineOption
                    ]}
                    onPress={() => setSelectedMachine(machine.id)}
                  >
                    <Text style={styles.machineOptionText}>{machine.name}</Text>
                  </Pressable>
                ))}
              </View>

              {/* Transfer To Machine */}
              {transactionType === 'transfer' && (
                <>
                  <Text style={styles.fieldLabel}>To Machine</Text>
                  <View style={styles.machineSelector}>
                    {machines
                      .filter(m => m.id !== selectedMachine)
                      .map((machine) => (
                        <Pressable
                          key={machine.id}
                          style={[
                            styles.machineOption,
                            transferToMachine === machine.id && styles.activeMachineOption
                          ]}
                          onPress={() => setTransferToMachine(machine.id)}
                        >
                          <Text style={styles.machineOptionText}>{machine.name}</Text>
                        </Pressable>
                      ))}
                  </View>
                </>
              )}

              {/* Product Selection */}
              {selectedMachineData && (
                <>
                  <Text style={styles.fieldLabel}>Product</Text>
                  <View style={styles.productSelector}>
                    {selectedMachineData.products.map((product) => (
                      <Pressable
                        key={product.id}
                        style={[
                          styles.productOption,
                          selectedProduct === product.id && styles.activeProductOption
                        ]}
                        onPress={() => setSelectedProduct(product.id)}
                      >
                        <Text style={styles.productOptionText}>
                          {product.emoji} {product.name} (Stock: {product.quantity})
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              )}

              {/* Quantity */}
              <Text style={styles.fieldLabel}>Quantity</Text>
              <TextInput
                style={styles.input}
                value={quantity}
                onChangeText={setQuantity}
                placeholder="Enter quantity"
                keyboardType="numeric"
                placeholderTextColor={colors.grey}
              />

              {/* Reason */}
              <Text style={styles.fieldLabel}>Reason</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={reason}
                onChangeText={setReason}
                placeholder="Enter reason for transaction"
                multiline
                numberOfLines={3}
                placeholderTextColor={colors.grey}
              />

              {/* Operator Name */}
              <Text style={styles.fieldLabel}>Operator Name</Text>
              <TextInput
                style={styles.input}
                value={operatorName}
                onChangeText={setOperatorName}
                placeholder="Enter operator name"
                placeholderTextColor={colors.grey}
              />

              <View style={styles.modalActions}>
                <Button onPress={handleSubmitTransaction}>
                  Submit Transaction
                </Button>
              </View>
            </ScrollView>
          </View>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  statsContainer: {
    padding: 20,
    paddingBottom: 0,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.grey,
  },
  activeTabText: {
    color: colors.text,
  },
  addButtonContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.grey,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.grey,
    textAlign: 'center',
  },
  transactionCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.grey + '20',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  transactionDate: {
    fontSize: 12,
    color: colors.grey,
    marginTop: 2,
  },
  quantityBadge: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  quantityText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  transactionDetails: {
    gap: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  machineName: {
    fontSize: 14,
    color: colors.grey,
  },
  transferInfo: {
    fontSize: 14,
    color: colors.grey,
  },
  reason: {
    fontSize: 14,
    color: colors.grey,
    fontStyle: 'italic',
  },
  operator: {
    fontSize: 12,
    color: colors.grey,
  },
  transferCard: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.grey + '20',
  },
  transferHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transferInfo: {
    flex: 1,
  },
  transferStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  transferDate: {
    fontSize: 12,
    color: colors.grey,
    marginTop: 2,
  },
  transferQuantity: {
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  transferDetails: {
    gap: 4,
    marginBottom: 12,
  },
  transferRoute: {
    fontSize: 14,
    color: colors.grey,
  },
  completedAt: {
    fontSize: 12,
    color: '#22c55e',
  },
  transferActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButton: {
    backgroundColor: '#22c55e',
  },
  cancelButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey + '30',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    fontSize: 24,
    color: colors.grey,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.grey + '30',
  },
  activeTypeButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  machineSelector: {
    gap: 8,
  },
  machineOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.grey + '30',
  },
  activeMachineOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  machineOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  productSelector: {
    gap: 8,
  },
  productOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.grey + '30',
  },
  activeProductOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  productOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  input: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.grey + '30',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    marginTop: 24,
    marginBottom: 40,
  },
});
