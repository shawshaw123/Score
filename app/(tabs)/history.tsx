import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { COLORS } from '@/constants/Colors';
import RecentMatchCard from '@/components/RecentMatchCard';
import TournamentCard from '@/components/TournamentCard';
import { useRouter } from 'expo-router';
import { useStorage } from '@/contexts/StorageContext';
import { getMatchHistory, getTournamentHistory } from '@/utils/storage';

interface Match {
  id: string;
  sport: string;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  date: string;
}

interface Tournament {
  id: string;
  name: string;
  sport: string;
  teams: number;
  status: 'ongoing' | 'upcoming' | 'completed';
  startDate: string;
  endDate: string;
}

export default function HistoryScreen() {
  const router = useRouter();
  const storage = useStorage();
  const [matches, setMatches] = useState<Match[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [activeTab, setActiveTab] = useState<'matches' | 'tournaments'>('matches');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const [matchHistory, tournamentHistory] = await Promise.all([
        getMatchHistory(storage),
        getTournamentHistory(storage)
      ]);
      
      setMatches(matchHistory.map(match => ({
        id: match.id,
        sport: match.sport,
        teamA: match.team1,
        teamB: match.team2,
        scoreA: match.score1,
        scoreB: match.score2,
        date: match.date
      })));
      
      setTournaments(tournamentHistory || []);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTournamentPress = (id: string) => {
    router.push(`/tournament/${id}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'matches' && styles.activeTab]}
          onPress={() => setActiveTab('matches')}
        >
          <Text style={[styles.tabText, activeTab === 'matches' && styles.activeTabText]}>Matches</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'tournaments' && styles.activeTab]}
          onPress={() => setActiveTab('tournaments')}
        >
          <Text style={[styles.tabText, activeTab === 'tournaments' && styles.activeTabText]}>Tournaments</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'matches' ? (
        <>
          <Text style={styles.resultsText}>
            {matches.length} {matches.length === 1 ? 'match' : 'matches'} found
          </Text>
          <FlatList
            data={matches}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <RecentMatchCard 
                match={item} 
                onPress={undefined}  
              />
            )}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No matches found</Text>
              </View>
            }
          />
        </>
      ) : (
        <>
          <Text style={styles.resultsText}>
            {tournaments.length} {tournaments.length === 1 ? 'tournament' : 'tournaments'} found
          </Text>
          <FlatList
            data={tournaments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TournamentCard 
                tournament={item}
                onPress={() => handleTournamentPress(item.id)}
              />
            )}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No tournaments found</Text>
              </View>
            }
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.gray,
  },
  activeTabText: {
    color: COLORS.white,
  },
  resultsText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 16,
  },
  list: {
    paddingBottom: 16,
  },
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
    color: COLORS.white,
    marginBottom: 8,
  }
});