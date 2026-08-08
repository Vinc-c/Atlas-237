import React, { useState } from 'react'
import * as Icons from 'lucide-react'

export default function BusinessModules({ 
  subModule, 
  database, 
  updateDatabase 
}) {
  const { products, quotes, orders, invoices, payments, support } = database

  // ----------------------------------------------------
  // PRODUCTS SUBMODULE
  // ----------------------------------------------------
  if (subModule === 'products') {
    return (
      <div className="space-y-6 fade-in">
        <div className="bg-white p-4 rounded-lg border border-salesforce-gray-border shadow-sm">
          <h2 className="text-xl font-extrabold text-salesforce-dark flex items-center space-x-2">
            <Icons.Package className="w-5 h-5 text-salesforce-blue" />
            <span>Catalogue des Produits & Licences</span>
          </h2>
          <p className="text-xs text-slate-500">Consultez et configurez votre catalogue d'offres SaaS et d'extensions d'IA.</p>
        </div>

        <div className="bg-white rounded-lg border border-salesforce-gray-border shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-salesforce-gray-border">
              <tr>
                <th className="p-4">SKU / Code</th>
                <th className="p-4">Nom de l'offre</th>
                <th className="p-4">Catégorie</th>
                <th className="p-4">Tarif</th>
                <th className="p-4">État</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="p-4 font-mono font-semibold text-slate-500">{p.sku}</td>
                  <td className="p-4 font-bold text-salesforce-dark">{p.name}</td>
                  <td className="p-4">{p.category}</td>
                  <td className="p-4 font-semibold text-indigo-700">{p.price} €</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Actif
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // ----------------------------------------------------
  // QUOTES SUBMODULE (Générateur interactif de devis)
  // ----------------------------------------------------
  if (subModule === 'quotes') {
    const [isCreating, setIsCreating] = useState(false)
    const [clientName, setClientName] = useState('')
    const [company, setCompany] = useState('')
    const [selectedProduct, setSelectedProduct] = useState(products[0]?.id || '')
    const [quantity, setQuantity] = useState(1)

    const handleCreateQuote = (e) => {
      e.preventDefault()
      const prod = products.find(p => p.id === selectedProduct)
      if (!prod) return

      const totalAmount = prod.price * quantity
      const newQuote = {
        id: 'quote_' + Date.now(),
        quoteNumber: 'QT-2026-0' + (quotes.length + 1),
        clientName,
        company,
        amount: totalAmount,
        date: new Date().toISOString().split('T')[0],
        status: 'Sent',
        items: [{ name: prod.name, qty: Number(quantity), price: prod.price }]
      }

      updateDatabase('quotes', [newQuote, ...quotes])
      setIsCreating(false)
      setClientName('')
      setCompany('')
      setQuantity(1)
    }

    const approveQuote = (quoteId) => {
      const updated = quotes.map(q => q.id === quoteId ? { ...q, status: 'Approved' } : q)
      updateDatabase('quotes', updated)
    }

    return (
      <div className="space-y-6 fade-in">
        <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-salesforce-gray-border shadow-sm">
          <div>
            <h2 className="text-xl font-extrabold text-salesforce-dark flex items-center space-x-2">
              <Icons.FileText className="w-5 h-5 text-salesforce-blue" />
              <span>Générateur de Devis Professionnels</span>
            </h2>
            <p className="text-xs text-slate-500">Rédigez, chiffrez et envoyez vos propositions tarifaires.</p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-salesforce-blue hover:bg-salesforce-blue-hover text-white text-xs font-bold px-4 py-2.5 rounded shadow flex items-center space-x-2"
          >
            <Icons.Plus className="w-4 h-4" />
            <span>Nouveau Devis</span>
          </button>
        </div>

        {isCreating ? (
          <form onSubmit={handleCreateQuote} className="bg-white rounded-lg border border-salesforce-gray-border shadow-md p-6 space-y-4 max-w-lg">
            <h3 className="font-bold text-sm text-salesforce-dark border-b border-slate-100 pb-2">Nouveau Devis de Ventes</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-700 block mb-1">Nom du destinataire</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Jean Dupont"
                  className="w-full border border-salesforce-gray-border rounded px-3 py-2 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-700 block mb-1">Entreprise</label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Orange"
                  className="w-full border border-salesforce-gray-border rounded px-3 py-2 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-700 block mb-1">Produit / Licence</label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full border border-salesforce-gray-border rounded px-3 py-2 text-xs bg-white focus:outline-none"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.price} €)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-700 block mb-1">Quantité (Unités)</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full border border-salesforce-gray-border rounded px-3 py-2 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 border border-slate-200 text-xs rounded text-slate-600 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button type="submit" className="px-4 py-2 bg-salesforce-blue text-white text-xs font-bold rounded hover:bg-salesforce-blue-hover shadow">
                Valider & Envoyer
              </button>
            </div>
          </form>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quotes.map(q => (
              <div key={q.id} className="bg-white rounded-lg border border-salesforce-gray-border shadow-sm p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs font-bold text-slate-500">{q.quoteNumber}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    q.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {q.status === 'Approved' ? 'Approuvé' : 'Envoyé'}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-salesforce-dark text-sm">{q.clientName}</h4>
                  <p className="text-xs text-slate-500">{q.company}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded space-y-1 text-xs">
                  {q.items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-slate-600">
                      <span>{item.name} (x{item.qty})</span>
                      <span className="font-bold text-slate-800">{item.price * item.qty} €</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-200 pt-2 flex justify-between font-extrabold text-salesforce-dark">
                    <span>Total:</span>
                    <span>{q.amount.toLocaleString()} €</span>
                  </div>
                </div>

                {q.status !== 'Approved' && (
                  <button
                    onClick={() => approveQuote(q.id)}
                    className="w-full text-center text-xs font-bold bg-salesforce-blue hover:bg-salesforce-blue-hover text-white py-2 rounded transition shadow"
                  >
                    Marquer Signé / Approuvé ✔
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ----------------------------------------------------
  // ORDERS SUBMODULE
  // ----------------------------------------------------
  if (subModule === 'orders') {
    return (
      <div className="space-y-6 fade-in">
        <div className="bg-white p-4 rounded-lg border border-salesforce-gray-border shadow-sm">
          <h2 className="text-xl font-extrabold text-salesforce-dark flex items-center space-x-2">
            <Icons.ShoppingCart className="w-5 h-5 text-salesforce-blue" />
            <span>Suivi des Commandes B2B</span>
          </h2>
          <p className="text-xs text-slate-500">Consultez l'historique et l'état de livraison des bons de commande signés.</p>
        </div>

        <div className="bg-white rounded-lg border border-salesforce-gray-border shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-salesforce-gray-border">
              <tr>
                <th className="p-4">N° de Commande</th>
                <th className="p-4">Client / Compte</th>
                <th className="p-4">Date</th>
                <th className="p-4">Volume Facturé</th>
                <th className="p-4">État de livraison</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map(o => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="p-4 font-mono font-semibold text-slate-500">{o.orderNumber}</td>
                  <td className="p-4 font-bold text-salesforce-dark">{o.clientName}</td>
                  <td className="p-4 text-slate-500">{o.date}</td>
                  <td className="p-4 font-bold">{o.amount} €</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      o.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                    }`}>
                      {o.status === 'Delivered' ? 'Livré / Déployé' : 'En attente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // ----------------------------------------------------
  // INVOICES SUBMODULE
  // ----------------------------------------------------
  if (subModule === 'invoices') {
    const handlePayInvoice = (invoiceId) => {
      const updated = invoices.map(inv => inv.id === invoiceId ? { ...inv, status: 'Paid' } : inv)
      updateDatabase('invoices', updated)
    }

    return (
      <div className="space-y-6 fade-in">
        <div className="bg-white p-4 rounded-lg border border-salesforce-gray-border shadow-sm">
          <h2 className="text-xl font-extrabold text-salesforce-dark flex items-center space-x-2">
            <Icons.Receipt className="w-5 h-5 text-salesforce-blue" />
            <span>Gestion de la Facturation client</span>
          </h2>
          <p className="text-xs text-slate-500">Factures générées automatiquement par Atlas CRM pour vos comptes.</p>
        </div>

        <div className="bg-white rounded-lg border border-salesforce-gray-border shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-salesforce-gray-border">
              <tr>
                <th className="p-4">Facture N°</th>
                <th className="p-4">Destinataire</th>
                <th className="p-4">Montant</th>
                <th className="p-4">Date de Facture</th>
                <th className="p-4">État</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="p-4 font-mono font-semibold text-slate-500">{inv.invoiceNumber}</td>
                  <td className="p-4 font-bold text-salesforce-dark">{inv.clientName}</td>
                  <td className="p-4 font-bold">{inv.amount} €</td>
                  <td className="p-4 text-slate-500">{inv.date}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                      inv.status === 'Unpaid' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {inv.status === 'Paid' ? 'Payée' : inv.status === 'Unpaid' ? 'En attente' : 'En retard'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {inv.status !== 'Paid' && (
                      <button
                        onClick={() => handlePayInvoice(inv.id)}
                        className="bg-salesforce-blue hover:bg-salesforce-blue-hover text-white text-[10px] font-bold px-3 py-1 rounded transition shadow-sm"
                      >
                        Encaisser Paiement
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // ----------------------------------------------------
  // PAYMENTS SUBMODULE
  // ----------------------------------------------------
  if (subModule === 'payments') {
    return (
      <div className="space-y-6 fade-in">
        <div className="bg-white p-4 rounded-lg border border-salesforce-gray-border shadow-sm">
          <h2 className="text-xl font-extrabold text-salesforce-dark flex items-center space-x-2">
            <Icons.CreditCard className="w-5 h-5 text-salesforce-blue" />
            <span>Ledger des Transactions Financières</span>
          </h2>
          <p className="text-xs text-slate-500">Rapprochement de tous les flux bancaires et cartes de crédit Stripe.</p>
        </div>

        <div className="bg-white rounded-lg border border-salesforce-gray-border shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-salesforce-gray-border">
              <tr>
                <th className="p-4">ID Transaction</th>
                <th className="p-4">Méthode de paiement</th>
                <th className="p-4">Flux financier</th>
                <th className="p-4">Date de transaction</th>
                <th className="p-4">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map(pay => (
                <tr key={pay.id} className="hover:bg-slate-50">
                  <td className="p-4 font-mono font-semibold text-slate-500">{pay.transactionId}</td>
                  <td className="p-4 text-slate-700">{pay.method}</td>
                  <td className="p-4 font-extrabold text-emerald-600">+{pay.amount} €</td>
                  <td className="p-4 text-slate-500">{pay.date}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      pay.status === 'Success' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                    }`}>
                      {pay.status === 'Success' ? 'Confirmé' : 'En cours'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // ----------------------------------------------------
  // MARKETING SUBMODULE
  // ----------------------------------------------------
  if (subModule === 'marketing') {
    return (
      <div className="space-y-6 fade-in">
        <div className="bg-white p-4 rounded-lg border border-salesforce-gray-border shadow-sm">
          <h2 className="text-xl font-extrabold text-salesforce-dark flex items-center space-x-2">
            <Icons.Megaphone className="w-5 h-5 text-salesforce-blue" />
            <span>Campagnes de Marketing B2B</span>
          </h2>
          <p className="text-xs text-slate-500">Rapports d'impact de vos campagnes de prospection et d'automation.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border border-salesforce-gray-border shadow-sm space-y-4">
            <h3 className="font-bold text-xs text-salesforce-dark uppercase tracking-wider">Campagnes d'Outbound Actives</h3>
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="flex justify-between font-bold text-xs">
                  <span>Prospection Directeurs Techniques EMEA</span>
                  <span className="text-emerald-600">Active</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2 text-[10px] font-semibold text-slate-500">
                  <div>Emails: <strong>1480</strong></div>
                  <div>Taux d'ouverture: <strong className="text-indigo-600">68%</strong></div>
                  <div>Réponses qualifiées: <strong className="text-emerald-600">32</strong></div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="flex justify-between font-bold text-xs">
                  <span>Webinaire AI Workforce 2026</span>
                  <span className="text-emerald-600">Active</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2 text-[10px] font-semibold text-slate-500">
                  <div>Inscrits: <strong>350</strong></div>
                  <div>Taux de présence: <strong className="text-indigo-600">52%</strong></div>
                  <div>MQLs: <strong className="text-emerald-600">18</strong></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-salesforce-gray-border shadow-sm space-y-4">
            <h3 className="font-bold text-xs text-salesforce-dark uppercase tracking-wider">Canaux d'Acquisition Performance</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b">
                <span>LinkedIn Outbound</span>
                <span className="font-bold">45% des prospects</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span>Inbound SEO</span>
                <span className="font-bold">28% des prospects</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span>Recommandations Partenaires</span>
                <span className="font-bold">20% des prospects</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ----------------------------------------------------
  // SUPPORT TICKET QUEUE (Support client interactif)
  // ----------------------------------------------------
  if (subModule === 'support') {
    const [selectedTicket, setSelectedTicket] = useState(null)
    const [replyText, setReplyText] = useState('')

    const handleSendReply = (ticketId) => {
      if (!replyText.trim()) {
        alert('Veuillez saisir votre message de réponse.')
        return
      }

      const updated = support.map(t => t.id === ticketId ? { 
        ...t, 
        status: 'Closed',
        message: `${t.message}\n\n--- Réponse Support ---\n${replyText}`
      } : t)

      updateDatabase('support', updated)
      setSelectedTicket(null)
      setReplyText('')
      alert('La réponse a été envoyée au client et le ticket a été résolu.')
    }

    return (
      <div className="space-y-6 fade-in">
        <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-salesforce-gray-border shadow-sm">
          <div>
            <h2 className="text-xl font-extrabold text-salesforce-dark flex items-center space-x-2">
              <Icons.LifeBuoy className="w-5 h-5 text-salesforce-blue" />
              <span>Console de Support Client (Helpdesk)</span>
            </h2>
            <p className="text-xs text-slate-500">Traitez et répondez aux demandes d'assistance de vos clients.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg border border-salesforce-gray-border shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-salesforce-gray-border">
                  <tr>
                    <th className="p-4">Ticket</th>
                    <th className="p-4">Client</th>
                    <th className="p-4">Priorité</th>
                    <th className="p-4">État</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {support.map(t => (
                    <tr 
                      key={t.id}
                      onClick={() => setSelectedTicket(t)}
                      className={`hover:bg-slate-50 cursor-pointer transition ${selectedTicket?.id === t.id ? 'bg-salesforce-blue-light/20' : ''}`}
                    >
                      <td className="p-4 font-semibold text-salesforce-dark">
                        <div className="font-bold">{t.ticketNumber}</div>
                        <div className="text-slate-500 text-[10px] font-medium truncate max-w-xs">{t.subject}</div>
                      </td>
                      <td className="p-4 font-semibold">{t.contactName}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          t.priority === 'High' ? 'bg-rose-100 text-rose-800' :
                          t.priority === 'Medium' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.status === 'Open' ? 'bg-blue-100 text-blue-800' :
                          t.status === 'In Progress' ? 'bg-purple-100 text-purple-800' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {t.status === 'Open' ? 'Nouveau' : t.status === 'In Progress' ? 'En cours' : 'Résolu'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button className="text-salesforce-blue hover:underline font-bold text-[10px]">Traiter</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-salesforce-gray-border shadow-sm p-5 space-y-4">
            {selectedTicket ? (
              <div className="space-y-4 fade-in text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs font-bold text-slate-400">{selectedTicket.ticketNumber}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    selectedTicket.priority === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>{selectedTicket.priority}</span>
                </div>

                <div>
                  <h4 className="font-bold text-salesforce-dark text-sm">{selectedTicket.subject}</h4>
                  <p className="text-[10px] text-slate-500 mt-1">Saisi par <strong>{selectedTicket.contactName}</strong> • Assigné à : {selectedTicket.assignee}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded text-slate-700 italic border">
                  "{selectedTicket.message}"
                </div>

                {selectedTicket.status !== 'Closed' ? (
                  <div className="space-y-3 pt-2">
                    <label className="text-[10px] font-bold text-slate-700 uppercase block">Rédiger une réponse d'assistance</label>
                    <textarea
                      rows="4"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Saisissez la solution pour le client..."
                      className="w-full border border-salesforce-gray-border rounded px-3 py-2 text-xs focus:outline-none"
                    ></textarea>
                    <button
                      onClick={() => handleSendReply(selectedTicket.id)}
                      className="w-full bg-salesforce-blue hover:bg-salesforce-blue-hover text-white py-2 rounded font-bold transition shadow"
                    >
                      Résoudre le ticket & Envoyer
                    </button>
                  </div>
                ) : (
                  <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-3 rounded font-semibold text-center">
                    ✓ Ce ticket a été résolu avec succès.
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col justify-center items-center text-center text-slate-400 py-12 space-y-3">
                <Icons.LifeBuoy className="w-12 h-12 text-slate-300 stroke-1" />
                <p className="text-xs">Sélectionnez un ticket pour rédiger une solution ou modifier son assignation.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return null
}
