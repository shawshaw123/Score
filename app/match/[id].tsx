import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import BasketballGame from '@/components/games/BasketballGame';
import VolleyballGame from '@/components/games/VolleyballGame';
import FootballGame from '@/components/games/FootballGame';
import BadmintonGame from '@/components/games/BadmintonGame';
import BoxingGame from '@/components/games/BoxingGame';
import SepakTakrawGame from '@/components/games/SepakTakrawGame';
import TableTennisGame from '@/components/games/TableTennisGame';
import { X } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  // Example match data
  // In a real app, this would be fetched based on the ID
  const [match, setMatch] = useState({
    id: '1',
    tournamentId: '123',
    sport: 'basketball',
    team1: 'Lakers',
    team2: 'Bulls',
    score1: 0,
    score2: 0,
    status: 'scheduled', // scheduled, in-progress, completed
    settings: {
      quarterLength: 10,
      quarters: 4,
      shotClock: 24,
      enableShotClock: true,
    }
  });
  
  const handleExitMatch = () => {
    if (match.status === 'in-progress') {
      Alert.alert(
        'Exit Match',
        'Are you sure you want to exit? Current progress will be saved.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Exit',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };
  
  const renderGameComponent = () => {
    const settings = {
      ...match.settings,
      team1Name: match.team1,
      team2Name: match.team2,
    };
    
    switch(match.sport) {
      case 'basketball':
        return <BasketballGame settings={settings} matchId={id} />;
      case 'volleyball':
        return <VolleyballGame settings={settings} matchId={id} />;
      case 'football':
        return <FootballGame settings={settings} matchId={id} />;
      case 'badminton':
        return <BadmintonGame settings={settings} matchId={id} />;
      case 'boxing':
        return <BoxingGame settings={settings} matchId={id} />;
      case 'sepaktakraw':
        return <SepakTakrawGame settings={settings} matchId={id} />;
      case 'tabletennis':
        return <TableTennisGame settings={settings} matchId={id} />;
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
          headerTitle: `${match.team1} vs ${match.team2}`,
          headerBackVisible: false,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={handleExitMatch}
              style={styles.headerButton}
            >
              <X color={COLORS.white} size={24} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View style={styles.container}>
        {renderGameComponent()}
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