import { UserCog, UsersRound, ShieldCheck, Plus, Trash2, Loader2, Search, UserPlus, Mail, Phone, Crown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { t } from '@/lib/i18n';
import { PageHeader, Badge } from '@/components/ui';
import { EmptyState } from '@/components/EmptyState';
import { Loading } from '@/components/Loading';
import { Modal } from '@/components/Modal';
import { fetchRoles, createRole, deleteRole, setRolePermissions, fetchPermissions, MODULES, ACTIONS, type RbacRole, type PermissionModule, type PermissionAction } from '@/lib/rbac';
import { hasFeature, getPlanFeatures } from '@/lib/plans';
import type { Profile, Role } from '@/types';

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'owner', label: 'Owner' },
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'sales', label: 'Sales' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'finance', label: 'Finance' },
  { value: 'support', label: 'Support' },
  { value: 'member', label: 'Member' },
];

export function EmployeesPage() {
  const { language, organization } = useAuth();
  const lang = language;
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editEmp, setEditEmp] = useState<Profile | null>(null);
  const [editRole, setEditRole] = useState<Role>('member');
  const [saving, setSaving] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('member');
  const [inviteError, setInviteError] = useState('');

  useEffect(() => {
    if (organization) load();
    // load() closes over `organization` but the effect already re-runs on organization?.id
    // changes; see rationale in SystemPages.tsx.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization?.id]);

  async function load() {
    const { data } = await supabase.from('profiles').select('*').eq('org_id', organization?.id).order('created_at', { ascending: false });
    setEmployees((data || []) as Profile[]);
    setLoading(false);
  }

  function openEdit(emp: Profile) {
    setEditEmp(emp);
    setEditRole(emp.role);
  }

  async function saveRole() {
    if (!editEmp) return;
    setSaving(true);
    await supabase.from('profiles').update({ role: editRole }).eq('id', editEmp.id);
    setEmployees(prev => prev.map(e => e.id === editEmp.id ? { ...e, role: editRole } : e));
    setSaving(false);
    setEditEmp(null);
  }

  async function toggleActive(emp: Profile) {
    const next = !emp.active;
    await supabase.from('profiles').update({ active: next }).eq('id', emp.id);
    setEmployees(prev => prev.map(e => e.id === emp.id ? { ...e, active: next } : e));
  }

  async function sendInvite() {
    if (!inviteEmail.trim() || !organization) return;
    const maxUsers = getPlanFeatures(organization.plan).maxUsers;
    if (maxUsers !== 'unlimited' && employees.length >= maxUsers) {
      setInviteError(lang === 'fr'
        ? `Limite de ${maxUsers} utilisateurs atteinte pour le plan ${organization.plan}. Passez à un plan supérieur pour inviter plus de monde.`
        : `You've reached the ${maxUsers}-user limit for the ${organization.plan} plan. Upgrade to invite more people.`);
      return;
    }
    setInviteError('');
    setSaving(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: inviteEmail.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth?invite=${organization.id}` },
    });
    if (!error) {
      setInviteEmail('');
      setInviteRole('member');
      setInviteOpen(false);
      alert(lang === 'fr' ? 'Invitation envoyée !' : 'Invitation sent!');
    } else {
      alert(error.message);
    }
    setSaving(false);
  }

  if (loading) return <Loading text={t('common.loading', language)} />;

  const filtered = search
    ? employees.filter(e => `${e.first_name} ${e.last_name} ${e.email}`.toLowerCase().includes(search.toLowerCase()))
    : employees;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('nav.employees', language)}
        subtitle=""
        actions={
          <button onClick={() => setInviteOpen(true)} className="btn-primary btn-sm">
            <UserPlus size={16} /> {lang === 'fr' ? 'Inviter' : 'Invite'}
          </button>
        }
      />
      <div className="mb-4 relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
        <input className="input pl-9" placeholder={t('common.search', language)} value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {filtered.length === 0 ? (
        <div className="card"><EmptyState icon={<UserCog size={28} />} title={lang === 'fr' ? 'Aucun employé' : 'No employees'} description={lang === 'fr' ? 'Invitez des membres à rejoindre votre organisation.' : 'Invite team members to join your organization.'} /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(emp => (
            <div key={emp.id} className="card p-5 group">
              <div className="flex items-center gap-3 mb-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full text-white text-lg font-bold flex-shrink-0 ${emp.role === 'owner' ? 'bg-warning-500' : 'bg-primary-600'}`}>
                  {(emp.first_name?.[0] || emp.email[0]).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-ink-800 truncate">{emp.first_name} {emp.last_name}</p>
                    {emp.role === 'owner' && <Crown size={14} className="text-warning-500 flex-shrink-0" />}
                  </div>
                  <p className="text-sm text-ink-500 truncate flex items-center gap-1"><Mail size={12} className="flex-shrink-0" /> {emp.email}</p>
                  {emp.phone && <p className="text-xs text-ink-400 truncate flex items-center gap-1"><Phone size={10} className="flex-shrink-0" /> {emp.phone}</p>}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant={emp.role === 'owner' ? 'primary' : emp.role === 'admin' ? 'success' : 'neutral'}>{emp.role}</Badge>
                <Badge variant={emp.active ? 'success' : 'neutral'}>{emp.active ? (lang === 'fr' ? 'Actif' : 'Active') : (lang === 'fr' ? 'Inactif' : 'Inactive')}</Badge>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-ink-50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                {emp.role !== 'owner' && (
                  <>
                    <button onClick={() => openEdit(emp)} className="btn-ghost btn-sm flex-1">
                      <UserCog size={14} /> {lang === 'fr' ? 'Rôle' : 'Role'}
                    </button>
                    <button onClick={() => toggleActive(emp)} className="btn-secondary btn-sm flex-1">
                      {emp.active ? (lang === 'fr' ? 'Désactiver' : 'Disable') : (lang === 'fr' ? 'Activer' : 'Enable')}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!editEmp} onClose={() => setEditEmp(null)} title={lang === 'fr' ? 'Modifier le rôle' : 'Edit Role'} size="sm">
        {editEmp && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white font-bold">
                {(editEmp.first_name?.[0] || editEmp.email[0]).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-ink-800">{editEmp.first_name} {editEmp.last_name}</p>
                <p className="text-sm text-ink-500">{editEmp.email}</p>
              </div>
            </div>
            <div>
              <label className="label">{lang === 'fr' ? 'Rôle' : 'Role'}</label>
              <select className="input" value={editRole} onChange={e => setEditRole(e.target.value as Role)}>
                {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditEmp(null)} className="btn-secondary btn-sm">{t('common.cancel', lang)}</button>
              <button onClick={saveRole} disabled={saving} className="btn-primary btn-sm">{t('common.save', lang)}</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title={lang === 'fr' ? 'Inviter un membre' : 'Invite Member'} size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">{lang === 'fr' ? 'Email' : 'Email'}</label>
            <input className="input" type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="colleague@company.com" autoFocus />
          </div>
          <div>
            <label className="label">{lang === 'fr' ? 'Rôle' : 'Role'}</label>
            <select className="input" value={inviteRole} onChange={e => setInviteRole(e.target.value as Role)}>
              {ROLE_OPTIONS.filter(r => r.value !== 'owner').map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setInviteOpen(false)} className="btn-secondary btn-sm">{t('common.cancel', lang)}</button>
            <button onClick={sendInvite} disabled={saving || !inviteEmail.trim()} className="btn-primary btn-sm">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />} {lang === 'fr' ? 'Envoyer' : 'Send'}
            </button>
          </div>
          {inviteError && <p className="text-xs text-error-600">{inviteError}</p>}
        </div>
      </Modal>
    </div>
  );
}

interface TeamRecord {
  id: string;
  name: string;
  description?: string | null;
  lead_id?: string | null;
  org_id?: string;
  created_at?: string;
}

export function TeamsPage() {
  const { language, organization } = useAuth();
  const lang = language;
  const [teams, setTeams] = useState<TeamRecord[]>([]);
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [leadId, setLeadId] = useState('');
  const [saving, setSaving] = useState(false);
  const [manageTeam, setManageTeam] = useState<TeamRecord | null>(null);
  const [teamMembers, setTeamMembers] = useState<Profile[]>([]);
  const [addMemberId, setAddMemberId] = useState('');

  useEffect(() => {
    if (organization) load();
    // see rationale in EmployeesPage above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization?.id]);

  async function load() {
    if (!organization) return;
    const [{ data: teamData }, { data: empData }] = await Promise.all([
      supabase.from('teams').select('*').eq('org_id', organization.id).order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').eq('org_id', organization.id).order('first_name'),
    ]);
    setTeams(teamData || []);
    setEmployees((empData || []) as Profile[]);
    setLoading(false);
  }

  async function createTeam() {
    if (!organization || !name.trim()) return;
    setSaving(true);
    const { error } = await supabase.from('teams').insert({
      org_id: organization.id, name, description, lead_id: leadId || null,
    });
    if (!error) {
      setName(''); setDescription(''); setLeadId(''); setShowForm(false);
      await load();
    }
    setSaving(false);
  }

  async function deleteTeam(id: string) {
    if (!confirm(lang === 'fr' ? 'Supprimer cette équipe ?' : 'Delete this team?')) return;
    await supabase.from('teams').delete().eq('id', id);
    await load();
  }

  async function openManage(team: TeamRecord) {
    setManageTeam(team);
    const { data } = await supabase.from('team_members').select('profile_id').eq('team_id', team.id);
    const memberIds = (data || []).map((m: { profile_id: string }) => m.profile_id);
    setTeamMembers(employees.filter(e => memberIds.includes(e.id)));
  }

  async function addMember() {
    if (!manageTeam || !addMemberId) return;
    await supabase.from('team_members').insert({ team_id: manageTeam.id, profile_id: addMemberId });
    setTeamMembers(prev => [...prev, employees.find(e => e.id === addMemberId)!].filter(Boolean));
    setAddMemberId('');
  }

  async function removeMember(profileId: string) {
    if (!manageTeam) return;
    await supabase.from('team_members').delete().eq('team_id', manageTeam.id).eq('profile_id', profileId);
    setTeamMembers(prev => prev.filter(m => m.id !== profileId));
  }

  if (loading) return <Loading text={t('common.loading', language)} />;

  const availableToAdd = employees.filter(e => !teamMembers.find(m => m.id === e.id));

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('nav.teams', language)}
        subtitle=""
        actions={<button onClick={() => setShowForm(!showForm)} className="btn-primary btn-sm flex items-center gap-2"><Plus size={14} /> {lang === 'fr' ? 'Nouvelle équipe' : 'New Team'}</button>}
      />

      {showForm && (
        <div className="card p-6 mb-6 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">{lang === 'fr' ? "Nom de l'équipe" : 'Team Name'}</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="label">{lang === 'fr' ? 'Responsable' : 'Team Lead'}</label>
              <select className="input" value={leadId} onChange={e => setLeadId(e.target.value)}>
                <option value="">{lang === 'fr' ? 'Sélectionner...' : 'Select...'}</option>
                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">{lang === 'fr' ? 'Description' : 'Description'}</label>
            <input className="input" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <button onClick={createTeam} disabled={saving || !name.trim()} className="btn-primary btn-sm">
            {saving ? <Loader2 size={14} className="animate-spin" /> : null} {t('common.create', language)}
          </button>
        </div>
      )}

      {teams.length === 0 ? (
        <div className="card">
          <EmptyState icon={<UsersRound size={28} />} title={lang === 'fr' ? 'Aucune équipe' : 'No teams yet'}
            description={lang === 'fr' ? 'Organisez vos employés en équipes pour une meilleure collaboration.' : 'Organize your employees into teams for better collaboration.'} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map(team => {
            const lead = employees.find(e => e.id === team.lead_id);
            return (
              <div key={team.id} className="card p-5 group">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50 text-primary-600 flex-shrink-0">
                      <UsersRound size={24} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-ink-800 truncate">{team.name}</p>
                      <p className="text-sm text-ink-500 truncate">{team.description || '—'}</p>
                    </div>
                  </div>
                  <button onClick={() => deleteTeam(team.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-error-500 hover:bg-error-50 rounded transition flex-shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
                {lead && (
                  <div className="mt-3 pt-3 border-t border-ink-50">
                    <p className="text-xs text-ink-400">{lang === 'fr' ? 'Responsable' : 'Lead'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-white text-xs font-bold">
                        {(lead.first_name?.[0] || lead.email[0]).toUpperCase()}
                      </div>
                      <p className="text-sm font-medium text-ink-700">{lead.first_name} {lead.last_name}</p>
                    </div>
                  </div>
                )}
                <button onClick={() => openManage(team)} className="btn-secondary btn-sm w-full mt-3">
                  <UserPlus size={14} /> {lang === 'fr' ? 'Gérer les membres' : 'Manage members'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!manageTeam} onClose={() => setManageTeam(null)} title={manageTeam?.name || ''} size="md">
        {manageTeam && (
          <div className="space-y-4">
            <div>
              <label className="label">{lang === 'fr' ? 'Ajouter un membre' : 'Add member'}</label>
              <div className="flex gap-2">
                <select className="input" value={addMemberId} onChange={e => setAddMemberId(e.target.value)}>
                  <option value="">{lang === 'fr' ? 'Sélectionner...' : 'Select...'}</option>
                  {availableToAdd.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
                </select>
                <button onClick={addMember} disabled={!addMemberId} className="btn-primary btn-sm flex-shrink-0"><Plus size={14} /></button>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-ink-600">{lang === 'fr' ? 'Membres' : 'Members'} ({teamMembers.length})</p>
              {teamMembers.length === 0 ? (
                <p className="text-sm text-ink-400 py-4 text-center">{lang === 'fr' ? 'Aucun membre. Ajoutez-en ci-dessus.' : 'No members yet. Add some above.'}</p>
              ) : (
                teamMembers.map(m => (
                  <div key={m.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-ink-50 group">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white text-xs font-bold">
                      {(m.first_name?.[0] || m.email[0]).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink-800 truncate">{m.first_name} {m.last_name}</p>
                      <p className="text-xs text-ink-400 truncate">{m.email}</p>
                    </div>
                    <Badge variant="neutral">{m.role}</Badge>
                    <button onClick={() => removeMember(m.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-error-500 hover:bg-error-50 rounded transition">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export function PermissionsPage() {
  const { language, organization } = useAuth();
  const plan = organization?.plan || 'starter';
  const customRolesAllowed = hasFeature(plan, 'customRoles');
  const [roles, setRoles] = useState<RbacRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<RbacRole | null>(null);
  const [perms, setPerms] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [showNewRole, setShowNewRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (organization) loadRoles();
    // see rationale in EmployeesPage above.
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
    if (!organization || !newRoleName.trim() || !customRolesAllowed) return;
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
    setSaving(true);
    const permList = Object.entries(perms).filter(([, v]) => v).map(([k]) => {
      const [module, action] = k.split(':') as [PermissionModule, PermissionAction];
      return { module, action };
    });
    await setRolePermissions(selectedRole.id, permList);
    setSaving(false);
    alert(language === 'fr' ? 'Permissions enregistrées' : 'Permissions saved');
  }

  if (loading) return <Loading text={t('common.loading', language)} />;

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('nav.permissions', language)} subtitle="" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-ink-800">{language === 'fr' ? 'Rôles' : 'Roles'}</h3>
            {customRolesAllowed && (
              <button onClick={() => setShowNewRole(!showNewRole)} className="btn-ghost btn-sm">+</button>
            )}
          </div>
          {!customRolesAllowed && (
            <p className="mb-3 text-xs text-ink-400 rounded-lg bg-ink-50 p-3">
              {language === 'fr'
                ? 'La création de rôles personnalisés est disponible à partir du plan Growth.'
                : 'Creating custom roles is available starting on the Growth plan.'}
            </p>
          )}
          {showNewRole && customRolesAllowed && (
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
                    <Trash2 size={14} />
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
                <div>
                  <h3 className="font-bold text-ink-800">{selectedRole.name}</h3>
                  <p className="text-sm text-ink-500">{selectedRole.description || ''}</p>
                </div>
                <button onClick={savePermissions} disabled={saving} className="btn-primary btn-sm">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : null} {t('common.save', language)}
                </button>
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
                  ? "Backend : les permissions sont vérifiées via la fonction SQL rbac_check(). Un seul moteur RBAC pour la plateforme et le tenant."
                  : 'Backend: permissions enforced via rbac_check() SQL function. Single RBAC engine for platform + tenant scope.'}
              </p>
            </>
          ) : (
            <EmptyState icon={<ShieldCheck size={28} />} title={language === 'fr' ? 'Sélectionner un rôle' : 'Select a role'}
              description={language === 'fr' ? 'Choisissez un rôle pour gérer ses permissions.' : 'Choose a role to manage its permissions.'} />
          )}
        </div>
      </div>
    </div>
  );
}
