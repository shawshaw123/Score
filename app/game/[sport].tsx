import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import BasketballGame from '@/components/games/BasketballGame';
import VolleyballGame from '@/components/games/VolleyballGame';
import FootballGame from '@/components/games/FootballGame';
import SepakTakrawGame from '@/components/games/SepakTakrawGame';
import BadmintonGame from '@/components/games/BadmintonGame';
import BoxingGame from '@/components/games/BoxingGame';
import TableTennisGame from '@/components/games/TableTennisGame';
import GameSetupModal from '@/components/modals/GameSetupModal';
import { useGameTimer } from '@/hooks/useGameTimer';
import { Plus, Minus, X } from 'lucide-react-native';

export default function GameScreen() {
  const { sport } = useLocalSearchParams<{ sport: string }>();
  const router = useRouter();
  const [showSetup, setShowSetup] = useState(true);
  const [gameSettings, setGameSettings] = useState<any>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  
  // Default game settings based on sport
  const getDefaultSettings = () => {
    switch(sport) {
      case 'basketball':
        return {
          quarterLength: 10,
          quarters: 4,
          team1Name: 'Home',
          team2Name: 'Away',
          shotClock: 24,
          enableShotClock: true,
        };
      case 'volleyball':
        return {
          setsToWin: 3,
          pointsPerSet: 25,
          team1Name: 'Home',
          team2Name: 'Away',
        };
      case 'football':
        return {
          halfLength: 45,
          team1Name: 'Home',
          team2Name: 'Away',
        };
      case 'sepak-takraw':
        return {
          team1Name: 'Home',
          team2Name: 'Away',
          timeoutsPerSet: 2,
        };
      case 'badminton':
        return {
          format: 'singles',
          pointsToWin: 21,
          team1Name: 'Player 1',
          team2Name: 'Player 2',
          timeoutsPerGame: 1,
        };
      case 'boxing':
        return {
          roundLength: 3,
          totalRounds: 12,
          breakLength: 1,
          boxer1Name: 'Boxer 1',
          boxer2Name: 'Boxer 2',
        };
      case 'table-tennis':
        return {
          pointsToWin: 11,
          bestOf: 5,
          team1Name: 'Player 1',
          team2Name: 'Player 2',
          timeoutsPerGame: 1,
        };
      default:
        return {};
    }
  };
  
  const handleSetupComplete = (settings: any) => {
    setGameSettings(settings);
    setShowSetup(false);
    setGameStarted(true);
  };
  
  const handleExitGame = () => {
    if (gameStarted) {
      Alert.alert(
        'Exit Game',
        'Are you sure you want to exit? All current game data will be lost.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Exit',
            onPress: () => router.back(),
            style: 'destructive',
          },
        ]
      );
    } else {
      router.back();
    }
  };
  
  const renderGameComponent = () => {
    if (!gameSettings) return null;
    
    switch(sport) {
      case 'basketball':
        return <BasketballGame settings={gameSettings} />;
      case 'volleyball':
        return <VolleyballGame settings={gameSettings} />;
      case 'football':
        return <FootballGame settings={gameSettings} />;
      case 'sepak-takraw':
        return <SepakTakrawGame settings={gameSettings} />;
      case 'badminton':
        return <BadmintonGame settings={gameSettings} />;
      case 'boxing':
        return <BoxingGame settings={gameSettings} />;
      case 'table-tennis':
        return <TableTennisGame settings={gameSettings} />;
      default:
        return (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Unknown sport type</Text>
          </View>
        );
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTitle: sport ? sport.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ') : 'Game',
          headerBackVisible: false,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={handleExitGame}
              style={styles.headerButton}
            >
              <X color={COLORS.white} size={24} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View style={styles.container}>
        {showSetup ? (
          <GameSetupModal 
            sport={sport as string} 
            defaultSettings={getDefaultSettings()}
            onComplete={handleSetupComplete}
          />
        ) : (
          renderGameComponent()
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerButton: {
    padding: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    color: COLORS.error,
  },
});