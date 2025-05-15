import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '@/constants/Colors';
import { Tournament } from '@/utils/storage';

interface Props {
  tournament: Tournament;
}

export default function TournamentBracket({ tournament }: Props) {
  const generateBracket = () => {
    const teamCount = tournament.teams.length;
    const rounds = Math.ceil(Math.log2(teamCount));
    const bracket = [];
    
    // First round
    const firstRound = [];
    const byes = Math.pow(2, rounds) - teamCount;
    let matchIndex = 0;
    
    for (let i = 0; i < teamCount; i += 2) {
      if (i + 1 < teamCount) {
        firstRound.push({
          id: `match-${matchIndex}`,
          team1: tournament.teams[i],
          team2: tournament.teams[i + 1],
          winner: null,
        });
      } else {
        // Bye match
        firstRound.push({
          id: `match-${matchIndex}`,
          team1: tournament.teams[i],
          team2: 'BYE',
          winner: tournament.teams[i],
        });
      }
      matchIndex++;
    }
    
    bracket.push({
      name: 'First Round',
      matches: firstRound,
    });
    
    // Generate subsequent rounds
    let prevRound = firstRound;
    for (let round = 1; round < rounds; round++) {
      const roundMatches = [];
      const matchCount = Math.floor(prevRound.length / 2);
      
      for (let i = 0; i < matchCount; i++) {
        roundMatches.push({
          id: `match-${matchIndex}`,
          team1: 'TBD',
          team2: 'TBD',
          winner: null,
        });
        matchIndex++;
      }
      
      bracket.push({
        name: round === rounds - 1 ? 'Final' : 
              round === rounds - 2 ? 'Semi Finals' : 
              `Round ${round + 1}`,
        matches: roundMatches,
      });
      
      prevRound = roundMatches;
    }
    
    return bracket;
  };

  const rounds = generateBracket();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.bracketContainer}>
        {rounds.map((round, roundIndex) => (
          <View key={roundIndex} style={styles.round}>
            <Text style={styles.roundTitle}>{round.name}</Text>
            {round.matches.map((match, matchIndex) => (
              <View key={match.id} style={styles.matchContainer}>
                <View style={styles.match}>
                  <View style={[
                    styles.team, 
                    match.winner === match.team1 && styles.winnerTeam
                  ]}>
                    <Text style={[
                      styles.teamText,
                      match.winner === match.team1 && styles.winnerText
                    ]}>
                      {match.team1 || 'TBD'}
                    </Text>
                  </View>
                  <View style={[
                    styles.team,
                    match.winner === match.team2 && styles.winnerTeam
                  ]}>
                    <Text style={[
                      styles.teamText,
                      match.winner === match.team2 && styles.winnerText
                    ]}>
                      {match.team2 || 'TBD'}
                    </Text>
                  </View>
                </View>
                {roundIndex < rounds.length - 1 && (
                  <View style={styles.connector} />
                )}
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bracketContainer: {
    flexDirection: 'row',
    padding: 16,
  },
  round: {
    marginRight: 24,
    minWidth: 200,
  },
  roundTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: COLORS.white,
    marginBottom: 16,
    textAlign: 'center',
  },
  matchContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  match: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 8,
    width: '100%',
    overflow: 'hidden',
  },
  team: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },
  teamText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.white,
  },
  winnerTeam: {
    backgroundColor: COLORS.primary + '20',
  },
  winnerText: {
    color: COLORS.primary,
  },
  connector: {
    width: 2,
    height: 24,
    backgroundColor: COLORS.borderColor,
    position: 'absolute',
    right: -13,
    top: '50%',
  },
});