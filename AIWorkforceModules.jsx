import React, { useState } from 'react'
import * as Icons from 'lucide-react'

export default function AIWorkforceModules({ 
  subModule, 
  database, 
  updateDatabase 
}) {
  const { aiAgents, aiTasks, workflows } = database

  // ----------------------------------------------------
  // AI AGENTS SUBMODULE
  // ----------------------------------------------------
  if (subModule === 'aiAgents') {
    const [selectedAgent, setSelectedAgent] = useState(null)
    const [prompt, setPrompt] = useState('')

    const handleSavePrompt = (agentId) => {
      const updated = aiAgents.map(ag => ag.id === agentId ? { ...ag, systemPrompt: prompt } : ag)
      updateDatabase('aiAgents', updated)
      setSelectedAgent(null)
      alert('Le prompt système de l\'agent AI a été mis à jour avec succès.')
    }

    const toggleAgentStatus = (agentId) => {
      const updated = aiAgents.map(ag => ag.id === agentId ? { 
        ...ag, 
        status: ag.status === 'Running' ? 'Standby' : 'Running' 
      } : ag)
      updateDatabase('aiAgents', updated)
    }

    return (
      <div className="space-y-6 fade-in">
        <div className="bg-white p-4 rounded-lg border border-salesforce-gray-border shadow-sm">
          <h2 className="text-xl font-extrabold text-salesforce-dark flex items-center space-x-2">
            <Icons.Bot className="w-5 h-5 text-salesforce-blue" />
            <span>Atlas AI Agents Directory</span>
          </h2>
          <p className="text-xs text-slate-500">Configurez et pilotez vos agents d'intelligence artificielle autonomes.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {aiAgents.map(agent => (
                <div key={agent.id} className="bg-white p-5 rounded-lg border border-salesforce-gray-border shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                        agent.status === 'Running' ? 'bg-emerald-100 text-emerald-800 animate-pulse' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {agent.status === 'Running' ? 'Actif' : 'En Pause'}
                      </span>
                      <button
                        onClick={() => toggleAgentStatus(agent.id)}
                        className="text-[10px] font-bold text-salesforce-blue hover:underline"
                      >
                        {agent.status === 'Running' ? 'Pause' : 'Démarrer'}
                      </button>
                    </div>

                    <h3 className="font-extrabold text-salesforce-dark text-sm">{agent.name}</h3>
                    <p className="text-xs text-slate-500">{agent.role}</p>
                    <p className="text-[10px] bg-slate-50 p-2 rounded text-slate-600 line-clamp-3">"{agent.systemPrompt}"</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-[10px]">
                    <span className="text-slate-400">Déclencheur: <strong className="text-slate-700">{agent.triggers}</strong></span>
                    <button
                      onClick={() => {
                        setSelectedAgent(agent)
                        setPrompt(agent.systemPrompt)
                      }}
                      className="bg-slate-800 text-white font-bold px-3 py-1.5 rounded text-[10px]"
                    >
                      Configurer Prompt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-salesforce-gray-border shadow-sm p-5 space-y-4">
            {selectedAgent ? (
              <div className="space-y-4 fade-in text-xs">
                <h3 className="font-bold text-salesforce-dark text-sm">Configurer Prompt : {selectedAgent.name}</h3>
                <p className="text-slate-500 text-[10px]">Ajustez le comportement et le ton de l'agent d'IA pour ses futures exécutions autonomes.</p>

                <textarea
                  rows="8"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full border border-salesforce-gray-border rounded p-3 text-xs focus:outline-none"
                ></textarea>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSavePrompt(selectedAgent.id)}
                    className="flex-1 bg-salesforce-blue hover:bg-salesforce-blue-hover text-white font-bold py-2 rounded text-center"
                  >
                    Mettre à jour
                  </button>
                  <button
                    onClick={() => setSelectedAgent(null)}
                    className="px-4 py-2 border rounded hover:bg-slate-50"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col justify-center items-center text-center text-slate-400 py-12 space-y-3">
                <Icons.Bot className="w-12 h-12 text-slate-300 stroke-1" />
                <p className="text-xs">Sélectionnez un agent pour ajuster ses instructions d'exécution.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ----------------------------------------------------
  // AI TASKS SUBMODULE
  // ----------------------------------------------------
  if (subModule === 'aiTasks') {
    return (
      <div className="space-y-6 fade-in">
        <div className="bg-white p-4 rounded-lg border border-salesforce-gray-border shadow-sm">
          <h2 className="text-xl font-extrabold text-salesforce-dark flex items-center space-x-2">
            <Icons.Cpu className="w-5 h-5 text-salesforce-blue" />
            <span>Historique des Tâches d'IA</span>
          </h2>
          <p className="text-xs text-slate-500">Log temps réel des exécutions d'agents d'IA Atlas sur vos workflows.</p>
        </div>

        <div className="bg-white rounded-lg border border-salesforce-gray-border shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-salesforce-gray-border">
              <tr>
                <th className="p-4">Tâche d'IA</th>
                <th className="p-4">Agent Déployé</th>
                <th className="p-4">Date de fin</th>
                <th className="p-4">État d'exécution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {aiTasks.map(t => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-salesforce-dark">{t.name}</td>
                  <td className="p-4 text-slate-600">{t.agent}</td>
                  <td className="p-4 text-slate-400">{t.completedAt}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.status === 'Success' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800 animate-pulse'
                    }`}>
                      {t.status === 'Success' ? 'Succès ✔' : 'En cours...'}
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
  // WORKFLOWS SUBMODULE (Règles conditionnelles interactives)
  // ----------------------------------------------------
  if (subModule === 'workflows') {
    const [wfName, setWfName] = useState('')
    const [wfTrigger, setWfTrigger] = useState('Lead created')
    const [wfAction, setWfAction] = useState('Assign to Account Manager')

    const handleCreateWorkflow = (e) => {
      e.preventDefault()
      if (!wfName.trim()) return

      const newWf = {
        id: 'wf_' + Date.now(),
        name: wfName,
        trigger: wfTrigger,
        actions: wfAction,
        status: 'Active'
      }

      updateDatabase('workflows', [...workflows, newWf])
      setWfName('')
    }

    const toggleWorkflowStatus = (wfId) => {
      const updated = workflows.map(w => w.id === wfId ? {
        ...w,
        status: w.status === 'Active' ? 'Inactive' : 'Active'
      } : w)
      updateDatabase('workflows', updated)
    }

    return (
      <div className="space-y-6 fade-in">
        <div className="bg-white p-4 rounded-lg border border-salesforce-gray-border shadow-sm">
          <h2 className="text-xl font-extrabold text-salesforce-dark flex items-center space-x-2">
            <Icons.GitFork className="w-5 h-5 text-salesforce-blue" />
            <span>Automated Workflows Builder</span>
          </h2>
          <p className="text-xs text-slate-500">Automatisez vos tâches commerciales récurrentes sans écrire de code.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg border border-salesforce-gray-border shadow-sm p-5 space-y-4">
              <h3 className="font-bold text-xs text-salesforce-dark uppercase tracking-wider">Vos Règles d'Automations</h3>
              <div className="space-y-3">
                {workflows.map(wf => (
                  <div key={wf.id} className="p-4 bg-slate-50 rounded border border-slate-200 flex justify-between items-center">
                    <div className="space-y-1 text-xs">
                      <h4 className="font-bold text-salesforce-dark">{wf.name}</h4>
                      <p className="text-slate-500">Quand: <strong className="text-indigo-600">{wf.trigger}</strong></p>
                      <p className="text-slate-500">Faire: <strong className="text-slate-800">{wf.actions}</strong></p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        wf.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {wf.status === 'Active' ? 'Actif' : 'Désactivé'}
                      </span>
                      <button
                        onClick={() => toggleWorkflowStatus(wf.id)}
                        className="text-xs text-salesforce-blue font-bold hover:underline"
                      >
                        Basculer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-salesforce-gray-border shadow-sm p-5 space-y-4">
            <h3 className="font-bold text-salesforce-dark text-xs border-b pb-2">Créer un Workflow d'IA</h3>
            <form onSubmit={handleCreateWorkflow} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-700 block mb-1">Nom du workflow</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Alerte Lead > 50k"
                  value={wfName}
                  onChange={(e) => setWfName(e.target.value)}
                  className="w-full border rounded px-3 py-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-700 block mb-1">Événement déclencheur (Trigger)</label>
                <select
                  value={wfTrigger}
                  onChange={(e) => setWfTrigger(e.target.value)}
                  className="w-full border rounded px-3 py-2 bg-white focus:outline-none"
                >
                  <option value="Lead created">Nouveau prospect créé</option>
                  <option value="Deal Stage changed">Changement d'étape de Deal</option>
                  <option value="Quote Approved">Devis signé / approuvé</option>
                  <option value="Support Ticket Open">Nouveau Ticket de Support</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-700 block mb-1">Action automatisée</label>
                <select
                  value={wfAction}
                  onChange={(e) => setWfAction(e.target.value)}
                  className="w-full border rounded px-3 py-2 bg-white focus:outline-none"
                >
                  <option value="Assign to Account Manager">Assigner à un Account Manager</option>
                  <option value="AI Agent drafted Proposal Email">AI pré-rédige un email de bienvenue</option>
                  <option value="Create Slack notification">Notifier Slack de l'équipe commerciale</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-salesforce-blue hover:bg-salesforce-blue-hover text-white font-bold py-2 rounded text-center"
              >
                Activer le Workflow
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // ----------------------------------------------------
  // AI MEMORY SUBMODULE
  // ----------------------------------------------------
  if (subModule === 'aiMemory') {
    return (
      <div className="space-y-6 fade-in">
        <div className="bg-white p-4 rounded-lg border border-salesforce-gray-border shadow-sm">
          <h2 className="text-xl font-extrabold text-salesforce-dark flex items-center space-x-2">
            <Icons.Database className="w-5 h-5 text-salesforce-blue" />
            <span>Atlas CRM AI Memory Vector logs</span>
          </h2>
          <p className="text-xs text-slate-500">Détails des données sémantiques contextualisées pour vos agents d'IA.</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-salesforce-gray-border shadow-sm space-y-4">
          <h3 className="font-bold text-xs text-salesforce-dark uppercase tracking-wider">Mémoire sémantique indexée</h3>
          <p className="text-xs text-slate-600">
            Atlas stocke les préférences et l'historique de vos clients sous forme de vecteurs pour nourrir les conversations de vos agents autonomes.
          </p>

          <div className="space-y-2 text-xs">
            <div className="p-3 bg-slate-50 rounded border font-mono text-[11px] text-slate-600">
              [Memory-ID: m_832] "Marie Martin privilégie la facturation annuelle et a manifesté un fort intérêt pour l'extension de support WhatsApp."
            </div>
            <div className="p-3 bg-slate-50 rounded border font-mono text-[11px] text-slate-600">
              [Memory-ID: m_104] "Le CTO de Sonatel, Amadou Diallo, utilise l'infrastructure cloud hébergée à Francfort."
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ----------------------------------------------------
  // KNOWLEDGE BASE SUBMODULE
  // ----------------------------------------------------
  if (subModule === 'knowledgeBase') {
    return (
      <div className="space-y-6 fade-in">
        <div className="bg-white p-4 rounded-lg border border-salesforce-gray-border shadow-sm">
          <h2 className="text-xl font-extrabold text-salesforce-dark flex items-center space-x-2">
            <Icons.BookOpen className="w-5 h-5 text-salesforce-blue" />
            <span>Base de Connaissances de l'IA</span>
          </h2>
          <p className="text-xs text-slate-500">Uploadez vos documentations pour que vos agents IA répondent précisément aux clients.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 text-xs">
          <div className="bg-white p-6 rounded-lg border border-salesforce-gray-border shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800">Documents Disponibles</h3>
            <div className="space-y-2">
              <div className="p-3 bg-slate-50 rounded border flex justify-between items-center">
                <span>📕 Manuel d'intégration API Atlas v2</span>
                <span className="text-[10px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-bold">PDF</span>
              </div>
              <div className="p-3 bg-slate-50 rounded border flex justify-between items-center">
                <span>📘 FAQ Tarifs & Licences 2026</span>
                <span className="text-[10px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-bold">DOCX</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-salesforce-gray-border shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800">Ajouter un Document</h3>
            <p className="text-slate-500">Glissez-déposez des fichiers PDF, DOCX ou des pages web pour indexation instantanée.</p>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center text-slate-400 hover:border-salesforce-blue transition cursor-pointer">
              📥 Cliquez pour parcourir vos fichiers
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
