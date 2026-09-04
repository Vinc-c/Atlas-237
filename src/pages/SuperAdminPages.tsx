import { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import {
  ShieldCheck, Users, Building2, CreditCard, BarChart3, UserCog,
  Receipt, ScrollText, Plus, Trash2, Ban, CheckCircle2, Loader2,
  AlertTriangle, TrendingUp, DollarSign, Activity, Search, CalendarPlus,
  Briefcase, Wallet, PiggyBank, ArrowUpRight, ArrowDownRight,
  UserPlus, Pencil, X, Calendar,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { t } from '@/lib/i18n';
import { formatMoney } from '@/lib/i18n-countries';
import { MODULES, ACTIONS, fetchRoles, fetchPermissions, setRolePermissions, type RbacRole, type PermissionModule, type PermissionAction } from '@/lib/rbac';
import { Loading } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { Modal } from '@/components/Modal';
import type { Organization, Profile } from '@/types';

/* ═══════════════════════════════════════════════════════════
   Super Admin Layout (separate from tenant AppLayout)
   ═══════════════════════════════════════════════════════════ */
export function SuperAdminLayout() {
  const { isSuperAdmin, loading, profile, signOut, language } = useAuth();
  const navigate = useNavigate();

  if (loading) return <Loading fullPage />;
  if (!isSuperAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-ink-50">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-3 text-error-500" size={48} />
          <h1 className="text-xl font-bold text-ink-900">{t('superAdmin.accessDenied', language)}</h1>
          <p className="mt-2 text-sm text-ink-500">{t('superAdmin.noPrivileges', language)}</p>
          <button onClick={() => navigate('/app')} className="btn-primary mt-4">{t('superAdmin.backToDashboard', language)}</button>
        </div>
      </div>
    );
  }

  const navItems = [
    { to: '/super-admin', label: t('superAdmin.dashboard', language), icon: ShieldCheck, end: true },
    { to: '/super-admin/users', label: t('superAdmin.usersTenants', language), icon: Users },
    { to: '/super-admin/subscriptions', label: t('superAdmin.subscriptions', language), icon: CreditCard },
    { to: '/super-admin/accounting', label: language === 'fr' ? 'Comptabilité' : 'Accounting', icon: Wallet },
    { to: '/super-admin/analytics', label: t('superAdmin.analytics', language), icon: BarChart3 },
    { to: '/super-admin/employees', label: t('superAdmin.employeeKpis', language), icon: UserCog },
    { to: '/super-admin/staff', label: language === 'fr' ? 'Personnel' : 'Staff', icon: Briefcase },
    { to: '/super-admin/sales-codes', label: t('superAdmin.salesCodes', language), icon: Receipt },
    { to: '/super-admin/permissions', label: t('superAdmin.permissions', language), icon: ShieldCheck },
    { to: '/super-admin/audit', label: t('superAdmin.auditLog', language), icon: ScrollText },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-ink-50">
      <aside className="w-60 flex-shrink-0 bg-ink-950 text-white flex flex-col">
        <div className="flex items-center gap-2.5 px-4 h-14 border-b border-white/10">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
            <ShieldCheck size={18} />
          </div>
          <span className="font-bold text-lg">{t('superAdmin.title', language)}</span>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.to}
              onClick={() => navigate(item.to)}
              className={`sidebar-item w-full text-left ${window.location.pathname === item.to ? 'sidebar-item-active' : ''}`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="border-t border-white/10 p-3">
          <button onClick={() => navigate('/app')} className="sidebar-item w-full text-left">
            <Building2 size={18} /><span>{t('superAdmin.backToApp', language)}</span>
          </button>
          <button onClick={() => { signOut(); navigate('/'); }} className="sidebar-item w-full text-left text-ink-400">
            <span>← {t('auth.login', language)}</span>
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b border-ink-100 flex items-center justify-between px-6">
          <h2 className="font-bold text-ink-900">{t('superAdmin.platformControl', language)}</h2>
          <div className="flex items-center gap-2 text-sm text-ink-500">
            <ShieldCheck size={16} className="text-primary-600" />
            <span>{profile?.email}</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6"><Outlet /></main>
      </div>
    </div>
  );
}

interface PlatformStats {
  total_orgs?: number;
  total_users?: number;
  active_subs?: number;
  mrr_cents?: number;
  active_trials?: number;
  new_orgs_30d?: number;
  starter_count?: number;
  growth_count?: number;
  pro_count?: number;
  enterprise_count?: number;
}

interface PlatformFinanceSummary {
  revenue_mtd: number;
  expenses_mtd: number;
  revenue_total: number;
  expenses_total: number;
  subscription_mrr: number;
  expense_count_mtd: number;
  revenue_count_mtd: number;
}

/* ═══════════════════════════════════════════════════════════
   Super Admin Dashboard
   ═══════════════════════════════════════════════════════════ */
export function SuperAdminDashboard() {
  const { language } = useAuth();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [finance, setFinance] = useState<PlatformFinanceSummary | null>(null);
  const [staffCount, setStaffCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: view } = await supabase.rpc('get_platform_stats');
      setStats((view && view[0]) || null);
      const { data: fin } = await supabase.rpc('get_platform_finance_summary');
      setFinance((fin && fin[0]) || null);
      const { count } = await supabase.from('platform_staff').select('*', { count: 'exact', head: true }).eq('active', true);
      setStaffCount(count || 0);
      setLoading(false);
    })();
  }, []);

  if (loading) return <Loading />;

  const cards = [
    { label: t('superAdmin.totalOrgs', language), value: stats?.total_orgs ?? 0, icon: Building2, color: 'text-primary-600 bg-primary-50' },
    { label: t('superAdmin.totalUsers', language), value: stats?.total_users ?? 0, icon: Users, color: 'text-success-600 bg-success-50' },
    { label: t('superAdmin.activeSubs', language), value: stats?.active_subs ?? 0, icon: CreditCard, color: 'text-warning-600 bg-warning-50' },
    { label: t('superAdmin.mrr', language), value: formatMoney(stats?.mrr_cents ?? 0, 'USD', language), icon: DollarSign, color: 'text-error-600 bg-error-50' },
    { label: t('superAdmin.activeTrials', language), value: stats?.active_trials ?? 0, icon: Activity, color: 'text-accent-600 bg-accent-50' },
    { label: t('superAdmin.new30d', language), value: stats?.new_orgs_30d ?? 0, icon: TrendingUp, color: 'text-secondary-600 bg-secondary-50' },
  ];

  const netProfit = (finance?.revenue_mtd ?? 0) - (finance?.expenses_mtd ?? 0);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Welcome header */}
      <div className="card p-6 bg-gradient-to-r from-ink-950 to-ink-800 text-white border-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{language === 'fr' ? 'Tableau de Bord Plateforme' : 'Platform Dashboard'}</h1>
            <p className="mt-1 text-sm text-ink-300">{language === 'fr' ? "Vue d'ensemble complète de la plateforme Atlas CRM" : 'Complete overview of the Atlas CRM platform'}</p>
          </div>
          <ShieldCheck size={40} className="text-primary-400" />
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-4 hover:shadow-card-hover transition-shadow">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${c.color}`}><c.icon size={20} /></div>
            <p className="mt-3 text-2xl font-bold text-ink-900">{c.value}</p>
            <p className="text-xs text-ink-500">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Finance summary row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 text-success-600"><ArrowUpRight size={18} /><span className="text-xs font-semibold uppercase tracking-wide">{language === 'fr' ? 'Revenus Mois' : 'Revenue MTD'}</span></div>
          <p className="mt-2 text-2xl font-bold text-ink-900">{formatMoney(finance?.revenue_mtd ?? 0, 'USD', language)}</p>
          <p className="text-xs text-ink-400">{finance?.revenue_count_mtd ?? 0} {language === 'fr' ? 'entrées' : 'entries'}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 text-error-600"><ArrowDownRight size={18} /><span className="text-xs font-semibold uppercase tracking-wide">{language === 'fr' ? 'Dépenses Mois' : 'Expenses MTD'}</span></div>
          <p className="mt-2 text-2xl font-bold text-ink-900">{formatMoney(finance?.expenses_mtd ?? 0, 'USD', language)}</p>
          <p className="text-xs text-ink-400">{finance?.expense_count_mtd ?? 0} {language === 'fr' ? 'entrées' : 'entries'}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 text-primary-600"><PiggyBank size={18} /><span className="text-xs font-semibold uppercase tracking-wide">{language === 'fr' ? 'Profit Net Mois' : 'Net Profit MTD'}</span></div>
          <p className={`mt-2 text-2xl font-bold ${netProfit >= 0 ? 'text-success-700' : 'text-error-700'}`}>{formatMoney(netProfit, 'USD', language)}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 text-warning-600"><Wallet size={18} /><span className="text-xs font-semibold uppercase tracking-wide">MRR</span></div>
          <p className="mt-2 text-2xl font-bold text-ink-900">{formatMoney(finance?.subscription_mrr ?? 0, 'USD', language)}</p>
          <p className="text-xs text-ink-400">{language === 'fr' ? 'Abonnements actifs' : 'Active subscriptions'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-bold text-ink-800 mb-4">{t('superAdmin.planDistribution', language)}</h3>
          {[
            { label: 'Starter', count: stats?.starter_count ?? 0 },
            { label: 'Growth', count: stats?.growth_count ?? 0 },
            { label: 'Pro', count: stats?.pro_count ?? 0 },
            { label: 'Enterprise', count: stats?.enterprise_count ?? 0 },
          ].map((p) => {
            const total = stats?.total_orgs ?? 1;
            const pct = Math.round((p.count / total) * 100);
            return (
              <div key={p.label} className="mb-3">
                <div className="flex justify-between text-sm mb-1"><span className="font-medium text-ink-700">{p.label}</span><span className="text-ink-500">{p.count} ({pct}%)</span></div>
                <div className="h-2 bg-ink-100 rounded-full overflow-hidden"><div className="h-full bg-primary-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} /></div>
              </div>
            );
          })}
        </div>
        <div className="card p-6">
          <h3 className="font-bold text-ink-800 mb-4">{t('superAdmin.superAdmins', language)}</h3>
          <SuperAdminsList />
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: language === 'fr' ? 'Personnel' : 'Staff', icon: Briefcase, to: '/super-admin/staff', count: staffCount },
          { label: language === 'fr' ? 'Comptabilité' : 'Accounting', icon: Wallet, to: '/super-admin/accounting' },
          { label: t('superAdmin.salesCodes', language), icon: Receipt, to: '/super-admin/sales-codes' },
          { label: t('superAdmin.auditLog', language), icon: ScrollText, to: '/super-admin/audit' },
        ].map((q) => (
          <button key={q.to} onClick={() => window.location.assign(q.to)} className="card p-4 text-left hover:shadow-card-hover transition-shadow">
            <q.icon size={20} className="text-primary-600" />
            <p className="mt-2 font-semibold text-ink-800">{q.label}</p>
            {q.count !== undefined && <p className="text-xs text-ink-400">{q.count} {language === 'fr' ? 'actifs' : 'active'}</p>}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Super Admins List (add/remove with min-2 rule)
   ═══════════════════════════════════════════════════════════ */
interface SuperAdminRecord {
  id: string;
  email: string;
  active: boolean;
  is_founder: boolean;
  twofa_required?: boolean;
  created_at?: string;
}

function SuperAdminsList() {
  const { user, language } = useAuth();
  const [admins, setAdmins] = useState<SuperAdminRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from('super_admins').select('*').order('created_at');
    setAdmins(data || []);
    setLoading(false);
  }

  async function addAdmin() {
    if (!newEmail.trim() || !user) return;
    setBusy(true); setError('');
    const email = newEmail.trim().toLowerCase();
    const { error: err } = await supabase.from('super_admins').insert({ email, is_founder: false, active: true });
    if (err) {
      setError(err.message.includes('duplicate') ? t('superAdmin.alreadyAdmin', language) : err.message);
    } else {
      // Log the action
      await supabase.rpc('log_platform_action', { p_actor_id: user.id, p_action: 'super_admin.add', p_target_type: 'super_admin', p_target_email: email });
      setNewEmail('');
      await load();
    }
    setBusy(false);
  }

  async function removeAdmin(id: string, email: string, isFounder: boolean) {
    if (!user) return;
    const count = admins.filter((a) => a.active).length;
    if (count <= 2) {
      setError(t('superAdmin.cannotRemove', language));
      return;
    }
    const confirmMsg = isFounder
      ? `⚠️ ${language === 'fr' ? 'FONDATEUR PROTÉGÉ' : 'FOUNDER PROTECTED'} ⚠️\n\n${language === 'fr' ? `Vous êtes sur le point de supprimer le fondateur ${email}. Ceci est une action sensible. Tapez "CONFIRM" pour continuer :` : `You are about to remove founder ${email}. This is a sensitive action. Type "CONFIRM" to proceed:`}`
      : (language === 'fr' ? `Supprimer le super admin ${email} ?` : `Remove super admin ${email}?`);
    const input = isFounder ? prompt(confirmMsg) : confirm(confirmMsg);
    if (isFounder && input !== 'CONFIRM') return;
    if (!isFounder && !input) return;

    setBusy(true); setError('');
    const { error: err } = await supabase.from('super_admins').delete().eq('id', id);
    if (err) {
      setError(err.message);
    } else {
      await supabase.rpc('log_platform_action', { p_actor_id: user.id, p_action: 'super_admin.remove', p_target_type: 'super_admin', p_target_email: email });
      await load();
    }
    setBusy(false);
  }

  if (loading) return <Loading />;

  return (
    <div>
      <div className="space-y-2 mb-4">
        {admins.map((a) => (
          <div key={a.id} className="flex items-center justify-between rounded-lg border border-ink-100 px-3 py-2">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${a.active ? 'bg-success-500' : 'bg-ink-300'}`} />
              <span className="text-sm font-medium text-ink-700">{a.email}</span>
              {a.is_founder && <span className="rounded-full bg-warning-100 px-2 py-0.5 text-[10px] font-bold text-warning-700">{language === 'fr' ? 'FONDATEUR' : 'FOUNDER'}</span>}
              {a.twofa_required && <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-bold text-primary-700">2FA</span>}
            </div>
            <button
              onClick={() => removeAdmin(a.id, a.email, a.is_founder)}
              disabled={busy}
              className="p-1.5 rounded-lg text-error-500 hover:bg-error-50 transition"
              title={t('superAdmin.remove', language)}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="input flex-1"
          placeholder="email@example.com"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          type="email"
        />
        <button onClick={addAdmin} disabled={busy || !newEmail.trim()} className="btn-primary btn-sm">
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} {t('superAdmin.add', language)}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-error-600">{error}</p>}
      <p className="mt-2 text-[11px] text-ink-400">{t('superAdmin.minAdmins', language)}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Users & Tenants Management
   ═══════════════════════════════════════════════════════════ */
export function SuperAdminUsersPage() {
  const { user, language } = useAuth();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [extendingOrg, setExtendingOrg] = useState<Organization | null>(null);
  const [extendMode, setExtendMode] = useState<'days' | 'months' | 'years' | 'date'>('days');
  const [extendAmount, setExtendAmount] = useState(30);
  const [extendDate, setExtendDate] = useState('');
  const [extending, setExtending] = useState(false);
  const [extendSuccess, setExtendSuccess] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const [{ data: orgData }, { data: profData }] = await Promise.all([
      supabase.from('organizations').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    ]);
    setOrgs(orgData || []);
    setProfiles(profData || []);
    setLoading(false);
  }

  async function toggleSuspend(orgId: string, currentStatus: string) {
    if (!user) return;
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    const { error } = await supabase.from('organizations').update({ status: newStatus }).eq('id', orgId);
    if (error) { alert(error.message); return; }
    await supabase.rpc('log_platform_action', { p_actor_id: user.id, p_action: newStatus === 'suspended' ? 'user.suspend' : 'user.reactivate', p_target_type: 'organization', p_target_id: orgId });
    await load();
  }

  async function changePlan(orgId: string, orgName: string, newPlan: string) {
    if (!user) return;
    const { error } = await supabase.rpc('admin_set_org_plan', { target_org_id: orgId, new_plan: newPlan });
    if (error) { alert(error.message); return; }
    await supabase.rpc('log_platform_action', { p_actor_id: user.id, p_action: 'plan.change', p_target_type: 'organization', p_target_id: orgId, p_details: { new_plan: newPlan } });
    await load();
  }

  function openExtendModal(org: Organization) {
    setExtendingOrg(org);
    setExtendMode('days');
    setExtendAmount(30);
    const current = org.trial_ends_at ? new Date(org.trial_ends_at) : new Date();
    setExtendDate(current.toISOString().slice(0, 10));
  }

  async function submitExtend() {
    if (!user || !extendingOrg) return;
    setExtending(true);
    try {
      if (extendMode === 'date') {
        if (!extendDate) return;
        const untilTs = new Date(`${extendDate}T23:59:59`).toISOString();
        const { error } = await supabase.rpc('admin_set_org_access_until', { target_org_id: extendingOrg.id, until_ts: untilTs });
        if (error) { alert(error.message); return; }
        await supabase.rpc('log_platform_action', { p_actor_id: user.id, p_action: 'subscription.set_until', p_target_type: 'organization', p_target_id: extendingOrg.id, p_details: { until: untilTs } });
      } else {
        // Real calendar arithmetic (not a flat *30/*365 approximation) so
        // "+1 month" or "+1 year" lands on the actual matching calendar date.
        const now = new Date();
        const future = new Date(now);
        if (extendMode === 'days') future.setDate(future.getDate() + extendAmount);
        else if (extendMode === 'months') future.setMonth(future.getMonth() + extendAmount);
        else future.setFullYear(future.getFullYear() + extendAmount);
        const days = Math.max(1, Math.round((future.getTime() - now.getTime()) / 86400000));
        const { error } = await supabase.rpc('admin_extend_org_access', { target_org_id: extendingOrg.id, extend_days: days });
        if (error) { alert(error.message); return; }
        await supabase.rpc('log_platform_action', { p_actor_id: user.id, p_action: 'subscription.extend', p_target_type: 'organization', p_target_id: extendingOrg.id, p_details: { unit: extendMode, amount: extendAmount, days } });
      }
      setExtendingOrg(null);
      await load();
      setExtendSuccess(language === 'fr' ? `Accès prolongé avec succès.` : `Access extended successfully.`);
      setTimeout(() => setExtendSuccess(null), 4000);
    } finally {
      setExtending(false);
    }
  }

  async function deleteTenant(org: Organization) {
    if (!user) return;
    const confirmText = language === 'fr'
      ? `Supprimer définitivement "${org.name}" et toutes ses données (contacts, deals, factures, utilisateurs...) ? Cette action est irréversible.`
      : `Permanently delete "${org.name}" and all of its data (contacts, deals, invoices, users...)? This cannot be undone.`;
    if (!window.confirm(confirmText)) return;
    const { error } = await supabase.from('organizations').delete().eq('id', org.id);
    if (error) { alert(error.message); return; }
    await supabase.rpc('log_platform_action', { p_actor_id: user.id, p_action: 'tenant.delete', p_target_type: 'organization', p_target_id: org.id, p_details: { name: org.name } });
    await load();
  }

  if (loading) return <Loading />;

  const filtered = orgs.filter((o) => o.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animate-fade-in space-y-6">
      {extendSuccess && (
        <div className="flex items-center gap-2 rounded-lg border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-700">
          <CheckCircle2 size={16} className="flex-none" />
          <span>{extendSuccess}</span>
        </div>
      )}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-ink-900">{t('superAdmin.tenants', language)} ({orgs.length})</h2>
        <div className="relative w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input className="input pl-9" placeholder={t('superAdmin.searchTenants', language)} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">{t('superAdmin.organization', language)}</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">{t('superAdmin.plan', language)}</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">{t('superAdmin.currency', language)}</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">{t('superAdmin.country', language)}</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">{t('superAdmin.trialEnds', language)}</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">{t('superAdmin.created', language)}</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">{t('superAdmin.status', language)}</th>
              <th className="px-4 py-3 text-right font-semibold text-ink-700">{t('superAdmin.actions', language)}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-t border-ink-100 hover:bg-ink-50/50">
                <td className="px-4 py-3 font-medium text-ink-900">{o.name}</td>
                <td className="px-4 py-3">
                  <select
                    value={o.plan}
                    onChange={(e) => changePlan(o.id, o.name, e.target.value)}
                    className="rounded-full border border-transparent bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary-700 capitalize cursor-pointer hover:border-primary-300"
                    title={t('superAdmin.changePlan', language)}
                  >
                    <option value="starter">Starter</option>
                    <option value="growth">Growth</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-ink-600">{o.currency}</td>
                <td className="px-4 py-3 text-ink-600">{o.country || '—'}</td>
                <td className="px-4 py-3 text-ink-600">{o.trial_ends_at ? new Date(o.trial_ends_at).toLocaleDateString() : '—'}</td>
                <td className="px-4 py-3 text-ink-500">{new Date(o.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${o.status === 'suspended' ? 'bg-error-50 text-error-700' : 'bg-success-50 text-success-700'}`}>
                    {o.status || 'active'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openExtendModal(o)} className="btn-ghost btn-sm" title={language === 'fr' ? "Prolonger l'accès" : 'Extend access'}><CalendarPlus size={14} /></button>
                    <button onClick={() => toggleSuspend(o.id, o.status || 'active')} className="btn-ghost btn-sm" title={o.status === 'suspended' ? t('superAdmin.reactivate', language) : t('superAdmin.suspend', language)}><Ban size={14} /></button>
                    <button onClick={() => deleteTenant(o)} className="btn-ghost btn-sm text-error-600 hover:bg-error-50" title={t('superAdmin.deleteTenant', language)}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card overflow-hidden">
        <h3 className="px-4 py-3 font-bold text-ink-800 border-b border-ink-100">{t('superAdmin.allUsers', language)} ({profiles.length})</h3>
        <table className="w-full text-sm">
          <thead className="bg-ink-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">{t('superAdmin.name', language)}</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">{t('superAdmin.email', language)}</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">{t('superAdmin.role', language)}</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">{t('superAdmin.active', language)}</th>
            </tr>
          </thead>
          <tbody>
            {profiles.slice(0, 50).map((p) => (
              <tr key={p.id} className="border-t border-ink-100">
                <td className="px-4 py-3 font-medium text-ink-900">{p.first_name} {p.last_name}</td>
                <td className="px-4 py-3 text-ink-600">{p.email}</td>
                <td className="px-4 py-3"><span className="capitalize text-ink-700">{p.role}</span></td>
                <td className="px-4 py-3">{p.active ? <CheckCircle2 size={16} className="text-success-500" /> : <Ban size={16} className="text-error-500" />}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {profiles.length > 50 && <p className="px-4 py-2 text-xs text-ink-400">{language === 'fr' ? `Affichage des 50 premiers sur ${profiles.length}` : `Showing first 50 of ${profiles.length}`}</p>}
      </div>

      <Modal open={!!extendingOrg} onClose={() => setExtendingOrg(null)} title={language === 'fr' ? `Prolonger l'accès — ${extendingOrg?.name}` : `Extend access — ${extendingOrg?.name}`}>
        {extendingOrg && (
          <div className="space-y-4">
            <p className="text-sm text-ink-500">
              {language === 'fr' ? 'Expiration actuelle : ' : 'Current expiration: '}
              <span className="font-medium text-ink-800">{extendingOrg.trial_ends_at ? new Date(extendingOrg.trial_ends_at).toLocaleString() : (language === 'fr' ? 'Aucune' : 'None')}</span>
            </p>
            <div className="grid grid-cols-4 gap-2">
              {(['days', 'months', 'years', 'date'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setExtendMode(mode)}
                  className={`btn-sm ${extendMode === mode ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {mode === 'days' && (language === 'fr' ? 'Jours' : 'Days')}
                  {mode === 'months' && (language === 'fr' ? 'Mois' : 'Months')}
                  {mode === 'years' && (language === 'fr' ? 'Années' : 'Years')}
                  {mode === 'date' && (language === 'fr' ? 'Date' : 'Date')}
                </button>
              ))}
            </div>
            {extendMode === 'date' ? (
              <div>
                <label className="label">{language === 'fr' ? "Nouvelle date d'expiration" : 'New expiration date'}</label>
                <input type="date" className="input" value={extendDate} onChange={e => setExtendDate(e.target.value)} min={new Date().toISOString().slice(0, 10)} />
              </div>
            ) : (
              <div>
                <label className="label">
                  {language === 'fr' ? `Ajouter combien de ${extendMode === 'days' ? 'jours' : extendMode === 'months' ? 'mois' : 'années'} ?` : `Add how many ${extendMode}?`}
                </label>
                <input type="number" min={1} className="input" value={extendAmount} onChange={e => setExtendAmount(Math.max(1, Number(e.target.value) || 1))} />
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setExtendingOrg(null)} className="btn-secondary btn-sm">{t('common.cancel', language)}</button>
              <button onClick={submitExtend} disabled={extending} className="btn-primary btn-sm">
                {extending ? <Loader2 size={14} className="animate-spin" /> : <Calendar size={14} />} {language === 'fr' ? 'Appliquer' : 'Apply'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Subscriptions Management
   ═══════════════════════════════════════════════════════════ */
interface SubscriptionRecord {
  id: string;
  plan: string;
  status: string;
  price_cents: number;
  currency?: string;
  billing_cycle?: string;
  current_period_end?: string | null;
  flutterwave_tx_ref?: string | null;
  organizations?: { name?: string } | null;
}

export function SuperAdminSubscriptionsPage() {
  const { language } = useAuth();
  const [subs, setSubs] = useState<SubscriptionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('subscriptions').select('*, organizations(name)').order('created_at', { ascending: false }).then(({ data }) => {
      setSubs(data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-xl font-bold text-ink-900">{t('superAdmin.subscriptions', language)} ({subs.length})</h2>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">{t('superAdmin.tenant', language)}</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">{t('superAdmin.plan', language)}</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">{t('superAdmin.status', language)}</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">{t('superAdmin.amount', language)}</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">{t('superAdmin.cycle', language)}</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">{t('superAdmin.periodEnd', language)}</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">{t('superAdmin.txRef', language)}</th>
            </tr>
          </thead>
          <tbody>
            {subs.map((s) => (
              <tr key={s.id} className="border-t border-ink-100">
                <td className="px-4 py-3 font-medium text-ink-900">{s.organizations?.name || '—'}</td>
                <td className="px-4 py-3 capitalize text-ink-700">{s.plan}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${s.status === 'active' ? 'bg-success-100 text-success-700' : s.status === 'trialing' ? 'bg-warning-100 text-warning-700' : 'bg-error-100 text-error-700'}`}>{s.status}</span>
                </td>
                <td className="px-4 py-3 text-ink-600">{formatMoney(s.price_cents, s.currency || 'USD', language)}</td>
                <td className="px-4 py-3 text-ink-600">{s.billing_cycle}</td>
                <td className="px-4 py-3 text-ink-500">{s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : '—'}</td>
                <td className="px-4 py-3 text-xs text-ink-400 font-mono">{s.flutterwave_tx_ref || '—'}</td>
              </tr>
            ))}
            {subs.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-ink-400">{t('superAdmin.noSubs', language)}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Analytics
   ═══════════════════════════════════════════════════════════ */
export function SuperAdminAnalyticsPage() {
  const { language } = useAuth();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.rpc('get_platform_stats').then(({ data, error }) => {
      if (!error) setStats((data && data[0]) || null);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-xl font-bold text-ink-900">{t('superAdmin.platformAnalytics', language)}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6">
          <DollarSign className="text-success-600" size={24} />
          <p className="mt-3 text-3xl font-bold text-ink-900">{formatMoney(stats?.mrr_cents ?? 0, 'USD', language)}</p>
          <p className="text-sm text-ink-500">{t('superAdmin.mrrLabel', language)}</p>
        </div>
        <div className="card p-6">
          <TrendingUp className="text-primary-600" size={24} />
          <p className="mt-3 text-3xl font-bold text-ink-900">{formatMoney((stats?.mrr_cents ?? 0) * 12, 'USD', language)}</p>
          <p className="text-sm text-ink-500">{t('superAdmin.arrLabel', language)}</p>
        </div>
        <div className="card p-6">
          <Activity className="text-warning-600" size={24} />
          <p className="mt-3 text-3xl font-bold text-ink-900">{stats?.active_trials ?? 0}</p>
          <p className="text-sm text-ink-500">{t('superAdmin.activeTrials', language)}</p>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-bold text-ink-800 mb-4">{t('superAdmin.growthMetrics', language)}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><p className="text-2xl font-bold text-ink-900">{stats?.total_orgs ?? 0}</p><p className="text-xs text-ink-500">{t('superAdmin.totalTenants', language)}</p></div>
          <div><p className="text-2xl font-bold text-ink-900">{stats?.total_users ?? 0}</p><p className="text-xs text-ink-500">{t('superAdmin.totalUsers', language)}</p></div>
          <div><p className="text-2xl font-bold text-ink-900">{stats?.new_orgs_30d ?? 0}</p><p className="text-xs text-ink-500">{t('superAdmin.new30days', language)}</p></div>
          <div><p className="text-2xl font-bold text-ink-900">{stats?.active_subs ?? 0}</p><p className="text-xs text-ink-500">{t('superAdmin.activeSubscriptions', language)}</p></div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Employee KPIs
   ═══════════════════════════════════════════════════════════ */
interface EmployeeKpiRecord {
  id: string;
  employee_email: string;
  employee_name?: string;
  period: string;
  target_revenue_cents: number;
  actual_revenue_cents?: number;
  target_deals?: number;
  activity_score?: number;
}

export function SuperAdminEmployeesPage() {
  const { language } = useAuth();
  const [kpis, setKpis] = useState<EmployeeKpiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ employee_email: '', employee_name: '', period: '', target_revenue: '', target_deals: '' });

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from('employee_kpis').select('*').order('created_at', { ascending: false });
    setKpis(data || []);
    setLoading(false);
  }

  async function addKpi() {
    if (!form.employee_email || !form.period) return;
    const { error } = await supabase.from('employee_kpis').insert({
      employee_email: form.employee_email,
      employee_name: form.employee_name,
      period: form.period,
      target_revenue_cents: parseInt(form.target_revenue) * 100 || 0,
      target_deals: parseInt(form.target_deals) || 0,
    });
    if (error) { alert(error.message); return; }
    setForm({ employee_email: '', employee_name: '', period: '', target_revenue: '', target_deals: '' });
    setShowForm(false);
    await load();
  }

  if (loading) return <Loading />;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-ink-900">{t('superAdmin.employeeKpis', language)}</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary btn-sm"><Plus size={14} /> {t('superAdmin.addKpi', language)}</button>
      </div>

      {showForm && (
        <div className="card p-6 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">{t('superAdmin.employeeEmail', language)}</label><input className="input" value={form.employee_email} onChange={(e) => setForm({ ...form, employee_email: e.target.value })} /></div>
            <div><label className="label">{t('superAdmin.employeeName', language)}</label><input className="input" value={form.employee_name} onChange={(e) => setForm({ ...form, employee_name: e.target.value })} /></div>
            <div><label className="label">{t('superAdmin.period', language)}</label><input className="input" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} /></div>
            <div><label className="label">{t('superAdmin.targetRevenue', language)}</label><input className="input" type="number" value={form.target_revenue} onChange={(e) => setForm({ ...form, target_revenue: e.target.value })} /></div>
            <div><label className="label">{t('superAdmin.targetDeals', language)}</label><input className="input" type="number" value={form.target_deals} onChange={(e) => setForm({ ...form, target_deals: e.target.value })} /></div>
          </div>
          <button onClick={addKpi} className="btn-primary btn-sm">{t('superAdmin.saveKpi', language)}</button>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">{t('superAdmin.employee', language)}</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">{t('superAdmin.period', language)}</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">{t('superAdmin.targetRev', language)}</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">{t('superAdmin.actualRev', language)}</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">{t('superAdmin.targetDeals', language)}</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">{t('superAdmin.activityScore', language)}</th>
            </tr>
          </thead>
          <tbody>
            {kpis.map((k) => (
              <tr key={k.id} className="border-t border-ink-100">
                <td className="px-4 py-3"><p className="font-medium text-ink-900">{k.employee_name}</p><p className="text-xs text-ink-400">{k.employee_email}</p></td>
                <td className="px-4 py-3 text-ink-600">{k.period}</td>
                <td className="px-4 py-3 text-ink-600">{formatMoney(k.target_revenue_cents, 'USD', language)}</td>
                <td className="px-4 py-3 text-ink-600">{formatMoney(k.actual_revenue_cents ?? 0, 'USD', language)}</td>
                <td className="px-4 py-3 text-ink-600">{k.target_deals}</td>
                <td className="px-4 py-3"><span className="font-semibold text-primary-600">{k.activity_score || 0}</span></td>
              </tr>
            ))}
            {kpis.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-ink-400">{t('superAdmin.noKpis', language)}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Sales Codes (commercial tracking)
   ═══════════════════════════════════════════════════════════ */
interface SalesCodeRecord {
  id: string;
  code: string;
  salesperson_name: string;
  salesperson_email: string;
  uses_count?: number;
  max_uses?: number | null;
  active: boolean;
  created_at: string;
}

export function SuperAdminSalesCodesPage() {
  const { user, language } = useAuth();
  const [codes, setCodes] = useState<SalesCodeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ salesperson_email: '', salesperson_name: '', max_uses: '' });

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from('sales_codes').select('*').order('created_at', { ascending: false });
    setCodes(data || []);
    setLoading(false);
  }

  async function addCode() {
    if (!form.salesperson_email || !form.salesperson_name || !user) return;
    const code = `ATLAS-${form.salesperson_name.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const { error } = await supabase.from('sales_codes').insert({
      code,
      salesperson_email: form.salesperson_email,
      salesperson_name: form.salesperson_name,
      max_uses: form.max_uses ? parseInt(form.max_uses) : null,
    });
    if (error) { alert(error.message); return; }
    setForm({ salesperson_email: '', salesperson_name: '', max_uses: '' });
    setShowForm(false);
    await load();
  }

  if (loading) return <Loading />;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink-900">{t('superAdmin.salesCodes', language)}</h2>
          <p className="text-sm text-ink-500">{t('superAdmin.trackReferrals', language)}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary btn-sm"><Plus size={14} /> {t('superAdmin.generateCode', language)}</button>
      </div>

      {showForm && (
        <div className="card p-6 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">{t('superAdmin.salespersonEmail', language)}</label><input className="input" value={form.salesperson_email} onChange={(e) => setForm({ ...form, salesperson_email: e.target.value })} /></div>
            <div><label className="label">{t('superAdmin.salespersonName', language)}</label><input className="input" value={form.salesperson_name} onChange={(e) => setForm({ ...form, salesperson_name: e.target.value })} /></div>
            <div><label className="label">{t('superAdmin.maxUses', language)}</label><input className="input" type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} /></div>
          </div>
          <button onClick={addCode} className="btn-primary btn-sm">{t('superAdmin.generate', language)}</button>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">{language === 'fr' ? 'Code' : 'Code'}</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">{t('superAdmin.salesperson', language)}</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">{t('superAdmin.uses', language)}</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">{t('superAdmin.status', language)}</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">{t('superAdmin.created', language)}</th>
            </tr>
          </thead>
          <tbody>
            {codes.map((c) => (
              <tr key={c.id} className="border-t border-ink-100">
                <td className="px-4 py-3 font-mono font-bold text-primary-600">{c.code}</td>
                <td className="px-4 py-3"><p className="font-medium text-ink-900">{c.salesperson_name}</p><p className="text-xs text-ink-400">{c.salesperson_email}</p></td>
                <td className="px-4 py-3 text-ink-600">{c.uses_count}{c.max_uses ? ` / ${c.max_uses}` : ''}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${c.active ? 'bg-success-100 text-success-700' : 'bg-ink-100 text-ink-500'}`}>{c.active ? t('status.active', language) : t('status.inactive', language)}</span></td>
                <td className="px-4 py-3 text-ink-500">{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {codes.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-ink-400">{t('superAdmin.noCodes', language)}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Permissions (RBAC management — platform scope)
   ═══════════════════════════════════════════════════════════ */
export function SuperAdminPermissionsPage() {
  const { language } = useAuth();
  const [roles, setRoles] = useState<RbacRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<RbacRole | null>(null);
  const [perms, setPerms] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadRoles(); }, []);

  async function loadRoles() {
    const data = await fetchRoles(null); // platform-level roles
    setRoles(data);
    setLoading(false);
  }

  async function selectRole(role: RbacRole) {
    setSelectedRole(role);
    const rolePerms = await fetchPermissions([role.id]);
    const map: Record<string, boolean> = {};
    rolePerms.forEach((p) => { map[`${p.module}:${p.action}`] = true; });
    setPerms(map);
  }

  async function savePermissions() {
    if (!selectedRole) return;
    const permList = Object.entries(perms).filter(([, v]) => v).map(([k]) => {
      const [module, action] = k.split(':') as [PermissionModule, PermissionAction];
      return { module, action };
    });
    await setRolePermissions(selectedRole.id, permList);
    alert(language === 'fr' ? 'Permissions enregistrées' : 'Permissions saved');
  }

  if (loading) return <Loading />;

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-xl font-bold text-ink-900">{t('superAdmin.platformPermissions', language)}</h2>
      <p className="text-sm text-ink-500">{t('superAdmin.permissionsDesc', language)} <code className="bg-ink-100 px-1 rounded">rbac_check()</code> SQL function.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-4">
          <h3 className="font-bold text-ink-800 mb-3">{t('superAdmin.roles', language)}</h3>
          <div className="space-y-1">
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => selectRole(r)}
                className={`w-full text-left px-3 py-2 rounded-lg transition ${selectedRole?.id === r.id ? 'bg-primary-50 text-primary-700' : 'hover:bg-ink-50 text-ink-700'}`}
              >
                <p className="font-medium text-sm">{r.name}</p>
                <p className="text-xs text-ink-400 capitalize">{r.scope} · {r.is_system ? (language === 'fr' ? 'Système' : 'System') : (language === 'fr' ? 'Personnalisé' : 'Custom')}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 card p-6">
          {selectedRole ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-ink-800">{selectedRole.name} {t('superAdmin.permissions', language)}</h3>
                <button onClick={savePermissions} className="btn-primary btn-sm">{t('superAdmin.save', language)}</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-ink-100">
                      <th className="text-left py-2 font-semibold text-ink-700">{language === 'fr' ? 'Module' : 'Module'}</th>
                      {ACTIONS.map((a) => <th key={a.key} className="px-3 py-2 text-center font-semibold text-ink-700">{a.label[language === 'fr' ? 'fr' : 'en']}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {MODULES.map((m) => (
                      <tr key={m.key} className="border-b border-ink-50">
                        <td className="py-2 font-medium text-ink-700">{m.label[language === 'fr' ? 'fr' : 'en']}</td>
                        {ACTIONS.map((a) => (
                          <td key={a.key} className="px-3 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={perms[`${m.key}:${a.key}`] || false}
                              onChange={(e) => setPerms({ ...perms, [`${m.key}:${a.key}`]: e.target.checked })}
                              className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <EmptyState icon={<ShieldCheck size={28} />} title={t('superAdmin.selectRole', language)} description={t('superAdmin.selectRoleDesc', language)} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Audit Log (immutable platform actions)
   ═══════════════════════════════════════════════════════════ */
interface AuditLogRecord {
  id: string;
  created_at: string;
  actor_email?: string;
  action: string;
  target_email?: string | null;
  target_id?: string | null;
}

interface PlatformStaffRole {
  id: string;
  name: string;
  description?: string | null;
  permissions: Record<string, unknown>;
  is_system: boolean;
}

interface PlatformStaffRecord {
  id: string;
  user_id?: string | null;
  email: string;
  full_name: string;
  role_id?: string | null;
  role_name: string;
  department?: string | null;
  phone?: string | null;
  active: boolean;
  exempt_from_billing: boolean;
  hired_at?: string | null;
  created_at?: string;
}

export function SuperAdminAuditPage() {
  const { language } = useAuth();
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('platform_audit_log').select('*').order('created_at', { ascending: false }).limit(100).then(({ data }) => {
      setLogs(data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-xl font-bold text-ink-900">{t('superAdmin.platformAuditLog', language)}</h2>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">{t('superAdmin.timestamp', language)}</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">{t('superAdmin.actor', language)}</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">{t('superAdmin.action', language)}</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">{t('superAdmin.target', language)}</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-t border-ink-100">
                <td className="px-4 py-3 text-ink-500 text-xs">{new Date(l.created_at).toLocaleString()}</td>
                <td className="px-4 py-3 text-ink-700">{l.actor_email}</td>
                <td className="px-4 py-3"><code className="bg-primary-50 text-primary-700 px-2 py-0.5 rounded text-xs">{l.action}</code></td>
                <td className="px-4 py-3 text-ink-600">{l.target_email || l.target_id || '—'}</td>
              </tr>
            ))}
            {logs.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-ink-400">{t('superAdmin.noAudit', language)}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Staff Management (platform staff with custom roles)
   ═══════════════════════════════════════════════════════════ */
export function SuperAdminStaffPage() {
  const { user, language } = useAuth();
  const [staff, setStaff] = useState<PlatformStaffRecord[]>([]);
  const [roles, setRoles] = useState<PlatformStaffRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<PlatformStaffRecord | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', full_name: '', role_id: '', department: '', phone: '' });
  const [roleForm, setRoleForm] = useState({ name: '', description: '' });

  useEffect(() => { load(); }, []);

  async function load() {
    const [{ data: staffData }, { data: roleData }] = await Promise.all([
      supabase.from('platform_staff').select('*').order('created_at', { ascending: false }),
      supabase.from('platform_staff_roles').select('*').order('name'),
    ]);
    setStaff(staffData || []);
    setRoles(roleData || []);
    setLoading(false);
  }

  async function addStaff() {
    if (!form.email.trim() || !form.full_name.trim() || !user) return;
    setBusy(true); setError('');
    const selectedRole = roles.find((r) => r.id === form.role_id);
    const { error: err } = await supabase.from('platform_staff').insert({
      email: form.email.trim().toLowerCase(),
      full_name: form.full_name.trim(),
      role_id: form.role_id || null,
      role_name: selectedRole?.name || 'Support Agent',
      department: form.department || null,
      phone: form.phone || null,
      exempt_from_billing: true,
      created_by: user.id,
    });
    if (err) {
      setError(err.message.includes('duplicate') ? (language === 'fr' ? 'Cet email existe déjà' : 'This email already exists') : err.message);
    } else {
      await supabase.rpc('log_platform_action', { p_actor_id: user.id, p_action: 'staff.add', p_target_type: 'platform_staff', p_target_email: form.email.trim().toLowerCase() });
      setForm({ email: '', full_name: '', role_id: '', department: '', phone: '' });
      setShowForm(false);
      await load();
    }
    setBusy(false);
  }

  async function updateStaff() {
    if (!editingStaff || !user) return;
    setBusy(true); setError('');
    const selectedRole = roles.find((r) => r.id === form.role_id);
    const { error: err } = await supabase.from('platform_staff').update({
      full_name: form.full_name.trim(),
      role_id: form.role_id || null,
      role_name: selectedRole?.name || 'Support Agent',
      department: form.department || null,
      phone: form.phone || null,
      updated_at: new Date().toISOString(),
    }).eq('id', editingStaff.id);
    if (err) { setError(err.message); }
    else {
      setEditingStaff(null);
      setForm({ email: '', full_name: '', role_id: '', department: '', phone: '' });
      await load();
    }
    setBusy(false);
  }

  async function toggleStaffActive(id: string, email: string, currentActive: boolean) {
    if (!user) return;
    const { error } = await supabase.from('platform_staff').update({ active: !currentActive, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) { alert(error.message); return; }
    await supabase.rpc('log_platform_action', { p_actor_id: user.id, p_action: currentActive ? 'staff.deactivate' : 'staff.activate', p_target_type: 'platform_staff', p_target_email: email });
    await load();
  }

  async function removeStaff(id: string, email: string) {
    if (!user) return;
    if (!confirm(language === 'fr' ? `Supprimer le membre du personnel ${email} ?` : `Remove staff member ${email}?`)) return;
    const { error } = await supabase.from('platform_staff').delete().eq('id', id);
    if (error) { alert(error.message); return; }
    await supabase.rpc('log_platform_action', { p_actor_id: user.id, p_action: 'staff.remove', p_target_type: 'platform_staff', p_target_email: email });
    await load();
  }

  async function addRole() {
    if (!roleForm.name.trim() || !user) return;
    setBusy(true); setError('');
    const { error: err } = await supabase.from('platform_staff_roles').insert({
      name: roleForm.name.trim(),
      description: roleForm.description || null,
      is_system: false,
      created_by: user.id,
    });
    if (err) { setError(err.message); }
    else {
      setRoleForm({ name: '', description: '' });
      setShowRoleForm(false);
      await load();
    }
    setBusy(false);
  }

  function startEdit(s: PlatformStaffRecord) {
    setEditingStaff(s);
    setForm({ email: s.email, full_name: s.full_name, role_id: s.role_id || '', department: s.department || '', phone: s.phone || '' });
    setShowForm(true);
  }

  if (loading) return <Loading />;

  const fr = language === 'fr';

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink-900">{fr ? 'Gestion du Personnel' : 'Staff Management'}</h2>
          <p className="text-sm text-ink-500">{fr ? 'Personnel de la plateforme avec rôles personnalisés — exempté de facturation' : 'Platform staff with custom roles — exempt from billing'}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowRoleForm(!showRoleForm)} className="btn-secondary btn-sm"><Plus size={14} /> {fr ? 'Nouveau Rôle' : 'New Role'}</button>
          <button onClick={() => { setShowForm(!showForm); setEditingStaff(null); setForm({ email: '', full_name: '', role_id: '', department: '', phone: '' }); }} className="btn-primary btn-sm"><UserPlus size={14} /> {fr ? 'Ajouter Personnel' : 'Add Staff'}</button>
        </div>
      </div>

      {error && <div className="rounded-lg bg-error-50 border border-error-200 px-4 py-2 text-sm text-error-700">{error}</div>}

      {/* Role creation form */}
      {showRoleForm && (
        <div className="card p-6 space-y-3">
          <h3 className="font-bold text-ink-800">{fr ? 'Créer un Rôle Personnalisé' : 'Create Custom Role'}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">{fr ? 'Nom du rôle' : 'Role name'}</label><input className="input" value={roleForm.name} onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })} /></div>
            <div><label className="label">{fr ? 'Description' : 'Description'}</label><input className="input" value={roleForm.description} onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })} /></div>
          </div>
          <button onClick={addRole} disabled={busy} className="btn-primary btn-sm">{busy ? <Loader2 size={14} className="animate-spin" /> : null} {fr ? 'Créer' : 'Create'}</button>
        </div>
      )}

      {/* Staff add/edit form */}
      {showForm && (
        <div className="card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-ink-800">{editingStaff ? (fr ? 'Modifier le Personnel' : 'Edit Staff') : (fr ? 'Ajouter un Membre du Personnel' : 'Add Staff Member')}</h3>
            <button onClick={() => { setShowForm(false); setEditingStaff(null); }} className="p-1.5 rounded-lg hover:bg-ink-100"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">{fr ? 'Email' : 'Email'}</label><input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} disabled={!!editingStaff} /></div>
            <div><label className="label">{fr ? 'Nom complet' : 'Full name'}</label><input className="input" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
            <div>
              <label className="label">{fr ? 'Rôle' : 'Role'}</label>
              <select className="input" value={form.role_id} onChange={(e) => setForm({ ...form, role_id: e.target.value })}>
                <option value="">{fr ? 'Sélectionner...' : 'Select...'}</option>
                {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div><label className="label">{fr ? 'Département' : 'Department'}</label><input className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
            <div><label className="label">{fr ? 'Téléphone' : 'Phone'}</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          </div>
          <button onClick={editingStaff ? updateStaff : addStaff} disabled={busy} className="btn-primary btn-sm">
            {busy ? <Loader2 size={14} className="animate-spin" /> : null} {editingStaff ? (fr ? 'Enregistrer' : 'Save') : (fr ? 'Ajouter' : 'Add')}
          </button>
        </div>
      )}

      {/* Staff list */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">{fr ? 'Nom' : 'Name'}</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">{fr ? 'Email' : 'Email'}</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">{fr ? 'Rôle' : 'Role'}</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">{fr ? 'Département' : 'Department'}</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">{fr ? 'Statut' : 'Status'}</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">{fr ? 'Facturation' : 'Billing'}</th>
              <th className="px-4 py-3 text-right font-semibold text-ink-700">{fr ? 'Actions' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id} className="border-t border-ink-100 hover:bg-ink-50/50">
                <td className="px-4 py-3 font-medium text-ink-900">{s.full_name}</td>
                <td className="px-4 py-3 text-ink-600">{s.email}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary-700">{s.role_name}</span></td>
                <td className="px-4 py-3 text-ink-600">{s.department || '—'}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${s.active ? 'bg-success-100 text-success-700' : 'bg-ink-100 text-ink-500'}`}>{s.active ? (fr ? 'Actif' : 'Active') : (fr ? 'Inactif' : 'Inactive')}</span></td>
                <td className="px-4 py-3"><span className="rounded-full bg-success-50 px-2 py-0.5 text-xs font-semibold text-success-600">{fr ? 'Exempté' : 'Exempt'}</span></td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => startEdit(s)} className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50" title={fr ? 'Modifier' : 'Edit'}><Pencil size={14} /></button>
                    <button onClick={() => toggleStaffActive(s.id, s.email, s.active)} className="p-1.5 rounded-lg text-warning-600 hover:bg-warning-50" title={fr ? 'Activer/Désactiver' : 'Toggle Active'}><Ban size={14} /></button>
                    <button onClick={() => removeStaff(s.id, s.email)} className="p-1.5 rounded-lg text-error-500 hover:bg-error-50" title={fr ? 'Supprimer' : 'Remove'}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {staff.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-ink-400">{fr ? 'Aucun membre du personnel. Ajoutez-en un pour commencer.' : 'No staff members yet. Add one to get started.'}</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Available roles */}
      <div className="card p-6">
        <h3 className="font-bold text-ink-800 mb-3">{fr ? 'Rôles Disponibles' : 'Available Roles'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {roles.map((r) => (
            <div key={r.id} className="rounded-lg border border-ink-100 p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-ink-800">{r.name}</p>
                {r.is_system && <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-bold text-ink-500">{fr ? 'SYSTÈME' : 'SYSTEM'}</span>}
              </div>
              <p className="mt-1 text-xs text-ink-500">{r.description || '—'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Accounting / Finance Dashboard (platform-level)
   ═══════════════════════════════════════════════════════════ */
interface PlatformExpenseRecord {
  id: string;
  category: string;
  description?: string | null;
  amount_cents: number;
  currency?: string;
  expense_date: string;
  vendor?: string | null;
  status?: string;
  created_at?: string;
}

interface PlatformRevenueRecord {
  id: string;
  source: string;
  category?: string;
  description?: string | null;
  amount_cents: number;
  currency?: string;
  revenue_date: string;
  org_id?: string | null;
  created_at?: string;
}

export function SuperAdminAccountingPage() {
  const { user, language } = useAuth();
  const [finance, setFinance] = useState<PlatformFinanceSummary | null>(null);
  const [expenses, setExpenses] = useState<PlatformExpenseRecord[]>([]);
  const [revenue, setRevenue] = useState<PlatformRevenueRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showRevenueForm, setShowRevenueForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ category: '', description: '', amount: '', vendor: '', expense_date: '' });
  const [revenueForm, setRevenueForm] = useState({ source: '', category: 'subscription', description: '', amount: '', revenue_date: '' });

  useEffect(() => { load(); }, []);

  async function load() {
    const [{ data: fin }, { data: exp }, { data: rev }] = await Promise.all([
      supabase.rpc('get_platform_finance_summary'),
      supabase.from('platform_expenses').select('*').order('expense_date', { ascending: false }).limit(50),
      supabase.from('platform_revenue').select('*').order('revenue_date', { ascending: false }).limit(50),
    ]);
    setFinance((fin && fin[0]) || null);
    setExpenses(exp || []);
    setRevenue(rev || []);
    setLoading(false);
  }

  async function addExpense() {
    if (!expenseForm.amount || !expenseForm.category || !user) return;
    setBusy(true);
    const { error } = await supabase.from('platform_expenses').insert({
      category: expenseForm.category,
      description: expenseForm.description || null,
      amount_cents: Math.round(parseFloat(expenseForm.amount) * 100),
      vendor: expenseForm.vendor || null,
      expense_date: expenseForm.expense_date || new Date().toISOString().split('T')[0],
      created_by: user.id,
    });
    if (error) { alert(error.message); setBusy(false); return; }
    await supabase.rpc('log_platform_action', { p_actor_id: user.id, p_action: 'expense.add', p_target_type: 'platform_expense', p_details: { amount: expenseForm.amount, category: expenseForm.category } });
    setExpenseForm({ category: '', description: '', amount: '', vendor: '', expense_date: '' });
    setShowExpenseForm(false);
    await load();
    setBusy(false);
  }

  async function addRevenue() {
    if (!revenueForm.amount || !revenueForm.source || !user) return;
    setBusy(true);
    const { error } = await supabase.from('platform_revenue').insert({
      source: revenueForm.source,
      category: revenueForm.category,
      description: revenueForm.description || null,
      amount_cents: Math.round(parseFloat(revenueForm.amount) * 100),
      revenue_date: revenueForm.revenue_date || new Date().toISOString().split('T')[0],
    });
    if (error) { alert(error.message); setBusy(false); return; }
    await supabase.rpc('log_platform_action', { p_actor_id: user.id, p_action: 'revenue.add', p_target_type: 'platform_revenue', p_details: { amount: revenueForm.amount, source: revenueForm.source } });
    setRevenueForm({ source: '', category: 'subscription', description: '', amount: '', revenue_date: '' });
    setShowRevenueForm(false);
    await load();
    setBusy(false);
  }

  async function deleteExpense(id: string) {
    if (!confirm(language === 'fr' ? 'Supprimer cette dépense ?' : 'Delete this expense?')) return;
    const { error } = await supabase.from('platform_expenses').delete().eq('id', id);
    if (error) { alert(error.message); return; }
    await load();
  }

  async function deleteRevenue(id: string) {
    if (!confirm(language === 'fr' ? 'Supprimer ce revenu ?' : 'Delete this revenue entry?')) return;
    const { error } = await supabase.from('platform_revenue').delete().eq('id', id);
    if (error) { alert(error.message); return; }
    await load();
  }

  if (loading) return <Loading />;

  const fr = language === 'fr';
  const netProfit = (finance?.revenue_mtd ?? 0) - (finance?.expenses_mtd ?? 0);
  const netTotal = (finance?.revenue_total ?? 0) - (finance?.expenses_total ?? 0);

  const expenseCategories = ['Salaries', 'Infrastructure', 'Marketing', 'Software', 'Office', 'Legal', 'Other'];
  const revenueCategories = ['subscription', 'one_time', 'service', 'other'];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink-900">{fr ? 'Comptabilité & Finance' : 'Accounting & Finance'}</h2>
          <p className="text-sm text-ink-500">{fr ? 'Gestion financière de la plateforme' : 'Platform financial management'}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowRevenueForm(!showRevenueForm)} className="btn-secondary btn-sm"><ArrowUpRight size={14} /> {fr ? 'Ajouter Revenu' : 'Add Revenue'}</button>
          <button onClick={() => setShowExpenseForm(!showExpenseForm)} className="btn-primary btn-sm"><ArrowDownRight size={14} /> {fr ? 'Ajouter Dépense' : 'Add Expense'}</button>
        </div>
      </div>

      {/* Finance summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 text-success-600"><ArrowUpRight size={20} /><span className="text-xs font-semibold uppercase tracking-wide">{fr ? 'Revenus du Mois' : 'Revenue MTD'}</span></div>
          <p className="mt-2 text-2xl font-bold text-ink-900">{formatMoney(finance?.revenue_mtd ?? 0, 'USD', language)}</p>
          <p className="text-xs text-ink-400">{finance?.revenue_count_mtd ?? 0} {fr ? 'entrées' : 'entries'}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 text-error-600"><ArrowDownRight size={20} /><span className="text-xs font-semibold uppercase tracking-wide">{fr ? 'Dépenses du Mois' : 'Expenses MTD'}</span></div>
          <p className="mt-2 text-2xl font-bold text-ink-900">{formatMoney(finance?.expenses_mtd ?? 0, 'USD', language)}</p>
          <p className="text-xs text-ink-400">{finance?.expense_count_mtd ?? 0} {fr ? 'entrées' : 'entries'}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 text-primary-600"><PiggyBank size={20} /><span className="text-xs font-semibold uppercase tracking-wide">{fr ? 'Profit Net du Mois' : 'Net Profit MTD'}</span></div>
          <p className={`mt-2 text-2xl font-bold ${netProfit >= 0 ? 'text-success-700' : 'text-error-700'}`}>{formatMoney(netProfit, 'USD', language)}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 text-accent-600"><Wallet size={20} /><span className="text-xs font-semibold uppercase tracking-wide">{fr ? 'Profit Net Total' : 'Total Net Profit'}</span></div>
          <p className={`mt-2 text-2xl font-bold ${netTotal >= 0 ? 'text-success-700' : 'text-error-700'}`}>{formatMoney(netTotal, 'USD', language)}</p>
        </div>
      </div>

      {/* MRR card */}
      <div className="card p-5 bg-gradient-to-r from-primary-50 to-accent-50 border-primary-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">{fr ? 'Revenu Mensuel Récurrent (MRR)' : 'Monthly Recurring Revenue (MRR)'}</p>
            <p className="mt-1 text-3xl font-bold text-primary-900">{formatMoney(finance?.subscription_mrr ?? 0, 'USD', language)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-ink-500">{fr ? 'ARR Projeté' : 'Projected ARR'}</p>
            <p className="text-xl font-bold text-primary-700">{formatMoney((finance?.subscription_mrr ?? 0) * 12, 'USD', language)}</p>
          </div>
        </div>
      </div>

      {/* Expense form */}
      {showExpenseForm && (
        <div className="card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-ink-800">{fr ? 'Nouvelle Dépense' : 'New Expense'}</h3>
            <button onClick={() => setShowExpenseForm(false)} className="p-1.5 rounded-lg hover:bg-ink-100"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="label">{fr ? 'Catégorie' : 'Category'}</label>
              <select className="input" value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}>
                <option value="">{fr ? 'Sélectionner...' : 'Select...'}</option>
                {expenseCategories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div><label className="label">{fr ? 'Montant (USD)' : 'Amount (USD)'}</label><input className="input" type="number" step="0.01" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} /></div>
            <div><label className="label">{fr ? 'Fournisseur' : 'Vendor'}</label><input className="input" value={expenseForm.vendor} onChange={(e) => setExpenseForm({ ...expenseForm, vendor: e.target.value })} /></div>
            <div><label className="label">{fr ? 'Description' : 'Description'}</label><input className="input" value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} /></div>
            <div><label className="label">{fr ? 'Date' : 'Date'}</label><input className="input" type="date" value={expenseForm.expense_date} onChange={(e) => setExpenseForm({ ...expenseForm, expense_date: e.target.value })} /></div>
          </div>
          <button onClick={addExpense} disabled={busy} className="btn-primary btn-sm">{busy ? <Loader2 size={14} className="animate-spin" /> : null} {fr ? 'Enregistrer' : 'Save'}</button>
        </div>
      )}

      {/* Revenue form */}
      {showRevenueForm && (
        <div className="card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-ink-800">{fr ? 'Nouveau Revenu' : 'New Revenue'}</h3>
            <button onClick={() => setShowRevenueForm(false)} className="p-1.5 rounded-lg hover:bg-ink-100"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div><label className="label">{fr ? 'Source' : 'Source'}</label><input className="input" value={revenueForm.source} onChange={(e) => setRevenueForm({ ...revenueForm, source: e.target.value })} /></div>
            <div>
              <label className="label">{fr ? 'Catégorie' : 'Category'}</label>
              <select className="input" value={revenueForm.category} onChange={(e) => setRevenueForm({ ...revenueForm, category: e.target.value })}>
                {revenueCategories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div><label className="label">{fr ? 'Montant (USD)' : 'Amount (USD)'}</label><input className="input" type="number" step="0.01" value={revenueForm.amount} onChange={(e) => setRevenueForm({ ...revenueForm, amount: e.target.value })} /></div>
            <div><label className="label">{fr ? 'Description' : 'Description'}</label><input className="input" value={revenueForm.description} onChange={(e) => setRevenueForm({ ...revenueForm, description: e.target.value })} /></div>
            <div><label className="label">{fr ? 'Date' : 'Date'}</label><input className="input" type="date" value={revenueForm.revenue_date} onChange={(e) => setRevenueForm({ ...revenueForm, revenue_date: e.target.value })} /></div>
          </div>
          <button onClick={addRevenue} disabled={busy} className="btn-primary btn-sm">{busy ? <Loader2 size={14} className="animate-spin" /> : null} {fr ? 'Enregistrer' : 'Save'}</button>
        </div>
      )}

      {/* Revenue and Expense tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue table */}
        <div className="card overflow-hidden">
          <h3 className="px-4 py-3 font-bold text-ink-800 border-b border-ink-100 flex items-center gap-2"><ArrowUpRight size={16} className="text-success-600" /> {fr ? 'Revenus Récents' : 'Recent Revenue'}</h3>
          <table className="w-full text-sm">
            <thead className="bg-ink-50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-ink-700">{fr ? 'Source' : 'Source'}</th>
                <th className="px-3 py-2 text-left font-semibold text-ink-700">{fr ? 'Montant' : 'Amount'}</th>
                <th className="px-3 py-2 text-left font-semibold text-ink-700">{fr ? 'Date' : 'Date'}</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {revenue.map((r) => (
                <tr key={r.id} className="border-t border-ink-100">
                  <td className="px-3 py-2"><p className="font-medium text-ink-900">{r.source}</p><p className="text-xs text-ink-400 capitalize">{r.category}</p></td>
                  <td className="px-3 py-2 font-semibold text-success-700">{formatMoney(r.amount_cents, r.currency || 'USD', language)}</td>
                  <td className="px-3 py-2 text-ink-500 text-xs">{new Date(r.revenue_date).toLocaleDateString()}</td>
                  <td className="px-3 py-2 text-right"><button onClick={() => deleteRevenue(r.id)} className="p-1 rounded text-error-400 hover:bg-error-50"><Trash2 size={12} /></button></td>
                </tr>
              ))}
              {revenue.length === 0 && <tr><td colSpan={4} className="px-3 py-6 text-center text-ink-400">{fr ? 'Aucun revenu enregistré' : 'No revenue recorded'}</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Expense table */}
        <div className="card overflow-hidden">
          <h3 className="px-4 py-3 font-bold text-ink-800 border-b border-ink-100 flex items-center gap-2"><ArrowDownRight size={16} className="text-error-600" /> {fr ? 'Dépenses Récentes' : 'Recent Expenses'}</h3>
          <table className="w-full text-sm">
            <thead className="bg-ink-50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-ink-700">{fr ? 'Catégorie' : 'Category'}</th>
                <th className="px-3 py-2 text-left font-semibold text-ink-700">{fr ? 'Montant' : 'Amount'}</th>
                <th className="px-3 py-2 text-left font-semibold text-ink-700">{fr ? 'Date' : 'Date'}</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id} className="border-t border-ink-100">
                  <td className="px-3 py-2"><p className="font-medium text-ink-900">{e.category}</p><p className="text-xs text-ink-400">{e.vendor || e.description || '—'}</p></td>
                  <td className="px-3 py-2 font-semibold text-error-700">{formatMoney(e.amount_cents, e.currency || 'USD', language)}</td>
                  <td className="px-3 py-2 text-ink-500 text-xs">{new Date(e.expense_date).toLocaleDateString()}</td>
                  <td className="px-3 py-2 text-right"><button onClick={() => deleteExpense(e.id)} className="p-1 rounded text-error-400 hover:bg-error-50"><Trash2 size={12} /></button></td>
                </tr>
              ))}
              {expenses.length === 0 && <tr><td colSpan={4} className="px-3 py-6 text-center text-ink-400">{fr ? 'Aucune dépense enregistrée' : 'No expenses recorded'}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
