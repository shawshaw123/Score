import React, { createContext, useContext, useState, useEffect } from 'react';
import { useStorage } from '@/contexts/StorageContext';
import { useRouter, useSegments } from 'expo-router';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  showWelcomeModal: boolean;
  setShowWelcomeModal: (show: boolean) => void;
}

const USER_STORAGE_KEY = 'scoreflow_users';
const CURRENT_USER_KEY = 'scoreflow_current_user';

const AuthContext = createContext<AuthContextType>({
  user: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  showWelcomeModal: true,
  setShowWelcomeModal: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const storage = useStorage();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Check for logged in user on mount
    const checkUser = async () => {
      if (storage) {
        const currentUserJson = await storage.getItem(CURRENT_USER_KEY);
        if (currentUserJson) {
          setUser(JSON.parse(currentUserJson));
        }
      }
    };
    checkUser();
  }, [storage]);

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const inGetStarted = segments[0] === 'get-started';

    if (!user && !inAuthGroup && !inGetStarted) {
      router.replace('/get-started');
    } else if (user && (inAuthGroup || inGetStarted)) {
      router.replace('/(tabs)');
    }
  }, [user, segments]);

  const signUp = async (name: string, email: string, password: string) => {
    if (!storage) throw new Error('Storage not available');

    const usersJson = await storage.getItem(USER_STORAGE_KEY);
    const users = usersJson ? JSON.parse(usersJson) : [];

    if (users.some((u: User) => u.email === email)) {
      throw new Error('Email already registered');
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password
    };

    users.push(newUser);
    await storage.setItem(USER_STORAGE_KEY, JSON.stringify(users));

    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    await storage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
  };

  const signIn = async (email: string, password: string) => {
    if (!storage) throw new Error('Storage not available');

    const usersJson = await storage.getItem(USER_STORAGE_KEY);
    const users = usersJson ? JSON.parse(usersJson) : [];

    const user = users.find((u: any) => u.email === email && u.password === password);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const { password: _, ...userWithoutPassword } = user;
    setUser(userWithoutPassword);
    await storage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
  };

  const signOut = async () => {
    if (!storage) throw new Error('Storage not available');
    await storage.removeItem(CURRENT_USER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      signIn, 
      signUp,
      signOut,
      showWelcomeModal,
      setShowWelcomeModal
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);