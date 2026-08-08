import React from 'react'

export default function Pricing({ setView, onSelectPlan }) {
  const handleSelectPlan = (tier) => {
    onSelectPlan(tier);
    setView('signUp');
  };

  return (
    <div className="bg-slate-50 min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <span className="text-xs font-bold text-salesforce-blue uppercase tracking-widest bg-salesforce-blue-light px-3 py-1 rounded-full">
            Tarifs clairs & transparents
          </span>
          <h1 className="text-4xl font-extrabold text-salesforce-dark">
            Une formule adaptée à chaque étape de votre croissance
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg font-light">
            Tous nos abonnements s'accompagnent d'un essai gratuit de 14 jours, sans engagement. Aucun frais caché.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          
          {/* Starter Plan */}
          <div className="bg-white rounded-lg border border-salesforce-gray-border shadow-sm p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-salesforce-dark">Starter</h3>
                <p className="text-sm text-slate-500 mt-2">Pour les petites structures voulant structurer leur processus commercial.</p>
              </div>
              
              <div className="flex items-baseline">
                <span className="text-5xl font-extrabold text-salesforce-dark">29€</span>
                <span className="text-slate-500 ml-2">/ mois</span>
              </div>
              <p className="text-xs text-salesforce-blue font-semibold">14 jours d'essai gratuit automatique</p>

              <hr className="border-salesforce-gray-border" />

              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Jusqu'à 5 utilisateurs</span>
                </li>
                <li className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Gestion Contacts & Entreprises</span>
                </li>
                <li className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Pipeline de Ventes (Deals Kanban)</span>
                </li>
                <li className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Générateur de devis de base</span>
                </li>
                <li className="flex items-center space-x-3 opacity-40">
                  <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="line-through">AI Workforce autonome</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <button
                onClick={() => handleSelectPlan('Starter')}
                className="w-full bg-white border-2 border-salesforce-blue hover:bg-salesforce-blue-light/30 text-salesforce-blue font-bold py-3 px-4 rounded transition text-center"
              >
                Get Started with Starter
              </button>
            </div>
          </div>

          {/* Pro Plan (Best Value) */}
          <div className="bg-white rounded-lg border-2 border-salesforce-blue shadow-md p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-salesforce-blue text-white text-[10px] font-bold tracking-widest uppercase px-4 py-1 rounded-bl">
              Recommandé
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-salesforce-dark">Pro</h3>
                <p className="text-sm text-slate-500 mt-2">Le plan CRM de référence, augmenté à l'IA pour maximiser la conversion.</p>
              </div>
              
              <div className="flex items-baseline">
                <span className="text-5xl font-extrabold text-salesforce-dark">79€</span>
                <span className="text-slate-500 ml-2">/ mois</span>
              </div>
              <p className="text-xs text-salesforce-blue font-semibold">14 jours d'essai gratuit automatique</p>

              <hr className="border-salesforce-gray-border" />

              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-semibold text-salesforce-dark">Utilisateurs illimités</span>
                </li>
                <li className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Tous les modules CRM Avancés</span>
                </li>
                <li className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-semibold text-salesforce-blue">AI Workforce autonome (2 Agents)</span>
                </li>
                <li className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Facturation, Devis & Bons de commande</span>
                </li>
                <li className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>API, Webhooks & Connected Apps</span>
                </li>
                <li className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Support Prioritaire 24/7</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <button
                onClick={() => handleSelectPlan('Pro')}
                className="w-full bg-salesforce-blue hover:bg-salesforce-blue-hover text-white font-bold py-3 px-4 rounded transition shadow-md text-center"
              >
                Get Started with Pro
              </button>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white rounded-lg border border-salesforce-gray-border shadow-sm p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-salesforce-dark">Enterprise</h3>
                <p className="text-sm text-slate-500 mt-2">Pour les grandes entreprises exigeant conformité, intégrations SLDS et cloud dédié.</p>
              </div>
              
              <div className="flex items-baseline">
                <span className="text-4xl font-extrabold text-salesforce-dark">Sur Mesure</span>
              </div>
              <p className="text-xs text-slate-500 font-semibold">Volume et cloud privé</p>

              <hr className="border-salesforce-gray-border" />

              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Nombre d'agents IA illimité</span>
                </li>
                <li className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Intégration sur site & SSO / SAML</span>
                </li>
                <li className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Conformité HIPAA / RGPD poussée</span>
                </li>
                <li className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Dedicated Customer Success Manager</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <button
                onClick={() => setView('contactSales')}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-4 rounded transition text-center"
              >
                Contact Sales
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
