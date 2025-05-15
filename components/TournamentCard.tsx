import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '@/constants/Colors';
import { ChevronRight } from 'lucide-react-native';
import { Basketball, Volleyball, Football } from './SportIcons';

interface Tournament {
  id: string;
  name: string;
  sport: string;
  teams: number;
  status: string;
  startDate: string;
  endDate: string;
}

interface TournamentCardProps {
  tournament: Tournament;
  onPress: () => void;
}

export default function TournamentCard({ tournament, onPress }: TournamentCardProps) {
  const getSportIcon = () => {
    switch (tournament.sport) {
      case 'basketball':
        return <Basketball width={24} height={24} color={COLORS.orange} />;
      case 'volleyball':
        return <Volleyball width={24} height={24} color={COLORS.blue} />;
      case 'football':
        return <Football width={24} height={24} color={COLORS.green} />;
      default:
        return null;
    }
  };
  
  const getStatusStyles = () => {
    switch (tournament.status) {
      case 'ongoing':
        return {
          container: styles.statusOngoing,
          text: styles.statusTextOngoing,
        };
      case 'upcoming':
        return {
          container: styles.statusUpcoming,
          text: styles.statusTextUpcoming,
        };
      case 'completed':
        return {
          container: styles.statusCompleted,
          text: styles.statusTextCompleted,
        };
      default:
        return {
          container: {},
          text: {},
        };
    }
  };
  
  const statusStyles = getStatusStyles();
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.sportBadge}>
          {getSportIcon()}
        </View>
        <View style={[styles.statusBadge, statusStyles.container]}>
          <Text style={[styles.statusText, statusStyles.text]}>
            {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
          </Text>
        </View>
      </View>
      
      <Text style={styles.title}>{tournament.name}</Text>
      
      <View style={styles.details}>
        <Text style={styles.detailText}>
          {tournament.teams} teams
        </Text>
        <Text style={styles.dateDot}>•</Text>
        <Text style={styles.detailText}>
          {tournament.startDate} - {tournament.endDate}
        </Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <ChevronRight color={COLORS.white} size={20} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sportBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.cardBackgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 50,
  },
  statusOngoing: {
    backgroundColor: COLORS.primaryDark,
  },
  statusUpcoming: {
    backgroundColor: COLORS.blueDark,
  },
  statusCompleted: {
    backgroundColor: COLORS.greenDark,
  },
  statusText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
  },
  statusTextOngoing: {
    color: COLORS.primary,
  },
  statusTextUpcoming: {
    color: COLORS.blue,
  },
  statusTextCompleted: {
    color: COLORS.green,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: COLORS.white,
    marginBottom: 8,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: COLORS.gray,
  },
  dateDot: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: COLORS.gray,
    marginHorizontal: 8,
  },
  buttonContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});