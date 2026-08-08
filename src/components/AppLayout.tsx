import { NavLink, useNavigate } from 'react-router-dom';
import { useState, type ComponentType } from 'react';
import {
  LayoutDashboard, Users, Building2, UserPlus, Handshake,
  KanbanSquare, Calendar, Activity, Package, FileText, ShoppingCart,
  Receipt, CreditCard, Megaphone, LifeBuoy, Bot, ListTodo, Workflow,
  Brain, BookOpen, CheckSquare, BarChart3, LayoutGrid, Lightbulb,
  UserCog, UsersRound, ShieldCheck, Store, Plug, Webhook, Bell,
  ScrollText, Settings, CreditCard as Billing, Gauge, Sparkles,
  ChevronDown, ChevronRight, LogOut, Search, Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { t } from '@/lib/i18n';

interface NavItem {
  to: string;
  labelKey: string;
  icon: ComponentType<{ size?: number | string }>;
}
interface NavSection {
  titleKey: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    titleKey: '',
    items: [
      { to: '/app', labelKey: 'nav.commandCenter', icon: LayoutDashboard },
      { to: '/app/ask-atlas', labelKey: 'nav.askAtlas', icon: Sparkles },
      { to: '/app/approvals', labelKey: 'nav.approvals', icon: CheckSquare },
    ],
  },
  {
    titleKey: 'nav.crm',
    items: [
      { to: '/app/contacts', labelKey: 'nav.contacts', icon: Users },
      { to: '/app/companies', labelKey: 'nav.companies', icon: Building2 },
      { to: '/app/leads', labelKey: 'nav.leads', icon: UserPlus },
      { to: '/app/deals', labelKey: 'nav.deals', icon: Handshake },
      { to: '/app/pipelines', labelKey: 'nav.pipelines', icon: KanbanSquare },
      { to: '/app/activities', labelKey: 'nav.activities', icon: Activity },
      { to: '/app/calendar', labelKey: 'nav.calendar', icon: Calendar },
    ],
  },
  {
    titleKey: 'nav.business',
    items: [
      { to: '/app/products', labelKey: 'nav.products', icon: Package },
      { to: '/app/quotes', labelKey: 'nav.quotes', icon: FileText },
      { to: '/app/orders', labelKey: 'nav.orders', icon: ShoppingCart },
      { to: '/app/invoices', labelKey: 'nav.invoices', icon: Receipt },
      { to: '/app/payments', labelKey: 'nav.payments', icon: CreditCard },
      { to: '/app/marketing', labelKey: 'nav.marketing', icon: Megaphone },
      { to: '/app/support', labelKey: 'nav.support', icon: LifeBuoy },
    ],
  },
  {
    titleKey: 'nav.aiWorkforce',
    items: [
      { to: '/app/ai-employees', labelKey: 'nav.aiEmployees', icon: Bot },
      { to: '/app/ai-tasks', labelKey: 'nav.aiTasks', icon: ListTodo },
      { to: '/app/ai-workflows', labelKey: 'nav.aiWorkflows', icon: Workflow },
      { to: '/app/ai-memory', labelKey: 'nav.aiMemory', icon: Brain },
      { to: '/app/knowledge-base', labelKey: 'nav.knowledgeBase', icon: BookOpen },
    ],
  },
  {
    titleKey: 'nav.analytics',
    items: [
      { to: '/app/reports', labelKey: 'nav.reports', icon: BarChart3 },
      { to: '/app/dashboards', labelKey: 'nav.dashboards', icon: LayoutGrid },
      { to: '/app/ai-insights', labelKey: 'nav.aiInsights', icon: Lightbulb },
    ],
  },
  {
    titleKey: 'nav.team',
    items: [
      { to: '/app/employees', labelKey: 'nav.employees', icon: UserCog },
      { to: '/app/teams', labelKey: 'nav.teams', icon: UsersRound },
      { to: '/app/permissions', labelKey: 'nav.permissions', icon: ShieldCheck },
    ],
  },
  {
    titleKey: 'nav.integrations',
    items: [
      { to: '/app/marketplace', labelKey: 'nav.appMarketplace', icon: Store },
      { to: '/app/connected-apps', labelKey: 'nav.connectedApps', icon: Plug },
      { to: '/app/api-webhooks', labelKey: 'nav.apiWebhooks', icon: Webhook },
    ],
  },
  {
    titleKey: 'nav.system',
    items: [
      { to: '/app/notifications', labelKey: 'nav.notifications', icon: Bell },
      { to: '/app/audit-log', labelKey: 'nav.auditLog', icon: ScrollText },
      { to: '/app/settings', labelKey: 'nav.settings', icon: Settings },
      { to: '/app/billing', labelKey: 'nav.billing', icon: Billing },
      { to: '/app/usage', labelKey: 'nav.usage', icon: Gauge },
    ],
  },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile, organization, language, signOut, isSuperAdmin, brandingLogoUrl } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');

  const searchRoutes: Record<string, string> = {
    contact: '/app/contacts', contacts: '/app/contacts', client: '/app/contacts', clients: '/app/contacts',
    company: '/app/companies', companies: '/app/companies',
    lead: '/app/leads', leads: '/app/leads', prospect: '/app/leads',
    deal: '/app/deals', deals: '/app/deals', opportunity: '/app/deals',
    pipeline: '/app/pipelines', pipelines: '/app/pipelines',
    activity: '/app/activities', activities: '/app/activities', task: '/app/activities', tasks: '/app/activities',
    calendar: '/app/calendar',
    product: '/app/products', products: '/app/products', catalog: '/app/products',
    quote: '/app/quotes', quotes: '/app/quotes', devis: '/app/quotes',
    order: '/app/orders', orders: '/app/orders', commande: '/app/orders',
    invoice: '/app/invoices', invoices: '/app/invoices', facture: '/app/invoices',
    payment: '/app/payments', payments: '/app/payments', paiement: '/app/payments',
    marketing: '/app/marketing', campaign: '/app/marketing', campagne: '/app/marketing',
    support: '/app/support', ticket: '/app/support', tickets: '/app/support',
    ai: '/app/ai-employees', agent: '/app/ai-employees', agents: '/app/ai-employees', 'ai employee': '/app/ai-employees',
    'ai task': '/app/ai-tasks', 'ai tasks': '/app/ai-tasks',
    workflow: '/app/ai-workflows', workflows: '/app/ai-workflows',
    memory: '/app/ai-memory', knowledge: '/app/knowledge-base', 'knowledge base': '/app/knowledge-base',
    report: '/app/reports', reports: '/app/reports', rapport: '/app/reports',
    dashboard: '/app/dashboards', dashboards: '/app/dashboards',
    insight: '/app/ai-insights', insights: '/app/ai-insights',
    employee: '/app/employees', employees: '/app/employees', employé: '/app/employees', team: '/app/teams', teams: '/app/teams',
    permission: '/app/permissions', permissions: '/app/permissions', role: '/app/permissions', roles: '/app/permissions',
    marketplace: '/app/marketplace', integration: '/app/connected-apps', integrations: '/app/connected-apps', 'connected app': '/app/connected-apps',
    webhook: '/app/api-webhooks', api: '/app/api-webhooks', 'api key': '/app/api-webhooks',
    notification: '/app/notifications', notifications: '/app/notifications',
    audit: '/app/audit-log', 'audit log': '/app/audit-log',
    setting: '/app/settings', settings: '/app/settings', paramètre: '/app/settings',
    billing: '/app/billing', plan: '/app/billing',
    usage: '/app/usage', utilisation: '/app/usage',
    approval: '/app/approvals', approvals: '/app/approvals', approbation: '/app/approvals',
    atlas: '/app/ask-atlas', 'ask atlas': '/app/ask-atlas',
  };

  function runSearch(e: React.KeyboardEvent) {
    if (e.key !== 'Enter') return;
    const q = search.trim().toLowerCase();
    if (!q) return;
    const match = searchRoutes[q] || Object.entries(searchRoutes).find(([k]) => k.includes(q))?.[1];
    if (match) { navigate(match); setSearch(''); setMobileOpen(false); }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-ink-50">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-ink-950/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-60'} ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} fixed lg:static inset-y-0 left-0 z-50 flex-shrink-0 bg-ink-900 text-white flex flex-col transition-all duration-200 sidebar-shadow overflow-hidden`}>
        {/* Logo — custom branding for paid plans, neutral placeholder otherwise (NO Atlas logo in dashboards) */}
        <div className="flex items-center gap-2.5 px-4 h-14 flex-shrink-0 border-b border-white/10">
          {brandingLogoUrl ? (
            <img src={brandingLogoUrl} alt={organization?.name || 'Logo'} className="h-8 w-auto max-w-[140px] object-contain flex-shrink-0" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 flex-shrink-0">
              <span className="text-sm font-bold text-white/70">{(organization?.name || 'A').charAt(0).toUpperCase()}</span>
            </div>
          )}
          {!collapsed && <span className="font-bold text-lg truncate">{organization?.name || 'Atlas'}</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 py-3 space-y-0.5">
          {navSections.map((section, si) => (
            <div key={si}>
              {section.titleKey && !collapsed && (
                <div className="sidebar-section">{t(section.titleKey, language)}</div>
              )}
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/app'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `sidebar-item ${isActive ? 'sidebar-item-active' : ''} ${collapsed ? 'justify-center px-2' : ''}`
                  }
                  title={collapsed ? t(item.labelKey, language) : undefined}
                >
                  <item.icon size={18} />
                  {!collapsed && <span>{t(item.labelKey, language)}</span>}
                </NavLink>
              ))}
            </div>
          ))}

          {/* Super Admin section (platform-level, only for super admins) */}
          {isSuperAdmin && (
            <div className="pt-3 mt-3 border-t border-white/10">
              {!collapsed && <div className="sidebar-section text-primary-400">{t('superAdmin.title', language)}</div>}
              <NavLink to="/super-admin" end onClick={() => setMobileOpen(false)} className={({ isActive }) => `sidebar-item ${isActive ? 'sidebar-item-active' : ''} ${collapsed ? 'justify-center px-2' : ''}`} title={collapsed ? t('superAdmin.dashboard', language) : undefined}>
                <ShieldCheck size={18} />
                {!collapsed && <span>{t('superAdmin.dashboard', language)}</span>}
              </NavLink>
              <NavLink to="/super-admin/users" onClick={() => setMobileOpen(false)} className={({ isActive }) => `sidebar-item ${isActive ? 'sidebar-item-active' : ''} ${collapsed ? 'justify-center px-2' : ''}`} title={collapsed ? t('superAdmin.usersTenants', language) : undefined}>
                <Users size={18} />
                {!collapsed && <span>{t('superAdmin.usersTenants', language)}</span>}
              </NavLink>
              <NavLink to="/super-admin/subscriptions" onClick={() => setMobileOpen(false)} className={({ isActive }) => `sidebar-item ${isActive ? 'sidebar-item-active' : ''} ${collapsed ? 'justify-center px-2' : ''}`} title={collapsed ? t('superAdmin.subscriptions', language) : undefined}>
                <Billing size={18} />
                {!collapsed && <span>{t('superAdmin.subscriptions', language)}</span>}
              </NavLink>
              <NavLink to="/super-admin/analytics" onClick={() => setMobileOpen(false)} className={({ isActive }) => `sidebar-item ${isActive ? 'sidebar-item-active' : ''} ${collapsed ? 'justify-center px-2' : ''}`} title={collapsed ? t('superAdmin.analytics', language) : undefined}>
                <BarChart3 size={18} />
                {!collapsed && <span>{t('superAdmin.analytics', language)}</span>}
              </NavLink>
              <NavLink to="/super-admin/employees" onClick={() => setMobileOpen(false)} className={({ isActive }) => `sidebar-item ${isActive ? 'sidebar-item-active' : ''} ${collapsed ? 'justify-center px-2' : ''}`} title={collapsed ? t('superAdmin.employeeKpis', language) : undefined}>
                <UserCog size={18} />
                {!collapsed && <span>{t('superAdmin.employeeKpis', language)}</span>}
              </NavLink>
              <NavLink to="/super-admin/sales-codes" onClick={() => setMobileOpen(false)} className={({ isActive }) => `sidebar-item ${isActive ? 'sidebar-item-active' : ''} ${collapsed ? 'justify-center px-2' : ''}`} title={collapsed ? t('superAdmin.salesCodes', language) : undefined}>
                <Receipt size={18} />
                {!collapsed && <span>{t('superAdmin.salesCodes', language)}</span>}
              </NavLink>
              <NavLink to="/super-admin/permissions" onClick={() => setMobileOpen(false)} className={({ isActive }) => `sidebar-item ${isActive ? 'sidebar-item-active' : ''} ${collapsed ? 'justify-center px-2' : ''}`} title={collapsed ? t('superAdmin.permissions', language) : undefined}>
                <ShieldCheck size={18} />
                {!collapsed && <span>{t('superAdmin.permissions', language)}</span>}
              </NavLink>
              <NavLink to="/super-admin/audit" onClick={() => setMobileOpen(false)} className={({ isActive }) => `sidebar-item ${isActive ? 'sidebar-item-active' : ''} ${collapsed ? 'justify-center px-2' : ''}`} title={collapsed ? t('superAdmin.auditLog', language) : undefined}>
                <ScrollText size={18} />
                {!collapsed && <span>{t('superAdmin.auditLog', language)}</span>}
              </NavLink>
            </div>
          )}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center py-2 text-ink-400 hover:text-white hover:bg-white/10 transition-colors border-t border-white/10"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
        </button>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex-shrink-0 h-14 bg-white border-b border-ink-100 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg text-ink-600 hover:bg-ink-100 transition-colors"
              aria-label="Open menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
            </button>
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                className="w-full pl-9 pr-3 py-1.5 text-sm bg-ink-50 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder={t('common.search', language)}
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={runSearch}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/app/notifications')} className="relative p-2 rounded-lg text-ink-500 hover:bg-ink-100 transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-error-500 rounded-full" />
            </button>
            <div className="h-6 w-px bg-ink-200" />
            <button
              onClick={() => { signOut(); navigate('/'); }}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-ink-100 transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white text-sm font-bold">
                {(profile?.first_name?.[0] || profile?.email?.[0] || 'U').toUpperCase()}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold text-ink-800 leading-tight">
                  {profile?.first_name} {profile?.last_name}
                </p>
                <p className="text-xs text-ink-500 leading-tight">{organization?.name}</p>
              </div>
              <LogOut size={16} className="text-ink-400 ml-1" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
