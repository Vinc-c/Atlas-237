import React, { useState } from 'react'
import * as Icons from 'lucide-react'

export default function SystemModules({ 
  subModule, 
  database, 
  updateDatabase,
  onUpdateProfile
}) {
  const { notifications, auditLogs, billing } = database

  // ----------------------------------------------------
  // NOTIFICATIONS SUBMODULE
  // ----------------------------------------------------
  if (subModule === 'notifications') {
    const markAllAsRead = () => {
      const updated = notifications.map(n => ({ ...n, read: true }))
      updateDatabase('notifications', updated)
    }

    const deleteNotification = (notifId) => {
      const updated = notifications.filter(n => n.id !== notifId)
      updateDatabase('notifications', updated)
    }

    return (
      <div className="space-y-6 fade-in text-xs">
        <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-salesforce-gray-border shadow-sm">
          <div>
            <h2 className="text-xl font-extrabold text-salesforce-dark flex items-center space-x-2">
              <Icons.Bell className="w-5 h-5 text-salesforce-blue" />
              <span>Centre de Notifications</span>
            </h2>
            <p className="text-xs text-slate-500">Consultez les événements système et alertes commerciales.</p>
          </div>
          <button
            onClick={markAllAsRead}
            className="text-xs font-bold text-salesforce-blue hover:underline"
          >
            Tout marquer comme lu
          </button>
        </div>

        <div className="space-y-3">
          {notifications.map(notif => (
            <div 
              key={notif.id} 
              className={`p-4 rounded-lg border flex justify-between items-center gap-4 transition ${
                notif.read ? 'bg-white border-slate-200' : 'bg-salesforce-blue-light/10 border-salesforce-blue/20 shadow-sm'
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className={`p-2 rounded-full mt-0.5 ${notif.read ? 'bg-slate-100 text-slate-400' : 'bg-salesforce-blue text-white'}`}>
                  <Icons.Bell className="w-3.5 h-3.5" />
                </span>
                <div>
                  <h4 className={`font-bold ${notif.read ? 'text-slate-700' : 'text-salesforce-dark'}`}>{notif.title}</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">{notif.description}</p>
                  <span className="text-[10px] text-slate-400 font-mono mt-1 block">{notif.time}</span>
                </div>
              </div>

              <button
                onClick={() => deleteNotification(notif.id)}
                className="text-slate-400 hover:text-rose-600 p-1"
                title="Supprimer"
              >
                <Icons.Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ----------------------------------------------------
  // AUDIT LOG SUBMODULE
  // ----------------------------------------------------
  if (subModule === 'auditLog') {
    return (
      <div className="space-y-6 fade-in text-xs">
        <div className="bg-white p-4 rounded-lg border border-salesforce-gray-border shadow-sm">
          <h2 className="text-xl font-extrabold text-salesforce-dark flex items-center space-x-2">
            <Icons.Scroll className="w-5 h-5 text-salesforce-blue" />
            <span>Journal d'Audit de Sécurité</span>
          </h2>
          <p className="text-xs text-slate-500">Traçabilité complète de toutes les opérations administratives effectuées sur Atlas CRM.</p>
        </div>

        <div className="bg-white rounded-lg border border-salesforce-gray-border shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b">
              <tr>
                <th className="p-4">Action</th>
                <th className="p-4">Opérateur</th>
                <th className="p-4">Horodatage</th>
                <th className="p-4">Détails techniques</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-600">
              {auditLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-salesforce-dark">{log.action}</td>
                  <td className="p-4">{log.user}</td>
                  <td className="p-4">{log.timestamp}</td>
                  <td className="p-4 text-slate-400 italic">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // ----------------------------------------------------
  // SETTINGS SUBMODULE
  // ----------------------------------------------------
  if (subModule === 'settings') {
    const [profileName, setProfileName] = useState('Fatou Sow')
    const [profileEmail, setProfileEmail] = useState('fatou.sow@liafrik.com')

    const handleSaveProfile = (e) => {
      e.preventDefault()
      onUpdateProfile(profileName, profileEmail)
      alert('Votre profil utilisateur a été mis à jour.')
    }

    return (
      <div className="space-y-6 fade-in text-xs max-w-lg">
        <div className="bg-white p-4 rounded-lg border border-salesforce-gray-border shadow-sm">
          <h2 className="text-xl font-extrabold text-salesforce-dark flex items-center space-x-2">
            <Icons.Settings className="w-5 h-5 text-salesforce-blue" />
            <span>Paramètres du Profil</span>
          </h2>
          <p className="text-xs text-slate-500">Mettez à jour vos coordonnées et préférences de sécurité.</p>
        </div>

        <form onSubmit={handleSaveProfile} className="bg-white rounded-lg border border-salesforce-gray-border shadow-sm p-6 space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-700 block mb-1">Nom complet d'utilisateur</label>
            <input
              type="text"
              required
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-700 block mb-1">Adresse Email pro</label>
            <input
              type="email"
              required
              value={profileEmail}
              onChange={(e) => setProfileEmail(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="bg-salesforce-blue hover:bg-salesforce-blue-hover text-white font-bold py-2 px-4 rounded text-xs shadow-sm"
          >
            Sauvegarder les modifications
          </button>
        </form>
      </div>
    )
  }

  // ----------------------------------------------------
  // BILLING SUBMODULE (Gestion de l'abonnement & Trial)
  // ----------------------------------------------------
  if (subModule === 'billing') {
    const [cardInput, setCardInput] = useState('4242')
    const [isEditingCard, setIsEditingCard] = useState(false)

    // Upgrade/Downgrade flow
    const changeTier = (newTier) => {
      const updatedBilling = {
        ...billing,
        tier: newTier
      }
      updateDatabase('billing', updatedBilling)
      alert(`Votre abonnement d'essai a été mis à jour vers le plan ${newTier}.`)
    }

    // Subscribe fully (convert from trial to active subscription)
    const subscribeFully = () => {
      const updatedBilling = {
        ...billing,
        plan: 'Premium Subscription',
        subscriptionStatus: 'active',
        cardLast4: cardInput || '4242',
        isCanceled: false
      }
      updateDatabase('billing', updatedBilling)
      alert('Félicitations ! Vous êtes désormais abonné premium. Votre période d\'essai a été convertie avec succès.')
    }

    const cancelSubscription = () => {
      if (confirm('Voulez-vous vraiment résilier votre abonnement ? À l\'expiration de votre essai gratuit, vos agents IA et accès CRM seront restreints.')) {
        const updatedBilling = {
          ...billing,
          isCanceled: true,
          subscriptionStatus: 'canceled'
        }
        updateDatabase('billing', updatedBilling)
        alert('Votre abonnement a été marqué comme résilié. Vous conservez l\'accès jusqu\'à la fin de la période d\'essai.')
      }
    }

    const saveCard = (e) => {
      e.preventDefault()
      const updatedBilling = {
        ...billing,
        cardLast4: cardInput.substring(cardInput.length - 4)
      }
      updateDatabase('billing', updatedBilling)
      setIsEditingCard(false)
      alert('La carte de paiement a été mise à jour.')
    }

    return (
      <div className="space-y-6 fade-in text-xs">
        <div className="bg-white p-4 rounded-lg border border-salesforce-gray-border shadow-sm">
          <h2 className="text-xl font-extrabold text-salesforce-dark flex items-center space-x-2">
            <Icons.Wallet className="w-5 h-5 text-salesforce-blue" />
            <span>Gestion de votre Abonnement & Facturation</span>
          </h2>
          <p className="text-xs text-slate-500">Configurez votre moyen de paiement, modifiez votre offre ou résiliez à tout moment.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Subscription State and Trial overview */}
          <div className="bg-white p-6 rounded-lg border border-salesforce-gray-border shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b pb-2">État de l'Abonnement</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Offre Actuelle</span>
                <div className="text-lg font-bold text-salesforce-dark">{billing.tier} • {billing.plan}</div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Statut Facturation</span>
                <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                  billing.isCanceled ? 'bg-rose-100 text-rose-800' :
                  billing.subscriptionStatus === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {billing.isCanceled ? 'Résilie à l\'expiration' : billing.subscriptionStatus === 'active' ? 'Abonnement Actif' : 'Période d\'essai (Trial)'}
                </span>
              </div>
            </div>

            <div className="space-y-1 bg-slate-50 p-3 rounded">
              <span className="text-[10px] text-slate-400 font-bold block">Fin de validité</span>
              <span className="font-semibold text-slate-800">{new Date(billing.trialEndDate).toLocaleDateString()}</span>
            </div>

            {/* Subscriptions operations actions */}
            <div className="pt-3 border-t flex flex-wrap gap-3">
              {billing.subscriptionStatus !== 'active' && (
                <button
                  onClick={subscribeFully}
                  className="bg-salesforce-blue hover:bg-salesforce-blue-hover text-white font-bold py-2 px-4 rounded text-xs"
                >
                  S'abonner maintenant ⚡
                </button>
              )}
              {billing.tier === 'Starter' ? (
                <button
                  onClick={() => changeTier('Pro')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded text-xs"
                >
                  Passer au plan PRO
                </button>
              ) : (
                <button
                  onClick={() => changeTier('Starter')}
                  className="border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-2 px-4 rounded text-xs"
                >
                  Rétrograder vers STARTER
                </button>
              )}

              {!billing.isCanceled && (
                <button
                  onClick={cancelSubscription}
                  className="text-rose-600 hover:text-rose-700 font-bold text-xs"
                >
                  Résilier l'abonnement
                </button>
              )}
            </div>
          </div>

          {/* Payment Methods card */}
          <div className="bg-white p-6 rounded-lg border border-salesforce-gray-border shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b pb-2">Moyen de Paiement</h3>
            {billing.cardLast4 ? (
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded border border-slate-200">
                <span className="p-2 bg-indigo-100 text-indigo-700 rounded font-extrabold text-sm font-mono shrink-0">CARD</span>
                <div>
                  <h4 className="font-bold text-slate-800">Visa se terminant par •••• {billing.cardLast4}</h4>
                  <p className="text-[10px] text-slate-400">Expire le 12/2029</p>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 italic">Aucune carte de crédit n'a été enregistrée pour le moment.</p>
            )}

            {isEditingCard ? (
              <form onSubmit={saveCard} className="space-y-3 pt-2">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">Numéro de Carte de crédit (Stripe Mock)</label>
                  <input
                    type="text"
                    required
                    value={cardInput}
                    onChange={(e) => setCardInput(e.target.value)}
                    placeholder="Ex: 4242 4242 ..."
                    className="w-full border rounded px-3 py-2 font-mono text-xs focus:outline-none"
                  />
                </div>
                <div className="flex space-x-2">
                  <button type="submit" className="bg-slate-800 text-white font-bold py-1.5 px-3 rounded">Enregistrer</button>
                  <button type="button" onClick={() => setIsEditingCard(false)} className="border px-3 py-1.5 rounded">Annuler</button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsEditingCard(true)}
                className="text-salesforce-blue hover:underline font-bold text-xs block"
              >
                {billing.cardLast4 ? 'Mettre à jour la carte' : 'Ajouter une carte de crédit'}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ----------------------------------------------------
  // AI USAGE SUBMODULE
  // ----------------------------------------------------
  if (subModule === 'aiUsage') {
    return (
      <div className="space-y-6 fade-in text-xs">
        <div className="bg-white p-4 rounded-lg border border-salesforce-gray-border shadow-sm">
          <h2 className="text-xl font-extrabold text-salesforce-dark flex items-center space-x-2">
            <Icons.Gauge className="w-5 h-5 text-salesforce-blue" />
            <span>Consommation et Crédits d'IA</span>
          </h2>
          <p className="text-xs text-slate-500">Suivez le nombre de requêtes d'IA générées par vos agents autonomes.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border border-salesforce-gray-border shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800">Jetons AI (Tokens) consommés</h3>
            <div className="space-y-1">
              <div className="flex justify-between font-bold text-slate-700">
                <span>124 580 Tokens</span>
                <span>Limite mensuelle : 5 000 000</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="bg-salesforce-blue h-full w-[2.5%]"></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-salesforce-gray-border shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800">Statistiques d'exécution d'Agents</h3>
            <div className="space-y-2">
              <div className="flex justify-between border-b pb-1">
                <span>Prospector Elite v2</span>
                <span className="font-bold text-slate-700">42 exécutions</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>CustomerCare Agent</span>
                <span className="font-bold text-slate-700">18 tickets résolus</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
