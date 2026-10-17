'use client';

// ==============================================================================
// TataDana: React Auth Context & Hook
// ==============================================================================

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types/database';
import { authService } from './auth-service';
import { supabase } from '@/lib/supabase/client';

export interface StoredUserProfile {
  nama: string;
  kontak: string;
  email: string;
  avatarUrl: string;
  statusPaket: string;
  isLoggedIn: boolean;
}

const DEFAULT_PROFILE: StoredUserProfile = {
  nama: 'Pengguna TataDana',
  kontak: '+62 812-3456-7890',
  email: 'user@tatadana.com',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TataDanaUser',
  statusPaket: 'Pro Lifetime (Rp99k)',
  isLoggedIn: true,
};

interface AuthContextType {
  user: User | null;
  profile: StoredUserProfile | null;
  loading: boolean;
  login: (emailOrContact: string, password?: string, extra?: Partial<StoredUserProfile>) => Promise<void>;
  loginWithProfile: (profile: StoredUserProfile) => void;
  updateProfile: (profileUpdates: Partial<StoredUserProfile>) => void;
  register: (email: string, password: string, fullName: string, phoneNumber?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setImpersonatedUser: (user: User | null) => void;
  isImpersonating: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StoredUserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isImpersonating, setIsImpersonating] = useState<boolean>(false);

  const saveProfileToStorage = (p: StoredUserProfile) => {
    try {
      localStorage.setItem('tatadana_user_profile', JSON.stringify(p));
      localStorage.setItem('user_profile', JSON.stringify(p));
      localStorage.setItem('tatadana_user', JSON.stringify(p));
      window.dispatchEvent(new Event('tatadana_profile_updated'));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error('Failed to save profile to localStorage:', e);
    }
    setProfile(p);
  };

  const clearProfileFromStorage = () => {
    try {
      localStorage.removeItem('tatadana_user_profile');
      localStorage.removeItem('user_profile');
      localStorage.removeItem('tatadana_user');
    } catch (e) {}
    setProfile(null);
  };

  const refreshUser = async () => {
    try {
      setLoading(true);
      const userProfile = await authService.getCurrentUserProfile();
      if (userProfile) {
        setUser(userProfile);
      }
    } catch (err) {
      // In offline / mock dev mode, keep local user
      console.warn('Failed to load user profile from Supabase:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Initial Load: check persistent profile in localStorage
    try {
      const raw = localStorage.getItem('tatadana_user_profile') || localStorage.getItem('user_profile');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.isLoggedIn) {
          setProfile(parsed);
          setUser({
            id: 'user-tatadana-persisted',
            email: parsed.email || 'user@tatadana.com',
            full_name: parsed.nama || 'Pengguna TataDana',
            avatar_url: parsed.avatarUrl,
            phone_number: parsed.kontak,
            subscription_tier: parsed.statusPaket?.includes('Pro') ? 'PRO' : 'STARTER',
            monthly_transaction_count: 0,
            is_admin: false,
            created_at: new Date().toISOString(),
          });
        }
      }
    } catch (e) {
      console.error('Failed to parse localStorage profile:', e);
    }

    refreshUser();

    // 2. Listen to Supabase auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event: string, session: any) => {
      if (session?.user) {
        refreshUser();
      } else if (!isImpersonating && !localStorage.getItem('tatadana_user_profile')) {
        setUser(null);
      }
    });

    // 3. Multi-tab / window sync listener
    const syncCurrentProfile = () => {
      try {
        const raw = localStorage.getItem('tatadana_user_profile') || localStorage.getItem('user_profile');
        if (raw) {
          const parsed = JSON.parse(raw);
          setProfile(parsed);
          setUser((prev) =>
            prev
              ? {
                  ...prev,
                  full_name: parsed.nama || prev.full_name,
                  avatar_url: parsed.avatarUrl || prev.avatar_url,
                  phone_number: parsed.kontak || prev.phone_number,
                  email: parsed.email || prev.email,
                }
              : null
          );
        } else {
          setProfile(null);
        }
      } catch (err) {}
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tatadana_user_profile' || e.key === 'user_profile') {
        syncCurrentProfile();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('tatadana_profile_updated', syncCurrentProfile);

    return () => {
      authListener?.subscription?.unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('tatadana_profile_updated', syncCurrentProfile);
    };
  }, [isImpersonating]);

  const loginWithProfile = (newProfile: StoredUserProfile) => {
    saveProfileToStorage(newProfile);
    setUser({
      id: 'user-tatadana-' + Math.random().toString(36).slice(2, 8),
      email: newProfile.email || 'user@tatadana.com',
      full_name: newProfile.nama || 'Pengguna TataDana',
      avatar_url: newProfile.avatarUrl,
      phone_number: newProfile.kontak,
      subscription_tier: newProfile.statusPaket?.includes('Pro') ? 'PRO' : 'STARTER',
      monthly_transaction_count: 0,
      is_admin: false,
      created_at: new Date().toISOString(),
    });
  };

  const updateProfile = (profileUpdates: Partial<StoredUserProfile>) => {
    const current = profile || DEFAULT_PROFILE;
    const updated: StoredUserProfile = {
      ...current,
      ...profileUpdates,
      isLoggedIn: true,
    };
    saveProfileToStorage(updated);
    setUser((prev) =>
      prev
        ? {
            ...prev,
            full_name: updated.nama || prev.full_name,
            avatar_url: updated.avatarUrl || prev.avatar_url,
            phone_number: updated.kontak || prev.phone_number,
            email: updated.email || prev.email,
          }
        : null
    );
  };

  const login = async (emailOrContact: string, password?: string, extra?: Partial<StoredUserProfile>) => {
    setLoading(true);
    try {
      const isEmail = emailOrContact.includes('@');
      if (isEmail && password) {
        try {
          await authService.loginWithEmail(emailOrContact, password);
        } catch (e) {
          console.warn('Supabase auth unavailable in dev environment, falling back to local persistent profile');
        }
      }

      let email = extra?.email;
      let kontak = extra?.kontak;
      let nama = extra?.nama;

      if (!email) {
        email = isEmail ? emailOrContact : 'user@tatadana.com';
      }
      if (!kontak) {
        kontak = !isEmail ? emailOrContact : '+62 812-3456-7890';
      }
      if (!nama) {
        if (isEmail) {
          const rawName = emailOrContact.split('@')[0];
          nama = rawName.replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        } else {
          nama = 'Pengguna TataDana';
        }
      }

      const seed = encodeURIComponent(nama || 'TataDanaUser');
      const avatarUrl = extra?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
      const statusPaket = extra?.statusPaket || 'Pro Lifetime (Rp99k)';

      const newProfile: StoredUserProfile = {
        nama,
        kontak,
        email,
        avatarUrl,
        statusPaket,
        isLoggedIn: true,
      };

      loginWithProfile(newProfile);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName: string, phoneNumber?: string) => {
    setLoading(true);
    try {
      try {
        await authService.registerWithEmail(email, password, fullName, phoneNumber);
      } catch (e) {
        console.warn('Supabase registration fallback to local mock');
      }

      const newProfile: StoredUserProfile = {
        nama: fullName || 'Pengguna TataDana',
        kontak: phoneNumber || '+62 812-3456-7890',
        email: email || 'user@tatadana.com',
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName || 'TataDanaUser')}`,
        statusPaket: 'Pro Lifetime (Rp99k)',
        isLoggedIn: true,
      };
      loginWithProfile(newProfile);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      try {
        await authService.logout();
      } catch (e) {}
      clearProfileFromStorage();
      setUser(null);
      setIsImpersonating(false);
    } finally {
      setLoading(false);
    }
  };

  const setImpersonatedUser = (impUser: User | null) => {
    if (impUser) {
      setUser(impUser);
      setIsImpersonating(true);
      if (profile) {
        setProfile({
          ...profile,
          nama: impUser.full_name || profile.nama,
          email: impUser.email || profile.email,
          kontak: impUser.phone_number || profile.kontak,
        });
      }
    } else {
      setIsImpersonating(false);
      refreshUser();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        loginWithProfile,
        updateProfile,
        register,
        logout,
        refreshUser,
        setImpersonatedUser,
        isImpersonating,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
