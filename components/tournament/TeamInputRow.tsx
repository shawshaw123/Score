import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { COLORS } from '@/constants/Colors';

interface TeamInputRowProps {
  teamNumber: number;
  teamName: string;
  onChangeText: (text: string) => void;
}

export default function TeamInputRow({ teamNumber, teamName, onChangeText }: TeamInputRowProps) {
  return (
    <View style={styles.container}>
      <View style={styles.numberContainer}>
        <Text style={styles.number}>{teamNumber}</Text>
      </View>
      <TextInput
        style={styles.input}
        value={teamName}
        onChangeText={onChangeText}
        placeholder={`Team ${teamNumber}`}
        placeholderTextColor={COLORS.gray}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  numberContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  number: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: COLORS.primary,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 8,
    padding: 12,
    color: COLORS.white,
    fontFamily: 'Poppins-Regular',
  },
});