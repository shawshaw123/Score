import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '@/constants/Colors';
import { Basketball, Volleyball, Football } from './SportIcons';
import { formatDate } from '@/utils/dateUtils';

interface Match {
  id: string;
  sport: string;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  date: string;
}

interface RecentMatchCardProps {
  match: Match;
  onPress?: () => void;
}

export default function RecentMatchCard({ match, onPress }: RecentMatchCardProps) {
  const getSportIcon = () => {
    switch (match.sport) {
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
  
  const getResultColor = () => {
    if (match.scoreA > match.scoreB) {
      return styles.winScore;
    } else if (match.scoreA < match.scoreB) {
      return styles.loseScore;
    }
    return styles.tieScore;
  };
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.sportBadge}>
        {getSportIcon()}
      </View>
      
      <View style={styles.content}>
        <View style={styles.teams}>
          <Text style={styles.teamName}>{match.teamA}</Text>
          <Text style={styles.versus}>vs</Text>
          <Text style={styles.teamName}>{match.teamB}</Text>
        </View>
        
        <View style={styles.scoreContainer}>
          <Text style={[styles.score, getResultColor()]}>{match.scoreA}</Text>
          <Text style={styles.scoreSeparator}>-</Text>
          <Text style={[styles.score, match.scoreB > match.scoreA ? styles.winScore : match.scoreB < match.scoreA ? styles.loseScore : styles.tieScore]}>
            {match.scoreB}
          </Text>
        </View>
      </View>
      
      <Text style={styles.date}>{formatDate(new Date(match.date))}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sportBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.cardBackgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  teams: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  teamName: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.white,
  },
  versus: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: COLORS.gray,
    marginHorizontal: 8,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  score: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
  winScore: {
    color: COLORS.green,
  },
  loseScore: {
    color: COLORS.error,
  },
  tieScore: {
    color: COLORS.orange,
  },
  scoreSeparator: {
    marginHorizontal: 8,
    color: COLORS.gray,
    fontFamily: 'Poppins-Regular',
  },
  date: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: COLORS.gray,
  },
});