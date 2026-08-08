import React, { useState } from 'react'

export default function AuthPage({ mode, setMode, selectedPlan, onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true)

    // Simulate network delay
    setTimeout(() => {
      setSubmitting(false)
      if (mode === 'forgot') {
        setResetSent(true)
        return
      }

      // Successful simulation
      const userPlan = selectedPlan || 'Pro' // Default to Pro if none selected
      const trialDays = 14
      const trialEnd = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString()
      
      const authSession = {
        user: {
          email: email || 'fatou.sow@liafrik.com',
          name: name || 'Fatou Sow',
          company: company || 'LiAfrik'
        },
        billing: {
          plan: 'Free Trial',
          tier: userPlan,
          trialStartDate: new Date().toISOString(),
          trialEndDate: trialEnd,
          isActive: true,
          cardLast4: '',
          isCanceled: false,
          subscriptionStatus: 'trialing'
        }
      }

      onLoginSuccess(authSession)
    }, 800)
  }

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Logo */}
        <div className="flex justify-center items-center space-x-2 cursor-pointer mb-6" onClick={() => window.location.reload()}>
          <svg className="h-10 w-10 text-salesforce-blue" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
          </svg>
          <div className="text-left">
            <span className="block font-extrabold text-2xl text-salesforce-dark tracking-tight leading-none">Atlas CRM</span>
            <span className="text-xs text-salesforce-blue font-semibold tracking-widest uppercase">by LiAfrik</span>
          </div>
        </div>

        <h2 className="text-3xl font-extrabold text-salesforce-dark">
          {mode === 'login' && "Connexion à votre espace"}
          {mode === 'signUp' && "Créer votre compte Atlas"}
          {mode === 'forgot' && "Mot de passe oublié"}
        </h2>
        
        <p className="mt-2 text-sm text-slate-500">
          {mode === 'login' && (
            <>
              Nouveau sur Atlas ?{' '}
              <button onClick={() => setMode('signUp')} className="font-semibold text-salesforce-blue hover:text-salesforce-blue-hover">
                S'inscrire gratuitement
              </button>
            </>
          )}
          {mode === 'signUp' && (
            <>
              Déjà inscrit ?{' '}
              <button onClick={() => setMode('login')} className="font-semibold text-salesforce-blue hover:text-salesforce-blue-hover">
                Se connecter
              </button>
            </>
          )}
          {mode === 'forgot' && (
            <button onClick={() => setMode('login')} className="font-semibold text-salesforce-blue hover:text-salesforce-blue-hover">
              Retourner à la connexion
            </button>
          )}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-salesforce-gray-border">
          
          {resetSent ? (
            <div className="text-center space-y-4 py-4">
              <div className="mx-auto h-12 w-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l8-4A2 2 0 0113 4.417V19m0 0h6M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-salesforce-dark text-center">Email envoyé</h3>
              <p className="text-sm text-slate-600">
                Si un compte existe pour <strong>{email}</strong>, un email contenant les instructions de récupération de mot de passe a été envoyé.
              </p>
              <button
                onClick={() => {
                  setResetSent(false)
                  setMode('login')
                }}
                className="w-full bg-salesforce-blue hover:bg-salesforce-blue-hover text-white font-bold py-2 px-4 rounded"
              >
                Retour
              </button>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {mode === 'signUp' && (
                <>
                  <div>
                    <label htmlFor="name" className="block text-xs font-bold text-slate-700 uppercase">
                      Nom complet
                    </label>
                    <div className="mt-1">
                      <input
                        id="name"
                        type="text"
                        required
                        placeholder="Ex: Fatou Sow"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="appearance-none block w-full px-3 py-2 border border-salesforce-gray-border rounded shadow-sm placeholder-slate-400 focus:outline-none focus:ring-salesforce-blue focus:border-salesforce-blue sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-xs font-bold text-slate-700 uppercase">
                      Entreprise
                    </label>
                    <div className="mt-1">
                      <input
                        id="company"
                        type="text"
                        required
                        placeholder="Ex: LiAfrik"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="appearance-none block w-full px-3 py-2 border border-salesforce-gray-border rounded shadow-sm placeholder-slate-400 focus:outline-none focus:ring-salesforce-blue focus:border-salesforce-blue sm:text-sm"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase">
                  Adresse Email
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="nom@entreprise.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-salesforce-gray-border rounded shadow-sm placeholder-slate-400 focus:outline-none focus:ring-salesforce-blue focus:border-salesforce-blue sm:text-sm"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <label htmlFor="password" className="block text-xs font-bold text-slate-700 uppercase">
                    Mot de passe
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-salesforce-gray-border rounded shadow-sm placeholder-slate-400 focus:outline-none focus:ring-salesforce-blue focus:border-salesforce-blue sm:text-sm"
                    />
                  </div>
                </div>
              )}

              {mode === 'login' && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-salesforce-blue focus:ring-salesforce-blue border-slate-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-700 font-semibold uppercase">
                      Se souvenir de moi
                    </label>
                  </div>

                  <div className="text-sm">
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="font-semibold text-salesforce-blue hover:text-salesforce-blue-hover"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded shadow-sm text-sm font-bold text-white bg-salesforce-blue hover:bg-salesforce-blue-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-salesforce-blue disabled:opacity-50 transition"
                >
                  {submitting ? (
                    <span className="flex items-center space-x-2">
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Traitement...</span>
                    </span>
                  ) : (
                    <>
                      {mode === 'login' && "Se connecter"}
                      {mode === 'signUp' && `Démarrer mon essai de 14 jours`}
                      {mode === 'forgot' && "Réinitialiser mon mot de passe"}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Explicit Trust Tag in Signup to mimic SLDS */}
          <div className="mt-6 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
            🔒 Vos données sont stockées en Europe et sécurisées sous chiffrement AES-256.
          </div>
        </div>
      </div>
    </div>
  )
}
