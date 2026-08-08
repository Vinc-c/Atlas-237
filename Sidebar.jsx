import React from 'react'
import * as Icons from 'lucide-react'

export default function Sidebar({ 
  currentModule, 
  setCurrentModule, 
  isCollapsed, 
  setIsCollapsed, 
  onLogout,
  onOpenAiAssistant
}) {
  // Let's define the exact sidebar categories and items structure as requested
  const navigationConfig = [
    {
      category: 'COMMAND CENTER',
      items: [
        { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
        { id: 'aiAssistant', label: 'AI Assistant', icon: 'Sparkles', shortcut: '⌘K' },
        { id: 'approvals', label: 'Approvals', icon: 'ShieldCheck', badge: 7 }
      ]
    },
    {
      category: 'CRM',
      items: [
        { id: 'contacts', label: 'Contacts', icon: 'Users' },
        { id: 'companies', label: 'Companies', icon: 'Building2' },
        { id: 'leads', label: 'Leads', icon: 'UserCheck', badge: 24 },
        { id: 'deals', label: 'Deals', icon: 'Landmark' },
        { id: 'activities', label: 'Activities', icon: 'ClipboardList' },
        { id: 'calendar', label: 'Calendar', icon: 'Calendar' }
      ]
    },
    {
      category: 'BUSINESS',
      items: [
        { id: 'products', label: 'Products', icon: 'Package' },
        { id: 'quotes', label: 'Quotes', icon: 'FileText' },
        { id: 'orders', label: 'Orders', icon: 'ShoppingCart' },
        { id: 'invoices', label: 'Invoices', icon: 'Receipt', badge: 3 },
        { id: 'payments', label: 'Payments', icon: 'CreditCard' },
        { id: 'marketing', label: 'Marketing', icon: 'Megaphone' },
        { id: 'support', label: 'Support', icon: 'LifeBuoy', badge: 12 }
      ]
    },
    {
      category: 'AI WORKFORCE',
      items: [
        { id: 'aiAgents', label: 'AI Agents', icon: 'Bot' },
        { id: 'aiTasks', label: 'AI Tasks', icon: 'Cpu' },
        { id: 'workflows', label: 'Workflows', icon: 'GitFork' },
        { id: 'aiMemory', label: 'AI Memory', icon: 'Database' },
        { id: 'knowledgeBase', label: 'Knowledge Base', icon: 'BookOpen' }
      ]
    },
    {
      category: 'ANALYTICS',
      items: [
        { id: 'reports', label: 'Reports', icon: 'BarChart3' },
        { id: 'dashboards', label: 'Dashboards', icon: 'Presentation' },
        { id: 'aiInsights', label: 'AI Insights', icon: 'Lightbulb' }
      ]
    },
    {
      category: 'TEAM',
      items: [
        { id: 'employees', label: 'Employees', icon: 'UserSquare2' },
        { id: 'teams', label: 'Teams', icon: 'Network' },
        { id: 'permissions', label: 'Permissions', icon: 'Key' }
      ]
    },
    {
      category: 'INTEGRATIONS',
      items: [
        { id: 'appMarketplace', label: 'App Marketplace', icon: 'Store' },
        { id: 'connectedApps', label: 'Connected Apps', icon: 'Link2' },
        { id: 'apiWebhooks', label: 'API / Webhooks', icon: 'Code2' }
      ]
    },
    {
      category: 'SYSTEM',
      items: [
        { id: 'notifications', label: 'Notifications', icon: 'Bell', badge: 5 },
        { id: 'auditLog', label: 'Audit Log', icon: 'Scroll' },
        { id: 'settings', label: 'Settings', icon: 'Settings' },
        { id: 'billing', label: 'Billing', icon: 'Wallet' },
        { id: 'aiUsage', label: 'AI Usage', icon: 'Gauge' }
      ]
    }
  ]

  const renderIcon = (iconName) => {
    const IconComponent = Icons[iconName]
    return IconComponent ? <IconComponent className="w-4 h-4" /> : <Icons.HelpCircle className="w-4 h-4" />
  }

  return (
    <aside 
      className={`fixed top-0 bottom-0 left-0 z-40 bg-salesforce-dark text-white flex flex-col justify-between transition-all duration-300 border-r border-slate-800 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className={`flex items-center space-x-3 overflow-hidden ${isCollapsed ? 'hidden' : 'flex'}`}>
          <svg className="h-8 w-8 text-salesforce-blue shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
          </svg>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm text-white tracking-tight leading-none">Atlas CRM</span>
            <span className="text-[9px] text-salesforce-blue-light font-bold tracking-wider uppercase leading-none mt-1">by LiAfrik</span>
          </div>
        </div>

        {isCollapsed && (
          <div className="mx-auto">
            <svg className="h-7 w-7 text-salesforce-blue" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
            </svg>
          </div>
        )}

        {/* Collapse Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:block p-1.5 rounded hover:bg-slate-800 transition text-slate-400 hover:text-white shrink-0"
          title={isCollapsed ? 'Agrandir la sidebar' : 'Réduire la sidebar'}
        >
          {isCollapsed ? (
            <Icons.ChevronRight className="w-4 h-4" />
          ) : (
            <Icons.ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 select-none">
        {navigationConfig.map((group) => (
          <div key={group.category} className="space-y-1">
            {/* Category header */}
            {!isCollapsed ? (
              <h4 className="px-3 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                {group.category}
              </h4>
            ) : (
              <div className="h-px bg-slate-800 my-2 mx-2"></div>
            )}

            {/* Category items */}
            {group.items.map((item) => {
              const isActive = currentModule === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'aiAssistant') {
                      onOpenAiAssistant()
                    } else {
                      setCurrentModule(item.id)
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs transition relative group ${
                    isActive 
                      ? 'bg-salesforce-blue text-white font-semibold shadow-sm' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <span className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                      {renderIcon(item.icon)}
                    </span>
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {/* Badges or shortcuts */}
                  {!isCollapsed && (
                    <>
                      {item.badge && (
                        <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                          {item.badge}
                        </span>
                      )}
                      {item.shortcut && (
                        <span className="text-[10px] text-slate-500 font-mono bg-slate-800 px-1.5 py-0.5 rounded shrink-0">
                          {item.shortcut}
                        </span>
                      )}
                    </>
                  )}

                  {/* Floating collapsed badge count */}
                  {isCollapsed && item.badge && (
                    <span className="absolute top-1 right-1 bg-rose-500 text-white text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                      {item.badge}
                    </span>
                  )}

                  {/* Custom collapsed tooltip */}
                  {isCollapsed && (
                    <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-slate-950 text-white text-xs font-semibold px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {item.label} {item.badge ? `(${item.badge})` : ''}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 space-y-2">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded transition"
        >
          <Icons.LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Se déconnecter</span>}
        </button>
      </div>
    </aside>
  )
}
