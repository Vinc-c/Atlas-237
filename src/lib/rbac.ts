// RBAC engine — single engine for platform + tenant scope.
// Backend enforcement is via the `rbac_check` SQL function.
// This client module mirrors the permission model for UI gating.

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export type PermissionAction = 'read' | 'write' | 'delete' | 'export';

export type PermissionModule =
  | 'contacts' | 'companies' | 'leads' | 'deals' | 'invoices'
  | 'reports' | 'team' | 'settings' | 'billing' | 'super_admin';

export interface RbacRole {
  id: string;
  org_id: string | null;
  name: string;
  description: string | null;
  scope: 'platform' | 'tenant';
  is_system: boolean;
  permissions?: RbacPermission[];
}

export interface RbacPermission {
  id: string;
  role_id: string;
  module: PermissionModule;
  action: PermissionAction;
}

export const MODULES: { key: PermissionModule; label: { en: string; fr: string } }[] = [
  { key: 'contacts', label: { en: 'Contacts', fr: 'Contacts' } },
  { key: 'companies', label: { en: 'Companies', fr: 'Entreprises' } },
  { key: 'leads', label: { en: 'Leads', fr: 'Pistes' } },
  { key: 'deals', label: { en: 'Deals', fr: 'Affaires' } },
  { key: 'invoices', label: { en: 'Invoices', fr: 'Factures' } },
  { key: 'reports', label: { en: 'Reports', fr: 'Rapports' } },
  { key: 'team', label: { en: 'Team', fr: 'Équipe' } },
  { key: 'settings', label: { en: 'Settings', fr: 'Paramètres' } },
  { key: 'billing', label: { en: 'Billing', fr: 'Facturation' } },
  { key: 'super_admin', label: { en: 'Super Admin', fr: 'Super Admin' } },
];

export const ACTIONS: { key: PermissionAction; label: { en: string; fr: string } }[] = [
  { key: 'read', label: { en: 'Read', fr: 'Lecture' } },
  { key: 'write', label: { en: 'Write', fr: 'Écriture' } },
  { key: 'delete', label: { en: 'Delete', fr: 'Suppression' } },
  { key: 'export', label: { en: 'Export', fr: 'Export' } },
];

/**
 * Check permission via backend RPC (authoritative).
 * Falls back to client-side heuristic if RPC unavailable.
 */
export async function checkPermission(
  userId: string,
  module: PermissionModule,
  action: PermissionAction,
  orgId?: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc('rbac_check', {
    check_user_id: userId,
    check_module: module,
    check_action: action,
    check_org_id: orgId || null,
  });
  if (error) return false;
  return Boolean(data);
}

/**
 * Fetch all roles for a tenant (or platform roles if orgId is null).
 */
export async function fetchRoles(orgId?: string | null): Promise<RbacRole[]> {
  const q = supabase.from('rbac_roles').select('*');
  if (orgId !== undefined) {
    if (orgId === null) q.is('org_id', null);
    else q.eq('org_id', orgId);
  }
  const { data, error } = await q.order('name');
  if (error || !data) return [];
  return data as RbacRole[];
}

/**
 * Fetch permissions for a set of roles.
 */
export async function fetchPermissions(roleIds: string[]): Promise<RbacPermission[]> {
  if (roleIds.length === 0) return [];
  const { data, error } = await supabase
    .from('rbac_permissions')
    .select('*')
    .in('role_id', roleIds);
  if (error || !data) return [];
  return data as RbacPermission[];
}

/**
 * Create a custom role in a tenant.
 */
export async function createRole(orgId: string, name: string, description: string): Promise<RbacRole | null> {
  const { data, error } = await supabase
    .from('rbac_roles')
    .insert({ org_id: orgId, name, description, scope: 'tenant', is_system: false })
    .select('*')
    .single();
  if (error) return null;
  return data as RbacRole;
}

/**
 * Delete a custom role (only non-system roles).
 */
export async function deleteRole(roleId: string): Promise<boolean> {
  const { error } = await supabase.from('rbac_roles').delete().eq('id', roleId).eq('is_system', false);
  return !error;
}

/**
 * Set permissions for a role (replace all).
 */
export async function setRolePermissions(roleId: string, perms: { module: PermissionModule; action: PermissionAction }[]): Promise<boolean> {
  // Delete existing
  await supabase.from('rbac_permissions').delete().eq('role_id', roleId);
  // Insert new
  if (perms.length === 0) return true;
  const rows = perms.map((p) => ({ role_id: roleId, module: p.module, action: p.action }));
  const { error } = await supabase.from('rbac_permissions').insert(rows);
  return !error;
}

/**
 * React hook for client-side permission checks.
 * Uses role from profile as a fast heuristic; for sensitive actions, call checkPermission() (backend).
 */
export function usePermission() {
  const { profile, organization } = useAuth();

  // Fast client-side check: owner has all access, admin has most, others limited
  function canFast(module: PermissionModule, action: PermissionAction): boolean {
    if (!profile) return false;
    // Owner: full tenant access
    if (profile.role === 'owner') return true;
    // Admin: everything except billing delete
    if (profile.role === 'admin') {
      if (module === 'billing' && action === 'delete') return false;
      return true;
    }
    // Manager: read/write CRM, read reports
    if (profile.role === 'manager') {
      if (['contacts', 'companies', 'leads', 'deals'].includes(module) && ['read', 'write'].includes(action)) return true;
      if (module === 'reports' && action === 'read') return true;
      return false;
    }
    // Sales: contacts/leads/deals read+write
    if (profile.role === 'sales') {
      if (['contacts', 'leads', 'deals'].includes(module) && ['read', 'write'].includes(action)) return true;
      return false;
    }
    // Others: read-only
    return action === 'read' && ['contacts', 'companies', 'leads', 'deals', 'reports'].includes(module);
  }

  return {
    can: canFast,
    canAsync: (module: PermissionModule, action: PermissionAction) =>
      profile ? checkPermission(profile.id, module, action, organization?.id) : Promise.resolve(false),
    role: profile?.role,
  };
}
