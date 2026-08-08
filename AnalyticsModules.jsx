import React from 'react'
import * as Icons from 'lucide-react'

export default function AnalyticsModules({ 
  subModule, 
  database 
}) {
  const { deals, leads } = database

  // Compute stats
  const totalPipeline = deals.reduce((sum, d) => sum + d.amount, 0)
  const activeLeads = leads.length
  const wonDeals = deals.filter(d => d.stage === 'Closed Won').length

  if (subModule === 'reports') {
    return (
      <div className="space-y-6 fade-in">
        <div className="bg-white p-4 rounded-lg border border-salesforce-gray-border shadow-sm">
          <h2 className="text-xl font-extrabold text-salesforce-dark flex items-center space-x-2">
            <Icons.BarChart3 className="w-5 h-5 text-salesforce-blue" />
            <span>Rapports de Performance de Ventes</span>
          </h2>
          <p className="text-xs text-slate-500">Générez des rapports d'activité analytiques pour vos comités de direction.</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-salesforce-gray-border shadow-sm space-y-4">
          <h3 className="font-bold text-xs text-salesforce-dark uppercase tracking-wider">Filtres du Rapport</h3>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">Période</label>
              <select className="w-full border rounded px-3 py-1.5 bg-white">
                <option>Ce trimestre (Q3 2026)</option>
                <option>Cette année (2026)</option>
                <option>Mois dernier</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">Collaborateur</label>
              <select className="w-full border rounded px-3 py-1.5 bg-white">
                <option>Tous les membres</option>
                <option>Fatou Sow</option>
                <option>Awa Cisse</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="bg-salesforce-blue text-white px-4 py-1.5 rounded font-bold hover:bg-salesforce-blue-hover text-xs">
                Exporter CSV
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (subModule === 'dashboards') {
    return (
      <div className="space-y-6 fade-in">
        <div className="bg-white p-4 rounded-lg border border-salesforce-gray-border shadow-sm">
          <h2 className="text-xl font-extrabold text-salesforce-dark flex items-center space-x-2">
            <Icons.Presentation className="w-5 h-5 text-salesforce-blue" />
            <span>Tableaux de Bord Opérationnels</span>
          </h2>
          <p className="text-xs text-slate-500">Indicateurs clés du chiffre d'affaires et de l'acquisition en temps réel.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-lg border border-salesforce-gray-border shadow-sm space-y-2">
            <span className="text-xs text-slate-400 font-bold uppercase">Volume du Pipeline</span>
            <div className="text-3xl font-extrabold text-salesforce-dark">{(totalPipeline).toLocaleString()} €</div>
            <p className="text-[10px] text-emerald-600 font-bold">▲ +12.4% par rapport à Q2</p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-salesforce-gray-border shadow-sm space-y-2">
            <span className="text-xs text-slate-400 font-bold uppercase">Prospects Actifs</span>
            <div className="text-3xl font-extrabold text-salesforce-blue">{activeLeads}</div>
            <p className="text-[10px] text-indigo-600 font-bold">Inbound & Outbound confondus</p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-salesforce-gray-border shadow-sm space-y-2">
            <span className="text-xs text-slate-400 font-bold uppercase">Opportunités Gagnées</span>
            <div className="text-3xl font-extrabold text-emerald-600">{wonDeals}</div>
            <p className="text-[10px] text-slate-400">Taux de closing global : 40%</p>
          </div>
        </div>

        {/* Visual progress card */}
        <div className="bg-white p-6 rounded-lg border border-salesforce-gray-border shadow-sm space-y-4">
          <h3 className="font-bold text-xs text-salesforce-dark uppercase tracking-wider">Objectif Commercial Trimestriel</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between font-bold text-slate-700">
              <span>Réalisé : {(totalPipeline * 0.4).toLocaleString()} € (Close Won)</span>
              <span>Objectif : 500 000 €</span>
            </div>
            <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
              <div className="bg-salesforce-blue h-full" style={{ width: `${Math.min(100, ((totalPipeline * 0.4) / 500000) * 100)}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (subModule === 'aiInsights') {
    return (
      <div className="space-y-6 fade-in">
        <div className="bg-white p-4 rounded-lg border border-salesforce-gray-border shadow-sm">
          <h2 className="text-xl font-extrabold text-salesforce-dark flex items-center space-x-2">
            <Icons.Lightbulb className="w-5 h-5 text-salesforce-blue" />
            <span>Recommandations Atlas AI Insights</span>
          </h2>
          <p className="text-xs text-slate-500">Suggestions prédictives fondées sur vos opportunités de ventes.</p>
        </div>

        <div className="space-y-4">
          <div className="bg-salesforce-blue-light/20 p-5 rounded-lg border border-salesforce-blue/20 flex items-start space-x-4">
            <span className="p-2 bg-salesforce-blue text-white rounded-full">
              <Icons.Sparkles className="w-4 h-4" />
            </span>
            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-salesforce-dark">Priorisez le closing du compte Société Générale</h4>
              <p className="text-slate-600 leading-relaxed">
                Notre modèle prédictif évalue à <strong>84%</strong> les chances de succès pour l'opportunité "AI Workforce Société Générale" (150 000 €). Le décideur technique a ouvert votre devis 4 fois ce matin. Programmez un appel de suivi sans tarder.
              </p>
            </div>
          </div>

          <div className="bg-amber-50 p-5 rounded-lg border border-amber-200 flex items-start space-x-4">
            <span className="p-2 bg-amber-500 text-white rounded-full">
              <Icons.AlertTriangle className="w-4 h-4" />
            </span>
            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-amber-900">Risque de désengagement sur le dossier TotalEnergies</h4>
              <p className="text-amber-800 leading-relaxed">
                Aucune activité n'a été consignée pour le prospect Alice Bertrand (TotalEnergies) depuis 10 jours. Le budget estimé est de 50 000 €. Lancez un agent d'IA ou programmez un rappel immédiat.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
