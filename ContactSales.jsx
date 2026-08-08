import React, { useState } from 'react'

export default function ContactSales({ setView }) {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    size: '100-500',
    message: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email) {
      alert('Veuillez remplir au moins le nom et l\'email professionnel.')
      return
    }
    setSubmitted(true)
  }

  return (
    <div className="bg-slate-50 min-h-screen py-16 flex items-center justify-center">
      <div className="max-w-xl w-full mx-4 bg-white rounded-lg border border-salesforce-gray-border shadow-md overflow-hidden">
        
        {/* Banner */}
        <div className="bg-salesforce-dark text-white px-8 py-6 text-center space-y-2">
          <h2 className="text-2xl font-bold">Contacter l'équipe commerciale</h2>
          <p className="text-xs text-blue-200">
            Discutez avec nos experts en CRM de l'adaptation d'Atlas à votre échelle.
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          {submitted ? (
            <div className="text-center space-y-6 py-8">
              <div className="mx-auto h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-salesforce-dark">Demande envoyée avec succès</h3>
                <p className="text-slate-600 text-sm">
                  Merci <strong>{formData.name}</strong>. Un responsable de compte de <strong>LiAfrik</strong> prendra contact avec vous à l'adresse <strong>{formData.email}</strong> dans un délai de 2 heures ouvrées.
                </p>
              </div>
              <button
                onClick={() => {
                  setSubmitted(false)
                  setView('landing')
                }}
                className="bg-salesforce-blue text-white px-6 py-2.5 rounded font-bold hover:bg-salesforce-blue-hover transition"
              >
                Retourner à l'accueil
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Nom complet</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Jean Dupont"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-salesforce-gray-border rounded px-3 py-2 text-sm focus:outline-none focus:border-salesforce-blue"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Email professionnel</label>
                <input
                  type="email"
                  required
                  placeholder="Ex: jean.dupont@entreprise.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-salesforce-gray-border rounded px-3 py-2 text-sm focus:outline-none focus:border-salesforce-blue"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Entreprise</label>
                  <input
                    type="text"
                    placeholder="Ex: Orange SA"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full border border-salesforce-gray-border rounded px-3 py-2 text-sm focus:outline-none focus:border-salesforce-blue"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Taille</label>
                  <select
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="w-full border border-salesforce-gray-border rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-salesforce-blue"
                  >
                    <option value="1-50">1 - 50 employés</option>
                    <option value="50-100">50 - 100 employés</option>
                    <option value="100-500">100 - 500 employés</option>
                    <option value="500+">Plus de 500 employés</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Parlez-nous de vos besoins</label>
                <textarea
                  rows="4"
                  placeholder="Ex: Nous souhaitons déployer des agents de prospection IA connectés à notre flux de vente..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full border border-salesforce-gray-border rounded px-3 py-2 text-sm focus:outline-none focus:border-salesforce-blue"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-salesforce-blue hover:bg-salesforce-blue-hover text-white font-bold py-3 px-4 rounded transition shadow"
              >
                Soumettre la demande commerciale
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
