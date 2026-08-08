import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import LandingPage from './views/LandingPage'
import Pricing from './views/Pricing'
import ContactSales from './views/ContactSales'
import AuthPage from './views/AuthPage'
import CRMModules from './views/CRMModules'
import BusinessModules from './views/BusinessModules'
import AIWorkforceModules from './views/AIWorkforceModules'
import AnalyticsModules from './views/AnalyticsModules'
import TeamModules from './views/TeamModules'
import IntegrationsModules from './views/IntegrationsModules'
import SystemModules from './views/SystemModules'
import { initializeDatabase, saveToStorage } from './mockData'
import * as Icons from 'lucide-react'

export default function App() {
  // Views states: 'landing', 'pricing', 'contactSales', 'login', 'signUp', 'forgot', 'dashboard'
  const [currentView, setView] = useState('landing')
  const [selectedPlan, setSelectedPlan] = useState('Pro') // Default to Pro
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [currentModule, setCurrentModule] = useState('overview') // active module in dashboard
  const [userSession, setUserSession] = useState(null)
  
  // Database local persistence
  const [database, setDatabase] = useState(() => initializeDatabase())

  // Modal states
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false)
  const [aiQuery, setAiQuery] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  // Sync state to local storage
  const updateDatabase = (key, data) => {
    const updated = { ...database, [key]: data }
    setDatabase(updated)
    saveToStorage(key, data)
  }

  // Restore user session if available
  useEffect(() => {
    const storedSession = localStorage.getItem('atlas_crm_session')
    if (storedSession) {
      const parsed = JSON.parse(storedSession)
      setUserSession(parsed.user)
      // Restore billing state as well
      if (parsed.billing) {
        updateDatabase('billing', parsed.billing)
      }
      setView('dashboard')
    }
  }, [])

  // Listen to keyboard shortcuts (⌘K or Ctrl+K for AI Assistant)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsAiAssistantOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Handle mock login/signup success
  const handleLoginSuccess = (session) => {
    setUserSession(session.user)
    updateDatabase('billing', session.billing)
    localStorage.setItem('atlas_crm_session', JSON.stringify(session))
    setView('dashboard')
    setCurrentModule('overview')
  }

  const handleLogout = () => {
    setUserSession(null)
    localStorage.removeItem('atlas_crm_session')
    setView('landing')
  }

  const handleUpdateProfile = (name, email) => {
    const updatedUser = { ...userSession, name, email }
    setUserSession(updatedUser)
    
    // update audit log
    const newLog = {
      id: 'log_' + Date.now(),
      action: 'Mise à jour Profil',
      user: email,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      details: `Nom changé en : ${name}`
    }
    updateDatabase('auditLogs', [newLog, ...database.auditLogs])

    // Update localStorage session
    const stored = JSON.parse(localStorage.getItem('atlas_crm_session') || '{}')
    stored.user = updatedUser
    localStorage.setItem('atlas_crm_session', JSON.stringify(stored))
  }

  // Compute remaining trial days
  const trialEndDate = new Date(database.billing.trialEndDate)
  const today = new Date()
  const diffTime = trialEndDate - today
  const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))

  // Approvals actions (Command center widget)
  const [approvalsCount, setApprovalsCount] = useState(7)
  const [approvals, setApprovals] = useState([
    { id: 'ap1', title: 'Devis Migration Cloud Orange', amount: '85 000 €', type: 'Signoff' },
    { id: 'ap2', title: 'Recrutement Mamadou Ba (Ingénieur AI)', salary: '65k€', type: 'HR' },
    { id: 'ap3', title: 'Remboursement frais transport Awa Cisse', amount: '124 €', type: 'Expense' }
  ])

  const handleApprove = (id) => {
    setApprovals(approvals.filter(ap => ap.id !== id))
    setApprovalsCount(prev => Math.max(0, prev - 1))
    
    // Add activity and audit log
    const approvedItem = approvals.find(ap => ap.id === id)
    const newAudit = {
      id: 'audit_' + Date.now(),
      action: 'Approbation validée',
      user: userSession?.email || 'admin@liafrik.com',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      details: `Approuvé : ${approvedItem?.title}`
    }
    updateDatabase('auditLogs', [newAudit, ...database.auditLogs])
  }

  // AI Assistant responses
  const handleAiSearch = (e) => {
    e.preventDefault()
    if (!aiQuery.trim()) return

    setAiResponse('Génération en cours par Atlas AI...')
    setTimeout(() => {
      const query = aiQuery.toLowerCase()
      if (query.includes('contact') || query.includes('jean')) {
        setAiResponse(`🔍 Atlas AI a localisé Jean Dupont (Directeur Technique chez Orange). Email: jean.dupont@orange.fr. Souhaitez-vous planifier un appel ou pré-rédiger un mail de relance ?`)
      } else if (query.includes('devis') || query.includes('proposition')) {
        setAiResponse(`📄 Vous avez 3 devis actifs. Le devis QT-2026-001 d'un montant de 948€ pour Orange a été signé.`)
      } else if (query.includes('lead') || query.includes('prospect')) {
        setAiResponse(`📈 Vous avez 5 leads actifs représentant un volume de pipeline qualifié estimé à 310k€.`)
      } else {
        setAiResponse(`🤖 Bonjour ${userSession?.name || 'Fatou'} ! Je suis votre copilote Atlas AI. Je peux analyser vos deals, planifier des événements ou modifier des prompts d'agents autonomes. Saisissez votre consigne.`)
      }
    }, 600)
  }

  return (
    <div className="h-full flex flex-col bg-slate-50 font-glacial antialiased text-slate-800">
      
      {/* RENDER PUBLIC VIEW */}
      {currentView !== 'dashboard' && (
        <div className="flex flex-col min-h-screen">
          <Navbar 
            currentView={currentView} 
            setView={setView} 
            onSelectPlan={setSelectedPlan} 
          />
          
          <main className="flex-1">
            {currentView === 'landing' && (
              <LandingPage setView={setView} onSelectPlan={setSelectedPlan} />
            )}
            {currentView === 'pricing' && (
              <Pricing setView={setView} onSelectPlan={setSelectedPlan} />
            )}
            {currentView === 'contactSales' && (
              <ContactSales setView={setView} />
            )}
            {(currentView === 'login' || currentView === 'signUp' || currentView === 'forgot') && (
              <AuthPage 
                mode={currentView === 'login' ? 'login' : currentView === 'forgot' ? 'forgot' : 'signUp'} 
                setMode={(m) => setView(m === 'signUp' ? 'signUp' : m === 'login' ? 'login' : 'forgot')} 
                selectedPlan={selectedPlan}
                onLoginSuccess={handleLoginSuccess}
              />
            )}
          </main>

          {/* Footer public */}
          <footer className="bg-salesforce-dark border-t border-slate-800 text-slate-400 py-12 text-center text-xs">
            <div className="max-w-7xl mx-auto px-4 space-y-4">
              <div className="flex justify-center items-center space-x-2">
                <svg className="h-6 w-6 text-salesforce-blue" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
                </svg>
                <span className="font-extrabold text-sm text-white">Atlas CRM</span>
              </div>
              <p>© 2026 Atlas CRM by LiAfrik. Tous droits réservés. Inspiré de l'excellence opérationnelle Salesforce.</p>
            </div>
          </footer>
        </div>
      )}

      {/* RENDER AUTHENTICATED DASHBOARD */}
      {currentView === 'dashboard' && (
        <div className="flex h-screen overflow-hidden">
          
          {/* Sidebar */}
          <Sidebar 
            currentModule={currentModule} 
            setCurrentModule={setCurrentModule} 
            isCollapsed={isSidebarCollapsed} 
            setIsCollapsed={setIsSidebarCollapsed}
            onLogout={handleLogout}
            onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
          />

          {/* Core Content area */}
          <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
            isSidebarCollapsed ? 'md:pl-16' : 'md:pl-64'
          }`}>
            
            {/* Topbar */}
            <header className="bg-white border-b border-salesforce-gray-border h-16 flex items-center justify-between px-6 shrink-0 relative z-30">
              <div className="flex items-center space-x-4">
                <h1 className="text-sm font-extrabold text-salesforce-dark uppercase tracking-wider flex items-center space-x-2">
                  <span>Application Center</span>
                  <span className="text-slate-300">/</span>
                  <span className="text-salesforce-blue lowercase font-mono font-medium">{currentModule}</span>
                </h1>
              </div>

              <div className="flex items-center space-x-4">
                {/* AI Assistant header badge trigger */}
                <button
                  onClick={() => setIsAiAssistantOpen(true)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-salesforce-blue transition flex items-center space-x-1 border"
                  title="Copilote AI (⌘K)"
                >
                  <Icons.Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                  <span className="text-[10px] font-bold px-1 hidden sm:inline">Copilote AI</span>
                </button>

                {/* Notifications icon */}
                <button 
                  onClick={() => setCurrentModule('notifications')}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 relative"
                >
                  <Icons.Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-rose-500 border-2 border-white"></span>
                </button>

                {/* User Profile dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-100 transition"
                  >
                    <div className="h-8 w-8 bg-salesforce-blue text-white rounded-full flex items-center justify-center font-bold text-sm uppercase">
                      {userSession?.name?.charAt(0) || 'F'}
                    </div>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded border border-salesforce-gray-border shadow-lg py-1 z-50 text-xs">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="font-bold text-salesforce-dark">{userSession?.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{userSession?.email}</p>
                      </div>
                      <button 
                        onClick={() => {
                          setCurrentModule('settings')
                          setIsProfileOpen(false)
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center space-x-2 text-slate-700"
                      >
                        <Icons.User className="w-3.5 h-3.5" />
                        <span>Profil & Paramètres</span>
                      </button>
                      <button 
                        onClick={() => {
                          setCurrentModule('billing')
                          setIsProfileOpen(false)
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center space-x-2 text-slate-700"
                      >
                        <Icons.Wallet className="w-3.5 h-3.5" />
                        <span>Mon Abonnement</span>
                      </button>
                      <hr className="border-slate-100" />
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 flex items-center space-x-2 font-semibold"
                      >
                        <Icons.LogOut className="w-3.5 h-3.5" />
                        <span>Se déconnecter</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* Sticky 14-Day Free Trial Tracker Banner */}
            <div className="bg-salesforce-blue text-white px-6 py-3 shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-salesforce-blue-dark">
              <div className="flex items-center space-x-3 text-xs">
                <span className="p-1 rounded bg-white/20 text-white shrink-0">
                  <Icons.Calendar className="w-4 h-4" />
                </span>
                <div>
                  <span className="font-extrabold block">
                    {diffDays === 0 ? "Votre essai gratuit Atlas expire aujourd'hui !" : `${diffDays} days left in your ${database.billing.tier} trial`}
                  </span>
                  <span className="text-[10px] text-blue-100 font-light block">
                    Expire le {trialEndDate.toLocaleDateString()} • Plan : <strong>{database.billing.tier}</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Custom warning alert banner notifications simulation */}
                {diffDays <= 7 && (
                  <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded animate-pulse">
                    ⚠️ Attention : Moins d'une semaine restante
                  </span>
                )}
                
                {database.billing.subscriptionStatus !== 'active' && (
                  <button 
                    onClick={() => setCurrentModule('billing')}
                    className="bg-white hover:bg-blue-50 text-salesforce-blue text-[11px] font-extrabold px-3 py-1.5 rounded shadow-sm transition"
                  >
                    Activer mon abonnement
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Viewport */}
            <main className="flex-1 overflow-y-auto p-6 relative z-10 space-y-6">
              
              {/* RENDER ACTIVE MODULE */}
              {currentModule === 'overview' && (
                <div className="space-y-6 fade-in">
                  
                  {/* Hero welcome row */}
                  <div className="bg-white rounded-lg border border-salesforce-gray-border shadow-sm p-6 grid md:grid-cols-3 gap-6 items-center">
                    <div className="md:col-span-2 space-y-2">
                      <h2 className="text-2xl font-extrabold text-salesforce-dark">
                        Heureux de vous revoir, {userSession?.name} ! 👋
                      </h2>
                      <p className="text-xs text-slate-600 font-light max-w-xl leading-relaxed">
                        Voici la console d'accueil d'<strong>Atlas CRM by LiAfrik</strong>. Vos agents d'IA sont opérationnels et surveillent votre pipeline de ventes en permanence.
                      </p>
                    </div>

                    <div className="bg-slate-50 border p-4 rounded-lg flex items-center space-x-3">
                      <span className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
                        <Icons.TrendingUp className="w-6 h-6" />
                      </span>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Conversion AI Rate</span>
                        <span className="text-xl font-extrabold text-slate-800">94.8%</span>
                      </div>
                    </div>
                  </div>

                  {/* Operational stats row */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded border shadow-sm space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Pipeline Estimé</span>
                      <span className="text-xl font-extrabold text-salesforce-dark">310 000 €</span>
                    </div>
                    <div className="bg-white p-4 rounded border shadow-sm space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Contacts Totaux</span>
                      <span className="text-xl font-extrabold text-salesforce-blue">{database.contacts.length}</span>
                    </div>
                    <div className="bg-white p-4 rounded border shadow-sm space-y-1 text-xs">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Prospects Qualifiés</span>
                      <span className="text-xl font-extrabold text-purple-700">{database.leads.filter(l => l.status === 'Qualified').length}</span>
                    </div>
                    <div className="bg-white p-4 rounded border shadow-sm space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Agents IA Actifs</span>
                      <span className="text-xl font-extrabold text-emerald-600">2 / 2</span>
                    </div>
                  </div>

                  {/* Core interactive panels (Approvals & Tasks) */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Approvals queue */}
                    <div className="bg-white p-5 rounded-lg border border-salesforce-gray-border shadow-sm space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b">
                        <h3 className="font-bold text-xs text-salesforce-dark uppercase tracking-wider flex items-center space-x-2">
                          <Icons.ShieldCheck className="w-4 h-4 text-salesforce-blue" />
                          <span>Demandes d'Approbations</span>
                        </h3>
                        <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {approvalsCount} en attente
                        </span>
                      </div>

                      <div className="space-y-3">
                        {approvals.length === 0 ? (
                          <p className="text-center text-slate-400 italic text-xs py-8">Toutes les approbations ont été validées ✔</p>
                        ) : (
                          approvals.map(ap => (
                            <div key={ap.id} className="p-3 bg-slate-50 rounded border flex justify-between items-center gap-3 text-xs">
                              <div>
                                <h4 className="font-bold text-slate-700 leading-tight">{ap.title}</h4>
                                <span className="text-[10px] text-indigo-600 font-semibold mt-0.5 block">{ap.amount || ap.salary}</span>
                              </div>

                              <button
                                onClick={() => handleApprove(ap.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-3 py-1.5 rounded transition shadow-sm shrink-0"
                              >
                                Approuver ✔
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* AI Tasks queue */}
                    <div className="bg-white p-5 rounded-lg border border-salesforce-gray-border shadow-sm space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b">
                        <h3 className="font-bold text-xs text-salesforce-dark uppercase tracking-wider flex items-center space-x-2">
                          <Icons.Cpu className="w-4 h-4 text-emerald-500" />
                          <span>Statut des Tâches d'IA</span>
                        </h3>
                        <button 
                          onClick={() => setCurrentModule('aiTasks')}
                          className="text-[10px] font-bold text-salesforce-blue hover:underline"
                        >
                          Voir l'historique
                        </button>
                      </div>

                      <div className="space-y-3 text-xs">
                        {database.aiTasks.map(task => (
                          <div key={task.id} className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-100">
                            <div>
                              <h4 className="font-bold text-slate-700">{task.name}</h4>
                              <p className="text-[10px] text-slate-400">Agent: {task.agent}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              task.status === 'Success' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800 animate-pulse'
                            }`}>
                              {task.status === 'Success' ? 'Succès' : 'En cours'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recent Logs panel */}
                  <div className="bg-white p-5 rounded-lg border border-salesforce-gray-border shadow-sm space-y-3">
                    <h3 className="font-bold text-xs text-salesforce-dark uppercase tracking-wider">Modifications Récentes</h3>
                    <div className="divide-y divide-slate-100 text-xs">
                      {database.auditLogs.slice(0, 3).map(log => (
                        <div key={log.id} className="py-2.5 flex justify-between items-center gap-4">
                          <div>
                            <span className="font-bold text-slate-700 block">{log.action}</span>
                            <span className="text-[10px] text-slate-400 block">{log.timestamp} • par {log.user}</span>
                          </div>
                          <span className="text-slate-500 font-mono text-[10px] italic">{log.details}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* CRM SUBMODULES ROUTER */}
              {['contacts', 'companies', 'leads', 'deals', 'activities', 'calendar'].includes(currentModule) && (
                <CRMModules 
                  subModule={currentModule} 
                  database={database} 
                  updateDatabase={updateDatabase} 
                />
              )}

              {/* BUSINESS SUBMODULES ROUTER */}
              {['products', 'quotes', 'orders', 'invoices', 'payments', 'marketing', 'support'].includes(currentModule) && (
                <BusinessModules 
                  subModule={currentModule} 
                  database={database} 
                  updateDatabase={updateDatabase} 
                />
              )}

              {/* AI WORKFORCE SUBMODULES ROUTER */}
              {['aiAgents', 'aiTasks', 'workflows', 'aiMemory', 'knowledgeBase'].includes(currentModule) && (
                <AIWorkforceModules 
                  subModule={currentModule} 
                  database={database} 
                  updateDatabase={updateDatabase} 
                />
              )}

              {/* ANALYTICS SUBMODULES ROUTER */}
              {['reports', 'dashboards', 'aiInsights'].includes(currentModule) && (
                <AnalyticsModules 
                  subModule={currentModule} 
                  database={database} 
                />
              )}

              {/* TEAM SUBMODULES ROUTER */}
              {['employees', 'teams', 'permissions'].includes(currentModule) && (
                <TeamModules 
                  subModule={currentModule} 
                  database={database} 
                  updateDatabase={updateDatabase} 
                />
              )}

              {/* INTEGRATIONS SUBMODULES ROUTER */}
              {['appMarketplace', 'connectedApps', 'apiWebhooks'].includes(currentModule) && (
                <IntegrationsModules 
                  subModule={currentModule} 
                />
              )}

              {/* SYSTEM SUBMODULES ROUTER */}
              {['notifications', 'auditLog', 'settings', 'billing', 'aiUsage'].includes(currentModule) && (
                <SystemModules 
                  subModule={currentModule} 
                  database={database} 
                  updateDatabase={updateDatabase} 
                  onUpdateProfile={handleUpdateProfile}
                />
              )}

            </main>
          </div>

          {/* GLOBAL INTEGRATED AI ASSISTANT OVERLAY MODAL */}
          {isAiAssistantOpen && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
              <div className="bg-white rounded-lg border border-salesforce-gray-border shadow-2xl max-w-lg w-full overflow-hidden slide-in">
                
                {/* Header */}
                <div className="bg-salesforce-dark text-white px-5 py-4 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Icons.Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                    <div>
                      <h3 className="font-bold text-xs uppercase tracking-widest leading-none">Copilote Atlas AI</h3>
                      <span className="text-[9px] text-slate-300">Raccourci d'activation : ⌘K ou Ctrl+K</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setIsAiAssistantOpen(false)
                      setAiResponse('')
                      setAiQuery('')
                    }} 
                    className="text-white hover:text-slate-300"
                  >
                    <Icons.X className="w-4 h-4" />
                  </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                  <form onSubmit={handleAiSearch} className="relative">
                    <input
                      type="text"
                      autoFocus
                      required
                      placeholder="Comment puis-je vous aider aujourd'hui ? (Ex: cherchez jean...)"
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      className="w-full border border-salesforce-gray-border rounded pl-4 pr-12 py-3 text-xs focus:outline-none focus:border-salesforce-blue font-medium"
                    />
                    <button 
                      type="submit" 
                      className="absolute right-3 top-2 px-3 py-1 bg-salesforce-blue text-white rounded text-[10px] font-bold"
                    >
                      Poser
                    </button>
                  </form>

                  {/* Suggestion tags */}
                  <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-slate-500">
                    <span className="bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded cursor-pointer transition" onClick={() => setAiQuery('Chercher le contact Jean Dupont')}>🔍 Chercher "Jean"</span>
                    <span className="bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded cursor-pointer transition" onClick={() => setAiQuery('Rapport des devis')}>📄 Analyser mes devis</span>
                    <span className="bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded cursor-pointer transition" onClick={() => setAiQuery('Résumé de mon pipeline')}>📈 Résumé du pipeline</span>
                  </div>

                  {/* Conversational Stream */}
                  {aiResponse && (
                    <div className="bg-slate-50 border border-slate-150 p-4 rounded-lg text-xs leading-relaxed space-y-2 text-slate-700">
                      <p>{aiResponse}</p>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 border-t p-3 text-center text-[10px] text-slate-400 font-mono">
                  💡 Posez des questions sémantiques ou recherchez des contacts de votre CRM.
                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  )
}
