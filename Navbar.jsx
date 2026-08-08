import React from 'react'

export default function Navbar({ currentView, setView, onSelectPlan }) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-salesforce-gray-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setView('landing')}>
            <svg className="h-9 w-9 text-salesforce-blue" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
            </svg>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg text-salesforce-dark tracking-tight leading-none">Atlas CRM</span>
              <span className="text-[10px] text-salesforce-blue font-semibold tracking-wider uppercase leading-none">by LiAfrik</span>
            </div>
          </div>

          {/* Links */}
          <nav className="hidden md:flex space-x-8 text-sm font-medium">
            <button 
              onClick={() => setView('landing')}
              className={`pb-1 border-b-2 transition ${currentView === 'landing' ? 'border-salesforce-blue text-salesforce-blue' : 'border-transparent text-slate-600 hover:text-salesforce-blue hover:border-salesforce-blue'}`}
            >
              Accueil
            </button>
            <button 
              onClick={() => setView('pricing')}
              className={`pb-1 border-b-2 transition ${currentView === 'pricing' ? 'border-salesforce-blue text-salesforce-blue' : 'border-transparent text-slate-600 hover:text-salesforce-blue hover:border-salesforce-blue'}`}
            >
              Tarifs
            </button>
            <button 
              onClick={() => setView('contactSales')}
              className={`pb-1 border-b-2 transition ${currentView === 'contactSales' ? 'border-salesforce-blue text-salesforce-blue' : 'border-transparent text-slate-600 hover:text-salesforce-blue hover:border-salesforce-blue'}`}
            >
              Contacter les Ventes
            </button>
          </nav>

          {/* CTAs */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setView('login')}
              className="text-sm font-semibold text-salesforce-blue hover:text-salesforce-blue-hover transition px-3 py-2"
            >
              Connexion
            </button>
            <button 
              onClick={() => {
                onSelectPlan('Pro');
                setView('signUp');
              }}
              className="bg-salesforce-blue text-white text-sm font-bold px-4 py-2 rounded shadow-md hover:bg-salesforce-blue-hover transition"
            >
              Essai Gratuit
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
