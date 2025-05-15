import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import SportCard from '@/components/SportCard';
import RecentMatchCard from '@/components/RecentMatchCard';
import { Basketball, Volleyball, Football, SepakTakraw, Badminton, Boxing, TableTennis } from '@/components/SportIcons';
import WelcomeModal from '@/components/modals/WelcomeModal';

interface Match {
  id: string;
  sport: string;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  date: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const { showWelcomeModal, setShowWelcomeModal } = useAuth();
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);

  const handleStartGame = (sport: string) => {
    router.push(`/game/${sport}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.sectionTitle}>Select Sport</Text>
      
      <View style={styles.sportsGrid}>
        <SportCard 
          title="Basketball"
          icon={<Basketball width={48} height={48} color={COLORS.orange} />}
          color={COLORS.orangeLight}
          onPress={() => handleStartGame('basketball')}
        />
        <SportCard 
          title="Volleyball"
          icon={<Volleyball width={48} height={48} color={COLORS.blue} />}
          color={COLORS.blueLight}
          onPress={() => handleStartGame('volleyball')}
        />
        <SportCard 
          title="Football"
          icon={<Football width={48} height={48} color={COLORS.green} />}
          color={COLORS.greenLight}
          onPress={() => handleStartGame('football')}
        />
        <SportCard 
          title="Sepak Takraw"
          icon={<SepakTakraw width={48} height={48} color={COLORS.purple} />}
          color={COLORS.purpleLight}
          onPress={() => handleStartGame('sepak-takraw')}
        />
        <SportCard 
          title="Badminton"
          icon={<Badminton width={48} height={48} color={COLORS.yellow} />}
          color={COLORS.yellowLight}
          onPress={() => handleStartGame('badminton')}
        />
        <SportCard 
          title="Boxing"
          icon={<Boxing width={48} height={48} color={COLORS.red} />}
          color={COLORS.redLight}
          onPress={() => handleStartGame('boxing')}
        />
        <SportCard 
          title="Table Tennis"
          icon={<TableTennis width={48} height={48} color={COLORS.cyan} />}
          color={COLORS.cyanLight}
          onPress={() => handleStartGame('table-tennis')}
        />
      </View>
      
      <View style={styles.recentContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Matches</Text>
          <TouchableOpacity onPress={() => router.push('/history')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {recentMatches.map(match => (
          <RecentMatchCard key={match.id} match={match} />
        ))}
        
        {recentMatches.length === 0 && (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No recent matches</Text>
            <Text style={styles.emptyStateSubtext}>
              Start a new game to see your match history here
            </Text>
          </View>
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.tournamentButton}
        onPress={() => router.push('/tournament')}
      >
        <Text style={styles.tournamentButtonText}>Setup New Tournament</Text>
      </TouchableOpacity>

      <WelcomeModal 
        visible={showWelcomeModal} 
        onClose={() => setShowWelcomeModal(false)} 
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: COLORS.white,
    marginBottom: 16,
  },
  sportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  recentContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.primary,
  },
  emptyStateContainer: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: COLORS.white,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
  },
  tournamentButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  tournamentButtonText: {
    fontFamily: 'Poppins-Medium',
    color: COLORS.white,
    fontSize: 16,
  },
});