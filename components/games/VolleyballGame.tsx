import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { COLORS } from '@/constants/Colors';
import { Castle as Whistle, Plus, Minus, RotateCcw } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { storeMatchResult, Sport } from '@/utils/storage';
import { useStorage } from '@/contexts/StorageContext';

interface VolleyballGameProps {
  settings: {
    setsToWin: number;
    pointsPerSet: number;
    team1Name: string;
    team2Name: string;
    timeoutsPerSet?: number;
  };
  matchId?: string;
}

export default function VolleyballGame({ settings, matchId }: VolleyballGameProps) {
  const router = useRouter();
  const storage = useStorage();
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [sets1, setSets1] = useState(0);
  const [sets2, setSets2] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [showEndGameConfirm, setShowEndGameConfirm] = useState(false);
  const [setHistory, setSetHistory] = useState<any[]>([]);
  const [eventLog, setEventLog] = useState<any[]>([]);
  const [serving, setServing] = useState<1 | 2>(1);
  const [timeouts1, setTimeouts1] = useState(settings.timeoutsPerSet || 2);
  const [timeouts2, setTimeouts2] = useState(settings.timeoutsPerSet || 2);

  useEffect(() => {
    setTimeouts1(settings.timeoutsPerSet || 2);
    setTimeouts2(settings.timeoutsPerSet || 2);
  }, [currentSet]);
  
  useEffect(() => {
    const checkSetWin = () => {
      const isWinByTwo = Math.abs(score1 - score2) >= 2;
      const hasReachedTarget = score1 >= settings.pointsPerSet || score2 >= settings.pointsPerSet;
      
      if (hasReachedTarget && isWinByTwo) {
        const winner = score1 > score2 ? 1 : 2;
        
        const setResult = {
          set: currentSet,
          score1,
          score2,
          winner
        };
        
        setSetHistory(prev => [...prev, setResult]);
        
        if (winner === 1) {
          setSets1(prev => prev + 1);
        } else {
          setSets2(prev => prev + 1);
        }
        
        setEventLog(prev => [
          ...prev,
          {
            type: 'set_end',
            ...setResult,
            timestamp: new Date().toISOString(),
          }
        ]);
        
        const newSets1 = winner === 1 ? sets1 + 1 : sets1;
        const newSets2 = winner === 2 ? sets2 + 1 : sets2;
        
        if (newSets1 >= settings.setsToWin || newSets2 >= settings.setsToWin) {
          handleEndGame();
        } else {
          setCurrentSet(prev => prev + 1);
          setScore1(0);
          setScore2(0);
          setServing(currentSet % 2 === 0 ? 1 : 2);
        }
      }
    };
    
    checkSetWin();
  }, [score1, score2]);

  const useTimeout = (team: 1 | 2) => {
    if (team === 1 && timeouts1 > 0) {
      setTimeouts1(prev => prev - 1);
      setEventLog(prev => [
        ...prev,
        {
          type: 'timeout',
          team,
          set: currentSet,
          timestamp: new Date().toISOString(),
        }
      ]);
    } else if (team === 2 && timeouts2 > 0) {
      setTimeouts2(prev => prev - 1);
      setEventLog(prev => [
        ...prev,
        {
          type: 'timeout',
          team,
          set: currentSet,
          timestamp: new Date().toISOString(),
        }
      ]);
    }
  };
  
  const addPoint = (team: 1 | 2) => {
    if (team === 1) {
      setScore1(prev => prev + 1);
      setServing(1);
    } else {
      setScore2(prev => prev + 1);
      setServing(2);
    }
    
    setEventLog(prev => [
      ...prev,
      {
        type: 'point',
        team,
        set: currentSet,
        score1: team === 1 ? score1 + 1 : score1,
        score2: team === 2 ? score2 + 1 : score2,
        timestamp: new Date().toISOString(),
      }
    ]);
  };
  
  const undoPoint = (team: 1 | 2) => {
    if (team === 1 && score1 > 0) {
      setScore1(prev => prev - 1);
    } else if (team === 2 && score2 > 0) {
      setScore2(prev => prev - 1);
    }
    
    setEventLog(prev => [
      ...prev,
      {
        type: 'undo_point',
        team,
        set: currentSet,
        score1: team === 1 ? score1 - 1 : score1,
        score2: team === 2 ? score2 - 1 : score2,
        timestamp: new Date().toISOString(),
      }
    ]);
  };
  
  const handleEndGame = () => {
    setShowEndGameConfirm(true);
  };
  
  const confirmEndGame = async () => {
    const finalResult = {
      id: matchId || Date.now().toString(),
      sport: 'volleyball' as Sport,
      date: new Date().toISOString(),
      team1: settings.team1Name,
      team2: settings.team2Name,
      score1,
      score2,
      sets1,
      sets2,
      currentSet,
      setHistory,
      events: eventLog,
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
      <View style={styles.setIndicator}>
        <Text style={styles.setIndicatorText}>
          Set {currentSet} • Best of {settings.setsToWin * 2 - 1}
        </Text>
      </View>
      
      <View style={styles.setsRow}>
        <View style={styles.setScoreContainer}>
          <Text style={styles.setScoreLabel}>{settings.team1Name}</Text>
          <Text style={styles.setScore}>{sets1}</Text>
        </View>
        
        <Text style={styles.setsSeparator}>Sets</Text>
        
        <View style={styles.setScoreContainer}>
          <Text style={styles.setScoreLabel}>{settings.team2Name}</Text>
          <Text style={styles.setScore}>{sets2}</Text>
        </View>
      </View>
      
      <View style={styles.scoreboardSection}>
        <View style={[styles.teamSection, serving === 1 && styles.servingTeam]}>
          {serving === 1 && (
            <View style={styles.servingIndicator}>
              <Text style={styles.servingIndicatorText}>Serving</Text>
            </View>
          )}
          
          <Text style={styles.teamName}>{settings.team1Name}</Text>
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
        
        <View style={[styles.teamSection, serving === 2 && styles.servingTeam]}>
          {serving === 2 && (
            <View style={styles.servingIndicator}>
              <Text style={styles.servingIndicatorText}>Serving</Text>
            </View>
          )}
          
          <Text style={styles.teamName}>{settings.team2Name}</Text>
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
      
      {setHistory.length > 0 && (
        <View style={styles.setHistoryContainer}>
          <Text style={styles.setHistoryTitle}>Set History</Text>
          {setHistory.map((set, index) => (
            <View key={index} style={styles.setHistoryItem}>
              <Text style={styles.setHistoryText}>
                Set {set.set}: {settings.team1Name} {set.score1} - {set.score2} {settings.team2Name}
              </Text>
            </View>
          ))}
        </View>
      )}
      
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
  setIndicator: {
    backgroundColor: COLORS.cardBackground,
    padding: 16,
    alignItems: 'center',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  setIndicatorText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: COLORS.white,
  },
  setsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackgroundLight,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
  },
  setScoreContainer: {
    alignItems: 'center',
  },
  setScoreLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 4,
  },
  setScore: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: COLORS.blue,
  },
  setsSeparator: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: COLORS.white,
  },
  scoreboardSection: {
    flexDirection: 'row',
    flex: 1,
    marginTop: 16,
  },
  teamSection: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },
  servingTeam: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 12,
    margin: 4,
  },
  servingIndicator: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    position: 'absolute',
    top: 12,
  },
  servingIndicatorText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: COLORS.white,
  },
  teamName: {
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
    backgroundColor: COLORS.blue,
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
    color: COLORS.white,
    marginLeft: 8,
  },
  disabledText: {
    color: COLORS.gray,
  },
  divider: {
    width: 1,
    backgroundColor: COLORS.borderColor,
  },
  setHistoryContainer: {
    backgroundColor: COLORS.cardBackground,
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  setHistoryTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: COLORS.white,
    marginBottom: 12,
  },
  setHistoryItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },
  setHistoryText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.gray,
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
});