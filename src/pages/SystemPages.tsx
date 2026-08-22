import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Factor } from '@supabase/supabase-js';
import { Bell, ScrollText, CreditCard, Gauge, Sparkles, ArrowRight, CheckCircle2, Loader2, Upload, ShieldCheck, Building2, User, Lock, Image as ImageIcon, Smartphone, Monitor } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { askAtlas } from '@/lib/askAtlas';
import { t } from '@/lib/i18n';
import { getErrorMessage } from '@/lib/errors';
import { initiateFlutterwaveCheckout, recordSubscription, isFlutterwaveConfigured } from '@/lib/flutterwave';
import { PageHeader, Badge, StatCard } from '@/components/ui';
import { EmptyState } from '@/components/EmptyState';
import { Loading } from '@/components/Loading';
import { COUNTRIES, CURRENCIES, TIMEZONES } from '@/lib/i18n-countries';
import { fetchRoles, createRole, deleteRole, setRolePermissions, fetchPermissions, MODULES, ACTIONS, type RbacRole, type PermissionModule, type PermissionAction } from '@/lib/rbac';
import { usePlanAccess } from '@/lib/plans';
import type { Notification, AuditLog, Organization, Profile } from '@/types';
import type { Language } from '@/lib/i18n';

export function NotificationsPage() {
  const { language, profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  async function load() {
    let query = supabase.from('notifications').select('*').order('created_at', { ascending: false });
    if (profile?.id) query = query.eq('user_id', profile.id);
    const { data } = await query;
    setNotifications((data || []) as Notification[]);
    setLoading(false);
  }

  async function markRead(id: string) {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
    if (error) { console.error('markRead failed:', error.message); return; }
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  async function markAllRead() {
    const unread = notifications.filter(n => !n.read);
    if (unread.length === 0) return;
    const { error } = await supabase.from('notifications').update({ read: true }).in('id', unread.map(n => n.id));
    if (error) { console.error('markAllRead failed:', error.message); return; }
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  async function clearAll() {
    if (!confirm(t('notif.clearConfirm', language))) return;
    let query = supabase.from('notifications').delete();
    if (profile?.id) query = query.eq('user_id', profile.id);
    await query;
    setNotifications([]);
  }

  if (loading) return <Loading text={t('common.loading', language)} />;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('nav.notifications', language)}
        subtitle=""
        actions={notifications.length > 0 ? (
          <div className="flex gap-2">
            {unreadCount > 0 && <button onClick={markAllRead} className="btn-secondary btn-sm">{t('notif.markAllRead', language)}</button>}
            <button onClick={clearAll} className="btn-secondary btn-sm">{t('notif.clearAll', language)}</button>
          </div>
        ) : undefined}
      />
      {notifications.length === 0 ? (
        <div className="card"><EmptyState icon={<Bell size={28} />} title={t('notif.noNotifications', language)} description={t('notif.caughtUp', language)} /></div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n.id} className={`card p-4 flex items-start gap-3 ${!n.read ? 'border-primary-200' : ''}`}>
              <div className={`h-2 w-2 rounded-full mt-2 flex-shrink-0 ${!n.read ? 'bg-primary-500' : 'bg-ink-300'}`} />
              <div className="flex-1">
                <p className="font-medium text-ink-800">{n.title}</p>
                {n.message && <p className="text-sm text-ink-500 mt-0.5">{n.message}</p>}
                <p className="text-xs text-ink-400 mt-1">{new Date(n.created_at).toLocaleString(language)}</p>
              </div>
              {!n.read && <button onClick={() => markRead(n.id)} className="text-xs text-primary-600 hover:underline">{t('notif.markRead', language)}</button>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AuditLogPage() {
  const { language } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100)
      .then(({ data }) => { setLogs((data || []) as AuditLog[]); setLoading(false); });
  }, []);

  if (loading) return <Loading text={t('common.loading', language)} />;

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('nav.auditLog', language)} subtitle="" />
      {logs.length === 0 ? (
        <div className="card"><EmptyState icon={<ScrollText size={28} />} title={t('audit.noLogs', language)} description={t('audit.logsDesc', language)} /></div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-ink-100 bg-ink-50/50">
              <th className="text-left text-xs font-semibold text-ink-500 uppercase px-4 py-3">{t('audit.actor', language)}</th>
              <th className="text-left text-xs font-semibold text-ink-500 uppercase px-4 py-3">{t('audit.action', language)}</th>
              <th className="text-left text-xs font-semibold text-ink-500 uppercase px-4 py-3">{t('audit.entity', language)}</th>
              <th className="text-left text-xs font-semibold text-ink-500 uppercase px-4 py-3">{t('audit.date', language)}</th>
            </tr></thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} className="border-b border-ink-50 last:border-0 table-row-hover">
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant={log.actor_type === 'ai' ? 'primary' : 'neutral'}>{log.actor_type}</Badge>
                      <span className="text-ink-700">{log.actor_name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-700">{log.action}</td>
                  <td className="px-4 py-3 text-sm text-ink-500">{log.entity_name || log.entity_type || '—'}</td>
                  <td className="px-4 py-3 text-sm text-ink-500">{new Date(log.created_at).toLocaleString(language)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function SettingsPage() {
  const { language, organization, profile, refreshOrg } = useAuth();
  const [activeTab, setActiveTab] = useState<'account' | 'profile' | 'branding' | 'roles' | 'security'>('account');

  const tabs = [
    { key: 'account' as const, label: language === 'fr' ? 'Compte' : 'Account', icon: Building2 },
    { key: 'profile' as const, label: language === 'fr' ? 'Profil' : 'Profile', icon: User },
    { key: 'branding' as const, label: language === 'fr' ? 'Branding' : 'Branding', icon: ImageIcon },
    { key: 'roles' as const, label: language === 'fr' ? 'Rôles & Permissions' : 'Roles & Permissions', icon: ShieldCheck },
    { key: 'security' as const, label: language === 'fr' ? 'Sécurité' : 'Security', icon: Lock },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('nav.settings', language)} subtitle="" />
      <div className="max-w-4xl">
        {/* Tab bar */}
        <div className="flex flex-wrap gap-1 mb-6 border-b border-ink-200">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition ${activeTab === tab.key ? 'border-primary-600 text-primary-600' : 'border-transparent text-ink-500 hover:text-ink-700'}`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'account' && <AccountTab language={language} organization={organization} onSave={refreshOrg} />}
        {activeTab === 'profile' && <ProfileTab language={language} profile={profile} />}
        {activeTab === 'branding' && <BrandingTab language={language} organization={organization} onSave={refreshOrg} />}
        {activeTab === 'roles' && <RolesPermissionsTab language={language} organization={organization} />}
        {activeTab === 'security' && <SecurityTab language={language} />}
      </div>
    </div>
  );
}

/* ── Account Tab ── */
function AccountTab({ language, organization, onSave }: { language: Language; organization: Organization | null; onSave: () => Promise<void> }) {
  const [org, setOrg] = useState<Organization | null>(organization);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setOrg(organization); }, [organization]);

  async function save() {
    setSaving(true); setSaved(false);
    if (org) {
      const { error } = await supabase.from('organizations').update({
        name: org.name, industry: org.industry, website: org.website,
        country: org.country, address: org.address, currency: org.currency, timezone: org.timezone,
      }).eq('id', org.id);
      if (!error) { setSaved(true); await onSave(); }
    }
    setSaving(false);
  }

  return (
    <div className="card p-6">
      <h3 className="font-bold text-ink-800 mb-4">{language === 'fr' ? 'Organisation' : 'Organization'}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">{language === 'fr' ? "Nom de l'entreprise" : 'Company Name'}</label>
          <input className="input" value={org?.name || ''} onChange={e => setOrg({ ...org!, name: e.target.value })} />
        </div>
        <div>
          <label className="label">{language === 'fr' ? 'Industrie' : 'Industry'}</label>
          <input className="input" value={org?.industry || ''} onChange={e => setOrg({ ...org!, industry: e.target.value })} />
        </div>
        <div>
          <label className="label">{language === 'fr' ? 'Site web' : 'Website'}</label>
          <input className="input" value={org?.website || ''} onChange={e => setOrg({ ...org!, website: e.target.value })} />
        </div>
        <div>
          <label className="label">{language === 'fr' ? 'Pays' : 'Country'}</label>
          <select className="input" value={org?.country || ''} onChange={e => setOrg({ ...org!, country: e.target.value })}>
            <option value="">{language === 'fr' ? 'Sélectionner...' : 'Select...'}</option>
            {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{language === 'fr' ? c.nameFr : c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">{language === 'fr' ? 'Devise' : 'Currency'}</label>
          <select className="input" value={org?.currency || 'USD'} onChange={e => setOrg({ ...org!, currency: e.target.value })}>
            {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code} — {c.symbol} ({c.name})</option>)}
          </select>
        </div>
        <div>
          <label className="label">{language === 'fr' ? 'Fuseau horaire' : 'Timezone'}</label>
          <select className="input" value={org?.timezone || 'UTC'} onChange={e => setOrg({ ...org!, timezone: e.target.value })}>
            {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="label">{language === 'fr' ? 'Adresse' : 'Address'}</label>
          <input className="input" value={org?.address || ''} onChange={e => setOrg({ ...org!, address: e.target.value })} />
        </div>
      </div>
      <div className="flex items-center gap-3 mt-4">
        <button onClick={save} disabled={saving} className="btn-primary btn-sm">{saving ? '...' : t('common.save', language)}</button>
        {saved && <span className="text-sm text-success-600">✓ {language === 'fr' ? 'Enregistré' : 'Saved'}</span>}
      </div>
    </div>
  );
}

/* ── Profile Tab ── */
function ProfileTab({ language, profile }: { language: Language; profile: Profile | null }) {
  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [lastName, setLastName] = useState(profile?.last_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFirstName(profile?.first_name || '');
    setLastName(profile?.last_name || '');
    setPhone(profile?.phone || '');
  }, [profile?.id, profile?.first_name, profile?.last_name, profile?.phone]);

  async function save() {
    if (!profile) return;
    setSaving(true); setSaved(false);
    const { error } = await supabase.from('profiles').update({ first_name: firstName, last_name: lastName, phone }).eq('id', profile.id);
    if (!error) setSaved(true);
    setSaving(false);
  }

  return (
    <div className="card p-6">
      <h3 className="font-bold text-ink-800 mb-4">{language === 'fr' ? 'Profil' : 'Profile'}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">{t('auth.firstName', language)}</label>
          <input className="input" value={firstName} onChange={e => setFirstName(e.target.value)} />
        </div>
        <div>
          <label className="label">{t('auth.lastName', language)}</label>
          <input className="input" value={lastName} onChange={e => setLastName(e.target.value)} />
        </div>
        <div>
          <label className="label">{t('common.email', language)}</label>
          <input className="input" defaultValue={profile?.email || ''} disabled />
        </div>
        <div>
          <label className="label">{t('common.phone', language)}</label>
          <input className="input" value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
      </div>
      <div className="flex items-center gap-3 mt-4">
        <button onClick={save} disabled={saving} className="btn-primary btn-sm">{saving ? '...' : t('common.save', language)}</button>
        {saved && <span className="text-sm text-success-600">✓ {language === 'fr' ? 'Enregistré' : 'Saved'}</span>}
      </div>
    </div>
  );
}

/* ── Branding Tab (conditional on plan) ── */
function BrandingTab({ language, organization, onSave }: { language: Language; organization: Organization | null; onSave: () => Promise<void> }) {
  const [logoUrl, setLogoUrl] = useState(organization?.logo_url || '');
  const [brandingEnabled, setBrandingEnabled] = useState(organization?.branding_enabled || false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { hasFeature: hasPlanFeature } = usePlanAccess();
  const brandingAllowed = hasPlanFeature('customBranding');

  useEffect(() => {
    setLogoUrl(organization?.logo_url || '');
    setBrandingEnabled(organization?.branding_enabled || false);
  }, [organization?.logo_url, organization?.branding_enabled]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !organization) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `logos/${organization.id}/logo.${ext}`;
    const { error: upErr } = await supabase.storage.from('branding').upload(path, file, { upsert: true });
    if (upErr) {
      // If bucket doesn't exist, store as data URL fallback
      const reader = new FileReader();
      reader.onload = () => setLogoUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      const { data } = supabase.storage.from('branding').getPublicUrl(path);
      setLogoUrl(data.publicUrl);
    }
    setUploading(false);
  }

  async function save() {
    if (!organization) return;
    setSaving(true); setSaved(false);
    const { error } = await supabase.from('organizations').update({
      logo_url: logoUrl, branding_enabled: brandingEnabled,
    }).eq('id', organization.id);
    if (!error) { setSaved(true); await onSave(); }
    setSaving(false);
  }

  if (!brandingAllowed) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <ImageIcon className="text-ink-400" size={24} />
          <h3 className="font-bold text-ink-800">{language === 'fr' ? 'Branding' : 'Branding'}</h3>
        </div>
        <div className="rounded-lg bg-ink-50 p-4 text-center">
          <p className="text-sm text-ink-600 mb-2">
            {language === 'fr'
              ? 'La personnalisation du logo est disponible sur les plans Growth, Pro et Enterprise.'
              : 'Custom logo branding is available on Growth, Pro, and Enterprise plans.'}
          </p>
          <button onClick={() => window.location.href = '/app/billing'} className="btn-primary btn-sm mt-2">
            {language === 'fr' ? 'Améliorer votre plan' : 'Upgrade your plan'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="font-bold text-ink-800 mb-4">{language === 'fr' ? 'Branding' : 'Branding'}</h3>
      <p className="text-sm text-ink-500 mb-4">
        {language === 'fr'
          ? "Téléchargez le logo de votre entreprise. Il remplacera le logo par défaut dans votre tableau de bord."
          : 'Upload your company logo. It will replace the default logo in your dashboard.'}
      </p>
      <div className="flex items-start gap-6">
        <div className="flex-shrink-0">
          <div className="h-24 w-24 rounded-lg border-2 border-dashed border-ink-200 flex items-center justify-center overflow-hidden bg-ink-50">
            {logoUrl ? <img src={logoUrl} alt="Logo" className="h-full w-full object-contain" /> : <ImageIcon className="text-ink-300" size={32} />}
          </div>
        </div>
        <div className="flex-1 space-y-4">
          <label className="btn-ghost btn-sm cursor-pointer inline-flex items-center gap-2">
            <Upload size={14} />
            {uploading ? (language === 'fr' ? 'Téléversement...' : 'Uploading...') : (language === 'fr' ? 'Choisir un fichier' : 'Choose file')}
            <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="hidden" />
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={brandingEnabled} onChange={e => setBrandingEnabled(e.target.checked)} className="h-4 w-4 rounded text-primary-600" />
            <span className="text-sm text-ink-700">{language === 'fr' ? 'Activer le branding personnalisé' : 'Enable custom branding'}</span>
          </label>
          <div className="flex items-center gap-3">
            <button onClick={save} disabled={saving} className="btn-primary btn-sm">{saving ? '...' : t('common.save', language)}</button>
            {saved && <span className="text-sm text-success-600">✓ {language === 'fr' ? 'Enregistré' : 'Saved'}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Roles & Permissions Tab (tenant scope) ── */
function RolesPermissionsTab({ language, organization }: { language: Language; organization: Organization | null }) {
  const [roles, setRoles] = useState<RbacRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<RbacRole | null>(null);
  const [perms, setPerms] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [showNewRole, setShowNewRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  useEffect(() => {
    if (organization) loadRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization?.id]);

  async function loadRoles() {
    if (!organization) return;
    const data = await fetchRoles(organization.id);
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

  async function handleCreateRole() {
    if (!organization || !newRoleName.trim()) return;
    const role = await createRole(organization.id, newRoleName, newRoleDesc);
    if (role) {
      setNewRoleName(''); setNewRoleDesc(''); setShowNewRole(false);
      await loadRoles();
    }
  }

  async function handleDeleteRole(role: RbacRole) {
    if (role.is_system) { alert(language === 'fr' ? 'Les rôles système ne peuvent pas être supprimés.' : 'System roles cannot be deleted.'); return; }
    if (!confirm(language === 'fr' ? `Supprimer le rôle ${role.name} ?` : `Delete role ${role.name}?`)) return;
    await deleteRole(role.id);
    if (selectedRole?.id === role.id) setSelectedRole(null);
    await loadRoles();
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-ink-800">{language === 'fr' ? 'Rôles' : 'Roles'}</h3>
          <button onClick={() => setShowNewRole(!showNewRole)} className="btn-ghost btn-sm">+</button>
        </div>
        {showNewRole && (
          <div className="mb-3 space-y-2 p-3 rounded-lg bg-ink-50">
            <input className="input" placeholder={language === 'fr' ? 'Nom du rôle' : 'Role name'} value={newRoleName} onChange={e => setNewRoleName(e.target.value)} />
            <input className="input" placeholder={language === 'fr' ? 'Description' : 'Description'} value={newRoleDesc} onChange={e => setNewRoleDesc(e.target.value)} />
            <button onClick={handleCreateRole} className="btn-primary btn-sm w-full">{language === 'fr' ? 'Créer' : 'Create'}</button>
          </div>
        )}
        <div className="space-y-1">
          {roles.map((r) => (
            <div key={r.id} className="flex items-center group">
              <button
                onClick={() => selectRole(r)}
                className={`flex-1 text-left px-3 py-2 rounded-lg transition ${selectedRole?.id === r.id ? 'bg-primary-50 text-primary-700' : 'hover:bg-ink-50 text-ink-700'}`}
              >
                <p className="font-medium text-sm">{r.name}</p>
                <p className="text-xs text-ink-400">{r.is_system ? (language === 'fr' ? 'Système' : 'System') : (language === 'fr' ? 'Personnalisé' : 'Custom')}</p>
              </button>
              {!r.is_system && (
                <button onClick={() => handleDeleteRole(r)} className="opacity-0 group-hover:opacity-100 p-1.5 text-error-500 hover:bg-error-50 rounded transition">
                  ×
                </button>
              )}
            </div>
          ))}
          {roles.length === 0 && <p className="text-xs text-ink-400 p-3">{language === 'fr' ? 'Aucun rôle. Les rôles par défaut sont créés automatiquement.' : 'No roles. Default roles are auto-created.'}</p>}
        </div>
      </div>

      <div className="md:col-span-2 card p-6">
        {selectedRole ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-ink-800">{selectedRole.name} — {language === 'fr' ? 'Permissions' : 'Permissions'}</h3>
              <button onClick={savePermissions} className="btn-primary btn-sm">{t('common.save', language)}</button>
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
                  {MODULES.filter(m => m.key !== 'super_admin').map((m) => (
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
            <p className="mt-4 text-xs text-ink-400">
              {language === 'fr'
                ? "Backend: les permissions sont vérifiées via la fonction SQL rbac_check(). L'application frontend est une heuristique rapide."
                : 'Backend: permissions enforced via rbac_check() SQL function. Frontend is a fast heuristic.'}
            </p>
          </>
        ) : (
          <EmptyState icon={<ShieldCheck size={28} />} title={language === 'fr' ? 'Sélectionner un rôle' : 'Select a role'} description={language === 'fr' ? 'Choisissez un rôle pour gérer ses permissions.' : 'Choose a role to manage its permissions.'} />
        )}
      </div>
    </div>
  );
}

/* ── Security Tab ── */
function SecurityTab({ language }: { language: Language }) {
  const [factors, setFactors] = useState<Factor[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [factorId, setFactorId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { loadFactors(); }, []);

  async function loadFactors() {
    setLoading(true);
    try {
      const { data } = await supabase.auth.mfa.listFactors();
      setFactors(data?.totp || []);
    } catch { /* ignore */ }
    setLoading(false);
  }

  async function startEnroll() {
    setError(''); setEnrolling(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', issuer: 'Atlas CRM' });
      if (error) { setError(error.message); setEnrolling(false); return; }
      setQrUrl(data.totp.qr_code || '');
      setFactorId(data.id);
    } catch (e) { setError(getErrorMessage(e)); setEnrolling(false); }
  }

  async function verifyEnroll() {
    setError('');
    try {
      const { data: challenge, error: cerr } = await supabase.auth.mfa.challenge({ factorId });
      if (cerr) { setError(cerr.message); return; }
      if (!challenge) { setError('MFA challenge failed'); return; }
      const { error: verr } = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.id, code: verifyCode });
      if (verr) { setError(verr.message); return; }
      setEnrolling(false); setQrUrl(''); setFactorId(''); setVerifyCode('');
      await loadFactors();
    } catch (e) { setError(getErrorMessage(e)); }
  }

  async function unenrollFactor(id: string) {
    const { error } = await supabase.auth.mfa.unenroll({ factorId: id });
    if (error) { setError(error.message); return; }
    await loadFactors();
  }

  async function signOutAll() {
    await supabase.auth.signOut({ scope: 'global' });
    window.location.href = '/auth';
  }

  if (loading) return <div className="card p-6 text-sm text-ink-500">{t('common.loading', language)}</div>;

  const has2FA = factors.some((f) => f.status === 'verified');

  return (
    <div className="space-y-6">
      {error && <div className="rounded-lg bg-error-50 border border-error-200 p-3 text-sm text-error-700">{error}</div>}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="text-ink-600" size={20} />
          <h3 className="font-bold text-ink-800">{language === 'fr' ? 'Authentification à deux facteurs (2FA)' : 'Two-Factor Authentication (2FA)'}</h3>
          {has2FA && <Badge variant="success">{language === 'fr' ? 'Activé' : 'Enabled'}</Badge>}
        </div>
        <p className="text-sm text-ink-500 mb-4">
          {language === 'fr'
            ? "Renforcez la sécurité de votre compte avec l'authentification à deux facteurs TOTP (Google Authenticator, Authy, etc.)."
            : 'Secure your account with TOTP two-factor authentication (Google Authenticator, Authy, etc.).'}
        </p>

        {enrolling ? (
          <div className="space-y-4">
            {qrUrl && (
              <div className="flex flex-col items-center gap-3 p-4 bg-ink-50 rounded-lg">
                <img src={qrUrl} alt="QR Code" className="w-48 h-48" />
                <p className="text-xs text-ink-500 text-center">
                  {language === 'fr' ? 'Scannez ce QR code avec votre application d\'authentification, puis entrez le code à 6 chiffres ci-dessous.' : 'Scan this QR code with your authenticator app, then enter the 6-digit code below.'}
                </p>
              </div>
            )}
            <input
              className="input"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              placeholder="123456"
              maxLength={6}
            />
            <div className="flex gap-2">
              <button onClick={verifyEnroll} disabled={verifyCode.length !== 6} className="btn-primary btn-sm">
                {language === 'fr' ? 'Vérifier et activer' : 'Verify & enable'}
              </button>
              <button onClick={() => { setEnrolling(false); setQrUrl(''); setFactorId(''); }} className="btn-secondary btn-sm">
                {t('common.cancel', language)}
              </button>
            </div>
          </div>
        ) : factors.length === 0 ? (
          <button onClick={startEnroll} className="btn-primary btn-sm">
            {language === 'fr' ? 'Activer 2FA' : 'Enable 2FA'}
          </button>
        ) : (
          <div className="space-y-2">
            {factors.map((f) => (
              <div key={f.id} className="flex items-center justify-between p-3 bg-ink-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Smartphone size={16} className="text-ink-500" />
                  <span className="text-sm font-medium text-ink-700">{f.friendly_name || 'Authenticator app'}</span>
                  <Badge variant={f.status === 'verified' ? 'success' : 'neutral'}>{f.status}</Badge>
                </div>
                <button onClick={() => unenrollFactor(f.id)} className="text-xs text-error-600 hover:underline">
                  {language === 'fr' ? 'Désactiver' : 'Remove'}
                </button>
              </div>
            ))}
            <button onClick={startEnroll} className="btn-secondary btn-sm mt-2">
              {language === 'fr' ? 'Ajouter un appareil' : 'Add another device'}
            </button>
          </div>
        )}
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheck className="text-ink-600" size={20} />
          <h3 className="font-bold text-ink-800">{language === 'fr' ? 'Sessions actives' : 'Active Sessions'}</h3>
        </div>
        <p className="text-sm text-ink-500 mb-4">
          {language === 'fr' ? 'Gérez vos sessions connectées sur différents appareils. Vous pouvez déconnecter toutes les autres sessions.' : 'Manage your active sessions across devices. You can sign out of all other sessions.'}
        </p>
        <div className="flex items-center justify-between p-3 bg-ink-50 rounded-lg mb-3">
          <div className="flex items-center gap-2">
            <Monitor size={16} className="text-ink-500" />
            <span className="text-sm font-medium text-ink-700">{language === 'fr' ? 'Cette session' : 'Current session'}</span>
          </div>
          <Badge variant="success">{language === 'fr' ? 'Actif' : 'Active'}</Badge>
        </div>
        <button onClick={signOutAll} className="btn-secondary btn-sm">
          {language === 'fr' ? 'Déconnecter toutes les sessions' : 'Sign out all sessions'}
        </button>
      </div>
    </div>
  );
}

export function BillingPage() {
  const { language, organization, session } = useAuth();
  const lang = language;
  const [currentPlan, setCurrentPlan] = useState(organization?.plan || 'starter');
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => { setCurrentPlan(organization?.plan || 'starter'); }, [organization?.plan]);

  const plans = [
    { name: 'Starter', key: 'starter', price: 19, features: [lang === 'fr' ? '5 employés IA' : '5 AI employees', lang === 'fr' ? '3 utilisateurs' : '3 users', lang === 'fr' ? 'Contacts illimités' : 'Unlimited contacts', lang === 'fr' ? 'Pipelines de ventes' : 'Sales pipelines', lang === 'fr' ? 'Support e-mail' : 'Email support'] },
    { name: 'Growth', key: 'growth', price: 49, features: [lang === 'fr' ? '15 employés IA' : '15 AI employees', lang === 'fr' ? '10 utilisateurs' : '10 users', lang === 'fr' ? 'Analytique avancée' : 'Advanced analytics', lang === 'fr' ? 'Support prioritaire' : 'Priority support', lang === 'fr' ? 'Accès API & Webhooks' : 'API access & Webhooks'] },
    { name: 'Pro', key: 'pro', price: 119, features: [lang === 'fr' ? 'Employés IA illimités' : 'Unlimited AI employees', lang === 'fr' ? '25 utilisateurs' : '25 users', lang === 'fr' ? 'Tableaux de bord personnalisés' : 'Custom dashboards', lang === 'fr' ? 'SSO & SAML' : 'SSO & SAML', lang === 'fr' ? 'Support 24/7 + SLA' : '24/7 support + SLA'] },
    { name: 'Enterprise', key: 'enterprise', price: -1, features: [lang === 'fr' ? 'Tout Pro inclus' : 'Everything in Pro', lang === 'fr' ? 'IA personnalisée' : 'Custom AI training', lang === 'fr' ? 'Utilisateurs illimités' : 'Unlimited users', lang === 'fr' ? 'Gestionnaire dédié' : 'Dedicated manager', lang === 'fr' ? 'Garantie SLA' : 'SLA guarantee'] },
  ] as const;

  async function changePlan(plan: typeof plans[number]) {
    if (!organization || plan.key === currentPlan) return;
    if (plan.key === 'enterprise') {
      window.location.href = 'mailto:sales@atlascrm.com?subject=Atlas%20CRM%20Enterprise%20Plan';
      return;
    }
    setBusy(plan.key);
    initiateFlutterwaveCheckout({
      plan: plan.key,
      email: session?.user?.email || '',
      orgId: organization.id,
      onSuccess: async (txRef, paymentId) => {
        const res = await recordSubscription({ orgId: organization.id, plan: plan.key, txRef, paymentId });
        if (res.success) {
          setCurrentPlan(plan.key);
          setBusy(null);
        } else {
          alert(res.error || 'Payment failed');
          setBusy(null);
        }
      },
      onClose: () => setBusy(null),
    });
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('nav.billing', lang)} subtitle="" />
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-ink-500">{lang === 'fr' ? 'Plan actuel' : 'Current Plan'}</p>
            <p className="text-2xl font-bold text-ink-900 capitalize">{currentPlan}</p>
            {organization?.trial_ends_at && (
              <p className="text-sm text-warning-600 mt-1">
                {lang === 'fr' ? 'Essai jusqu\'au' : 'Trial ends'} {new Date(organization.trial_ends_at).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US')}
              </p>
            )}
          </div>
          <CreditCard size={32} className="text-ink-300" />
        </div>
        {!isFlutterwaveConfigured() && (
          <p className="mt-3 rounded-lg bg-warning-50 p-2 text-xs text-warning-700">
            {lang === 'fr' ? 'Paiement Flutterwave non configuré. Ajoutez VITE_FLW_PUBLIC_KEY dans les variables d\'environnement.' : 'Flutterwave payment not configured. Add VITE_FLW_PUBLIC_KEY to environment variables.'}
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map(plan => {
          const isCurrent = plan.key === currentPlan;
          return (
            <div key={plan.name} className={`card p-6 ${isCurrent ? 'border-primary-300 ring-2 ring-primary-100' : ''}`}>
              <h3 className="font-bold text-ink-800">{plan.name}</h3>
              <p className="text-2xl font-bold text-ink-900 mt-2">
                {plan.price === -1 ? (lang === 'fr' ? 'Sur devis' : 'Custom') : `$${plan.price}/${lang === 'fr' ? 'mois' : 'mo'}`}
              </p>
              <ul className="mt-4 space-y-2">
                {plan.features.map(f => (
                  <li key={f} className="text-sm text-ink-600 flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-success-500 mt-0.5 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => changePlan(plan)}
                disabled={isCurrent || busy !== null}
                className={`btn-sm w-full mt-4 rounded-lg font-medium inline-flex items-center justify-center gap-1.5 ${isCurrent ? 'bg-ink-100 text-ink-500' : 'bg-primary-600 text-white hover:bg-primary-700'}`}
              >
                {busy === plan.key ? <Loader2 size={14} className="animate-spin" /> : null}
                {busy === plan.key ? (lang === 'fr' ? 'Paiement...' : 'Paying...') : isCurrent ? (lang === 'fr' ? 'Actuel' : 'Current') : plan.key === 'enterprise' ? (lang === 'fr' ? 'Contacter' : 'Contact Sales') : (lang === 'fr' ? 'Payer' : 'Pay')}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function UsagePage() {
  const { language } = useAuth();
  const lang = language;
  const { plan, features } = usePlanAccess();
  const [usage, setUsage] = useState({
    aiTasks: 0, apiCalls: 0, storage: 0, activeUsers: 1,
    contacts: 0, emailsSent: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [aiTasksRes, contactsRes, invoicesRes, employeesRes] = await Promise.all([
          supabase.from('ai_tasks').select('*', { count: 'exact', head: true }),
          supabase.from('contacts').select('*', { count: 'exact', head: true }),
          supabase.from('invoices').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
        ]);
        setUsage({
          aiTasks: aiTasksRes.count || 0,
          apiCalls: (aiTasksRes.count || 0) * 12,
          storage: Math.round(((contactsRes.count || 0) * 0.2 + (invoicesRes.count || 0) * 0.5) * 10) / 10,
          activeUsers: employeesRes.count || 1,
          contacts: contactsRes.count || 0,
          emailsSent: (invoicesRes.count || 0) * 3,
        });
      } catch {
        // tables may be empty
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const contactCap = features.maxContacts === 'unlimited' ? null : features.maxContacts;
  const aiCap = features.maxAIEmployees === 'unlimited' ? null : features.maxAIEmployees;
  const userCap = features.maxUsers === 'unlimited' ? null : features.maxUsers;

  const limits: Record<string, { value: number; cap: number | null }> = {
    [lang === 'fr' ? 'Tâches IA' : 'AI Tasks']: { value: usage.aiTasks, cap: aiCap ? aiCap * 100 : null },
    [lang === 'fr' ? 'Appels API' : 'API Calls']: { value: usage.apiCalls, cap: features.apiAccess ? null : 0 },
    [lang === 'fr' ? 'Stockage' : 'Storage']: { value: Math.round(usage.storage), cap: null },
    [lang === 'fr' ? 'Contacts' : 'Contacts']: { value: usage.contacts, cap: contactCap },
    [lang === 'fr' ? 'Utilisateurs' : 'Users']: { value: usage.activeUsers, cap: userCap },
    [lang === 'fr' ? 'E-mails envoyés' : 'Emails Sent']: { value: usage.emailsSent, cap: null },
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('nav.usage', lang)} subtitle={`${lang === 'fr' ? 'Plan actuel' : 'Current plan'}: ${plan}`} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label={lang === 'fr' ? 'Tâches IA' : 'AI Tasks'} value={loading ? '…' : String(usage.aiTasks)} icon={<Sparkles size={20} />} color="primary" />
        <StatCard label={lang === 'fr' ? 'Appels API' : 'API Calls'} value={loading ? '…' : String(usage.apiCalls)} icon={<Gauge size={20} />} color="accent" />
        <StatCard label={lang === 'fr' ? 'Stockage' : 'Storage'} value={loading ? '…' : `${usage.storage} MB`} icon={<Gauge size={20} />} color="success" />
        <StatCard label={lang === 'fr' ? 'Utilisateurs actifs' : 'Active Users'} value={loading ? '…' : String(usage.activeUsers)} icon={<Gauge size={20} />} color="warning" />
      </div>
      <div className="card p-6">
        <h3 className="font-bold text-ink-800 mb-1">{lang === 'fr' ? 'Utilisation mensuelle' : 'Monthly Usage'}</h3>
        <p className="text-xs text-ink-400 mb-4">{lang === 'fr' ? `Limites selon votre plan ${plan}.` : `Limits based on your ${plan} plan.`}</p>
        <div className="space-y-4">
          {Object.entries(limits).map(([item, { value, cap }]) => {
            const pct = cap ? Math.min(100, Math.round((value / cap) * 100)) : 0;
            const capLabel = cap === null ? (lang === 'fr' ? 'Illimité' : 'Unlimited') : (cap === 0 ? (lang === 'fr' ? 'Non disponible' : 'Not available') : cap.toLocaleString());
            return (
              <div key={item}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-ink-600">{item}</span>
                  <span className="text-ink-400">{value.toLocaleString()} / {capLabel}</span>
                </div>
                <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${cap === 0 ? 'bg-ink-200' : pct > 80 ? 'bg-error-500' : pct > 50 ? 'bg-warning-500' : 'bg-primary-500'}`} style={{ width: `${cap === null || cap === 0 ? 0 : pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function AskAtlasPage() {
  const { language } = useAuth();
  const navigate = useNavigate();
  const lang = language;
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string; route?: string }[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);

  const suggestions = lang === 'fr'
    ? ['Combien de deals ouverts ?', 'Quels sont mes leads chauds ?', 'Quel est mon revenu ?', 'Factures impayées ?']
    : ['How many open deals?', 'Show my hot leads', 'What is my revenue?', 'Unpaid invoices?'];

  async function send(text?: string) {
    const value = (text ?? input).trim();
    if (!value || thinking) return;
    const userMsg = { role: 'user' as const, text: value };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setThinking(true);
    try {
      const answer = await askAtlas(value, lang);
      setMessages((prev) => [...prev, { role: 'ai', text: answer.text, route: answer.route }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', text: lang === 'fr' ? 'Désolé, je n\'ai pas pu récupérer les données.' : 'Sorry, I couldn\'t fetch the data.' }]);
    } finally {
      setThinking(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('nav.askAtlas', lang)} subtitle={lang === 'fr' ? 'Posez une question sur votre entreprise — les réponses viennent de vos données réelles.' : 'Ask a question about your business — answers come from your real data.'} />
      <div className="card p-0 h-[60vh] flex flex-col">
        <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 mb-4">
                <Sparkles size={28} />
              </div>
              <h3 className="font-bold text-ink-800">{t('dash.askAtlas', lang)}</h3>
              <p className="text-sm text-ink-500 mt-1 max-w-md text-center">{t('dash.askPlaceholder', lang)}</p>
              <div className="mt-6 flex flex-wrap gap-2 justify-center max-w-lg">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-full border border-ink-200 bg-white px-4 py-2 text-sm text-ink-700 transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-md px-4 py-2 rounded-xl text-sm ${msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-ink-100 text-ink-800'}`}>
                {msg.text}
                {msg.route && (
                  <button onClick={() => navigate(msg.route!)} className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-primary-600 hover:underline">
                    {lang === 'fr' ? 'Voir' : 'View'} <ArrowRight size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex justify-start">
              <div className="max-w-md px-4 py-2 rounded-xl text-sm bg-ink-100 text-ink-400 flex items-center gap-2">
                <Sparkles size={14} className="animate-pulse" /> {lang === 'fr' ? 'Atlas analyse vos données…' : 'Atlas is analysing your data…'}
              </div>
            </div>
          )}
        </div>
        <div className="border-t border-ink-100 p-4 flex gap-2">
          <input
            className="input flex-1"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder={t('dash.askPlaceholder', lang)}
            disabled={thinking}
          />
          <button onClick={() => send()} disabled={thinking} className="btn-primary btn-sm">{lang === 'fr' ? 'Envoyer' : 'Send'}</button>
        </div>
      </div>
    </div>
  );
}
