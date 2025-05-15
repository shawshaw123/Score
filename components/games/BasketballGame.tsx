import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { COLORS } from '@/constants/Colors';
import { useGameTimer } from '@/hooks/useGameTimer';
import { Castle as Whistle, Pause, Play, Plus, Minus, RotateCcw, CircleCheck as CheckCircle2 } from 'lucide-react-native';
import FoulCounter from '@/components/games/FoulCounter';
import { useRouter } from 'expo-router';
import { storeMatchResult, Sport } from '@/utils/storage';
import { useStorage } from '@/contexts/StorageContext';

interface BasketballGameProps {
  settings: {
    quarterLength: number;
    quarters: number;
    team1Name: string;
    team2Name: string;
    shotClock: number;
    enableShotClock: boolean;
    timeoutsPerTeam?: number;
  };
  matchId?: string;
}

export default function BasketballGame({ settings, matchId }: BasketballGameProps) {
  const router = useRouter();
  const storage = useStorage();
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [currentQuarter, setCurrentQuarter] = useState(1);
  const [fouls1, setFouls1] = useState(0);
  const [fouls2, setFouls2] = useState(0);
  const [shotClockTime, setShotClockTime] = useState(settings.shotClock);
  const [showEndGameConfirm, setShowEndGameConfirm] = useState(false);
  const [eventLog, setEventLog] = useState<any[]>([]);
  const [timeouts1, setTimeouts1] = useState(settings.timeoutsPerTeam || 5);
  const [timeouts2, setTimeouts2] = useState(settings.timeoutsPerTeam || 5);
  
  const { 
    time, 
    isRunning, 
    startTimer, 
    stopTimer, 
    resetTimer,
    formatTime
  } = useGameTimer(settings.quarterLength * 60);
  
  const shotClockTimerRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (isRunning && settings.enableShotClock) {
      shotClockTimerRef.current = setInterval(() => {
        setShotClockTime(prev => {
          if (prev <= 1) {
            // Buzzer sound could be played here
            console.log("Shot clock violation!");
            if (shotClockTimerRef.current) clearInterval(shotClockTimerRef.current);
            setTimeout(() => setShotClockTime(settings.shotClock), 1000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (shotClockTimerRef.current) {
      clearInterval(shotClockTimerRef.current);
    }
    
    return () => {
      if (shotClockTimerRef.current) {
        clearInterval(shotClockTimerRef.current);
      }
    };
  }, [isRunning, settings.enableShotClock]);
  
  const resetShotClock = () => {
    setShotClockTime(settings.shotClock);
  };
  
  const addPoints = (team: 1 | 2, points: number) => {
    if (team === 1) {
      setScore1(prev => prev + points);
    } else {
      setScore2(prev => prev + points);
    }
    
    // Log the event
    setEventLog(prev => [
      ...prev,
      {
        type: 'score',
        team,
        points,
        time: formatTime(time),
        quarter: currentQuarter,
      }
    ]);
  };
  
  const addFoul = (team: 1 | 2) => {
    if (team === 1) {
      setFouls1(prev => {
        const newFouls = prev + 1;
        // Reset fouls if they reach 6
        if (newFouls >= 7) {
          return 0;
        }
        return newFouls;
      });
    } else {
      setFouls2(prev => {
        const newFouls = prev + 1;
        // Reset fouls if they reach 6
        if (newFouls >= 7) {
          return 0;
        }
        return newFouls;
      });
    }
    
    // Log the event
    setEventLog(prev => [
      ...prev,
      {
        type: 'foul',
        team,
        time: formatTime(time),
        quarter: currentQuarter,
      }
    ]);
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
  
  const logEvent = (team: 1 | 2, type: string) => {
    setEventLog(prev => [
      ...prev,
      {
        type,
        team,
        time: formatTime(time),
        quarter: currentQuarter,
        timestamp: new Date().toISOString(),
      }
    ]);
  };
  
  const handleNextQuarter = () => {
    if (currentQuarter < settings.quarters) {
      setCurrentQuarter(prev => prev + 1);
      resetTimer();
      resetShotClock();
      stopTimer();
      
      // Log the event
      setEventLog(prev => [
        ...prev,
        {
          type: 'quarter_end',
          quarter: currentQuarter,
          score1,
          score2,
        }
      ]);
    } else {
      // Game over
      handleEndGame();
    }
  };
  
  const handleEndGame = () => {
    setShowEndGameConfirm(true);
  };
  
  const confirmEndGame = async () => {
    // Stop timers
    stopTimer();
    if (shotClockTimerRef.current) {
      clearInterval(shotClockTimerRef.current);
    }
    
    // Log the final result
    const finalResult = {
      id: matchId || Date.now().toString(),
      sport: 'basketball' as Sport,
      date: new Date().toISOString(),
      team1: settings.team1Name,
      team2: settings.team2Name,
      score1,
      score2,
      quarters: currentQuarter,
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
        <View style={styles.quarterIndicator}>
          <Text style={styles.quarterText}>Quarter {currentQuarter}</Text>
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
            onPress={handleNextQuarter}
          >
            <CheckCircle2 color={COLORS.white} size={24} />
          </TouchableOpacity>
        </View>
        
        {settings.enableShotClock && (
          <View style={styles.shotClockContainer}>
            <Text style={styles.shotClockLabel}>Shot Clock</Text>
            <Text style={styles.shotClockTime}>{shotClockTime}</Text>
            <TouchableOpacity 
              style={styles.resetShotClockButton}
              onPress={resetShotClock}
            >
              <RotateCcw color={COLORS.white} size={20} />
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      <View style={styles.scoreboardSection}>
        <View style={styles.teamSection}>
          <Text style={styles.teamName}>{settings.team1Name}</Text>
          <Text style={styles.score}>{score1}</Text>
          
          <View style={styles.pointButtons}>
            <TouchableOpacity 
              style={[styles.pointButton, styles.pointButton1]}
              onPress={() => addPoints(1, 1)}
            >
              <Text style={styles.pointButtonText}>+1</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.pointButton, styles.pointButton2]}
              onPress={() => addPoints(1, 2)}
            >
              <Text style={styles.pointButtonText}>+2</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.pointButton, styles.pointButton3]}
              onPress={() => addPoints(1, 3)}
            >
              <Text style={styles.pointButtonText}>+3</Text>
            </TouchableOpacity>
          </View>
          
          <FoulCounter 
            count={fouls1} 
            onAddFoul={() => addFoul(1)} 
            label="Team Fouls" 
          />

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
          
          <View style={styles.pointButtons}>
            <TouchableOpacity 
              style={[styles.pointButton, styles.pointButton1]}
              onPress={() => addPoints(2, 1)}
            >
              <Text style={styles.pointButtonText}>+1</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.pointButton, styles.pointButton2]}
              onPress={() => addPoints(2, 2)}
            >
              <Text style={styles.pointButtonText}>+2</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.pointButton, styles.pointButton3]}
              onPress={() => addPoints(2, 3)}
            >
              <Text style={styles.pointButtonText}>+3</Text>
            </TouchableOpacity>
          </View>
          
          <FoulCounter 
            count={fouls2} 
            onAddFoul={() => addFoul(2)} 
            label="Team Fouls" 
          />

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
      
      <TouchableOpacity 
        style={styles.endGameButton}
        onPress={handleEndGame}
      >
        <Whistle color={COLORS.white} size={20} />
        <Text style={styles.endGameButtonText}>End Game</Text>
      </TouchableOpacity>
      
      {showEndGameConfirm && (
        <View style={styles.overlay}>
          <View style={styles.confirmDialog}>
            <Text style={styles.confirmTitle}>End Game?</Text>
            <Text style={styles.confirmText}>
              Are you sure you want to end the game? This will save the current result.
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
                <Text style={styles.endButtonText}>End Game</Text>
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
  quarterIndicator: {
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  quarterText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: COLORS.primary,
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
    backgroundColor: COLORS.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  shotClockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackgroundLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  shotClockLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.gray,
    marginRight: 8,
  },
  shotClockTime: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: COLORS.orange,
    marginRight: 8,
  },
  resetShotClockButton: {
    padding: 4,
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
    marginBottom: 24,
  },
  pointButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  pointButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  pointButton1: {
    backgroundColor: COLORS.blue,
  },
  pointButton2: {
    backgroundColor: COLORS.green,
  },
  pointButton3: {
    backgroundColor: COLORS.orange,
  },
  pointButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: COLORS.white,
  },
  divider: {
    width: 1,
    backgroundColor: COLORS.borderColor,
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