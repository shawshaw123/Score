import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { COLORS } from '@/constants/Colors';
import { Castle as Whistle, Plus, Minus, RotateCcw, ArrowLeftRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { storeMatchResult, MatchResult, Sport } from '@/utils/storage';
import { useStorage } from '@/contexts/StorageContext';

interface TableTennisGameProps {
  settings: {
    player1Name: string;
    player2Name: string;
    pointsToWin: number;
    bestOf: number;
    timeoutsPerGame?: number;
  };
  matchId?: string;
}

export default function TableTennisGame({ settings, matchId }: TableTennisGameProps) {
  const router = useRouter();
  const storage = useStorage();
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [games1, setGames1] = useState(0);
  const [games2, setGames2] = useState(0);
  const [currentGame, setCurrentGame] = useState(1);
  const [showEndGameConfirm, setShowEndGameConfirm] = useState(false);
  const [gameHistory, setGameHistory] = useState<any[]>([]);
  const [eventLog, setEventLog] = useState<any[]>([]);
  const [serving, setServing] = useState<1 | 2>(1);
  const [servesLeft, setServesLeft] = useState(2);
  const [timeouts1, setTimeouts1] = useState(settings.timeoutsPerGame || 1);
  const [timeouts2, setTimeouts2] = useState(settings.timeoutsPerGame || 1);
  const [shouldSwitchSides, setShouldSwitchSides] = useState(false);

  useEffect(() => {
    setTimeouts1(settings.timeoutsPerGame || 1);
    setTimeouts2(settings.timeoutsPerGame || 1);
  }, [currentGame]);

  useEffect(() => {
    // Check for side switch at game end
    if (score1 === 0 && score2 === 0 && currentGame > 1) {
      setShouldSwitchSides(true);
    }
    
    // In final game, switch sides at 5 points
    if (games1 + games2 === settings.bestOf - 1 && (score1 === 5 || score2 === 5)) {
      setShouldSwitchSides(true);
    }
  }, [score1, score2, currentGame, games1, games2]);

  useEffect(() => {
    const checkGameWin = () => {
      const isWinByTwo = Math.abs(score1 - score2) >= 2;
      const hasReachedTarget = score1 >= settings.pointsToWin || score2 >= settings.pointsToWin;
      
      if (hasReachedTarget && isWinByTwo) {
        const winner = score1 > score2 ? 1 : 2;
        
        const gameResult = {
          game: currentGame,
          score1,
          score2,
          winner
        };
        
        setGameHistory(prev => [...prev, gameResult]);
        
        if (winner === 1) {
          setGames1(prev => prev + 1);
        } else {
          setGames2(prev => prev + 1);
        }
        
        setEventLog(prev => [
          ...prev,
          {
            type: 'game_end',
            ...gameResult,
            timestamp: new Date().toISOString(),
          }
        ]);
        
        const newGames1 = winner === 1 ? games1 + 1 : games1;
        const newGames2 = winner === 2 ? games2 + 1 : games2;
        
        if (newGames1 >= Math.ceil(settings.bestOf / 2) || newGames2 >= Math.ceil(settings.bestOf / 2)) {
          handleEndGame();
        } else {
          setCurrentGame(prev => prev + 1);
          setScore1(0);
          setScore2(0);
          setShouldSwitchSides(true);
          setServing(currentGame % 2 === 0 ? 1 : 2);
          setServesLeft(2);
        }
      }
    };
    
    checkGameWin();
  }, [score1, score2]);

  useEffect(() => {
    // Handle serve rotation
    if (servesLeft === 0) {
      setServing(prev => prev === 1 ? 2 : 1);
      setServesLeft(2);
      
      // At deuce (10-10), change serve every point
      if (score1 >= 10 && score2 >= 10) {
        setServesLeft(1);
      }
    }
  }, [servesLeft]);

  const addPoint = (player: 1 | 2) => {
    if (player === 1) {
      setScore1(prev => prev + 1);
    } else {
      setScore2(prev => prev + 1);
    }
    
    setServesLeft(prev => {
      // At deuce (10-10), change serve every point
      if (score1 >= 9 && score2 >= 9) {
        return 1;
      }
      return prev - 1;
    });
    
    setEventLog(prev => [
      ...prev,
      {
        type: 'point',
        player,
        game: currentGame,
        score1: player === 1 ? score1 + 1 : score1,
        score2: player === 2 ? score2 + 1 : score2,
        timestamp: new Date().toISOString(),
      }
    ]);
  };

  const undoPoint = (player: 1 | 2) => {
    if (player === 1 && score1 > 0) {
      setScore1(prev => prev - 1);
      setServesLeft(prev => prev + 1);
    } else if (player === 2 && score2 > 0) {
      setScore2(prev => prev - 1);
      setServesLeft(prev => prev + 1);
    }
  };

  const useTimeout = (player: 1 | 2) => {
    if (player === 1 && timeouts1 > 0) {
      setTimeouts1(prev => prev - 1);
      logEvent(player, 'timeout');
    } else if (player === 2 && timeouts2 > 0) {
      setTimeouts2(prev => prev - 1);
      logEvent(player, 'timeout');
    }
  };

  const switchSides = () => {
    setShouldSwitchSides(false);
    logEvent(0, 'switch_sides');
  };

  const logEvent = (player: number, type: string) => {
    setEventLog(prev => [
      ...prev,
      {
        type,
        player,
        game: currentGame,
        timestamp: new Date().toISOString(),
      }
    ]);
  };

  const handleEndGame = () => {
    setShowEndGameConfirm(true);
  };

  const confirmEndGame = async () => {
    const finalResult: MatchResult = {
      id: matchId || Date.now().toString(),
      sport: 'table-tennis' as Sport,
      date: new Date().toISOString(),
      team1: settings.player1Name,
      team2: settings.player2Name,
      score1,
      score2,
      games1,
      games2,
      gameHistory,
      events: eventLog,
      format: `Best of ${settings.bestOf}`,
    };
    
    try {
      await storeMatchResult(storage, finalResult);
      Alert.alert(
        'Game Completed',
        'Game has been saved to history',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)/history'),
          },
        ]
      );
    } catch (error) {
      console.error('Failed to save game result', error);
      Alert.alert('Error', 'Failed to save game result');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.gameIndicator}>
        <Text style={styles.gameIndicatorText}>
          Game {currentGame} • Best of {settings.bestOf}
        </Text>
      </View>
      
      <View style={styles.gamesRow}>
        <View style={styles.gameScoreContainer}>
          <Text style={styles.gameScoreLabel}>{settings.player1Name}</Text>
          <Text style={styles.gameScore}>{games1}</Text>
        </View>
        
        <Text style={styles.gamesSeparator}>Games</Text>
        
        <View style={styles.gameScoreContainer}>
          <Text style={styles.gameScoreLabel}>{settings.player2Name}</Text>
          <Text style={styles.gameScore}>{games2}</Text>
        </View>
      </View>
      
      <View style={styles.scoreboardSection}>
        <View style={[styles.playerSection, serving === 1 && styles.servingPlayer]}>
          {serving === 1 && (
            <View style={styles.servingIndicator}>
              <Text style={styles.servingIndicatorText}>
                Serving ({servesLeft} {servesLeft === 1 ? 'serve' : 'serves'} left)
              </Text>
            </View>
          )}
          
          <Text style={styles.playerName}>{settings.player1Name}</Text>
          <Text style={styles.score}>{score1}</Text>
          
          <View style={styles.pointControls}>
            <TouchableOpacity 
              style={styles.pointButton}
              onPress={() => addPoint(1)}
            >
              <Plus color={COLORS.white} size={24} />
              <Text style={styles.pointButtonText}>Add Point</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.pointButton, styles.undoButton]}
              onPress={() => undoPoint(1)}
              disabled={score1 === 0}
            >
              <Minus color={score1 === 0 ? COLORS.gray : COLORS.white} size={24} />
              <Text style={[styles.pointButtonText, score1 === 0 && styles.disabledText]}>
                Undo Point
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.timeoutSection}>
            <Text style={styles.timeoutLabel}>Timeouts: {timeouts1}</Text>
            <TouchableOpacity 
              style={[styles.timeoutButton, timeouts1 === 0 && styles.timeoutButtonDisabled]}
              onPress={() => useTimeout(1)}
              disabled={timeouts1 === 0}
            >
              <Text style={styles.timeoutButtonText}>Call Timeout</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={[styles.playerSection, serving === 2 && styles.servingPlayer]}>
          {serving === 2 && (
            <View style={styles.servingIndicator}>
              <Text style={styles.servingIndicatorText}>
                Serving ({servesLeft} {servesLeft === 1 ? 'serve' : 'serves'} left)
              </Text>
            </View>
          )}
          
          <Text style={styles.playerName}>{settings.player2Name}</Text>
          <Text style={styles.score}>{score2}</Text>
          
          <View style={styles.pointControls}>
            <TouchableOpacity 
              style={styles.pointButton}
              onPress={() => addPoint(2)}
            >
              <Plus color={COLORS.white} size={24} />
              <Text style={styles.pointButtonText}>Add Point</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.pointButton, styles.undoButton]}
              onPress={() => undoPoint(2)}
              disabled={score2 === 0}
            >
              <Minus color={score2 === 0 ? COLORS.gray : COLORS.white} size={24} />
              <Text style={[styles.pointButtonText, score2 === 0 && styles.disabledText]}>
                Undo Point
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.timeoutSection}>
            <Text style={styles.timeoutLabel}>Timeouts: {timeouts2}</Text>
            <TouchableOpacity 
              style={[styles.timeoutButton, timeouts2 === 0 && styles.timeoutButtonDisabled]}
              onPress={() => useTimeout(2)}
              disabled={timeouts2 === 0}
            >
              <Text style={styles.timeoutButtonText}>Call Timeout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {shouldSwitchSides && (
        <TouchableOpacity 
          style={styles.switchSidesButton}
          onPress={switchSides}
        >
          <ArrowLeftRight color={COLORS.white} size={20} />
          <Text style={styles.switchSidesText}>Switch Sides</Text>
        </TouchableOpacity>
      )}
      
      <View style={styles.eventLogContainer}>
        <Text style={styles.eventLogTitle}>Match Events</Text>
        <ScrollView style={styles.eventLog}>
          {eventLog.slice(-5).reverse().map((event, index) => (
            <View key={index} style={styles.eventItem}>
              <Text style={styles.eventTime}>
                {new Date(event.timestamp).toLocaleTimeString()}
              </Text>
              <View style={[
                styles.eventType,
                event.type === 'point' ? styles.pointEvent :
                event.type === 'game_end' ? styles.gameEndEvent :
                event.type === 'timeout' ? styles.timeoutEvent :
                styles.otherEvent
              ]}>
                <Text style={styles.eventTypeText}>
                  {event.type.toUpperCase().replace('_', ' ')}
                </Text>
              </View>
              <Text style={styles.eventPlayer}>
                {event.player === 0 ? 'BOTH' :
                 event.player === 1 ? settings.player1Name : settings.player2Name}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
      
      <TouchableOpacity 
        style={styles.endGameButton}
        onPress={handleEndGame}
      >
        <Whistle color={COLORS.white} size={20} />
        <Text style={styles.endGameButtonText}>End Match</Text>
      </TouchableOpacity>
      
      {showEndGameConfirm && (
        <View style={styles.overlay}>
          <View style={styles.confirmDialog}>
            <Text style={styles.confirmTitle}>End Match?</Text>
            <Text style={styles.confirmText}>
              Are you sure you want to end the match? This will save the current result.
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity 
                style={[styles.confirmButton, styles.cancelButton]}
                onPress={() => setShowEndGameConfirm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.confirmButton, styles.endButton]}
                onPress={confirmEndGame}
              >
                <Text style={styles.endButtonText}>End Match</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gameIndicator: {
    backgroundColor: COLORS.cardBackground,
    padding: 16,
    alignItems: 'center',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  gameIndicatorText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: COLORS.white,
  },
  gamesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackgroundLight,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
  },
  gameScoreContainer: {
    alignItems: 'center',
  },
  gameScoreLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 4,
  },
  gameScore: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: COLORS.cyan,
  },
  gamesSeparator: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: COLORS.white,
  },
  scoreboardSection: {
    flexDirection: 'row',
    flex: 1,
    marginTop: 16,
  },
  playerSection: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },
  servingPlayer: {
    backgroundColor: COLORS.cyanDark,
    borderRadius: 12,
    margin: 4,
  },
  servingIndicator: {
    backgroundColor: COLORS.cyan,
    paddingHorizontal: 12,
    paddingVertical:  4,
    borderRadius: 16,
    position: 'absolute',
    top: 12,
  },
  servingIndicatorText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: COLORS.black,
  },
  playerName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: COLORS.white,
    marginBottom: 8,
    marginTop: 32,
  },
  score: {
    fontFamily: 'Poppins-Bold',
    fontSize: 64,
    color: COLORS.white,
    marginBottom: 24,
  },
  pointControls: {
    width: '100%',
  },
  pointButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.cyan,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  undoButton: {
    backgroundColor: COLORS.cardBackgroundLight,
  },
  pointButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.black,
    marginLeft: 8,
  },
  disabledText: {
    color: COLORS.gray,
  },
  divider: {
    width: 1,
    backgroundColor: COLORS.borderColor,
  },
  switchSidesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cyanDark,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  switchSidesText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.white,
    marginLeft: 8,
  },
  eventLogContainer: {
    backgroundColor: COLORS.cardBackground,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    maxHeight: 200,
  },
  eventLogTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: COLORS.white,
    marginBottom: 12,
  },
  eventLog: {
    flex: 1,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },
  eventTime: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: COLORS.gray,
    width: 70,
  },
  eventType: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  pointEvent: {
    backgroundColor: COLORS.cyanDark,
  },
  gameEndEvent: {
    backgroundColor: COLORS.greenDark,
  },
  timeoutEvent: {
    backgroundColor: COLORS.blueDark,
  },
  otherEvent: {
    backgroundColor: COLORS.cardBackgroundLight,
  },
  eventTypeText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: COLORS.white,
  },
  eventPlayer: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.white,
    flex: 1,
  },
  timeoutSection: {
    alignItems: 'center',
    marginTop: 16,
  },
  timeoutLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 8,
  },
  timeoutButton: {
    backgroundColor: COLORS.blue,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  timeoutButtonDisabled: {
    backgroundColor: COLORS.cardBackgroundLight,
  },
  timeoutButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: COLORS.white,
  },
  endGameButton: {
    backgroundColor: COLORS.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  endGameButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: COLORS.white,
    marginLeft: 8,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  confirmDialog: {
    width: '80%',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 24,
  },
  confirmTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: COLORS.white,
    marginBottom: 12,
  },
  confirmText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: COLORS.gray,
    marginBottom: 24,
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  confirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 12,
  },
  cancelButton: {
    backgroundColor: COLORS.cardBackgroundLight,
  },
  cancelButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.white,
  },
  endButton: {
    backgroundColor: COLORS.error,
  },
  endButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.white,
  },
});