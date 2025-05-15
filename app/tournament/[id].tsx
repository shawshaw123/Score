import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { COLORS } from '@/constants/Colors';
import { useStorage } from '@/contexts/StorageContext';
import { Tournament, getTournamentById, storeTournament } from '@/utils/storage';
import TournamentBracket from '@/components/tournament/TournamentBracket';

export default function TournamentDetailsScreen() {
  const { id } = useLocalSearchParams();
  const storage = useStorage();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTournament();
  }, [id]);

  const loadTournament = async () => {
    try {
      const data = await getTournamentById(storage, id as string);
      setTournament(data);
      
      // Check if tournament is complete
      if (data && data.matches) {
        const finalMatch = data.matches[data.matches.length - 1];
        if (finalMatch && finalMatch.winner && data.status !== 'completed') {
          // Update tournament status to completed
          await storeTournament(storage, {
            ...data,
            status: 'completed'
          });
          // Reload tournament to get updated status
          const updatedData = await getTournamentById(storage, id as string);
          setTournament(updatedData);
        }
      }
    } catch (error) {
      console.error('Failed to load tournament:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!tournament) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Tournament not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTitle: tournament.name,
        }} 
      />
      
      <ScrollView style={styles.container}>
        <View style={styles.infoCard}>
          <Text style={styles.label}>Tournament Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Sport:</Text>
            <Text style={styles.infoValue}>{tournament.sport.charAt(0).toUpperCase() + tournament.sport.slice(1)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Teams:</Text>
            <Text style={styles.infoValue}>{tournament.teams.length}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status:</Text>
            <Text style={[styles.infoValue, styles[tournament.status]]}>{tournament.status}</Text>
          </View>
        </View>

        <View style={styles.teamsCard}>
          <Text style={styles.label}>Teams</Text>
          {tournament.teams.map((team, index) => (
            <View key={index} style={styles.teamRow}>
              <Text style={styles.teamNumber}>{index + 1}</Text>
              <Text style={styles.teamName}>{team}</Text>
            </View>
          ))}
        </View>

        <View style={styles.bracketCard}>
          <Text style={styles.label}>Tournament Bracket</Text>
          <TournamentBracket tournament={tournament} />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
  },
  infoCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  label: {
    color: COLORS.white,
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    color: COLORS.gray,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    width: 80,
  },
  infoValue: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  upcoming: {
    color: COLORS.warning,
  },
  ongoing: {
    color: COLORS.primary,
  },
  completed: {
    color: COLORS.success,
  },
  teamsCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamNumber: {
    color: COLORS.gray,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    width: 30,
  },
  teamName: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  bracketCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
});