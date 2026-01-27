import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// AndroidApp interface is defined in SubscriptionContext.tsx

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Notify Android app on sign in
        if (session?.user && window.AndroidApp?.logIn) {
          console.log('[Auth] Calling AndroidApp.logIn:', session.user.id);
          window.AndroidApp.logIn(session.user.id);
        }

        // Handle sign out event
        if (event === 'SIGNED_OUT') {
          console.log('[Auth] User signed out, clearing premium and calling AndroidApp.logOut');
          try {
            localStorage.removeItem('isPremium');
          } catch (e) {
            console.warn('[Auth] Could not clear isPremium:', e);
          }
          if (window.AndroidApp?.logOut) {
            window.AndroidApp.logOut();
          }
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Notify Android app on session restore
      if (session?.user && window.AndroidApp?.logIn) {
        console.log('[Auth] Session restored, calling AndroidApp.logIn:', session.user.id);
        window.AndroidApp.logIn(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error: error ? new Error(getErrorMessage(error.message)) : null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          },
        },
      });
      return { error: error ? new Error(getErrorMessage(error.message)) : null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    // Clear premium status before signing out
    try {
      localStorage.removeItem('isPremium');
    } catch (e) {
      console.warn('[Auth] Could not clear isPremium:', e);
    }

    // Notify Android app
    if (window.AndroidApp?.logOut) {
      console.log('[Auth] Calling AndroidApp.logOut');
      window.AndroidApp.logOut();
    }

    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Helper function to translate error messages to Arabic
function getErrorMessage(message: string): string {
  const errorMessages: Record<string, string> = {
    'Invalid login credentials': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    'Email not confirmed': 'يرجى تأكيد البريد الإلكتروني أولاً',
    'User already registered': 'هذا البريد الإلكتروني مسجل بالفعل',
    'Password should be at least 6 characters': 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
    'Unable to validate email address: invalid format': 'صيغة البريد الإلكتروني غير صحيحة',
    'Signup requires a valid password': 'يرجى إدخال كلمة مرور صالحة',
  };

  return errorMessages[message] || message;
}
