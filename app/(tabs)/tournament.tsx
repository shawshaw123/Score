import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS } from '@/constants/Colors';
import { Trophy, Plus, ChevronRight } from 'lucide-react-native';
import TournamentCard from '@/components/TournamentCard';
import { useRouter } from 'expo-router';

interface Tournament {
  id: string;
  name: string;
  sport: string;
  teams: number;
  status: 'ongoing' | 'upcoming' | 'completed';
  startDate: string;
  endDate: string;
}

export default function TournamentScreen() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  const handleCreateTournament = () => {
    router.push('/tournament/create');
  };

  const handleTournamentPress = (id: string) => {
    router.push(`/tournament/${id}`);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.createButton}
        onPress={handleCreateTournament}
      >
        <Plus color={COLORS.white} size={20} />
        <Text style={styles.createButtonText}>Create Tournament</Text>
      </TouchableOpacity>

      <View style={styles.tournamentSection}>
        <Text style={styles.sectionTitle}>Active Tournaments</Text>
        {tournaments.filter(t => t.status === 'ongoing').length > 0 ? (
          <FlatList
            data={tournaments.filter(t => t.status === 'ongoing')}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TournamentCard 
                tournament={item} 
                onPress={() => handleTournamentPress(item.id)} 
              />
            )}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Trophy color={COLORS.gray} size={40} />
            <Text style={styles.emptyStateText}>No active tournaments</Text>
          </View>
        )}
      </View>

      <View style={styles.tournamentSection}>
        <Text style={styles.sectionTitle}>Upcoming Tournaments</Text>
        {tournaments.filter(t => t.status === 'upcoming').length > 0 ? (
          <FlatList
            data={tournaments.filter(t => t.status === 'upcoming')}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TournamentCard 
                tournament={item} 
                onPress={() => handleTournamentPress(item.id)} 
              />
            )}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Trophy color={COLORS.gray} size={40} />
            <Text style={styles.emptyStateText}>No upcoming tournaments</Text>
          </View>
        )}
      </View>

      <TouchableOpacity 
        style={styles.viewAllButton}
        onPress={() => router.push('/tournament/history')}
      >
        <Text style={styles.viewAllText}>View Tournament History</Text>
        <ChevronRight color={COLORS.primary} size={20} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginBottom: 24,
  },
  createButtonText: {
    fontFamily: 'Poppins-Medium',
    color: COLORS.white,
    fontSize: 16,
    marginLeft: 8,
  },
  tournamentSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: COLORS.white,
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: COLORS.gray,
    marginTop: 12,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  viewAllText: {
    fontFamily: 'Poppins-Medium',
    color: COLORS.primary,
    fontSize: 16,
    marginRight: 8,
  },
});