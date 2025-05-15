import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { COLORS } from '@/constants/Colors';
import { Castle as Whistle, Play, Pause, RotateCcw, CircleCheck as CheckCircle2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { storeMatchResult, MatchResult, Sport } from '@/utils/storage';
import { useStorage } from '@/contexts/StorageContext';
import { useGameTimer } from '@/hooks/useGameTimer';

interface BoxingGameProps {
  settings: {
    boxer1Name: string;
    boxer2Name: string;
    roundLength: number;
    totalRounds: number;
    breakLength: number;
  };
  matchId?: string;
}

interface RoundScore {
  boxer1: number;
  boxer2: number;
}

interface RoundEvent {
  type: 'knockdown' | 'warning' | 'point_deduction';
  boxer: 1 | 2;
  round: number;
  timestamp: string;
}

export default function BoxingGame({ settings, matchId }: BoxingGameProps) {
  const router = useRouter();
  const storage = useStorage();
  const [currentRound, setCurrentRound] = useState(1);
  const [isBreak, setIsBreak] = useState(false);
  const [roundScores, setRoundScores] = useState<RoundScore[]>([]);
  const [knockdowns1, setKnockdowns1] = useState(0);
  const [knockdowns2, setKnockdowns2] = useState(0);
  const [warnings1, setWarnings1] = useState(0);
  const [warnings2, setWarnings2] = useState(0);
  const [pointDeductions1, setPointDeductions1] = useState(0);
  const [pointDeductions2, setPointDeductions2] = useState(0);
  const [showEndMatchConfirm, setShowEndMatchConfirm] = useState(false);
  const [events, setEvents] = useState<RoundEvent[]>([]);
  
  const { 
    time, 
    isRunning, 
    startTimer, 
    stopTimer, 
    resetTimer,
    formatTime
  } = useGameTimer(isBreak ? settings.breakLength * 60 : settings.roundLength * 60);

  useEffect(() => {
    if (time === 0) {
      if (!isBreak) {
        // Round ended
        if (currentRound < settings.totalRounds) {
          setIsBreak(true);
          resetTimer();
        } else {
          handleEndMatch();
        }
      } else {
        // Break ended
        setIsBreak(false);
        setCurrentRound(prev => prev + 1);
        resetTimer();
      }
    }
  }, [time]);

  const addKnockdown = (boxer: 1 | 2) => {
    if (boxer === 1) {
      setKnockdowns1(prev => prev + 1);
    } else {
      setKnockdowns2(prev => prev + 1);
    }
    
    setEvents(prev => [
      ...prev,
      {
        type: 'knockdown',
        boxer,
        round: currentRound,
        timestamp: new Date().toISOString(),
      }
    ]);
  };

  const addWarning = (boxer: 1 | 2) => {
    if (boxer === 1) {
      setWarnings1(prev => prev + 1);
      if ((warnings1 + 1) % 3 === 0) {
        setPointDeductions1(prev => prev + 1);
      }
    } else {
      setWarnings2(prev => prev + 1);
      if ((warnings2 + 1) % 3 === 0) {
        setPointDeductions2(prev => prev + 1);
      }
    }
    
    setEvents(prev => [
      ...prev,
      {
        type: 'warning',
        boxer,
        round: currentRound,
        timestamp: new Date().toISOString(),
      }
    ]);
  };

  const updateRoundScore = (boxer: 1 | 2, score: number) => {
    setRoundScores(prev => {
      const newScores = [...prev];
      if (!newScores[currentRound - 1]) {
        newScores[currentRound - 1] = { boxer1: 10, boxer2: 10 };
      }
      if (boxer === 1) {
        newScores[currentRound - 1].boxer1 = score;
      } else {
        newScores[currentRound - 1].boxer2 = score;
      }
      return newScores;
    });
  };

  const calculateTotalScore = () => {
    return roundScores.reduce((total, round) => {
      return {
        boxer1: total.boxer1 + round.boxer1,
        boxer2: total.boxer2 + round.boxer2,
      };
    }, { boxer1: 0, boxer2: 0 });
  };

  const handleEndMatch = () => {
    setShowEndMatchConfirm(true);
  };

  const confirmEndMatch = async () => {
    stopTimer();
    
    const totalScore = calculateTotalScore();
    const finalResult: MatchResult = {
      id: matchId || Date.now().toString(),
      sport: 'boxing' as Sport,
      date: new Date().toISOString(),
      team1: settings.boxer1Name,
      team2: settings.boxer2Name,
      score1: totalScore.boxer1,
      score2: totalScore.boxer2,
      events,
      roundScores,
      totalScore,
      knockdowns1,
      knockdowns2,
      warnings1,
      warnings2,
      pointDeductions1,
      pointDeductions2,
      completedRounds: currentRound,
    };
    
    try {
      await storeMatchResult(storage, finalResult);
      Alert.alert(
        'Match Completed',
        'Match has been saved to history',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)/history'),
          },
        ]
      );
    } catch (error) {
      console.error('Failed to save match result', error);
      Alert.alert('Error', 'Failed to save match result');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.roundIndicator}>
          <Text style={styles.roundText}>
            {isBreak ? 'Break' : `Round ${currentRound}`} of {settings.totalRounds}
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
          
          {!isBreak && (
            <TouchableOpacity 
              style={styles.timerButton}
              onPress={() => {
                stopTimer();
                if (currentRound < settings.totalRounds) {
                  setIsBreak(true);
                  resetTimer();
                } else {
                  handleEndMatch();
                }
              }}
            >
              <CheckCircle2 color={COLORS.white} size={24} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.scoreboardSection}>
        <View style={styles.boxerSection}>
          <Text style={styles.boxerName}>{settings.boxer1Name}</Text>
          
          <View style={styles.scoreInputContainer}>
            <Text style={styles.scoreLabel}>Round Score</Text>
            <View style={styles.scoreButtons}>
              <TouchableOpacity 
                style={[styles.scoreButton, roundScores[currentRound - 1]?.boxer1 === 10 && styles.selectedScore]}
                onPress={() => updateRoundScore(1, 10)}
              >
                <Text style={styles.scoreButtonText}>10</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.scoreButton, roundScores[currentRound - 1]?.boxer1 === 9 && styles.selectedScore]}
                onPress={() => updateRoundScore(1, 9)}
              >
                <Text style={styles.scoreButtonText}>9</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.scoreButton, roundScores[currentRound - 1]?.boxer1 === 8 && styles.selectedScore]}
                onPress={() => updateRoundScore(1, 8)}
              >
                <Text style={styles.scoreButtonText}>8</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.eventSection}>
            <Text style={styles.eventLabel}>Knockdowns: {knockdowns1}</Text>
            <TouchableOpacity 
              style={styles.eventButton}
              onPress={() => addKnockdown(1)}
            >
              <Text style={styles.eventButtonText}>Add Knockdown</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.eventSection}>
            <Text style={styles.eventLabel}>Warnings: {warnings1}</Text>
            <TouchableOpacity 
              style={styles.eventButton}
              onPress={() => addWarning(1)}
            >
              <Text style={styles.eventButtonText}>Add Warning</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.deductionText}>
            Point Deductions: {pointDeductions1}
          </Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.boxerSection}>
          <Text style={styles.boxerName}>{settings.boxer2Name}</Text>
          
          <View style={styles.scoreInputContainer}>
            <Text style={styles.scoreLabel}>Round Score</Text>
            <View style={styles.scoreButtons}>
              <TouchableOpacity 
                style={[styles.scoreButton, roundScores[currentRound - 1]?.boxer2 === 10 && styles.selectedScore]}
                onPress={() => updateRoundScore(2, 10)}
              >
                <Text style={styles.scoreButtonText}>10</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.scoreButton, roundScores[currentRound - 1]?.boxer2 === 9 && styles.selectedScore]}
                onPress={() => updateRoundScore(2, 9)}
              >
                <Text style={styles.scoreButtonText}>9</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.scoreButton, roundScores[currentRound - 1]?.boxer2 === 8 && styles.selectedScore]}
                onPress={() => updateRoundScore(2, 8)}
              >
                <Text style={styles.scoreButtonText}>8</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.eventSection}>
            <Text style={styles.eventLabel}>Knockdowns: {knockdowns2}</Text>
            <TouchableOpacity 
              style={styles.eventButton}
              onPress={() => addKnockdown(2)}
            >
              <Text style={styles.eventButtonText}>Add Knockdown</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.eventSection}>
            <Text style={styles.eventLabel}>Warnings: {warnings2}</Text>
            <TouchableOpacity 
              style={styles.eventButton}
              onPress={() => addWarning(2)}
            >
              <Text style={styles.eventButtonText}>Add Warning</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.deductionText}>
            Point Deductions: {pointDeductions2}
          </Text>
        </View>
      </View>
      
      <View style={styles.eventLogContainer}>
        <Text style={styles.eventLogTitle}>Round Events</Text>
        <ScrollView style={styles.eventLog}>
          {events.filter(e => e.round === currentRound).reverse().map((event, index) => (
            <View key={index} style={styles.eventItem}>
              <Text style={styles.eventTime}>
                {new Date(event.timestamp).toLocaleTimeString()}
              </Text>
              <View style={[
                styles.eventType,
                event.type === 'knockdown' ? styles.knockdownEvent :
                event.type === 'warning' ? styles.warningEvent :
                styles.deductionEvent
              ]}>
                <Text style={styles.eventTypeText}>
                  {event.type.toUpperCase().replace('_', ' ')}
                </Text>
              </View>
              <Text style={styles.eventBoxer}>
                {event.boxer === 1 ? settings.boxer1Name : settings.boxer2Name}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
      
      <TouchableOpacity 
        style={styles.endMatchButton}
        onPress={handleEndMatch}
      >
        <Whistle color={COLORS.white} size={20} />
        <Text style={styles.endMatchButtonText}>End Match</Text>
      </TouchableOpacity>
      
      {showEndMatchConfirm && (
        <View style={styles.overlay}>
          <View style={styles.confirmDialog}>
            <Text style={styles.confirmTitle}>End Match?</Text>
            <Text style={styles.confirmText}>
              Are you sure you want to end the match? This will save the current result.
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity 
                style={[styles.confirmButton, styles.cancelButton]}
                onPress={() => setShowEndMatchConfirm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.confirmButton, styles.endButton]}
                onPress={confirmEndMatch}
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
  header: {
    backgroundColor: COLORS.cardBackground,
    padding: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  roundIndicator: {
    backgroundColor: COLORS.redDark,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  roundText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: COLORS.red,
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
  },
  timerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.redDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  scoreboardSection: {
    flexDirection: 'row',
    flex: 1,
    marginTop: 16,
  },
  boxerSection: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  boxerName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: COLORS.white,
    marginBottom: 16,
  },
  scoreInputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  scoreLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 8,
    textAlign: 'center',
  },
  scoreButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scoreButton: {
    flex: 1,
    backgroundColor: COLORS.cardBackgroundLight,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedScore: {
    backgroundColor: COLORS.red,
  },
  scoreButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: COLORS.white,
  },
  eventSection: {
    width: '100%',
    marginBottom: 16,
  },
  eventLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 8,
    textAlign: 'center',
  },
  eventButton: {
    backgroundColor: COLORS.redDark,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  eventButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.white,
  },
  deductionText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.error,
    marginTop: 8,
  },
  divider: {
    width: 1,
    backgroundColor: COLORS.borderColor,
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
  knockdownEvent: {
    backgroundColor: COLORS.redDark,
  },
  warningEvent: {
    backgroundColor: COLORS.yellowDark,
  },
  deductionEvent: {
    backgroundColor: COLORS.errorDark,
  },
  eventTypeText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: COLORS.white,
  },
  eventBoxer: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.white,
    flex: 1,
  },
  endMatchButton: {
    backgroundColor: COLORS.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  endMatchButtonText: {
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