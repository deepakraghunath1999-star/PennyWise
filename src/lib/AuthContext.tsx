import React, { createContext, useContext, useEffect, useState } from 'react';

export interface MockUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
}

interface AuthContextType {
  user: MockUser | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// A premium-styled realistic user photo URL for standard look & feel
const DEFAULT_MOCK_USER: MockUser = {
  uid: 'local_pennywise_user',
  displayName: 'PennyWise Scout',
  email: 'scout@pennywise.local',
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user was previously signed in
    const stored = localStorage.getItem('pennywise_auth_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        setUser(null);
      }
    } else {
      // By default, Auto-login since there's no real cloud login needed anymore,
      // creating an extremely seamless local-first onboarding experience.
      localStorage.setItem('pennywise_auth_user', JSON.stringify(DEFAULT_MOCK_USER));
      setUser(DEFAULT_MOCK_USER);
    }
    setLoading(false);
  }, []);

  const signIn = async () => {
    // Simulating instant seamless authentication
    localStorage.setItem('pennywise_auth_user', JSON.stringify(DEFAULT_MOCK_USER));
    setUser(DEFAULT_MOCK_USER);
  };

  const signOut = async () => {
    localStorage.removeItem('pennywise_auth_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
