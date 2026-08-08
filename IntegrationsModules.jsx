import React, { useState } from 'react'
import * as Icons from 'lucide-react'

export default function IntegrationsModules({ 
  subModule 
}) {
  const [apiKey, setApiKey] = useState('at_live_83210x98d41...')
  const [isGenerated, setIsGenerated] = useState(false)
  
  const generateNewKey = () => {
    const key = 'at_live_' + Array.from({ length: 24 }, () => Math.random().toString(36)[2]).join('')
    setApiKey(key)
    setIsGenerated(true)
  }

  const [apps, setApps] = useState([
    { id: 'slack', name: 'Slack Bot', desc: 'Envoyez vos notifications de leads directement dans vos channels.', installed: true },
    { id: 'stripe', name: 'Stripe payments', desc: 'Encassez les factures de vos devis en ligne via carte bancaire.', installed: true },
    { id: 'google', name: 'Google Calendar & Mail', desc: 'Synchronisez automatiquement vos rendez-vous et vos emails.', installed: false },
    { id: 'quickbooks', name: 'QuickBooks Sync', desc: 'Rapprochez instantanément vos devis et factures.', installed: false }
  ])

  const toggleApp = (appId) => {
    setApps(apps.map(a => a.id === appId ? { ...a, installed: !a.installed } : a))
  }

  if (subModule === 'appMarketplace' || subModule === 'connectedApps') {
    return (
      <div className="space-y-6 fade-in">
        <div className="bg-white p-4 rounded-lg border border-salesforce-gray-border shadow-sm">
          <h2 className="text-xl font-extrabold text-salesforce-dark flex items-center space-x-2">
            <Icons.Store className="w-5 h-5 text-salesforce-blue" />
            <span>App Marketplace & Connexions</span>
          </h2>
          <p className="text-xs text-slate-500">Connectez vos outils quotidiens pour unifier vos données dans Atlas CRM.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 text-xs">
          {apps.map(app => (
            <div key={app.id} className="bg-white p-5 rounded-lg border border-salesforce-gray-border shadow-sm flex justify-between items-start gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="p-2 bg-slate-50 border rounded text-salesforce-blue">
                    {app.id === 'slack' && <Icons.MessageSquare className="w-4 h-4" />}
                    {app.id === 'stripe' && <Icons.CreditCard className="w-4 h-4" />}
                    {app.id === 'google' && <Icons.Mail className="w-4 h-4" />}
                    {app.id === 'quickbooks' && <Icons.FileSpreadsheet className="w-4 h-4" />}
                  </span>
                  <h3 className="font-bold text-salesforce-dark text-sm">{app.name}</h3>
                </div>
                <p className="text-slate-500 mt-2">{app.desc}</p>
              </div>

              <button
                onClick={() => toggleApp(app.id)}
                className={`px-3 py-1.5 rounded font-bold transition whitespace-nowrap text-xs ${
                  app.installed 
                    ? 'bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100' 
                    : 'bg-salesforce-blue hover:bg-salesforce-blue-hover text-white shadow-sm'
                }`}
              >
                {app.installed ? 'Désinstaller' : 'Installer App'}
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (subModule === 'apiWebhooks') {
    return (
      <div className="space-y-6 fade-in text-xs">
        <div className="bg-white p-4 rounded-lg border border-salesforce-gray-border shadow-sm">
          <h2 className="text-xl font-extrabold text-salesforce-dark flex items-center space-x-2">
            <Icons.Code2 className="w-5 h-5 text-salesforce-blue" />
            <span>Clés d'API & Webhooks</span>
          </h2>
          <p className="text-xs text-slate-500">Intégrez vos propres logiciels personnalisés à Atlas CRM grâce à nos endpoints d'API.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border border-salesforce-gray-border shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800">Générer une Clé d'API Secrète</h3>
            <p className="text-slate-500">Utilisez cette clé pour soumettre des leads ou des contacts de manière programmatique.</p>
            
            <div className="bg-slate-50 border p-3 rounded font-mono select-all text-slate-700">
              {apiKey}
            </div>

            <button
              onClick={generateNewKey}
              className="bg-salesforce-blue hover:bg-salesforce-blue-hover text-white font-bold py-2 px-4 rounded transition text-xs shadow-sm"
            >
              {isGenerated ? 'Régénérer une clé' : 'Générer une nouvelle clé'}
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg border border-salesforce-gray-border shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800">Configurer un Endpoint Webhook</h3>
            <p className="text-slate-500">Recevez des notifications HTTP POST en temps réel à chaque nouvel achat ou lead qualifié.</p>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">URL de Destination (Payload URL)</label>
                <input
                  type="url"
                  placeholder="https://votre-site.com/api/atlas-webhook"
                  className="w-full border rounded px-3 py-2 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => alert('Webhook configuré avec succès.')}
                className="bg-slate-800 text-white font-bold py-2 px-4 rounded text-xs"
              >
                Activer le Webhook
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
