import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile, Organization, Language } from '@/types';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  organization: Organization | null;
  loading: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('atlas-lang');
    return (stored as Language) || 'en';
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
          setOrganization(null);
          setLoading(false);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(userId: string) {
    const { data: prof, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !prof) {
      setLoading(false);
      return;
    }

    setProfile(prof as Profile);
    if (prof.language) setLanguageState(prof.language as Language);

    const { data: org } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', prof.org_id)
      .maybeSingle();

    setOrganization(org as Organization);
    setLoading(false);
  }

  function setLanguage(lang: Language) {
    setLanguageState(lang);
    localStorage.setItem('atlas-lang', lang);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
    setOrganization(null);
  }

  return (
    <AuthContext.Provider value={{ session, user, profile, organization, loading, language, setLanguage, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
