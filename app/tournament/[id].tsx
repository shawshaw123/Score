import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '@/constants/Colors';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Share2, CreditCard as Edit, Award } from 'lucide-react-native';
import TournamentBracket from '@/components/tournament/TournamentBracket';

interface Match {
  id: string;
  team1: string;
  team2: string;
  score1: number;
  score2: number;
  winner: string | null;
  complete: boolean;
}

interface Round {
  name: string;
  matches: Match[];
}

interface Tournament {
  id: string;
  name: string;
  sport: string;
  startDate: string;
  endDate: string;
  status: 'ongoing' | 'upcoming' | 'completed';
  teams: string[];
  rounds: Round[];
}

export default function TournamentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [tournament, setTournament] = useState<Tournament | null>(null);

  const handleShareTournament = () => {
    // Share tournament logic
    console.log('Sharing tournament...');
  };
  
  const handleEditTournament = () => {
    // Edit tournament logic
    console.log('Editing tournament...');
  };
  
  const handleStartMatch = (matchId: string) => {
    // Navigate to match screen
    router.push(`/match/${matchId}`);
  };
  
  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTitle: tournament?.name || 'Tournament Details',
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={handleShareTournament}
              >
                <Share2 color={COLORS.white} size={20} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={handleEditTournament}
              >
                <Edit color={COLORS.white} size={20} />
              </TouchableOpacity>
            </View>
          ),
        }} 
      />
      
      <ScrollView style={styles.container}>
        {tournament ? (
          <>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Sport:</Text>
                <Text style={styles.infoValue}>
                  {tournament.sport.charAt(0).toUpperCase() + tournament.sport.slice(1)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date:</Text>
                <Text style={styles.infoValue}>{tournament.startDate} - {tournament.endDate}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status:</Text>
                <View style={[
                  styles.statusBadge,
                  tournament.status === 'ongoing' ? styles.statusOngoing : 
                  tournament.status === 'upcoming' ? styles.statusUpcoming : 
                  styles.statusCompleted
                ]}>
                  <Text style={styles.statusText}>
                    {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                  </Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Teams:</Text>
                <Text style={styles.infoValue}>{tournament.teams.length}</Text>
              </View>
            </View>
            
            <TournamentBracket 
              rounds={tournament.rounds} 
              onStartMatch={handleStartMatch} 
            />
            
            {tournament.status === 'completed' && (
              <View style={styles.winnerCard}>
                <Award color={COLORS.gold} size={40} />
                <Text style={styles.winnerTitle}>Tournament Winner</Text>
                <Text style={styles.winnerName}>Lakers</Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Tournament not found</Text>
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginTop: 24,
  },
  emptyStateText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: COLORS.gray,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 16,
  },
  infoCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: COLORS.gray,
  },
  infoValue: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: COLORS.white,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 50,
  },
  statusOngoing: {
    backgroundColor: COLORS.primary,
  },
  statusUpcoming: {
    backgroundColor: COLORS.blue,
  },
  statusCompleted: {
    backgroundColor: COLORS.green,
  },
  statusText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: COLORS.white,
  },
  winnerCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  winnerTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    color: COLORS.white,
    marginVertical: 8,
  },
  winnerName: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: COLORS.gold,
  },
});