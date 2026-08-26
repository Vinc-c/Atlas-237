import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile, Organization } from '@/types';
import type { Language } from '@/lib/i18n';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  organization: Organization | null;
  loading: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
  signOut: () => Promise<void>;
  isSuperAdmin: boolean;
  isPlatformExempt: boolean;
  brandingLogoUrl: string | null;
  refreshOrg: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isPlatformExempt, setIsPlatformExempt] = useState(false);
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('atlas-lang');
    return (stored as Language) || 'en';
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session) {
        loadProfile(session.user.id, session.user.email);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session) {
          await loadProfile(session.user.id, session.user.email);
        } else {
          setProfile(null);
          setOrganization(null);
          setIsSuperAdmin(false);
          setIsPlatformExempt(false);
          setLoading(false);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(userId: string, email?: string) {
    // Resolve super admin / platform-staff exemption status first and
    // independently of the tenant profile lookup below — platform staff
    // may not always have a tenant `profiles` row, and this status must
    // never be skipped just because that lookup comes back empty.
    if (email) {
      try {
        await supabase.rpc('link_super_admin', { login_email: email, login_user_id: userId });
      } catch { /* ignore if function doesn't exist yet */ }
    }
    try {
      const { data: saFlag } = await supabase.rpc('is_super_admin', { check_user_id: userId });
      setIsSuperAdmin(Boolean(saFlag));
      if (saFlag) {
        setIsPlatformExempt(true);
      } else {
        try {
          const { data: exemptFlag } = await supabase.rpc('is_platform_exempt', { check_user_id: userId });
          setIsPlatformExempt(Boolean(exemptFlag));
        } catch { /* function may not exist yet */ }
      }
    } catch {
      // Fallback: check by email in super_admins table
      if (email) {
        const { data: saRow } = await supabase
          .from('super_admins')
          .select('id')
          .eq('email', email)
          .eq('active', true)
          .maybeSingle();
        setIsSuperAdmin(Boolean(saRow));
        setIsPlatformExempt(Boolean(saRow));
      }
    }

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

  async function refreshOrg() {
    if (!profile) return;
    const { data: org } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', profile.org_id)
      .maybeSingle();
    setOrganization(org as Organization);
  }

  function setLanguage(lang: Language) {
    setLanguageState(lang);
    localStorage.setItem('atlas-lang', lang);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
    setOrganization(null);
    setIsSuperAdmin(false);
    setIsPlatformExempt(false);
  }

  const brandingLogoUrl = organization?.logo_url && organization.branding_enabled ? organization.logo_url : null;

  return (
    <AuthContext.Provider value={{ session, user, profile, organization, loading, language, setLanguage, signOut, isSuperAdmin, isPlatformExempt, brandingLogoUrl, refreshOrg }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
