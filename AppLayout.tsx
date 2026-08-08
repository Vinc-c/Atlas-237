import { NavLink, useNavigate } from 'react-router-dom';
import { useState, type ComponentType } from 'react';
import {
  LayoutDashboard, Users, Building2, UserPlus, Handshake,
  KanbanSquare, Calendar, Activity, Package, FileText, ShoppingCart,
  Receipt, CreditCard, Megaphone, LifeBuoy, Bot, ListTodo, Workflow,
  Brain, BookOpen, CheckSquare, BarChart3, LayoutGrid, Lightbulb,
  UserCog, UsersRound, ShieldCheck, Store, Plug, Webhook, Bell,
  ScrollText, Settings, CreditCard as Billing, Gauge, Sparkles,
  ChevronDown, ChevronRight, LogOut, Search
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
  const { profile, organization, language, signOut } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-ink-50">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-60'} flex-shrink-0 bg-ink-900 text-white flex flex-col transition-all duration-200 sidebar-shadow overflow-hidden`}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 h-14 flex-shrink-0 border-b border-white/10">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 flex-shrink-0">
            <Sparkles size={18} />
          </div>
          {!collapsed && <span className="font-bold text-lg">Atlas CRM</span>}
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
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center py-2 text-ink-400 hover:text-white hover:bg-white/10 transition-colors border-t border-white/10"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
        </button>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex-shrink-0 h-14 bg-white border-b border-ink-100 flex items-center justify-between px-6">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                className="w-full pl-9 pr-3 py-1.5 text-sm bg-ink-50 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder={t('common.search', language)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg text-ink-500 hover:bg-ink-100 transition-colors">
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
          <div className="p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
