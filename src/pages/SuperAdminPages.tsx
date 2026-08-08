import { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import {
  ShieldCheck, Users, Building2, CreditCard, BarChart3, UserCog,
  Receipt, ScrollText, Plus, Trash2, Ban, CheckCircle2, Loader2,
  AlertTriangle, TrendingUp, DollarSign, Activity, UserCheck, Search,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { t } from '@/lib/i18n';
import { formatMoney } from '@/lib/i18n-countries';
import { MODULES, ACTIONS, fetchRoles, createRole, deleteRole, setRolePermissions, type RbacRole, type PermissionModule, type PermissionAction } from '@/lib/rbac';
import { Loading } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';

const FOUNDER_EMAILS = ['vincentnogue@yahoo.com', 'vincentnogue2@gmail.com', 'webdxb1@gmail.com'];

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
          <h1 className="text-xl font-bold text-ink-900">Access Denied</h1>
          <p className="mt-2 text-sm text-ink-500">You do not have Super Admin privileges.</p>
          <button onClick={() => navigate('/app')} className="btn-primary mt-4">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const navItems = [
    { to: '/super-admin', label: 'Dashboard', icon: ShieldCheck, end: true },
    { to: '/super-admin/users', label: 'Users & Tenants', icon: Users },
    { to: '/super-admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
    { to: '/super-admin/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/super-admin/employees', label: 'Employee KPIs', icon: UserCog },
    { to: '/super-admin/sales-codes', label: 'Sales Codes', icon: Receipt },
    { to: '/super-admin/permissions', label: 'Permissions', icon: ShieldCheck },
    { to: '/super-admin/audit', label: 'Audit Log', icon: ScrollText },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-ink-50">
      <aside className="w-60 flex-shrink-0 bg-ink-950 text-white flex flex-col">
        <div className="flex items-center gap-2.5 px-4 h-14 border-b border-white/10">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
            <ShieldCheck size={18} />
          </div>
          <span className="font-bold text-lg">Super Admin</span>
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
            <Building2 size={18} /><span>Back to App</span>
          </button>
          <button onClick={() => { signOut(); navigate('/'); }} className="sidebar-item w-full text-left text-ink-400">
            <span>← {t('auth.login', language)}</span>
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b border-ink-100 flex items-center justify-between px-6">
          <h2 className="font-bold text-ink-900">Platform Control Center</h2>
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

/* ═══════════════════════════════════════════════════════════
   Super Admin Dashboard
   ═══════════════════════════════════════════════════════════ */
export function SuperAdminDashboard() {
  const { language } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.rpc('is_super_admin', { check_user_id: (await supabase.auth.getUser()).data.user?.id });
        if (!data) return;
      } catch { /* */ }
      // Fetch platform stats from view
      const { data: view } = await supabase.from('platform_stats').select('*').limit(1).maybeSingle();
      setStats(view);
      setLoading(false);
    })();
  }, []);

  if (loading) return <Loading />;

  const cards = [
    { label: 'Total Orgs', value: stats?.total_orgs ?? 0, icon: Building2, color: 'text-primary-600 bg-primary-50' },
    { label: 'Total Users', value: stats?.total_users ?? 0, icon: Users, color: 'text-success-600 bg-success-50' },
    { label: 'Active Subs', value: stats?.active_subs ?? 0, icon: CreditCard, color: 'text-warning-600 bg-warning-50' },
    { label: 'MRR', value: formatMoney(stats?.mrr_cents ?? 0, 'USD', language), icon: DollarSign, color: 'text-error-600 bg-error-50' },
    { label: 'Active Trials', value: stats?.active_trials ?? 0, icon: Activity, color: 'text-accent-600 bg-accent-50' },
    { label: 'New (30d)', value: stats?.new_orgs_30d ?? 0, icon: TrendingUp, color: 'text-secondary-600 bg-secondary-50' },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${c.color}`}><c.icon size={20} /></div>
            <p className="mt-3 text-2xl font-bold text-ink-900">{c.value}</p>
            <p className="text-xs text-ink-500">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-bold text-ink-800 mb-4">Plan Distribution</h3>
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
                <div className="h-2 bg-ink-100 rounded-full overflow-hidden"><div className="h-full bg-primary-500 rounded-full" style={{ width: `${pct}%` }} /></div>
              </div>
            );
          })}
        </div>
        <div className="card p-6">
          <h3 className="font-bold text-ink-800 mb-4">Super Admins</h3>
          <SuperAdminsList />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Super Admins List (add/remove with min-2 rule)
   ═══════════════════════════════════════════════════════════ */
function SuperAdminsList() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<any[]>([]);
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
      setError(err.message.includes('duplicate') ? 'Already a super admin' : err.message);
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
      setError('Cannot remove: minimum 2 active super admins required.');
      return;
    }
    const confirmMsg = isFounder
      ? `⚠️ FOUNDER PROTECTED ⚠️\n\nYou are about to remove founder ${email}.\nThis is a sensitive action. Type "CONFIRM" to proceed:`
      : `Remove super admin ${email}?`;
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
              {a.is_founder && <span className="rounded-full bg-warning-100 px-2 py-0.5 text-[10px] font-bold text-warning-700">FOUNDER</span>}
              {a.twofa_required && <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-bold text-primary-700">2FA</span>}
            </div>
            <button
              onClick={() => removeAdmin(a.id, a.email, a.is_founder)}
              disabled={busy}
              className="p-1.5 rounded-lg text-error-500 hover:bg-error-50 transition"
              title="Remove"
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
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Add
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-error-600">{error}</p>}
      <p className="mt-2 text-[11px] text-ink-400">Min. 2 active admins enforced. Founders require typed confirmation.</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Users & Tenants Management
   ═══════════════════════════════════════════════════════════ */
export function SuperAdminUsersPage() {
  const { user, language } = useAuth();
  const [orgs, setOrgs] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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
    await supabase.from('organizations').update({ /* no status column — use a flag */ }).eq('id', orgId);
    // Log impersonation/suspend action
    await supabase.rpc('log_platform_action', { p_actor_id: user.id, p_action: newStatus === 'suspended' ? 'user.suspend' : 'user.reactivate', p_target_type: 'organization', p_target_id: orgId });
    alert(`Tenant ${newStatus === 'suspended' ? 'suspended' : 'reactivated'} (demo — requires backend policy).`);
  }

  if (loading) return <Loading />;

  const filtered = orgs.filter((o) => o.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-ink-900">Tenants ({orgs.length})</h2>
        <div className="relative w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input className="input pl-9" placeholder="Search tenants..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">Organization</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">Plan</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">Currency</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">Country</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">Trial Ends</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">Created</th>
              <th className="px-4 py-3 text-right font-semibold text-ink-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-t border-ink-100 hover:bg-ink-50/50">
                <td className="px-4 py-3 font-medium text-ink-900">{o.name}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary-700 capitalize">{o.plan}</span></td>
                <td className="px-4 py-3 text-ink-600">{o.currency}</td>
                <td className="px-4 py-3 text-ink-600">{o.country || '—'}</td>
                <td className="px-4 py-3 text-ink-600">{o.trial_ends_at ? new Date(o.trial_ends_at).toLocaleDateString() : '—'}</td>
                <td className="px-4 py-3 text-ink-500">{new Date(o.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => toggleSuspend(o.id, 'active')} className="btn-ghost btn-sm" title="Suspend/Reactivate"><Ban size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card overflow-hidden">
        <h3 className="px-4 py-3 font-bold text-ink-800 border-b border-ink-100">All Users ({profiles.length})</h3>
        <table className="w-full text-sm">
          <thead className="bg-ink-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">Email</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">Role</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">Active</th>
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
        {profiles.length > 50 && <p className="px-4 py-2 text-xs text-ink-400">Showing first 50 of {profiles.length}</p>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Subscriptions Management
   ═══════════════════════════════════════════════════════════ */
export function SuperAdminSubscriptionsPage() {
  const { language } = useAuth();
  const [subs, setSubs] = useState<any[]>([]);
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
      <h2 className="text-xl font-bold text-ink-900">Subscriptions ({subs.length})</h2>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">Tenant</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">Plan</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">Amount</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">Cycle</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">Period End</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">Tx Ref</th>
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
              <tr><td colSpan={7} className="px-4 py-8 text-center text-ink-400">No subscriptions yet</td></tr>
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
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('platform_stats').select('*').limit(1).maybeSingle().then(({ data }) => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-xl font-bold text-ink-900">Platform Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6">
          <DollarSign className="text-success-600" size={24} />
          <p className="mt-3 text-3xl font-bold text-ink-900">{formatMoney(stats?.mrr_cents ?? 0, 'USD', language)}</p>
          <p className="text-sm text-ink-500">Monthly Recurring Revenue</p>
        </div>
        <div className="card p-6">
          <TrendingUp className="text-primary-600" size={24} />
          <p className="mt-3 text-3xl font-bold text-ink-900">{formatMoney((stats?.mrr_cents ?? 0) * 12, 'USD', language)}</p>
          <p className="text-sm text-ink-500">Annual Recurring Revenue (ARR)</p>
        </div>
        <div className="card p-6">
          <Activity className="text-warning-600" size={24} />
          <p className="mt-3 text-3xl font-bold text-ink-900">{stats?.active_trials ?? 0}</p>
          <p className="text-sm text-ink-500">Active Trials</p>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-bold text-ink-800 mb-4">Growth Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><p className="text-2xl font-bold text-ink-900">{stats?.total_orgs ?? 0}</p><p className="text-xs text-ink-500">Total Tenants</p></div>
          <div><p className="text-2xl font-bold text-ink-900">{stats?.total_users ?? 0}</p><p className="text-xs text-ink-500">Total Users</p></div>
          <div><p className="text-2xl font-bold text-ink-900">{stats?.new_orgs_30d ?? 0}</p><p className="text-xs text-ink-500">New (30 days)</p></div>
          <div><p className="text-2xl font-bold text-ink-900">{stats?.active_subs ?? 0}</p><p className="text-xs text-ink-500">Active Subscriptions</p></div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Employee KPIs
   ═══════════════════════════════════════════════════════════ */
export function SuperAdminEmployeesPage() {
  const { language } = useAuth();
  const [kpis, setKpis] = useState<any[]>([]);
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
    await supabase.from('employee_kpis').insert({
      employee_email: form.employee_email,
      employee_name: form.employee_name,
      period: form.period,
      target_revenue_cents: parseInt(form.target_revenue) * 100 || 0,
      target_deals: parseInt(form.target_deals) || 0,
    });
    setForm({ employee_email: '', employee_name: '', period: '', target_revenue: '', target_deals: '' });
    setShowForm(false);
    await load();
  }

  if (loading) return <Loading />;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-ink-900">Employee KPIs</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary btn-sm"><Plus size={14} /> Add KPI</button>
      </div>

      {showForm && (
        <div className="card p-6 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Employee Email</label><input className="input" value={form.employee_email} onChange={(e) => setForm({ ...form, employee_email: e.target.value })} /></div>
            <div><label className="label">Employee Name</label><input className="input" value={form.employee_name} onChange={(e) => setForm({ ...form, employee_name: e.target.value })} /></div>
            <div><label className="label">Period (e.g. 2026-Q3)</label><input className="input" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} /></div>
            <div><label className="label">Target Revenue ($)</label><input className="input" type="number" value={form.target_revenue} onChange={(e) => setForm({ ...form, target_revenue: e.target.value })} /></div>
            <div><label className="label">Target Deals</label><input className="input" type="number" value={form.target_deals} onChange={(e) => setForm({ ...form, target_deals: e.target.value })} /></div>
          </div>
          <button onClick={addKpi} className="btn-primary btn-sm">Save KPI</button>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">Employee</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">Period</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">Target Rev</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">Actual Rev</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">Target Deals</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">Activity Score</th>
            </tr>
          </thead>
          <tbody>
            {kpis.map((k) => (
              <tr key={k.id} className="border-t border-ink-100">
                <td className="px-4 py-3"><p className="font-medium text-ink-900">{k.employee_name}</p><p className="text-xs text-ink-400">{k.employee_email}</p></td>
                <td className="px-4 py-3 text-ink-600">{k.period}</td>
                <td className="px-4 py-3 text-ink-600">{formatMoney(k.target_revenue_cents, 'USD', language)}</td>
                <td className="px-4 py-3 text-ink-600">{formatMoney(k.actual_revenue_cents, 'USD', language)}</td>
                <td className="px-4 py-3 text-ink-600">{k.target_deals}</td>
                <td className="px-4 py-3"><span className="font-semibold text-primary-600">{k.activity_score || 0}</span></td>
              </tr>
            ))}
            {kpis.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-ink-400">No KPIs defined yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Sales Codes (commercial tracking)
   ═══════════════════════════════════════════════════════════ */
export function SuperAdminSalesCodesPage() {
  const { user } = useAuth();
  const [codes, setCodes] = useState<any[]>([]);
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
    await supabase.from('sales_codes').insert({
      code,
      salesperson_email: form.salesperson_email,
      salesperson_name: form.salesperson_name,
      max_uses: form.max_uses ? parseInt(form.max_uses) : null,
    });
    setForm({ salesperson_email: '', salesperson_name: '', max_uses: '' });
    setShowForm(false);
    await load();
  }

  if (loading) return <Loading />;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink-900">Sales Codes</h2>
          <p className="text-sm text-ink-500">Track commercial referrals and conversions</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary btn-sm"><Plus size={14} /> Generate Code</button>
      </div>

      {showForm && (
        <div className="card p-6 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Salesperson Email</label><input className="input" value={form.salesperson_email} onChange={(e) => setForm({ ...form, salesperson_email: e.target.value })} /></div>
            <div><label className="label">Salesperson Name</label><input className="input" value={form.salesperson_name} onChange={(e) => setForm({ ...form, salesperson_name: e.target.value })} /></div>
            <div><label className="label">Max Uses (blank = unlimited)</label><input className="input" type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} /></div>
          </div>
          <button onClick={addCode} className="btn-primary btn-sm">Generate</button>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">Code</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">Salesperson</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">Uses</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">Created</th>
            </tr>
          </thead>
          <tbody>
            {codes.map((c) => (
              <tr key={c.id} className="border-t border-ink-100">
                <td className="px-4 py-3 font-mono font-bold text-primary-600">{c.code}</td>
                <td className="px-4 py-3"><p className="font-medium text-ink-900">{c.salesperson_name}</p><p className="text-xs text-ink-400">{c.salesperson_email}</p></td>
                <td className="px-4 py-3 text-ink-600">{c.uses_count}{c.max_uses ? ` / ${c.max_uses}` : ''}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${c.active ? 'bg-success-100 text-success-700' : 'bg-ink-100 text-ink-500'}`}>{c.active ? 'Active' : 'Inactive'}</span></td>
                <td className="px-4 py-3 text-ink-500">{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {codes.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-ink-400">No sales codes generated yet</td></tr>}
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
    alert('Permissions saved');
  }

  if (loading) return <Loading />;

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-xl font-bold text-ink-900">Platform Permissions (RBAC)</h2>
      <p className="text-sm text-ink-500">Single permission engine for platform + tenant scope. Backend enforcement via <code className="bg-ink-100 px-1 rounded">rbac_check()</code> SQL function.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-4">
          <h3 className="font-bold text-ink-800 mb-3">Roles</h3>
          <div className="space-y-1">
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => selectRole(r)}
                className={`w-full text-left px-3 py-2 rounded-lg transition ${selectedRole?.id === r.id ? 'bg-primary-50 text-primary-700' : 'hover:bg-ink-50 text-ink-700'}`}
              >
                <p className="font-medium text-sm">{r.name}</p>
                <p className="text-xs text-ink-400 capitalize">{r.scope} · {r.is_system ? 'System' : 'Custom'}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 card p-6">
          {selectedRole ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-ink-800">{selectedRole.name} Permissions</h3>
                <button onClick={savePermissions} className="btn-primary btn-sm">Save</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-ink-100">
                      <th className="text-left py-2 font-semibold text-ink-700">Module</th>
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
            <EmptyState icon={<ShieldCheck size={28} />} title="Select a role" description="Choose a role from the left to manage its permissions." />
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Audit Log (immutable platform actions)
   ═══════════════════════════════════════════════════════════ */
export function SuperAdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
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
      <h2 className="text-xl font-bold text-ink-900">Platform Audit Log</h2>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">Timestamp</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">Actor</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">Action</th>
              <th className="px-4 py-3 text-left font-semibold text-ink-700">Target</th>
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
            {logs.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-ink-400">No audit entries yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
