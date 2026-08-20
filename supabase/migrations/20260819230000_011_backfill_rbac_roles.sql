-- ============================================================
-- 011: Backfill default RBAC roles for pre-existing organizations
--
-- seed_default_rbac_roles() only runs on INSERT into organizations
-- (via trigger). Organizations created before migration 006 was
-- applied never got their Owner/Admin/Member roles seeded, leaving
-- the Permissions page empty for those tenants. This backfills them.
-- ============================================================
DO $$
DECLARE
  org_rec record;
  owner_role_id uuid; admin_role_id uuid; member_role_id uuid;
BEGIN
  FOR org_rec IN
    SELECT o.id FROM public.organizations o
    WHERE NOT EXISTS (SELECT 1 FROM public.rbac_roles r WHERE r.org_id = o.id)
  LOOP
    INSERT INTO public.rbac_roles (org_id, name, description, scope, is_system)
    VALUES (org_rec.id, 'Owner', 'Full access', 'tenant', true)
    RETURNING id INTO owner_role_id;
    INSERT INTO public.rbac_permissions (role_id, module, action) VALUES
      (owner_role_id, 'contacts', 'read'), (owner_role_id, 'contacts', 'write'), (owner_role_id, 'contacts', 'delete'), (owner_role_id, 'contacts', 'export'),
      (owner_role_id, 'companies', 'read'), (owner_role_id, 'companies', 'write'), (owner_role_id, 'companies', 'delete'), (owner_role_id, 'companies', 'export'),
      (owner_role_id, 'leads', 'read'), (owner_role_id, 'leads', 'write'), (owner_role_id, 'leads', 'delete'), (owner_role_id, 'leads', 'export'),
      (owner_role_id, 'deals', 'read'), (owner_role_id, 'deals', 'write'), (owner_role_id, 'deals', 'delete'), (owner_role_id, 'deals', 'export'),
      (owner_role_id, 'invoices', 'read'), (owner_role_id, 'invoices', 'write'), (owner_role_id, 'invoices', 'delete'), (owner_role_id, 'invoices', 'export'),
      (owner_role_id, 'reports', 'read'), (owner_role_id, 'reports', 'write'), (owner_role_id, 'reports', 'export'),
      (owner_role_id, 'team', 'read'), (owner_role_id, 'team', 'write'),
      (owner_role_id, 'settings', 'read'), (owner_role_id, 'settings', 'write'),
      (owner_role_id, 'billing', 'read'), (owner_role_id, 'billing', 'write');

    INSERT INTO public.rbac_roles (org_id, name, description, scope, is_system)
    VALUES (org_rec.id, 'Admin', 'Administrative access', 'tenant', true)
    RETURNING id INTO admin_role_id;
    INSERT INTO public.rbac_permissions (role_id, module, action) VALUES
      (admin_role_id, 'contacts', 'read'), (admin_role_id, 'contacts', 'write'), (admin_role_id, 'contacts', 'delete'), (admin_role_id, 'contacts', 'export'),
      (admin_role_id, 'companies', 'read'), (admin_role_id, 'companies', 'write'), (admin_role_id, 'companies', 'delete'), (admin_role_id, 'companies', 'export'),
      (admin_role_id, 'leads', 'read'), (admin_role_id, 'leads', 'write'), (admin_role_id, 'leads', 'delete'), (admin_role_id, 'leads', 'export'),
      (admin_role_id, 'deals', 'read'), (admin_role_id, 'deals', 'write'), (admin_role_id, 'deals', 'delete'), (admin_role_id, 'deals', 'export'),
      (admin_role_id, 'invoices', 'read'), (admin_role_id, 'invoices', 'write'),
      (admin_role_id, 'reports', 'read'), (admin_role_id, 'reports', 'export'),
      (admin_role_id, 'team', 'read'), (admin_role_id, 'team', 'write'),
      (admin_role_id, 'settings', 'read'), (admin_role_id, 'settings', 'write'),
      (admin_role_id, 'billing', 'read');

    INSERT INTO public.rbac_roles (org_id, name, description, scope, is_system)
    VALUES (org_rec.id, 'Member', 'Basic access', 'tenant', true)
    RETURNING id INTO member_role_id;
    INSERT INTO public.rbac_permissions (role_id, module, action) VALUES
      (member_role_id, 'contacts', 'read'), (member_role_id, 'contacts', 'write'),
      (member_role_id, 'companies', 'read'),
      (member_role_id, 'leads', 'read'), (member_role_id, 'leads', 'write'),
      (member_role_id, 'deals', 'read'),
      (member_role_id, 'reports', 'read');
  END LOOP;
END $$;
