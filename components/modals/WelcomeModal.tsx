import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { COLORS } from '@/constants/Colors';
import { Heart } from 'lucide-react-native';

interface WelcomeModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function WelcomeModal({ visible, onClose }: WelcomeModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <Heart color={COLORS.primary} size={40} />
          </View>
          
          <Text style={styles.title}>Welcome to ScoreFlow!</Text>
          
          <Text style={styles.message}>
            We're excited to have you onboard as we build a better space for sports lovers like you. Currently, our app supports Basketball, Volleyball, and Football, but we're just getting started!
          </Text>
          
          <Text style={styles.message}>
            Our team is actively working on expanding and improving the experience — adding more features, refining gameplay stats, and eventually covering all sports you love.
          </Text>
          
          <Text style={styles.message}>
            Stay tuned — the full game is just getting started!
          </Text>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Let's Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    alignSelf: 'center',
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: COLORS.white,
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: COLORS.gray,
    marginBottom: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontFamily: 'Poppins-Medium',
    color: COLORS.white,
    fontSize: 16,
  },
});