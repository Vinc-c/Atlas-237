import React, { useState } from 'react'
import * as Icons from 'lucide-react'

export default function TeamModules({ 
  subModule, 
  database, 
  updateDatabase 
}) {
  const { employees } = database

  if (subModule === 'employees') {
    const [empName, setEmpName] = useState('')
    const [empEmail, setEmpEmail] = useState('')
    const [empRole, setEmpRole] = useState('Account Manager')
    const [empDept, setEmpDept] = useState('Sales')

    const handleAddEmployee = (e) => {
      e.preventDefault()
      if (!empName.trim() || !empEmail.trim()) return

      const newEmp = {
        id: 'emp_' + Date.now(),
        name: empName,
        email: empEmail,
        role: empRole,
        department: empDept,
        status: 'Active'
      }

      updateDatabase('employees', [...employees, newEmp])
      setEmpName('')
      setEmpEmail('')
    }

    return (
      <div className="space-y-6 fade-in">
        <div className="bg-white p-4 rounded-lg border border-salesforce-gray-border shadow-sm">
          <h2 className="text-xl font-extrabold text-salesforce-dark flex items-center space-x-2">
            <Icons.UserSquare2 className="w-5 h-5 text-salesforce-blue" />
            <span>Répertoire des Employés</span>
          </h2>
          <p className="text-xs text-slate-500">Consultez et gérez les fiches de vos collaborateurs d'entreprise.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg border border-salesforce-gray-border shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-salesforce-gray-border">
                <tr>
                  <th className="p-4">Employé</th>
                  <th className="p-4">Département</th>
                  <th className="p-4">Rôle</th>
                  <th className="p-4">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50">
                    <td className="p-4">
                      <div className="font-bold text-salesforce-dark">{emp.name}</div>
                      <div className="text-[10px] text-slate-400">{emp.email}</div>
                    </td>
                    <td className="p-4">{emp.department}</td>
                    <td className="p-4 text-slate-500">{emp.role}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {emp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-lg border border-salesforce-gray-border shadow-sm p-5 space-y-4">
            <h3 className="font-bold text-slate-800 text-xs border-b pb-2">Ajouter un Collaborateur</h3>
            <form onSubmit={handleAddEmployee} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-700 block mb-1">Nom Complet</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Awa Cisse"
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  className="w-full border rounded px-3 py-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-700 block mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="awa.cisse@liafrik.com"
                  value={empEmail}
                  onChange={(e) => setEmpEmail(e.target.value)}
                  className="w-full border rounded px-3 py-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-700 block mb-1">Rôle</label>
                <select
                  value={empRole}
                  onChange={(e) => setEmpRole(e.target.value)}
                  className="w-full border rounded px-3 py-2 bg-white focus:outline-none"
                >
                  <option value="Administrateur">Administrateur</option>
                  <option value="Ingénieur AI">Ingénieur AI</option>
                  <option value="Account Manager">Account Manager</option>
                  <option value="Support Technique">Support Technique</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-salesforce-blue hover:bg-salesforce-blue-hover text-white font-bold py-2 rounded text-center"
              >
                Inscrire Collaborateur
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  if (subModule === 'teams') {
    return (
      <div className="space-y-6 fade-in">
        <div className="bg-white p-4 rounded-lg border border-salesforce-gray-border shadow-sm">
          <h2 className="text-xl font-extrabold text-salesforce-dark flex items-center space-x-2">
            <Icons.Network className="w-5 h-5 text-salesforce-blue" />
            <span>Gestion des Équipes</span>
          </h2>
          <p className="text-xs text-slate-500">Organisez vos forces commerciales et techniques par filières.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 text-xs">
          <div className="bg-white p-6 rounded-lg border border-salesforce-gray-border shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800">Équipes de Ventes (Sales Teams)</h3>
            <div className="p-3 bg-slate-50 rounded border flex justify-between items-center">
              <div>
                <h4 className="font-bold">Team West-Africa CRM</h4>
                <p className="text-[10px] text-slate-400">Responsable: Awa Cisse • 3 membres</p>
              </div>
              <span className="text-salesforce-blue font-bold">Actif</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-salesforce-gray-border shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800">Équipes Techniques (AI Engineering)</h3>
            <div className="p-3 bg-slate-50 rounded border flex justify-between items-center">
              <div>
                <h4 className="font-bold">R&D AI Workforce</h4>
                <p className="text-[10px] text-slate-400">Responsable: Mamadou Ba • 5 membres</p>
              </div>
              <span className="text-salesforce-blue font-bold">Actif</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (subModule === 'permissions') {
    const [roles, setRoles] = useState({
      Admin: { crm: true, billing: true, ai: true },
      Sales: { crm: true, billing: false, ai: true },
      Support: { crm: true, billing: false, ai: false }
    })

    const togglePermission = (role, module) => {
      setRoles({
        ...roles,
        [role]: {
          ...roles[role],
          [module]: !roles[role][module]
        }
      })
    }

    return (
      <div className="space-y-6 fade-in">
        <div className="bg-white p-4 rounded-lg border border-salesforce-gray-border shadow-sm">
          <h2 className="text-xl font-extrabold text-salesforce-dark flex items-center space-x-2">
            <Icons.Key className="w-5 h-5 text-salesforce-blue" />
            <span>Matrice de Permissions & Rôles</span>
          </h2>
          <p className="text-xs text-slate-500">Définissez les droits d'accès aux modules pour préserver la confidentialité.</p>
        </div>

        <div className="bg-white rounded-lg border border-salesforce-gray-border shadow-sm overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b">
              <tr>
                <th className="p-4">Rôle / Profil</th>
                <th className="p-4">Module CRM</th>
                <th className="p-4">Module AI Workforce</th>
                <th className="p-4">Système & Billing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.keys(roles).map(role => (
                <tr key={role} className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-salesforce-dark">{role}</td>
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={roles[role].crm}
                      onChange={() => togglePermission(role, 'crm')}
                      className="rounded text-salesforce-blue"
                    />
                  </td>
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={roles[role].ai}
                      onChange={() => togglePermission(role, 'ai')}
                      className="rounded text-salesforce-blue"
                    />
                  </td>
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={roles[role].billing}
                      disabled={role === 'Admin'} // Admin has forced billing
                      onChange={() => togglePermission(role, 'billing')}
                      className="rounded text-salesforce-blue"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return null
}
