import { Tabs } from 'expo-router/tabs';
import { useTheme } from '@/contexts/ThemeContext';
import { COLORS } from '@/constants/Colors';
import { Chrome as Home, Trophy, Clock, Settings } from 'lucide-react-native';

export default function TabLayout() {
  const { theme } = useTheme();
  
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: COLORS.cardBackground,
          borderTopColor: COLORS.borderColor,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarLabelStyle: {
          fontFamily: 'Poppins-Medium',
          fontSize: 12,
        },
        headerStyle: {
          backgroundColor: COLORS.cardBackground,
          borderBottomColor: COLORS.borderColor,
          borderBottomWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          fontFamily: 'Poppins-SemiBold',
          color: COLORS.white,
          fontSize: 18,
        },
        headerTintColor: COLORS.white,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          headerTitle: 'ScoreFlow',
        }}
      />
      <Tabs.Screen
        name="tournament"
        options={{
          title: 'Tournament',
          tabBarIcon: ({ color, size }) => <Trophy size={size} color={color} />,
          headerTitle: 'Tournaments',
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => <Clock size={size} color={color} />,
          headerTitle: 'Match History',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
          headerTitle: 'Settings',
        }}
      />
    </Tabs>
  );
}