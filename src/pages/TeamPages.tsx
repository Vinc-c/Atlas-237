import { UserCog, UsersRound, ShieldCheck, Plus, Trash2, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { t } from '@/lib/i18n';
import { PageHeader, Badge } from '@/components/ui';
import { EmptyState } from '@/components/EmptyState';
import { Loading } from '@/components/Loading';
import { fetchRoles, createRole, deleteRole, setRolePermissions, fetchPermissions, MODULES, ACTIONS, type RbacRole, type PermissionModule, type PermissionAction } from '@/lib/rbac';
import type { Profile } from '@/types';

export function EmployeesPage() {
  const { language } = useAuth();
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('profiles').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setEmployees((data || []) as Profile[]); setLoading(false); });
  }, []);

  if (loading) return <Loading text={t('common.loading', language)} />;

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('nav.employees', language)} subtitle="" />
      {employees.length === 0 ? (
        <div className="card"><EmptyState icon={<UserCog size={28} />} title="No employees" description="Team members will appear here." /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map(emp => (
            <div key={emp.id} className="card p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-white text-lg font-bold">
                  {(emp.first_name?.[0] || emp.email[0]).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-ink-800 truncate">{emp.first_name} {emp.last_name}</p>
                  <p className="text-sm text-ink-500 truncate">{emp.email}</p>
                  <Badge variant={emp.role === 'owner' ? 'primary' : 'neutral'}>{emp.role}</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function TeamsPage() {
  const { language, organization } = useAuth();
  const [teams, setTeams] = useState<any[]>([]);
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [leadId, setLeadId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (organization) load();
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
      org_id: organization.id,
      name,
      description,
      lead_id: leadId || null,
    });
    if (!error) {
      setName(''); setDescription(''); setLeadId(''); setShowForm(false);
      await load();
    }
    setSaving(false);
  }

  async function deleteTeam(id: string) {
    if (!confirm(language === 'fr' ? 'Supprimer cette équipe ?' : 'Delete this team?')) return;
    await supabase.from('teams').delete().eq('id', id);
    await load();
  }

  if (loading) return <Loading text={t('common.loading', language)} />;

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('nav.teams', language)} subtitle="" />
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowForm(!showForm)} className="btn-primary btn-sm flex items-center gap-2">
          <Plus size={14} /> {language === 'fr' ? 'Nouvelle équipe' : 'New Team'}
        </button>
      </div>

      {showForm && (
        <div className="card p-6 mb-6 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">{language === 'fr' ? "Nom de l'équipe" : 'Team Name'}</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="label">{language === 'fr' ? 'Responsable' : 'Team Lead'}</label>
              <select className="input" value={leadId} onChange={e => setLeadId(e.target.value)}>
                <option value="">{language === 'fr' ? 'Sélectionner...' : 'Select...'}</option>
                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">{language === 'fr' ? 'Description' : 'Description'}</label>
            <input className="input" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <button onClick={createTeam} disabled={saving || !name.trim()} className="btn-primary btn-sm">
            {saving ? <Loader2 size={14} className="animate-spin" /> : null} {t('common.create', language)}
          </button>
        </div>
      )}

      {teams.length === 0 ? (
        <div className="card">
          <EmptyState icon={<UsersRound size={28} />} title={language === 'fr' ? 'Aucune équipe' : 'No teams yet'}
            description={language === 'fr' ? 'Organisez vos employés en équipes pour une meilleure collaboration.' : 'Organize your employees into teams for better collaboration.'} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map(team => (
            <div key={team.id} className="card p-5 group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                    <UsersRound size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-ink-800">{team.name}</p>
                    <p className="text-sm text-ink-500">{team.description || '—'}</p>
                  </div>
                </div>
                <button onClick={() => deleteTeam(team.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-error-500 hover:bg-error-50 rounded transition">
                  <Trash2 size={14} />
                </button>
              </div>
              {team.lead_id && (
                <div className="mt-3 pt-3 border-t border-ink-50">
                  <p className="text-xs text-ink-400">{language === 'fr' ? 'Responsable' : 'Lead'}</p>
                  <p className="text-sm font-medium text-ink-700">
                    {employees.find(e => e.id === team.lead_id)?.first_name} {employees.find(e => e.id === team.lead_id)?.last_name}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function PermissionsPage() {
  const { language, organization } = useAuth();
  const [roles, setRoles] = useState<RbacRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<RbacRole | null>(null);
  const [perms, setPerms] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [showNewRole, setShowNewRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (organization) loadRoles(); }, [organization?.id]);

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
