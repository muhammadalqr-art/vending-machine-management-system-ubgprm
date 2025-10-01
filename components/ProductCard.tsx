
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Product } from '../types/VendingMachine';
import { colors } from '../styles/commonStyles';

interface ProductCardProps {
  product: Product;
  onUpdateQuantity?: (productId: string, quantity: number) => void;
  lowStockThreshold?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onUpdateQuantity,
  lowStockThreshold = 5 
}) => {
  const isLowStock = product.quantity <= lowStockThreshold;
  const stockPercentage = (product.quantity / product.maxCapacity) * 100;

  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(0, Math.min(product.maxCapacity, product.quantity + change));
    onUpdateQuantity?.(product.id, newQuantity);
  };

  return (
    <View style={[styles.card, isLowStock && styles.lowStockCard]}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{product.emoji}</Text>
        <View style={styles.productInfo}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
        </View>
        {isLowStock && <Text style={styles.lowStockBadge}>⚠️</Text>}
      </View>

      <View style={styles.stockContainer}>
        <View style={styles.stockBar}>
          <View 
            style={[
              styles.stockFill, 
              { 
                width: `${stockPercentage}%`,
                backgroundColor: isLowStock ? '#ef4444' : '#22c55e'
              }
            ]} 
          />
        </View>
        <Text style={styles.stockText}>
          {product.quantity}/{product.maxCapacity}
        </Text>
      </View>

      {onUpdateQuantity && (
        <View style={styles.controls}>
          <Pressable 
            style={styles.controlButton} 
            onPress={() => handleQuantityChange(-1)}
          >
            <Text style={styles.controlText}>-</Text>
          </Pressable>
          
          <Text style={styles.quantity}>{product.quantity}</Text>
          
          <Pressable 
            style={styles.controlButton} 
            onPress={() => handleQuantityChange(1)}
          >
            <Text style={styles.controlText}>+</Text>
          </Pressable>
        </View>
      )}
    </View>
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
  lowStockCard: {
    borderColor: '#ef4444',
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 24,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  price: {
    fontSize: 14,
    color: colors.grey,
    marginTop: 2,
  },
  lowStockBadge: {
    fontSize: 20,
  },
  stockContainer: {
    marginBottom: 12,
  },
  stockBar: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  stockFill: {
    height: '100%',
    borderRadius: 4,
  },
  stockText: {
    fontSize: 12,
    color: colors.grey,
    textAlign: 'right',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantity: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },
});
