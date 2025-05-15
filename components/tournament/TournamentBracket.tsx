import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '@/constants/Colors';
import { Play } from 'lucide-react-native';

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

interface TournamentBracketProps {
  rounds: Round[];
  onStartMatch: (matchId: string) => void;
}

export default function TournamentBracket({ rounds, onStartMatch }: TournamentBracketProps) {
  return (
    <ScrollView horizontal style={styles.container} contentContainerStyle={styles.contentContainer}>
      {rounds.map((round, roundIndex) => (
        <View key={roundIndex} style={styles.roundColumn}>
          <Text style={styles.roundTitle}>{round.name}</Text>
          
          {round.matches.map((match, matchIndex) => (
            <View key={matchIndex} style={styles.matchContainer}>
              <View style={[
                styles.matchCard,
                match.complete && styles.matchCompleted
              ]}>
                <View style={styles.teamRow}>
                  <Text style={[
                    styles.teamName,
                    match.winner === match.team1 && styles.winnerTeam
                  ]}>
                    {match.team1}
                  </Text>
                  <Text style={styles.score}>
                    {match.complete ? match.score1 : '-'}
                  </Text>
                </View>
                
                <View style={styles.teamRow}>
                  <Text style={[
                    styles.teamName,
                    match.winner === match.team2 && styles.winnerTeam
                  ]}>
                    {match.team2}
                  </Text>
                  <Text style={styles.score}>
                    {match.complete ? match.score2 : '-'}
                  </Text>
                </View>
                
                {!match.complete && match.team1 !== '?' && match.team2 !== '?' && (
                  <TouchableOpacity 
                    style={styles.startMatchButton}
                    onPress={() => onStartMatch(match.id)}
                  >
                    <Play color={COLORS.white} size={16} />
                    <Text style={styles.startMatchText}>Start Match</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {matchIndex < round.matches.length - 1 && (
                <View style={styles.connector}>
                  <View style={styles.connectorLine} />
                </View>
              )}
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 20,
  },
  roundColumn: {
    width: 220,
    marginHorizontal: 20,
  },
  roundTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: COLORS.white,
    marginBottom: 16,
    textAlign: 'center',
  },
  matchContainer: {
    marginBottom: 40,
  },
  matchCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.blue,
  },
  matchCompleted: {
    borderLeftColor: COLORS.green,
  },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  teamName: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.white,
    flex: 1,
  },
  winnerTeam: {
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.green,
  },
  score: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: COLORS.white,
    marginLeft: 8,
  },
  startMatchButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  startMatchText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: COLORS.white,
    marginLeft: 4,
  },
  connector: {
    alignItems: 'center',
    height: 40,
  },
  connectorLine: {
    width: 2,
    height: '100%',
    backgroundColor: COLORS.borderColor,
  },
});