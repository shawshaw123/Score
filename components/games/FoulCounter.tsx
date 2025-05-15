import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '@/constants/Colors';
import { Plus } from 'lucide-react-native';

interface FoulCounterProps {
  count: number;
  onAddFoul: () => void;
  label: string;
}

export default function FoulCounter({ count, onAddFoul, label }: FoulCounterProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.countRow}>
        {[...Array(6)].map((_, index) => (
          <View 
            key={index} 
            style={[
              styles.foulIndicator, 
              index < count && styles.activeFoul
            ]} 
          />
        ))}
      </View>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={onAddFoul}
      >
        <Plus color={COLORS.white} size={16} />
        <Text style={styles.addButtonText}>Add Foul</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  label: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 8,
  },
  countRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  foulIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.cardBackgroundLight,
    marginHorizontal: 4,
  },
  activeFoul: {
    backgroundColor: COLORS.error,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackgroundLight,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.white,
    marginLeft: 8,
  },
});