import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { COLORS } from '@/constants/Colors';
import { useGameTimer } from '@/hooks/useGameTimer';
import { Castle as Whistle, Pause, Play, Plus, Minus, RotateCcw, CircleCheck as CheckCircle2, Flag, Shield, Repeat } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { storeMatchResult, Storage } from '@/utils/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FootballGameProps {
  settings: {
    halfLength: number;
    team1Name: string;
    team2Name: string;
    timeoutsPerHalf?: number;
  };
  matchId?: string;
}

export default function FootballGame({ settings, matchId }: FootballGameProps) {
  const router = useRouter();
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [currentHalf, setCurrentHalf] = useState(1);
  const [possession, setPossession] = useState<1 | 2>(1);
  const [yellowCards1, setYellowCards1] = useState(0);
  const [yellowCards2, setYellowCards2] = useState(0);
  const [redCards1, setRedCards1] = useState(0);
  const [redCards2, setRedCards2] = useState(0);
  const [showEndGameConfirm, setShowEndGameConfirm] = useState(false);
  const [eventLog, setEventLog] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<1 | 2 | null>(null);
  const [timeouts1, setTimeouts1] = useState(settings.timeoutsPerHalf || 3);
  const [timeouts2, setTimeouts2] = useState(settings.timeoutsPerHalf || 3);
  
  const { 
    time, 
    isRunning, 
    startTimer, 
    stopTimer, 
    resetTimer,
    formatTime
  } = useGameTimer(settings.halfLength * 60);

  useEffect(() => {
    setTimeouts1(settings.timeoutsPerHalf || 3);
    setTimeouts2(settings.timeoutsPerHalf || 3);
  }, [currentHalf]);
  
  const addGoal = (team: 1 | 2) => {
    if (team === 1) {
      setScore1(prev => prev + 1);
    } else {
      setScore2(prev => prev + 1);
    }
    
    logEvent(team, 'goal');
  };
  
  const undoGoal = (team: 1 | 2) => {
    if (team === 1 && score1 > 0) {
      setScore1(prev => prev - 1);
      logEvent(team, 'undo_goal');
    } else if (team === 2 && score2 > 0) {
      setScore2(prev => prev - 1);
      logEvent(team, 'undo_goal');
    }
  };
  
  const addYellowCard = (team: 1 | 2) => {
    if (team === 1) {
      setYellowCards1(prev => prev + 1);
    } else {
      setYellowCards2(prev => prev + 1);
    }
    logEvent(team, 'yellow_card');
  };
  
  const addRedCard = (team: 1 | 2) => {
    if (team === 1) {
      setRedCards1(prev => prev + 1);
    } else {
      setRedCards2(prev => prev + 1);
    }
    logEvent(team, 'red_card');
  };
  
  const togglePossession = () => {
    setPossession(prev => prev === 1 ? 2 : 1);
    logEvent(possession === 1 ? 2 : 1, 'possession');
  };

  const useTimeout = (team: 1 | 2) => {
    if (team === 1 && timeouts1 > 0) {
      setTimeouts1(prev => prev - 1);
      logEvent(team, 'timeout');
    } else if (team === 2 && timeouts2 > 0) {
      setTimeouts2(prev => prev - 1);
      logEvent(team, 'timeout');
    }
  };
  
  const logEvent = (team: 1 | 2, eventType: string) => {
    const newEvent = {
      type: eventType,
      team,
      time: formatTime(time),
      half: currentHalf,
      timestamp: new Date().toISOString(),
    };
    
    setEventLog(prev => [...prev, newEvent]);
  };
  
  const handleNextHalf = () => {
    if (currentHalf === 1) {
      setCurrentHalf(2);
      resetTimer();
      stopTimer();
      
      setEventLog(prev => [
        ...prev,
        {
          type: 'half_time',
          score1,
          score2,
          timestamp: new Date().toISOString(),
        }
      ]);
    } else {
      handleEndGame();
    }
  };
  
  const handleEndGame = () => {
    setShowEndGameConfirm(true);
  };
  
  const confirmEndGame = async () => {
    const storage: Storage = AsyncStorage;
    stopTimer();
    
    const finalResult = {
      id: matchId || Date.now().toString(),
      sport: 'football' as const,
      date: new Date().toISOString(),
      team1: settings.team1Name,
      team2: settings.team2Name,
      score1,
      score2,
      yellowCards1,
      yellowCards2,
      redCards1,
      redCards2,
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
      <View style={styles.timerSection}>
        <View style={styles.halfIndicator}>
          <Text style={styles.halfText}>
            {currentHalf === 1 ? 'First Half' : 'Second Half'}
          </Text>
        </View>
        
        <Text style={styles.timer}>{formatTime(time)}</Text>
        
        <View style={styles.timerControls}>
          <TouchableOpacity 
            style={styles.timerButton}
            onPress={isRunning ? stopTimer : startTimer}
          >
            {isRunning ? (
              <Pause color={COLORS.white} size={24} />
            ) : (
              <Play color={COLORS.white} size={24} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.timerButton}
            onPress={resetTimer}
          >
            <RotateCcw color={COLORS.white} size={24} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.timerButton}
            onPress={handleNextHalf}
          >
            <CheckCircle2 color={COLORS.white} size={24} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[styles.possessionButton, possession === 1 ? styles.team1Button : styles.team2Button]}
          onPress={togglePossession}
        >
          <View style={styles.possessionTeam}>
            <Shield color={COLORS.white} size={16} />
            <Text style={styles.possessionTeamText}>
              {possession === 1 ? settings.team1Name : settings.team2Name}
            </Text>
          </View>
          <View style={styles.possessionIndicator}>
            <Repeat color={COLORS.white} size={14} />
            <Text style={styles.possessionText}>Possession</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      <View style={styles.scoreboardSection}>
        <View style={styles.teamSection}>
          <Text style={styles.teamName}>{settings.team1Name}</Text>
          <Text style={styles.score}>{score1}</Text>
          
          <View style={styles.goalButtons}>
            <TouchableOpacity 
              style={styles.goalButton}
              onPress={() => addGoal(1)}
            >
              <Text style={styles.goalButtonText}>Goal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.goalButton, styles.undoButton]}
              onPress={() => undoGoal(1)}
              disabled={score1 === 0}
            >
              <Text style={[styles.goalButtonText, score1 === 0 && styles.disabledText]}>
                Undo
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.cardSection}>
            <View style={styles.cardItem}>
              <View style={styles.yellowCard}>
                <Text style={styles.cardCount}>{yellowCards1}</Text>
              </View>
              <TouchableOpacity 
                style={styles.addCardButton}
                onPress={() => addYellowCard(1)}
              >
                <Plus color={COLORS.white} size={16} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.cardItem}>
              <View style={styles.redCard}>
                <Text style={styles.cardCount}>{redCards1}</Text>
              </View>
              <TouchableOpacity 
                style={styles.addCardButton}
                onPress={() => addRedCard(1)}
              >
                <Plus color={COLORS.white} size={16} />
              </TouchableOpacity>
            </View>
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
        
        <View style={styles.teamSection}>
          <Text style={styles.teamName}>{settings.team2Name}</Text>
          <Text style={styles.score}>{score2}</Text>
          
          <View style={styles.goalButtons}>
            <TouchableOpacity 
              style={styles.goalButton}
              onPress={() => addGoal(2)}
            >
              <Text style={styles.goalButtonText}>Goal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.goalButton, styles.undoButton]}
              onPress={() => undoGoal(2)}
              disabled={score2 === 0}
            >
              <Text style={[styles.goalButtonText, score2 === 0 && styles.disabledText]}>
                Undo
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.cardSection}>
            <View style={styles.cardItem}>
              <View style={styles.yellowCard}>
                <Text style={styles.cardCount}>{yellowCards2}</Text>
              </View>
              <TouchableOpacity 
                style={styles.addCardButton}
                onPress={() => addYellowCard(2)}
              >
                <Plus color={COLORS.white} size={16} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.cardItem}>
              <View style={styles.redCard}>
                <Text style={styles.cardCount}>{redCards2}</Text>
              </View>
              <TouchableOpacity 
                style={styles.addCardButton}
                onPress={() => addRedCard(2)}
              >
                <Plus color={COLORS.white} size={16} />
              </TouchableOpacity>
            </View>
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
      
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.endGameButton}
          onPress={handleEndGame}
        >
          <Whistle color={COLORS.white} size={20} />
          <Text style={styles.endGameButtonText}>End Match</Text>
        </TouchableOpacity>
      </View>
      
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
  timerSection: {
    backgroundColor: COLORS.cardBackground,
    padding: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  halfIndicator: {
    backgroundColor: COLORS.greenDark,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  halfText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: COLORS.green,
  },
  timer: {
    fontFamily: 'Poppins-Bold',
    fontSize: 48,
    color: COLORS.white,
    marginBottom: 16,
  },
  timerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  timerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.greenDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  possessionButton: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '80%',
  },
  team1Button: {
    backgroundColor: COLORS.primaryDark,
  },
  team2Button: {
    backgroundColor: COLORS.blueDark,
  },
  possessionTeam: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  possessionTeamText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.white,
    marginLeft: 8,
  },
  possessionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  possessionText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: COLORS.white,
    marginLeft: 4,
  },
  scoreboardSection: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  teamSection: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  teamName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: COLORS.white,
    marginBottom: 8,
  },
  score: {
    fontFamily: 'Poppins-Bold',
    fontSize: 64,
    color: COLORS.white,
    marginBottom: 12,
  },
  goalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  goalButton: {
    flex: 1,
    backgroundColor: COLORS.green,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  undoButton: {
    backgroundColor: COLORS.cardBackgroundLight,
  },
  goalButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.white,
  },
  disabledText: {
    color: COLORS.gray,
  },
  cardSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  cardItem: {
    alignItems: 'center',
  },
  yellowCard: {
    width: 20,
    height: 30,
    backgroundColor: COLORS.yellow,
    borderRadius: 2,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  redCard: {
    width: 20,
    height: 30,
    backgroundColor: COLORS.error,
    borderRadius: 2,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCount: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    color: COLORS.black,
  },
  addCardButton: {
    backgroundColor: COLORS.cardBackgroundLight,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: COLORS.borderColor,
  },
  bottomContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  endGameButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
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