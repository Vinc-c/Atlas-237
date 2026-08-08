import React from 'react'

export default function LandingPage({ setView, onSelectPlan }) {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-salesforce-dark text-white py-20 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(1,118,211,0.2),transparent_50%)]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-salesforce-blue/20 text-salesforce-blue-light border border-salesforce-blue/30">
                🚀 Nouveau : Atlas AI Workforce disponible
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Réinventez votre CRM avec <span className="text-salesforce-blue-light">l'Intelligence Artificielle</span>.
              </h1>
              <p className="text-lg sm:text-xl text-blue-100 font-light max-w-2xl">
                La plateforme SaaS B2B ultime pour connecter vos équipes, stimuler vos opportunités de vente, gérer la facturation, et propulser vos automatisations grâce à des agents d'IA autonomes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setView('pricing')}
                  className="bg-salesforce-blue text-white px-8 py-4 rounded font-bold text-base hover:bg-salesforce-blue-hover transition shadow-lg flex items-center justify-center space-x-2"
                >
                  <span>Voir les Tarifs & Plans</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => setView('contactSales')}
                  className="bg-transparent border border-white/40 hover:border-white hover:bg-white/5 text-white px-8 py-4 rounded font-semibold text-base transition flex items-center justify-center"
                >
                  Contacter un Conseiller
                </button>
              </div>
              <div className="flex items-center space-x-6 text-sm text-blue-200 pt-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>14 jours d'essai gratuit</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Aucune carte requise</span>
                </div>
              </div>
            </div>

            {/* Hero App Preview Widget */}
            <div className="lg:col-span-5 relative">
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden text-slate-800 border border-salesforce-gray-border">
                {/* Header widget */}
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <span className="ml-2 text-xs text-slate-400 font-mono">atlas_dashboard.app</span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    Mode Démo Actif
                  </span>
                </div>

                <div className="p-6 space-y-6">
                  {/* Metric Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded border border-slate-100">
                      <span className="text-xs text-slate-500 uppercase font-semibold">Opportunités</span>
                      <div className="text-2xl font-bold text-salesforce-dark">+42.8%</div>
                      <span className="text-[10px] text-emerald-600 font-semibold">▲ Ce trimestre</span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded border border-slate-100">
                      <span className="text-xs text-slate-500 uppercase font-semibold">Tâches AI</span>
                      <div className="text-2xl font-bold text-salesforce-blue">2 481</div>
                      <span className="text-[10px] text-emerald-600 font-semibold">▲ Automatisation 94%</span>
                    </div>
                  </div>

                  {/* AI Workforce visual */}
                  <div className="border border-slate-100 rounded-lg p-4 space-y-3 bg-salesforce-blue-light/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="p-1.5 rounded-full bg-salesforce-blue text-white">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </span>
                        <span className="text-sm font-bold text-salesforce-dark">Agent de Service Prospector</span>
                      </div>
                      <span className="text-xs text-emerald-600 font-bold flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Actif</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 italic">
                      "Scraping des entreprises tech en cours... 14 leads qualifiés identifiés ce matin."
                    </p>
                    {/* Progress bar */}
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-salesforce-blue h-full w-[78%]"></div>
                    </div>
                  </div>

                  {/* Quick stats list */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                      <span className="font-semibold text-slate-600">Jean Dupont (Orange)</span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-medium">Nouveau Lead</span>
                    </div>
                    <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                      <span className="font-semibold text-slate-600">Société Générale CRM</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">Négociation</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Proof logos */}
      <section className="bg-white border-y border-salesforce-gray-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            Déployé par les meilleures équipes B2B au monde
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
            <span className="text-xl font-bold text-slate-700 tracking-tight">ORANGE Business</span>
            <span className="text-xl font-bold text-slate-700 tracking-tight">SOCIÉTÉ GÉNÉRALE</span>
            <span className="text-xl font-bold text-slate-700 tracking-tight">SONATEL AI</span>
            <span className="text-xl font-bold text-slate-700 tracking-tight">ECOBANK</span>
            <span className="text-xl font-bold text-slate-700 tracking-tight">LIAFRIK</span>
          </div>
        </div>
      </section>

      {/* Core Value Pillars */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-extrabold text-salesforce-dark">
            Une suite CRM complète construite pour la croissance
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Gérez chaque étape du cycle de vente de votre client B2B, de l'acquisition de prospects au paiement, avec un contrôle absolu de l'IA.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white rounded-lg p-8 border border-salesforce-gray-border hover:shadow-lg transition">
            <div className="h-12 w-12 rounded-lg bg-salesforce-blue-light text-salesforce-blue flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-salesforce-dark mb-3">CRM de Ventes Unifié</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Conservez une visibilité totale sur vos contacts, vos leads qualifiés, vos comptes entreprises et vos opportunités commerciales dans un pipeline interactif à la pointe du design.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-lg p-8 border border-salesforce-gray-border hover:shadow-lg transition">
            <div className="h-12 w-12 rounded-lg bg-salesforce-blue-light text-salesforce-blue flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-salesforce-dark mb-3">AI Workforce Autonome</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Déployez de véritables agents et workflows d'IA autonomes capables de prospecter en masse, de rédiger vos documents commerciaux ou de répondre intelligemment à vos tickets de support.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-lg p-8 border border-salesforce-gray-border hover:shadow-lg transition">
            <div className="h-12 w-12 rounded-lg bg-salesforce-blue-light text-salesforce-blue flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-salesforce-dark mb-3">Business & Facturation</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Générez des devis professionnels en 3 clics, convertissez-les en bons de commande et en factures avec paiement Stripe en ligne. Suivez chaque euro en temps réel.
            </p>
          </div>
        </div>
      </section>

      {/* Customer Review Section */}
      <section className="bg-white py-16 border-t border-salesforce-gray-border">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="flex justify-center space-x-1 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-6 h-6 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <blockquote className="text-2xl font-light text-salesforce-dark italic leading-relaxed">
            "Le fait d'intégrer l'IA directement dans notre pipeline CRM grâce à Atlas nous a permis de multiplier nos contacts qualifiés par 3 en l'espace de 6 semaines seulement. L'interface est intuitive et d'une clarté inégalée."
          </blockquote>
          <div>
            <p className="font-bold text-slate-800">Fatou Sow</p>
            <p className="text-xs text-slate-500 uppercase font-semibold">Directrice Produit chez LiAfrik</p>
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="bg-salesforce-blue text-white py-16 text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <h2 className="text-3xl font-extrabold">Faites le premier pas aujourd'hui</h2>
          <p className="text-blue-100 max-w-xl mx-auto font-light">
            Activez votre essai gratuit de 14 jours de notre plan Starter ou Pro, sans engagement et sans frais.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setView('pricing')}
              className="bg-white text-salesforce-blue px-8 py-3.5 rounded font-bold hover:bg-blue-50 transition shadow-lg"
            >
              Choisir mon Plan
            </button>
            <button
              onClick={() => setView('contactSales')}
              className="bg-salesforce-blue-hover text-white border border-white/20 px-8 py-3.5 rounded font-bold hover:bg-salesforce-blue/80 transition"
            >
              Parler à un Expert
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
