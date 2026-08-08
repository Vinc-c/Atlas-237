import { UserCog, UsersRound, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { t } from '@/lib/i18n';
import { PageHeader, Badge } from '@/components/ui';
import { EmptyState } from '@/components/EmptyState';
import { Loading } from '@/components/Loading';
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
  const { language } = useAuth();
  return (
    <div className="animate-fade-in">
      <PageHeader title={t('nav.teams', language)} subtitle="" />
      <div className="card">
        <EmptyState icon={<UsersRound size={28} />} title="No teams yet" description="Organize your employees into teams for better collaboration." />
      </div>
    </div>
  );
}

export function PermissionsPage() {
  const { language } = useAuth();
  const roles = [
    { role: 'owner', desc: 'Full access to everything', permissions: ['All permissions'] },
    { role: 'admin', desc: 'Manage all data and settings', permissions: ['Create', 'Read', 'Update', 'Delete', 'Manage Settings'] },
    { role: 'manager', desc: 'Manage team and data', permissions: ['Create', 'Read', 'Update'] },
    { role: 'sales', desc: 'Manage CRM and deals', permissions: ['Read', 'Create', 'Update (CRM only)'] },
    { role: 'marketing', desc: 'Manage campaigns', permissions: ['Read', 'Create', 'Update (Marketing only)'] },
    { role: 'finance', desc: 'Manage invoices', permissions: ['Read', 'Create', 'Update (Finance only)'] },
    { role: 'support', desc: 'Manage tickets', permissions: ['Read', 'Create', 'Update (Support only)'] },
    { role: 'member', desc: 'Read-only access', permissions: ['Read'] },
  ];
  return (
    <div className="animate-fade-in">
      <PageHeader title={t('nav.permissions', language)} subtitle="" />
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-ink-100 bg-ink-50/50">
            <th className="text-left text-xs font-semibold text-ink-500 uppercase px-4 py-3">Role</th>
            <th className="text-left text-xs font-semibold text-ink-500 uppercase px-4 py-3">Description</th>
            <th className="text-left text-xs font-semibold text-ink-500 uppercase px-4 py-3">Permissions</th>
          </tr></thead>
          <tbody>
            {roles.map(r => (
              <tr key={r.role} className="border-b border-ink-50 last:border-0 table-row-hover">
                <td className="px-4 py-3"><Badge variant={r.role === 'owner' ? 'primary' : 'neutral'}>{r.role}</Badge></td>
                <td className="px-4 py-3 text-sm text-ink-700">{r.desc}</td>
                <td className="px-4 py-3 text-sm text-ink-500">{r.permissions.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
