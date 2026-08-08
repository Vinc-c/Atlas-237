import React, { useState } from 'react'
import * as Icons from 'lucide-react'

export default function CRMModules({ 
  subModule, 
  database, 
  updateDatabase 
}) {
  const { contacts, companies, leads, deals, activities } = database

  // ----------------------------------------------------
  // COMMON HELPER
  // ----------------------------------------------------
  const handleSave = (key, updatedList) => {
    updateDatabase(key, updatedList)
  }

  // ----------------------------------------------------
  // CONTACTS SUBMODULE
  // ----------------------------------------------------
  if (subModule === 'contacts') {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('All')
    const [selectedContact, setSelectedContact] = useState(null)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingContact, setEditingContact] = useState(null)
    
    // Form States
    const [formName, setFormName] = useState('')
    const [formEmail, setFormEmail] = useState('')
    const [formPhone, setFormPhone] = useState('')
    const [formCompany, setFormCompany] = useState('')
    const [formRole, setFormRole] = useState('')
    const [formStatus, setFormStatus] = useState('Active')

    const openCreateModal = () => {
      setEditingContact(null)
      setFormName('')
      setFormEmail('')
      setFormPhone('')
      setFormCompany('')
      setFormRole('')
      setFormStatus('Active')
      setIsFormOpen(true)
    }

    const openEditModal = (contact, e) => {
      e.stopPropagation()
      setEditingContact(contact)
      setFormName(contact.name)
      setFormEmail(contact.email)
      setFormPhone(contact.phone)
      setFormCompany(contact.company)
      setFormRole(contact.role)
      setFormStatus(contact.status)
      setIsFormOpen(true)
    }

    const handleDelete = (contactId, e) => {
      e.stopPropagation()
      if (confirm('Voulez-vous vraiment supprimer ce contact ?')) {
        const updated = contacts.filter(c => c.id !== contactId)
        handleSave('contacts', updated)
        if (selectedContact?.id === contactId) {
          setSelectedContact(null)
        }
      }
    }

    const handleSubmit = (e) => {
      e.preventDefault()
      if (editingContact) {
        // Edit
        const updated = contacts.map(c => c.id === editingContact.id ? {
          ...c,
          name: formName,
          email: formEmail,
          phone: formPhone,
          company: formCompany,
          role: formRole,
          status: formStatus
        } : c)
        handleSave('contacts', updated)
        if (selectedContact?.id === editingContact.id) {
          setSelectedContact({
            ...selectedContact,
            name: formName,
            email: formEmail,
            phone: formPhone,
            company: formCompany,
            role: formRole,
            status: formStatus
          })
        }
      } else {
        // Create
        const newContact = {
          id: 'contact_' + Date.now(),
          name: formName,
          email: formEmail,
          phone: formPhone,
          company: formCompany,
          role: formRole,
          status: formStatus
        }
        handleSave('contacts', [...contacts, newContact])
      }
      setIsFormOpen(false)
    }

    const filteredContacts = contacts.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchStatus = statusFilter === 'All' || c.status === statusFilter
      return matchSearch && matchStatus
    })

    return (
      <div className="space-y-6 fade-in">
        <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-salesforce-gray-border shadow-sm">
          <div>
            <h2 className="text-xl font-extrabold text-salesforce-dark flex items-center space-x-2">
              <Icons.Users className="w-5 h-5 text-salesforce-blue" />
              <span>Gestion des Contacts</span>
            </h2>
            <p className="text-xs text-slate-500">Visualisez, filtrez, créez et gérez vos contacts commerciaux.</p>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-salesforce-blue hover:bg-salesforce-blue-hover text-white text-xs font-bold px-4 py-2.5 rounded shadow flex items-center space-x-2"
          >
            <Icons.Plus className="w-4 h-4" />
            <span>Nouveau Contact</span>
          </button>
        </div>

        {/* Filters and List */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-4 rounded-lg border border-salesforce-gray-border shadow-sm flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Rechercher par nom, email, entreprise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-salesforce-gray-border rounded pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-salesforce-blue"
                />
                <Icons.Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-salesforce-gray-border rounded px-3 py-1.5 text-xs bg-white focus:outline-none"
              >
                <option value="All">Tous les statuts</option>
                <option value="Active">Actif</option>
                <option value="Inactive">Inactif</option>
              </select>
            </div>

            {/* List */}
            <div className="bg-white rounded-lg border border-salesforce-gray-border shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-salesforce-gray-border">
                  <tr>
                    <th className="p-4">Nom</th>
                    <th className="p-4">Entreprise</th>
                    <th className="p-4">Rôle</th>
                    <th className="p-4">Statut</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredContacts.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-400 italic">Aucun contact trouvé.</td>
                    </tr>
                  ) : (
                    filteredContacts.map(c => (
                      <tr 
                        key={c.id} 
                        onClick={() => setSelectedContact(c)}
                        className={`hover:bg-slate-50 cursor-pointer transition ${selectedContact?.id === c.id ? 'bg-salesforce-blue-light/20 font-medium' : ''}`}
                      >
                        <td className="p-4">
                          <div className="font-semibold text-salesforce-dark">{c.name}</div>
                          <div className="text-[10px] text-slate-400">{c.email}</div>
                        </td>
                        <td className="p-4">{c.company}</td>
                        <td className="p-4 text-slate-500">{c.role}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-1" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={(e) => openEditModal(c, e)}
                            className="p-1 rounded text-slate-500 hover:bg-slate-100 hover:text-salesforce-blue transition"
                            title="Modifier"
                          >
                            <Icons.Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(c.id, e)}
                            className="p-1 rounded text-slate-500 hover:bg-slate-100 hover:text-rose-600 transition"
                            title="Supprimer"
                          >
                            <Icons.Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Details Sidebar Side */}
          <div className="bg-white rounded-lg border border-salesforce-gray-border shadow-sm p-5 space-y-6">
            {selectedContact ? (
              <div className="space-y-6 fade-in">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-salesforce-blue/10 text-salesforce-blue rounded-full flex items-center justify-center font-bold text-lg uppercase shrink-0">
                    {selectedContact.name.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-salesforce-dark text-base truncate">{selectedContact.name}</h3>
                    <p className="text-xs text-slate-500 truncate">{selectedContact.role} chez <strong className="text-slate-700">{selectedContact.company}</strong></p>
                  </div>
                </div>

                <hr className="border-salesforce-gray-border" />

                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Email</span>
                    <a href={`mailto:${selectedContact.email}`} className="text-salesforce-blue hover:underline">{selectedContact.email}</a>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Téléphone</span>
                    <span className="text-slate-700 font-medium">{selectedContact.phone || 'Non renseigné'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Statut du compte</span>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ${selectedContact.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                      {selectedContact.status}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded text-slate-600 space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase flex items-center space-x-1">
                    <Icons.History className="w-3 h-3" />
                    <span>Dernière activité</span>
                  </h4>
                  <p className="text-xs italic">"Démonstration effectuée avec succès par Fatou Sow le 08/08/2026."</p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col justify-center items-center text-center text-slate-400 py-12 space-y-3">
                <Icons.User className="w-12 h-12 text-slate-300 stroke-1" />
                <p className="text-xs">Sélectionnez un contact pour visualiser ses détails et activités passées.</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal form */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-lg border border-salesforce-gray-border shadow-2xl max-w-md w-full overflow-hidden">
              <div className="bg-salesforce-dark text-white px-6 py-4 flex justify-between items-center">
                <h3 className="font-bold text-sm">
                  {editingContact ? 'Modifier le Contact' : 'Créer un Contact'}
                </h3>
                <button onClick={() => setIsFormOpen(false)} className="text-white hover:text-slate-300">
                  <Icons.X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">Nom complet</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex: Fatou Sow"
                    className="w-full border border-salesforce-gray-border rounded px-3 py-2 text-xs focus:outline-none focus:border-salesforce-blue"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="nom@mail.com"
                      className="w-full border border-salesforce-gray-border rounded px-3 py-2 text-xs focus:outline-none focus:border-salesforce-blue"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">Téléphone</label>
                    <input
                      type="text"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="+221 ..."
                      className="w-full border border-salesforce-gray-border rounded px-3 py-2 text-xs focus:outline-none focus:border-salesforce-blue"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">Entreprise</label>
                    <input
                      type="text"
                      required
                      value={formCompany}
                      onChange={(e) => setFormCompany(e.target.value)}
                      placeholder="Ex: LiAfrik"
                      className="w-full border border-salesforce-gray-border rounded px-3 py-2 text-xs focus:outline-none focus:border-salesforce-blue"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">Poste / Rôle</label>
                    <input
                      type="text"
                      required
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      placeholder="Ex: CTO"
                      className="w-full border border-salesforce-gray-border rounded px-3 py-2 text-xs focus:outline-none focus:border-salesforce-blue"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">Statut</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full border border-salesforce-gray-border rounded px-3 py-2 text-xs bg-white focus:outline-none focus:border-salesforce-blue"
                  >
                    <option value="Active">Actif</option>
                    <option value="Inactive">Inactif</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-xs text-slate-600 rounded hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-salesforce-blue text-white text-xs font-bold rounded hover:bg-salesforce-blue-hover shadow"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ----------------------------------------------------
  // COMPANIES SUBMODULE
  // ----------------------------------------------------
  if (subModule === 'companies') {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCompany, setSelectedCompany] = useState(null)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingCompany, setEditingCompany] = useState(null)

    // Form states
    const [formName, setFormName] = useState('')
    const [formIndustry, setFormIndustry] = useState('')
    const [formSize, setFormSize] = useState('1-50 emp')
    const [formWebsite, setFormWebsite] = useState('')
    const [formCountry, setFormCountry] = useState('')
    const [formStatus, setFormStatus] = useState('Client')

    const openCreateModal = () => {
      setEditingCompany(null)
      setFormName('')
      setFormIndustry('')
      setFormSize('1-50 emp')
      setFormWebsite('')
      setFormCountry('')
      setFormStatus('Client')
      setIsFormOpen(true)
    }

    const openEditModal = (comp, e) => {
      e.stopPropagation()
      setEditingCompany(comp)
      setFormName(comp.name)
      setFormIndustry(comp.industry)
      setFormSize(comp.size)
      setFormWebsite(comp.website)
      setFormCountry(comp.country)
      setFormStatus(comp.status)
      setIsFormOpen(true)
    }

    const handleDelete = (compId, e) => {
      e.stopPropagation()
      if (confirm('Voulez-vous vraiment supprimer cette entreprise ?')) {
        const updated = companies.filter(c => c.id !== compId)
        handleSave('companies', updated)
        if (selectedCompany?.id === compId) {
          setSelectedCompany(null)
        }
      }
    }

    const handleSubmit = (e) => {
      e.preventDefault()
      if (editingCompany) {
        const updated = companies.map(c => c.id === editingCompany.id ? {
          ...c,
          name: formName,
          industry: formIndustry,
          size: formSize,
          website: formWebsite,
          country: formCountry,
          status: formStatus
        } : c)
        handleSave('companies', updated)
        if (selectedCompany?.id === editingCompany.id) {
          setSelectedCompany({
            ...selectedCompany,
            name: formName,
            industry: formIndustry,
            size: formSize,
            website: formWebsite,
            country: formCountry,
            status: formStatus
          })
        }
      } else {
        const newComp = {
          id: 'company_' + Date.now(),
          name: formName,
          industry: formIndustry,
          size: formSize,
          website: formWebsite,
          country: formCountry,
          status: formStatus
        }
        handleSave('companies', [...companies, newComp])
      }
      setIsFormOpen(false)
    }

    const filteredCompanies = companies.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.country.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
      <div className="space-y-6 fade-in">
        <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-salesforce-gray-border shadow-sm">
          <div>
            <h2 className="text-xl font-extrabold text-salesforce-dark flex items-center space-x-2">
              <Icons.Building2 className="w-5 h-5 text-salesforce-blue" />
              <span>Gestion des Entreprises Comptes</span>
            </h2>
            <p className="text-xs text-slate-500">Gérez vos comptes clients B2B, partenaires et prospects.</p>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-salesforce-blue hover:bg-salesforce-blue-hover text-white text-xs font-bold px-4 py-2.5 rounded shadow flex items-center space-x-2"
          >
            <Icons.Plus className="w-4 h-4" />
            <span>Nouvelle Entreprise</span>
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-4 rounded-lg border border-salesforce-gray-border shadow-sm">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher par nom, secteur, pays..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-salesforce-gray-border rounded pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-salesforce-blue"
                />
                <Icons.Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-salesforce-gray-border shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-salesforce-gray-border">
                  <tr>
                    <th className="p-4">Entreprise</th>
                    <th className="p-4">Secteur</th>
                    <th className="p-4">Taille</th>
                    <th className="p-4">Type / Relation</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCompanies.map(c => (
                    <tr 
                      key={c.id}
                      onClick={() => setSelectedCompany(c)}
                      className={`hover:bg-slate-50 cursor-pointer transition ${selectedCompany?.id === c.id ? 'bg-salesforce-blue-light/20 font-medium' : ''}`}
                    >
                      <td className="p-4">
                        <div className="font-semibold text-salesforce-dark">{c.name}</div>
                        <div className="text-[10px] text-slate-400">{c.website}</div>
                      </td>
                      <td className="p-4">{c.industry}</td>
                      <td className="p-4 text-slate-500">{c.size}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.status === 'Client' ? 'bg-emerald-100 text-emerald-800' :
                          c.status === 'Partenaire' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={(e) => openEditModal(c, e)}
                          className="p-1 rounded text-slate-500 hover:bg-slate-100 hover:text-salesforce-blue transition"
                        >
                          <Icons.Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(c.id, e)}
                          className="p-1 rounded text-slate-500 hover:bg-slate-100 hover:text-rose-600 transition"
                        >
                          <Icons.Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-salesforce-gray-border shadow-sm p-5 space-y-6">
            {selectedCompany ? (
              <div className="space-y-5 fade-in">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-indigo-100 text-indigo-600 rounded flex items-center justify-center font-bold text-lg uppercase shrink-0">
                    <Icons.Building className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-salesforce-dark text-base">{selectedCompany.name}</h3>
                    <p className="text-xs text-slate-500">{selectedCompany.country}</p>
                  </div>
                </div>

                <hr className="border-salesforce-gray-border" />

                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Site Web</span>
                    <a href={selectedCompany.website} target="_blank" rel="noreferrer" className="text-salesforce-blue hover:underline">{selectedCompany.website}</a>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Secteur d'activité</span>
                    <span className="text-slate-700 font-semibold">{selectedCompany.industry}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Taille de l'entreprise</span>
                    <span className="text-slate-700 font-medium">{selectedCompany.size}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Relation commerciale</span>
                    <span className="text-slate-700 font-semibold">{selectedCompany.status}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col justify-center items-center text-center text-slate-400 py-12 space-y-3">
                <Icons.Building2 className="w-12 h-12 text-slate-300 stroke-1" />
                <p className="text-xs">Sélectionnez une entreprise pour visualiser ses indicateurs.</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-lg border border-salesforce-gray-border shadow-2xl max-w-md w-full overflow-hidden">
              <div className="bg-salesforce-dark text-white px-6 py-4 flex justify-between items-center">
                <h3 className="font-bold text-sm">
                  {editingCompany ? 'Modifier l\'Entreprise' : 'Créer une Entreprise'}
                </h3>
                <button onClick={() => setIsFormOpen(false)} className="text-white hover:text-slate-300">
                  <Icons.X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">Nom de l'entreprise</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex: Orange SA"
                    className="w-full border border-salesforce-gray-border rounded px-3 py-2 text-xs focus:outline-none focus:border-salesforce-blue"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">Secteur</label>
                    <input
                      type="text"
                      required
                      value={formIndustry}
                      onChange={(e) => setFormIndustry(e.target.value)}
                      placeholder="Télécom, Finance..."
                      className="w-full border border-salesforce-gray-border rounded px-3 py-2 text-xs focus:outline-none focus:border-salesforce-blue"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">Taille</label>
                    <select
                      value={formSize}
                      onChange={(e) => setFormSize(e.target.value)}
                      className="w-full border border-salesforce-gray-border rounded px-3 py-2 text-xs bg-white focus:outline-none focus:border-salesforce-blue"
                    >
                      <option value="1-50 emp">1-50 employés</option>
                      <option value="50-100 emp">50-100 employés</option>
                      <option value="100-500 emp">100-500 employés</option>
                      <option value="1000+ emp">1000+ employés</option>
                      <option value="10000+ emp">10000+ employés</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">Site Web</label>
                    <input
                      type="text"
                      value={formWebsite}
                      onChange={(e) => setFormWebsite(e.target.value)}
                      placeholder="https://..."
                      className="w-full border border-salesforce-gray-border rounded px-3 py-2 text-xs focus:outline-none focus:border-salesforce-blue"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">Pays</label>
                    <input
                      type="text"
                      required
                      value={formCountry}
                      onChange={(e) => setFormCountry(e.target.value)}
                      placeholder="France, Sénégal..."
                      className="w-full border border-salesforce-gray-border rounded px-3 py-2 text-xs focus:outline-none focus:border-salesforce-blue"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">Type de relation</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full border border-salesforce-gray-border rounded px-3 py-2 text-xs bg-white focus:outline-none focus:border-salesforce-blue"
                  >
                    <option value="Client">Client</option>
                    <option value="Partenaire">Partenaire</option>
                    <option value="Prospect">Prospect</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-xs text-slate-600 rounded hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-salesforce-blue text-white text-xs font-bold rounded hover:bg-salesforce-blue-hover shadow"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ----------------------------------------------------
  // LEADS SUBMODULE
  // ----------------------------------------------------
  if (subModule === 'leads') {
    const [searchTerm, setSearchTerm] = useState('')
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [formName, setFormName] = useState('')
    const [formCompany, setFormCompany] = useState('')
    const [formEmail, setFormEmail] = useState('')
    const [formBudget, setFormBudget] = useState(10000)
    const [formStatus, setFormStatus] = useState('New')

    const handleSubmit = (e) => {
      e.preventDefault()
      const newLead = {
        id: 'lead_' + Date.now(),
        name: formName,
        company: formCompany,
        email: formEmail,
        status: formStatus,
        budget: Number(formBudget),
        value: Number(formBudget) * 1.2,
        source: 'Form'
      }
      handleSave('leads', [...leads, newLead])
      setIsFormOpen(false)
      setFormName('')
      setFormCompany('')
      setFormEmail('')
      setFormBudget(10000)
    }

    const changeStatus = (leadId, nextStatus) => {
      const updated = leads.map(l => l.id === leadId ? { ...l, status: nextStatus } : l)
      handleSave('leads', updated)
    }

    const deleteLead = (leadId) => {
      if (confirm('Supprimer ce prospect ?')) {
        handleSave('leads', leads.filter(l => l.id !== leadId))
      }
    }

    const filteredLeads = leads.filter(l => 
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.company.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
      <div className="space-y-6 fade-in">
        <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-salesforce-gray-border shadow-sm">
          <div>
            <h2 className="text-xl font-extrabold text-salesforce-dark flex items-center space-x-2">
              <Icons.UserCheck className="w-5 h-5 text-salesforce-blue" />
              <span>Gestion des Leads / Prospects</span>
            </h2>
            <p className="text-xs text-slate-500">Traitez vos prospects entrants et qualifiez-les en opportunités.</p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-salesforce-blue hover:bg-salesforce-blue-hover text-white text-xs font-bold px-4 py-2.5 rounded shadow flex items-center space-x-2"
          >
            <Icons.Plus className="w-4 h-4" />
            <span>Nouveau Lead</span>
          </button>
        </div>

        <div className="bg-white p-4 rounded-lg border border-salesforce-gray-border shadow-sm">
          <input
            type="text"
            placeholder="Rechercher des leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-salesforce-gray-border rounded pl-9 pr-3 py-1.5 text-xs focus:outline-none"
          />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeads.map(lead => (
            <div key={lead.id} className="bg-white rounded-lg border border-salesforce-gray-border shadow-sm p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-salesforce-dark text-sm">{lead.name}</h3>
                  <p className="text-xs text-slate-500">{lead.company}</p>
                </div>
                <button 
                  onClick={() => deleteLead(lead.id)}
                  className="p-1 rounded text-slate-400 hover:bg-slate-50 hover:text-rose-600 transition"
                >
                  <Icons.Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Status Path bar representing real sales progress */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Progression Qualif</span>
                <div className="grid grid-cols-4 gap-1 h-2 rounded overflow-hidden">
                  <div className={`h-full rounded-l ${lead.status === 'New' || lead.status === 'Contacted' || lead.status === 'Qualified' ? 'bg-salesforce-blue' : 'bg-slate-200'}`}></div>
                  <div className={`h-full ${lead.status === 'Contacted' || lead.status === 'Qualified' ? 'bg-salesforce-blue' : 'bg-slate-200'}`}></div>
                  <div className={`h-full ${lead.status === 'Qualified' ? 'bg-salesforce-blue' : 'bg-slate-200'}`}></div>
                  <div className={`h-full rounded-r ${lead.status === 'Unqualified' ? 'bg-rose-500' : lead.status === 'Qualified' ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                </div>
                <div className="flex justify-between text-[9px] font-bold text-slate-400">
                  <span>Nouveau</span>
                  <span>Contacté</span>
                  <span>Qualifié</span>
                  <span>{lead.status === 'Unqualified' ? 'Disqualifié' : 'Terminé'}</span>
                </div>
              </div>

              <div className="text-xs space-y-2 bg-slate-50 p-3 rounded">
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-semibold">{lead.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Budget estimé:</span>
                  <span className="font-bold text-salesforce-dark">{lead.budget.toLocaleString()} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Origine:</span>
                  <span className="font-semibold text-indigo-600">{lead.source}</span>
                </div>
              </div>

              {/* Status action buttons */}
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => changeStatus(lead.id, 'Contacted')}
                  className={`flex-1 text-[10px] font-bold py-1.5 px-2 rounded border transition text-center ${
                    lead.status === 'Contacted' ? 'bg-salesforce-blue text-white border-salesforce-blue' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Contacté
                </button>
                <button
                  onClick={() => changeStatus(lead.id, 'Qualified')}
                  className="flex-1 text-[10px] font-bold py-1.5 px-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white transition text-center"
                >
                  Qualifier ✔
                </button>
                <button
                  onClick={() => changeStatus(lead.id, 'Unqualified')}
                  className="text-[10px] font-bold py-1.5 px-2 rounded bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 transition"
                  title="Disqualifier"
                >
                  ✘
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Create Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full overflow-hidden shadow-2xl border border-salesforce-gray-border">
              <div className="bg-salesforce-dark text-white px-6 py-4 flex justify-between items-center">
                <h3 className="font-bold text-sm">Ajouter un Prospect (Lead)</h3>
                <button onClick={() => setIsFormOpen(false)} className="text-white hover:text-slate-300">
                  <Icons.X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-700 block mb-1">Nom complet du prospect</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex: Koffi Mensah"
                    className="w-full border border-salesforce-gray-border rounded px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-700 block mb-1">Entreprise</label>
                  <input
                    type="text"
                    required
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="Ex: Ecobank"
                    className="w-full border border-salesforce-gray-border rounded px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-700 block mb-1">Email pro</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="koffi@ecobank.com"
                    className="w-full border border-salesforce-gray-border rounded px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-700 block mb-1">Budget estimé (€)</label>
                  <input
                    type="number"
                    value={formBudget}
                    onChange={(e) => setFormBudget(e.target.value)}
                    className="w-full border border-salesforce-gray-border rounded px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-700 block mb-1">Étape initiale</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full border border-salesforce-gray-border rounded px-3 py-2 text-xs bg-white focus:outline-none"
                  >
                    <option value="New">Nouveau (New)</option>
                    <option value="Contacted">Contacté (Contacted)</option>
                    <option value="Qualified">Qualifié (Qualified)</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-xs rounded text-slate-600 hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                  <button type="submit" className="px-4 py-2 bg-salesforce-blue text-white text-xs font-bold rounded hover:bg-salesforce-blue-hover">
                    Créer Prospect
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ----------------------------------------------------
  // DEALS KANBAN SUBMODULE
  // ----------------------------------------------------
  if (subModule === 'deals') {
    const stages = ['Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']

    const moveDeal = (dealId, targetStage) => {
      const updated = deals.map(d => d.id === dealId ? { ...d, stage: targetStage } : d)
      handleSave('deals', updated)
    }

    const [isFormOpen, setIsFormOpen] = useState(false)
    const [formName, setFormName] = useState('')
    const [formCompany, setFormCompany] = useState('')
    const [formAmount, setFormAmount] = useState(50000)
    const [formStage, setFormStage] = useState('Qualification')

    const handleSubmit = (e) => {
      e.preventDefault()
      const newDeal = {
        id: 'deal_' + Date.now(),
        name: formName,
        company: formCompany,
        amount: Number(formAmount),
        stage: formStage,
        closeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
      handleSave('deals', [...deals, newDeal])
      setIsFormOpen(false)
      setFormName('')
      setFormCompany('')
      setFormAmount(50000)
    }

    return (
      <div className="space-y-6 fade-in">
        <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-salesforce-gray-border shadow-sm">
          <div>
            <h2 className="text-xl font-extrabold text-salesforce-dark flex items-center space-x-2">
              <Icons.Landmark className="w-5 h-5 text-salesforce-blue" />
              <span>Pipeline Commercial (Deals Kanban)</span>
            </h2>
            <p className="text-xs text-slate-500">Visualisez et déplacez vos opportunités commerciales pour suivre votre chiffre d'affaires.</p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-salesforce-blue hover:bg-salesforce-blue-hover text-white text-xs font-bold px-4 py-2.5 rounded shadow flex items-center space-x-2"
          >
            <Icons.Plus className="w-4 h-4" />
            <span>Nouveau Deal</span>
          </button>
        </div>

        {/* Kanban Board Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-stretch">
          {stages.map(stage => {
            const stageDeals = deals.filter(d => d.stage === stage)
            const stageTotal = stageDeals.reduce((sum, d) => sum + d.amount, 0)

            return (
              <div key={stage} className="bg-slate-100 rounded-lg p-3 flex flex-col space-y-3 min-h-[400px]">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-salesforce-dark uppercase">{stage}</span>
                    <span className="text-[10px] text-slate-500">{stageDeals.length} opportunités</span>
                  </div>
                  <span className="bg-white px-2 py-0.5 rounded text-[10px] font-extrabold text-indigo-700 shadow-sm">
                    {stageTotal.toLocaleString()} €
                  </span>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto">
                  {stageDeals.map(deal => (
                    <div 
                      key={deal.id} 
                      className="bg-white p-3 rounded shadow-sm border border-slate-200 hover:border-salesforce-blue transition space-y-3"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-salesforce-dark leading-tight">{deal.name}</h4>
                        <span className="text-[10px] text-slate-500 font-medium block">{deal.company}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-700">{deal.amount.toLocaleString()} €</span>
                        <span className="text-[9px] text-slate-400">Date: {deal.closeDate}</span>
                      </div>

                      {/* Dropdown status changer (or arrows) to make Kanban fully interactive */}
                      <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                        <span className="text-[9px] font-bold text-slate-400">Étape:</span>
                        <select
                          value={deal.stage}
                          onChange={(e) => moveDeal(deal.id, e.target.value)}
                          className="text-[10px] font-semibold text-salesforce-blue bg-slate-50 border border-slate-200 rounded px-1 py-0.5"
                        >
                          {stages.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full overflow-hidden shadow-2xl border border-salesforce-gray-border">
              <div className="bg-salesforce-dark text-white px-6 py-4 flex justify-between items-center">
                <h3 className="font-bold text-sm">Ajouter une opportunité</h3>
                <button onClick={() => setIsFormOpen(false)} className="text-white hover:text-slate-300">
                  <Icons.X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-700 block mb-1">Nom de l'opportunité (Deal)</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex: Migration Cloud Orange"
                    className="w-full border border-salesforce-gray-border rounded px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-700 block mb-1">Entreprise</label>
                  <input
                    type="text"
                    required
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="Ex: Orange"
                    className="w-full border border-salesforce-gray-border rounded px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-700 block mb-1">Montant estimé (€)</label>
                  <input
                    type="number"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full border border-salesforce-gray-border rounded px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-700 block mb-1">Étape initiale</label>
                  <select
                    value={formStage}
                    onChange={(e) => setFormStage(e.target.value)}
                    className="w-full border border-salesforce-gray-border rounded px-3 py-2 text-xs bg-white focus:outline-none"
                  >
                    {stages.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-xs rounded text-slate-600 hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                  <button type="submit" className="px-4 py-2 bg-salesforce-blue text-white text-xs font-bold rounded hover:bg-salesforce-blue-hover">
                    Créer opportunité
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ----------------------------------------------------
  // ACTIVITIES SUBMODULE
  // ----------------------------------------------------
  if (subModule === 'activities') {
    const [searchTerm, setSearchTerm] = useState('')
    const [typeFilter, setTypeFilter] = useState('All')
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [actType, setActType] = useState('Call')
    const [actSubject, setActSubject] = useState('')
    const [actContact, setActContact] = useState('')
    const [actNotes, setActNotes] = useState('')

    const handleSubmit = (e) => {
      e.preventDefault()
      const newActivity = {
        id: 'activity_' + Date.now(),
        type: actType,
        subject: actSubject,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        contactName: actContact,
        status: 'Scheduled',
        notes: actNotes
      }
      handleSave('activities', [newActivity, ...activities])
      setIsFormOpen(false)
      setActSubject('')
      setActContact('')
      setActNotes('')
    }

    const completeActivity = (actId) => {
      const updated = activities.map(a => a.id === actId ? { ...a, status: 'Completed' } : a)
      handleSave('activities', updated)
    }

    const filteredActivities = activities.filter(act => {
      const matchesSearch = act.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            act.contactName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = typeFilter === 'All' || act.type === typeFilter
      return matchesSearch && matchesType
    })

    return (
      <div className="space-y-6 fade-in">
        <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-salesforce-gray-border shadow-sm">
          <div>
            <h2 className="text-xl font-extrabold text-salesforce-dark flex items-center space-x-2">
              <Icons.ClipboardList className="w-5 h-5 text-salesforce-blue" />
              <span>Log des Activités de Vente</span>
            </h2>
            <p className="text-xs text-slate-500">Suivez et consignez tous les appels, emails, réunions et tâches effectués avec vos clients.</p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-salesforce-blue hover:bg-salesforce-blue-hover text-white text-xs font-bold px-4 py-2.5 rounded shadow flex items-center space-x-2"
          >
            <Icons.Plus className="w-4 h-4" />
            <span>Consigner une Activité</span>
          </button>
        </div>

        <div className="bg-white p-4 rounded-lg border border-salesforce-gray-border shadow-sm flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Rechercher une activité ou un contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border border-salesforce-gray-border rounded pl-3 pr-3 py-1.5 text-xs focus:outline-none"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-salesforce-gray-border rounded px-3 py-1.5 text-xs bg-white focus:outline-none"
          >
            <option value="All">Tous les types</option>
            <option value="Call">Appels</option>
            <option value="Email">Emails</option>
            <option value="Meeting">Réunions</option>
            <option value="Task">Tâches</option>
          </select>
        </div>

        <div className="space-y-4">
          {filteredActivities.map(act => (
            <div key={act.id} className="bg-white rounded-lg border border-salesforce-gray-border shadow-sm p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-start space-x-4">
                <span className={`p-2 rounded-full ${
                  act.type === 'Call' ? 'bg-blue-100 text-blue-600' :
                  act.type === 'Email' ? 'bg-violet-100 text-violet-600' :
                  act.type === 'Meeting' ? 'bg-amber-100 text-amber-600' :
                  'bg-emerald-100 text-emerald-600'
                }`}>
                  {act.type === 'Call' && <Icons.Phone className="w-4 h-4" />}
                  {act.type === 'Email' && <Icons.Mail className="w-4 h-4" />}
                  {act.type === 'Meeting' && <Icons.Video className="w-4 h-4" />}
                  {act.type === 'Task' && <Icons.CheckSquare className="w-4 h-4" />}
                </span>
                <div>
                  <h4 className="font-bold text-salesforce-dark text-xs">{act.subject}</h4>
                  <p className="text-[10px] text-slate-500">Contact : <span className="font-semibold text-slate-700">{act.contactName}</span> • Date: {act.date}</p>
                  {act.notes && <p className="text-xs text-slate-600 mt-1 italic">"{act.notes}"</p>}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  act.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                }`}>
                  {act.status === 'Completed' ? 'Complété' : 'Planifié'}
                </span>

                {act.status !== 'Completed' && (
                  <button
                    onClick={() => completeActivity(act.id)}
                    className="text-[10px] font-bold px-3 py-1 rounded bg-slate-800 text-white hover:bg-slate-950 transition"
                  >
                    Marquer terminé ✔
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full overflow-hidden shadow-2xl border border-salesforce-gray-border">
              <div className="bg-salesforce-dark text-white px-6 py-4 flex justify-between items-center">
                <h3 className="font-bold text-sm">Consigner une activité</h3>
                <button onClick={() => setIsFormOpen(false)} className="text-white hover:text-slate-300">
                  <Icons.X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-700 block mb-1">Type d'activité</label>
                  <select
                    value={actType}
                    onChange={(e) => setActType(e.target.value)}
                    className="w-full border border-salesforce-gray-border rounded px-3 py-2 text-xs bg-white focus:outline-none"
                  >
                    <option value="Call">📞 Appel (Call)</option>
                    <option value="Email">✉ Email</option>
                    <option value="Meeting">💻 Réunion (Meeting)</option>
                    <option value="Task">☑ Tâche (Task)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-700 block mb-1">Sujet</label>
                  <input
                    type="text"
                    required
                    value={actSubject}
                    onChange={(e) => setActSubject(e.target.value)}
                    placeholder="Ex: Appel d'introduction, Démo technique..."
                    className="w-full border border-salesforce-gray-border rounded px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-700 block mb-1">Contact associé</label>
                  <input
                    type="text"
                    required
                    value={actContact}
                    onChange={(e) => setActContact(e.target.value)}
                    placeholder="Ex: Alice Bertrand"
                    className="w-full border border-salesforce-gray-border rounded px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-700 block mb-1">Notes / Détails</label>
                  <textarea
                    value={actNotes}
                    onChange={(e) => setActNotes(e.target.value)}
                    placeholder="Consignez les points clés de l'échange..."
                    className="w-full border border-salesforce-gray-border rounded px-3 py-2 text-xs focus:outline-none"
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-xs rounded text-slate-600 hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                  <button type="submit" className="px-4 py-2 bg-salesforce-blue text-white text-xs font-bold rounded hover:bg-salesforce-blue-hover">
                    Enregistrer l'Activité
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ----------------------------------------------------
  // CALENDAR SUBMODULE
  // ----------------------------------------------------
  if (subModule === 'calendar') {
    const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1)
    const [selectedDay, setSelectedDay] = useState(8)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [eventTitle, setEventTitle] = useState('')
    const [eventTime, setEventTime] = useState('10:00')
    const [eventContact, setEventContact] = useState('')

    const handleCreateEvent = (e) => {
      e.preventDefault()
      const newEvent = {
        id: 'activity_cal_' + Date.now(),
        type: 'Meeting',
        subject: eventTitle,
        date: `2026-08-${selectedDay < 10 ? '0' + selectedDay : selectedDay} ${eventTime}`,
        contactName: eventContact,
        status: 'Scheduled',
        notes: 'Ajouté depuis le calendrier Atlas.'
      }
      handleSave('activities', [...activities, newEvent])
      setIsFormOpen(false)
      setEventTitle('')
      setEventContact('')
    }

    return (
      <div className="space-y-6 fade-in">
        <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-salesforce-gray-border shadow-sm">
          <div>
            <h2 className="text-xl font-extrabold text-salesforce-dark flex items-center space-x-2">
              <Icons.Calendar className="w-5 h-5 text-salesforce-blue" />
              <span>Calendrier Intégré</span>
            </h2>
            <p className="text-xs text-slate-500">Gérez votre emploi du temps et suivez les réunions commerciales.</p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-salesforce-blue hover:bg-salesforce-blue-hover text-white text-xs font-bold px-4 py-2.5 rounded shadow flex items-center space-x-2"
          >
            <Icons.Plus className="w-4 h-4" />
            <span>Planifier Réunion / Événement</span>
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Monthly grid */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-salesforce-gray-border shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-salesforce-dark text-base">Août 2026</h3>
              <div className="flex space-x-1">
                <button className="p-1 border border-slate-200 rounded hover:bg-slate-50"><Icons.ChevronLeft className="w-4 h-4" /></button>
                <button className="p-1 border border-slate-200 rounded hover:bg-slate-50"><Icons.ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500 uppercase">
              <span>Lun</span><span>Mar</span><span>Mer</span><span>Jeu</span><span>Ven</span><span>Sam</span><span>Dim</span>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {/* Offset for August 2026 (Starts on Saturday, which is column index 5) */}
              {[...Array(4)].map((_, i) => (
                <div key={`offset-${i}`} className="h-14 bg-slate-50/50 rounded border border-transparent"></div>
              ))}

              {daysInMonth.map(day => {
                const dayStr = `2026-08-${day < 10 ? '0' + day : day}`
                const dayActivities = activities.filter(a => a.date.startsWith(dayStr))
                const isSelected = selectedDay === day

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`h-14 rounded border flex flex-col justify-between p-1.5 text-left transition select-none ${
                      isSelected 
                        ? 'border-salesforce-blue bg-salesforce-blue-light/30' 
                        : 'border-slate-100 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className={`text-[10px] font-bold ${isSelected ? 'text-salesforce-blue font-extrabold' : 'text-slate-700'}`}>{day}</span>
                    <div className="flex flex-wrap gap-1">
                      {dayActivities.map(act => (
                        <span key={act.id} className={`h-2 w-2 rounded-full ${
                          act.type === 'Call' ? 'bg-blue-500' :
                          act.type === 'Meeting' ? 'bg-amber-500' :
                          'bg-emerald-500'
                        }`} title={act.subject}></span>
                      ))}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Activities list of selected day */}
          <div className="bg-white rounded-lg border border-salesforce-gray-border shadow-sm p-5 space-y-6">
            <h3 className="font-bold text-salesforce-dark text-sm border-b border-slate-100 pb-2">
              Événements du {selectedDay} Août 2026
            </h3>

            <div className="space-y-4">
              {(() => {
                const dayStr = `2026-08-${selectedDay < 10 ? '0' + selectedDay : selectedDay}`
                const dayActivities = activities.filter(a => a.date.startsWith(dayStr))

                if (dayActivities.length === 0) {
                  return (
                    <div className="text-center text-slate-400 py-12 text-xs italic">
                      Aucune activité enregistrée pour ce jour.
                    </div>
                  )
                }

                return dayActivities.map(act => (
                  <div key={act.id} className="bg-slate-50 p-4 rounded border border-slate-200 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded uppercase">
                        {act.type}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {act.date.split(' ')[1]}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-salesforce-dark">{act.subject}</h4>
                    <p className="text-[10px] text-slate-500">Avec <span className="font-semibold">{act.contactName}</span></p>
                  </div>
                ))
              })()}
            </div>
          </div>
        </div>

        {/* Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full overflow-hidden shadow-2xl border border-salesforce-gray-border">
              <div className="bg-salesforce-dark text-white px-6 py-4 flex justify-between items-center">
                <h3 className="font-bold text-sm">Planifier une réunion (Août {selectedDay})</h3>
                <button onClick={() => setIsFormOpen(false)} className="text-white hover:text-slate-300">
                  <Icons.X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-700 block mb-1">Titre de l'événement</label>
                  <input
                    type="text"
                    required
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="Ex: Démo CRM Atlas..."
                    className="w-full border border-salesforce-gray-border rounded px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 block mb-1">Heure de début</label>
                    <input
                      type="time"
                      required
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      className="w-full border border-salesforce-gray-border rounded px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 block mb-1">Contact associé</label>
                    <input
                      type="text"
                      required
                      value={eventContact}
                      onChange={(e) => setEventContact(e.target.value)}
                      placeholder="Ex: Jean Dupont"
                      className="w-full border border-salesforce-gray-border rounded px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-xs rounded text-slate-600 hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                  <button type="submit" className="px-4 py-2 bg-salesforce-blue text-white text-xs font-bold rounded hover:bg-salesforce-blue-hover">
                    Ajouter au calendrier
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    )
  }

  return null
}
