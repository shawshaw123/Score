import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { COLORS } from '@/constants/Colors';
import { useRouter, Stack } from 'expo-router';
import { ChevronDown } from 'lucide-react-native';
import TeamInputRow from '@/components/tournament/TeamInputRow';
import { useStorage } from '@/contexts/StorageContext';
import { storeTournament, Sport } from '@/utils/storage';

export default function TournamentCreateScreen() {
  const router = useRouter();
  const storage = useStorage();
  const [tournamentName, setTournamentName] = useState('');
  const [sportType, setSportType] = useState<Sport>('basketball');
  const [teamCount, setTeamCount] = useState('8');
  const [teams, setTeams] = useState(Array(8).fill('').map((_, i) => `Team ${i + 1}`));
  const [showSportDropdown, setShowSportDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const sportOptions = [
    { label: 'Basketball', value: 'basketball' },
    { label: 'Volleyball', value: 'volleyball' },
    { label: 'Football', value: 'football' },
    { label: 'Badminton', value: 'badminton' },
    { label: 'Table Tennis', value: 'table-tennis' },
    { label: 'Boxing', value: 'boxing' },
    { label: 'Sepak Takraw', value: 'sepak-takraw' },
  ];
  
  const updateTeam = (index: number, name: string) => {
    const newTeams = [...teams];
    newTeams[index] = name;
    setTeams(newTeams);
  };
  
  const handleCreateTournament = async () => {
    if (!tournamentName.trim()) {
      Alert.alert('Error', 'Please enter a tournament name');
      return;
    }
    
    if (teams.some(team => !team.trim())) {
      Alert.alert('Error', 'Please enter names for all teams');
      return;
    }

    // Validate team count matches selected count
    if (teams.length !== parseInt(teamCount)) {
      Alert.alert('Error', 'Team count mismatch. Please try again.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Generate initial bracket structure
      const rounds = Math.ceil(Math.log2(teams.length));
      const initialMatches = [];
      let matchIndex = 0;
      
      // First round matches
      for (let i = 0; i < teams.length; i += 2) {
        initialMatches.push({
          id: `match-${matchIndex}`,
          round: 1,
          team1: teams[i],
          team2: i + 1 < teams.length ? teams[i + 1] : 'BYE',
          score1: 0,
          score2: 0,
          winner: i + 1 >= teams.length ? teams[i] : null,
          status: 'pending'
        });
        matchIndex++;
      }

      const tournament = await storeTournament(storage, {
        name: tournamentName.trim(),
        sport: sportType,
        teams: teams.map(t => t.trim()),
        status: 'ongoing',
        startDate: new Date().toISOString(),
        matches: initialMatches,
        currentRound: 1,
        totalRounds: rounds
      });
      
      if (!tournament || !tournament.id) {
        throw new Error('Failed to create tournament');
      }

      // Navigate to the newly created tournament
      router.replace(`/tournament/${tournament.id}`);
    } catch (error) {
      console.error('Tournament creation error:', error);
      Alert.alert('Error', 'Failed to create tournament. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTitle: 'Create Tournament',
        }} 
      />
      
      <ScrollView style={styles.container}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Tournament Details</Text>
          
          <Text style={styles.inputLabel}>Tournament Name</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter tournament name"
              placeholderTextColor={COLORS.gray}
              value={tournamentName}
              onChangeText={setTournamentName}
            />
          </View>

          <Text style={styles.inputLabel}>Number of Teams</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter number of teams"
              placeholderTextColor={COLORS.gray}
              value={teamCount}
              onChangeText={(text) => {
                const num = parseInt(text) || 0;
                if (num >= 0 && num <= 32) { // Set a reasonable maximum
                  setTeamCount(text);
                  // Update teams array
                  if (num > teams.length) {
                    // Add more teams
                    setTeams([...teams, ...Array(num - teams.length).fill('').map((_, i) => `Team ${teams.length + i + 1}`)]);
                  } else if (num < teams.length) {
                    // Remove teams
                    setTeams(teams.slice(0, num));
                  }
                }
              }}
              keyboardType="number-pad"
              maxLength={2}
            />
          </View>
          
          <Text style={styles.inputLabel}>Sport</Text>
          <View style={styles.dropdownWrapper}>
            <TouchableOpacity 
              style={styles.dropdown}
              onPress={() => setShowSportDropdown(!showSportDropdown)}
            >
              <Text style={styles.dropdownText}>
                {sportOptions.find(option => option.value === sportType)?.label || 'Select sport'}
              </Text>
              <ChevronDown color={COLORS.white} size={20} />
            </TouchableOpacity>
            
            {showSportDropdown && (
              <View style={styles.dropdownMenu}>
                {sportOptions.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSportType(option.value as Sport);
                      setShowSportDropdown(false);
                    }}
                  >
                    <Text style={[
                      styles.dropdownItemText,
                      option.value === sportType && styles.dropdownItemTextSelected
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Team Setup</Text>
          <Text style={styles.sectionSubtitle}>Enter names for all participating teams</Text>
          
          {teams.map((team, index) => (
            <TeamInputRow
              key={index}
              teamNumber={index + 1}
              teamName={team}
              onChangeText={(text) => updateTeam(index, text)}
            />
          ))}
        </View>
        
        <TouchableOpacity 
          style={[styles.createButton, isLoading && styles.createButtonDisabled]} 
          onPress={handleCreateTournament}
          disabled={isLoading}
        >
          <Text style={styles.createButtonText}>
            {isLoading ? 'Creating Tournament...' : 'Create Tournament'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  formSection: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: COLORS.white,
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.white,
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 8,
    marginBottom: 16,
  },
  input: {
    fontFamily: 'Poppins-Regular',
    color: COLORS.white,
    padding: 12,
  },
  dropdownWrapper: {
    position: 'relative',
    marginBottom: 16,
    zIndex: 1,
  },
  dropdown: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontFamily: 'Poppins-Regular',
    color: COLORS.white,
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 8,
    marginTop: 4,
    zIndex: 2,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },
  dropdownItemText: {
    fontFamily: 'Poppins-Regular',
    color: COLORS.white,
  },
  dropdownItemTextSelected: {
    color: COLORS.primary,
    fontFamily: 'Poppins-Medium',
  },
  createButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonText: {
    fontFamily: 'Poppins-Medium',
    color: COLORS.white,
    fontSize: 16,
  },
});