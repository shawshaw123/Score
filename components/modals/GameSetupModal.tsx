import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS } from '@/constants/Colors';

interface GameSetupModalProps {
  sport: string;
  defaultSettings: any;
  onComplete: (settings: any) => void;
}

export default function GameSetupModal({ sport, defaultSettings, onComplete }: GameSetupModalProps) {
  const [settings, setSettings] = useState(defaultSettings);
  
  const handleChange = (key: string, value: any) => {
    setSettings((prev: typeof defaultSettings) => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleStart = () => {
    onComplete(settings);
  };
  
  const renderBasketballSettings = () => {
    return (
      <>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Quarter Length (minutes)</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={settings.quarterLength.toString()}
            onChangeText={(value) => handleChange('quarterLength', parseInt(value) || 10)}
            placeholder="10"
            placeholderTextColor={COLORS.gray}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Number of Quarters</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={settings.quarters.toString()}
            onChangeText={(value) => handleChange('quarters', parseInt(value) || 4)}
            placeholder="4"
            placeholderTextColor={COLORS.gray}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Shot Clock (seconds)</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={settings.shotClock.toString()}
            onChangeText={(value) => handleChange('shotClock', parseInt(value) || 24)}
            placeholder="24"
            placeholderTextColor={COLORS.gray}
          />
        </View>
        
        <View style={styles.checkboxGroup}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => handleChange('enableShotClock', !settings.enableShotClock)}
          >
            <View style={[styles.checkboxBox, settings.enableShotClock && styles.checkboxChecked]} />
            <Text style={styles.checkboxLabel}>Enable Shot Clock</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };
  
  const renderVolleyballSettings = () => {
    return (
      <>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Sets to Win (Best of 3 or 5)</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={[styles.radioButton, settings.setsToWin === 2 && styles.radioActive]}
              onPress={() => handleChange('setsToWin', 2)}
            >
              <Text style={[styles.radioText, settings.setsToWin === 2 && styles.radioTextActive]}>
                Best of 3
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.radioButton, settings.setsToWin === 3 && styles.radioActive]}
              onPress={() => handleChange('setsToWin', 3)}
            >
              <Text style={[styles.radioText, settings.setsToWin === 3 && styles.radioTextActive]}>
                Best of 5
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Points Per Set</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={settings.pointsPerSet.toString()}
            onChangeText={(value) => handleChange('pointsPerSet', parseInt(value) || 25)}
            placeholder="25"
            placeholderTextColor={COLORS.gray}
          />
        </View>
      </>
    );
  };
  
  const renderFootballSettings = () => {
    return (
      <>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Half Length (minutes)</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={settings.halfLength.toString()}
            onChangeText={(value) => handleChange('halfLength', parseInt(value) || 45)}
            placeholder="45"
            placeholderTextColor={COLORS.gray}
          />
        </View>
      </>
    );
  };

  const renderBadmintonSettings = () => {
    return (
      <>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Game Format</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={[styles.radioButton, settings.format === 'singles' && styles.radioActive]}
              onPress={() => handleChange('format', 'singles')}
            >
              <Text style={[styles.radioText, settings.format === 'singles' && styles.radioTextActive]}>
                Singles
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.radioButton, settings.format === 'doubles' && styles.radioActive]}
              onPress={() => handleChange('format', 'doubles')}
            >
              <Text style={[styles.radioText, settings.format === 'doubles' && styles.radioTextActive]}>
                Doubles
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Points to Win</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={settings.pointsToWin.toString()}
            onChangeText={(value) => handleChange('pointsToWin', parseInt(value) || 21)}
            placeholder="21"
            placeholderTextColor={COLORS.gray}
          />
        </View>
      </>
    );
  };

  const renderBoxingSettings = () => {
    return (
      <>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Round Length (minutes)</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={settings.roundLength.toString()}
            onChangeText={(value) => handleChange('roundLength', parseInt(value) || 3)}
            placeholder="3"
            placeholderTextColor={COLORS.gray}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Number of Rounds</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={settings.totalRounds.toString()}
            onChangeText={(value) => handleChange('totalRounds', parseInt(value) || 12)}
            placeholder="12"
            placeholderTextColor={COLORS.gray}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Break Length (minutes)</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={settings.breakLength.toString()}
            onChangeText={(value) => handleChange('breakLength', parseInt(value) || 1)}
            placeholder="1"
            placeholderTextColor={COLORS.gray}
          />
        </View>
      </>
    );
  };

  const renderTableTennisSettings = () => {
    return (
      <>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Points to Win</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={settings.pointsToWin.toString()}
            onChangeText={(value) => handleChange('pointsToWin', parseInt(value) || 11)}
            placeholder="11"
            placeholderTextColor={COLORS.gray}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Best of Games</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={[styles.radioButton, settings.bestOf === 3 && styles.radioActive]}
              onPress={() => handleChange('bestOf', 3)}
            >
              <Text style={[styles.radioText, settings.bestOf === 3 && styles.radioTextActive]}>
                Best of 3
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.radioButton, settings.bestOf === 5 && styles.radioActive]}
              onPress={() => handleChange('bestOf', 5)}
            >
              <Text style={[styles.radioText, settings.bestOf === 5 && styles.radioTextActive]}>
                Best of 5
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.radioButton, settings.bestOf === 7 && styles.radioActive]}
              onPress={() => handleChange('bestOf', 7)}
            >
              <Text style={[styles.radioText, settings.bestOf === 7 && styles.radioTextActive]}>
                Best of 7
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  };
  
  const renderSportSettings = () => {
    switch(sport) {
      case 'basketball':
        return renderBasketballSettings();
      case 'volleyball':
        return renderVolleyballSettings();
      case 'football':
        return renderFootballSettings();
      case 'badminton':
        return renderBadmintonSettings();
      case 'boxing':
        return renderBoxingSettings();
      case 'table-tennis':
        return renderTableTennisSettings();
      default:
        return null;
    }
  };
  
  const getTitle = () => {
    const sportName = sport.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    return `${sportName} Game Setup`;
  };
  
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>{getTitle()}</Text>
        
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {sport === 'boxing' ? 'Boxer 1 Name' : 
               sport === 'table-tennis' ? 'Player 1 Name' :
               'Home Team'}
            </Text>
            <TextInput
              style={styles.input}
              value={settings.team1Name}
              onChangeText={(value) => handleChange('team1Name', value)}
              placeholder="Home Team"
              placeholderTextColor={COLORS.gray}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {sport === 'boxing' ? 'Boxer 2 Name' :
               sport === 'table-tennis' ? 'Player 2 Name' :
               'Away Team'}
            </Text>
            <TextInput
              style={styles.input}
              value={settings.team2Name}
              onChangeText={(value) => handleChange('team2Name', value)}
              placeholder="Away Team"
              placeholderTextColor={COLORS.gray}
            />
          </View>
          
          {renderSportSettings()}
        </View>
      </ScrollView>
      
      <TouchableOpacity 
        style={styles.startButton}
        onPress={handleStart}
      >
        <Text style={styles.startButtonText}>Start Game</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 24,
    color: COLORS.white,
    marginBottom: 24,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: COLORS.white,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 8,
    padding: 12,
    color: COLORS.white,
    fontFamily: 'Poppins-Regular',
  },
  checkboxGroup: {
    marginBottom: 16,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
  },
  checkboxLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: COLORS.white,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radioButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.inputBackground,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  radioActive: {
    backgroundColor: COLORS.primary,
  },
  radioText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.gray,
  },
  radioTextActive: {
    color: COLORS.white,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  startButtonText: {
    fontFamily: 'Poppins-Medium',
    color: COLORS.white,
    fontSize: 16,
  },
});