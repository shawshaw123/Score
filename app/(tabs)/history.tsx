import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { COLORS } from '@/constants/Colors';
import { Filter, Calendar, Download } from 'lucide-react-native';
import RecentMatchCard from '@/components/RecentMatchCard';
import { useRouter } from 'expo-router';

interface Match {
  id: string;
  sport: string;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  date: string;
}

export default function HistoryScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('all');
  
  const [matches, setMatches] = useState<Match[]>([]);

  const filteredMatches = activeFilter === 'all' 
    ? matches 
    : matches.filter(match => match.sport === activeFilter);

  const handleMatchPress = (id: string) => {
    router.push(`/match/${id}`);
  };

  const handleExport = () => {
    // Logic to export match history
    console.log('Exporting match history...');
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, activeFilter === 'all' && styles.activeFilterButton]}
          onPress={() => setActiveFilter('all')}
        >
          <Text style={[styles.filterText, activeFilter === 'all' && styles.activeFilterText]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, activeFilter === 'badminton' && styles.activeFilterButton]}
          onPress={() => setActiveFilter('badminton')}
        >
          <Text style={[styles.filterText, activeFilter === 'badminton' && styles.activeFilterText]}>Badminton</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, activeFilter === 'table-tennis' && styles.activeFilterButton]}
          onPress={() => setActiveFilter('table-tennis')}
        >
          <Text style={[styles.filterText, activeFilter === 'table-tennis' && styles.activeFilterText]}>Table Tennis</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, activeFilter === 'boxing' && styles.activeFilterButton]}
          onPress={() => setActiveFilter('boxing')}
        >
          <Text style={[styles.filterText, activeFilter === 'boxing' && styles.activeFilterText]}>Boxing</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, activeFilter === 'sepak-takraw' && styles.activeFilterButton]}
          onPress={() => setActiveFilter('sepak-takraw')}
        >
          <Text style={[styles.filterText, activeFilter === 'sepak-takraw' && styles.activeFilterText]}>Sepak Takraw</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton}>
          <Calendar size={18} color={COLORS.white} />
          <Text style={styles.actionButtonText}>Filter by Date</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleExport}
        >
          <Download size={18} color={COLORS.white} />
          <Text style={styles.actionButtonText}>Export</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.resultsText}>
        {filteredMatches.length} {filteredMatches.length === 1 ? 'match' : 'matches'} found
      </Text>

      <FlatList
        data={filteredMatches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RecentMatchCard 
            match={item} 
            onPress={() => handleMatchPress(item.id)} 
          />
        )}
        contentContainerStyle={styles.matchesList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No matches found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try changing your filter options
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 8,
    marginBottom: 16,
    padding: 4,
  },
  filterButton: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  activeFilterButton: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: COLORS.gray,
  },
  activeFilterText: {
    color: COLORS.white,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    padding: 10,
    borderRadius: 8,
    flex: 0.48,
    justifyContent: 'center',
  },
  actionButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.white,
    marginLeft: 8,
  },
  resultsText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 16,
  },
  matchesList: {
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
  },
  emptyStateSubtext: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
  },
});