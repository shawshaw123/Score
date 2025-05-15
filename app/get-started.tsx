import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '@/constants/Colors';
import { useRouter } from 'expo-router';

export default function GetStartedScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.appName}>ScoreFlow</Text>
        <Text style={styles.tagline}>Your All-in-One Sports Timer & Scorekeeper</Text>
        
        <TouchableOpacity 
          style={styles.getStartedButton}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.getStartedButtonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  appName: {
    fontFamily: 'Poppins-Bold',
    fontSize: 48,
    color: COLORS.primary,
    marginBottom: 16,
  },
  tagline: {
    fontFamily: 'Poppins-Regular',
    fontSize: 18,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 48,
    maxWidth: '80%',
  },
  getStartedButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
  },
  getStartedButtonText: {
    fontFamily: 'Poppins-Medium',
    color: COLORS.white,
    fontSize: 18,
  },
});