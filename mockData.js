// Seed data and state manager for Atlas CRM by LiAfrik
// Saved in localStorage to support persistence across reloads

const INITIAL_CONTACTS = [
  { id: 'c1', name: 'Jean Dupont', email: 'jean.dupont@orange.fr', phone: '+33 6 12 34 56 78', company: 'Orange', role: 'Directeur Technique', status: 'Active' },
  { id: 'c2', name: 'Marie Martin', email: 'marie.martin@societegenerale.com', phone: '+33 7 98 76 54 32', company: 'Société Générale', role: 'Responsable Achats', status: 'Active' },
  { id: 'c3', name: 'Amadou Diallo', email: 'a.diallo@sonatel.sn', phone: '+221 77 123 45 67', company: 'Sonatel', role: 'CTO', status: 'Active' },
  { id: 'c4', name: 'Fatou Sow', email: 'fatou.sow@liafrik.com', phone: '+221 78 456 12 34', company: 'LiAfrik', role: 'Product Manager', status: 'Active' },
  { id: 'c5', name: 'David Smith', email: 'd.smith@microsoft.com', phone: '+1 415 555 2671', company: 'Microsoft Europe', role: 'VP Partnerships', status: 'Inactive' }
];

const INITIAL_COMPANIES = [
  { id: 'co1', name: 'Orange', industry: 'Télécommunications', size: '10000+ emp', website: 'https://orange.com', country: 'France', status: 'Client' },
  { id: 'co2', name: 'Société Générale', industry: 'Banque', size: '5000-10000 emp', website: 'https://societegenerale.com', country: 'France', status: 'Client' },
  { id: 'co3', name: 'Sonatel', industry: 'Télécommunications', size: '1000-5000 emp', website: 'https://sonatel.sn', country: 'Sénégal', status: 'Partenaire' },
  { id: 'co4', name: 'LiAfrik', industry: 'Technologie & AI', size: '50-100 emp', website: 'https://liafrik.com', country: 'Sénégal', status: 'Client' },
  { id: 'co5', name: 'Microsoft Europe', industry: 'Technologie', size: '10000+ emp', website: 'https://microsoft.com', country: 'Irlande', status: 'Prospect' }
];

const INITIAL_LEADS = [
  { id: 'l1', name: 'Alice Bertrand', company: 'TotalEnergies', email: 'a.bertrand@total.com', status: 'New', budget: 45000, value: 50000, source: 'Website' },
  { id: 'l2', name: 'Koffi Mensah', company: 'Ecobank', email: 'koffi.mensah@ecobank.com', status: 'Contacted', budget: 120000, value: 150000, source: 'Referral' },
  { id: 'l3', name: 'Yasmine Benali', company: 'Maroc Telecom', email: 'y.benali@iam.ma', status: 'Qualified', budget: 75000, value: 90000, source: 'Cold Outreach' },
  { id: 'l4', name: 'Marc Dubois', company: 'Capgemini', email: 'marc.dubois@capgemini.com', status: 'Unqualified', budget: 30000, value: 0, source: 'LinkedIn' },
  { id: 'l5', name: 'Sophie Leroi', company: 'Danone', email: 's.leroi@danone.com', status: 'New', budget: 60000, value: 70000, source: 'Inbound' }
];

const INITIAL_DEALS = [
  { id: 'd1', name: 'Migration Cloud Orange', company: 'Orange', amount: 85000, stage: 'Negotiation', closeDate: '2026-09-30' },
  { id: 'd2', name: 'AI Workforce Société Générale', company: 'Société Générale', amount: 150000, stage: 'Proposal', closeDate: '2026-10-15' },
  { id: 'd3', name: 'CRM Sonatel Integration', company: 'Sonatel', amount: 45000, stage: 'Closed Won', closeDate: '2026-08-01' },
  { id: 'd4', name: 'Security Audit Microsoft', company: 'Microsoft Europe', amount: 30000, stage: 'Qualification', closeDate: '2026-11-20' },
  { id: 'd5', name: 'Licences SaaS LiAfrik', company: 'LiAfrik', amount: 12000, stage: 'Closed Lost', closeDate: '2026-07-15' }
];

const INITIAL_ACTIVITIES = [
  { id: 'act1', type: 'Call', subject: 'Appel d\'introduction avec Alice', date: '2026-08-05 10:00', contactName: 'Alice Bertrand', status: 'Completed', notes: 'Très intéressée par notre module AI Agents.' },
  { id: 'act2', type: 'Email', subject: 'Envoi de la proposition commerciale Ecobank', date: '2026-08-07 15:30', contactName: 'Koffi Mensah', status: 'Completed', notes: 'Proposition de 120k€ envoyée par email.' },
  { id: 'act3', type: 'Meeting', subject: 'Démonstration AI Workforce', date: '2026-08-12 11:00', contactName: 'Jean Dupont', status: 'Scheduled', notes: 'Montrer les connecteurs Salesforce.' },
  { id: 'act4', type: 'Task', subject: 'Relancer Yasmine', date: '2026-08-15 09:00', contactName: 'Yasmine Benali', status: 'Scheduled', notes: 'Suivi de la qualification technique.' }
];

const INITIAL_PRODUCTS = [
  { id: 'p1', name: 'Atlas CRM - Licence Pro (Annuelle)', sku: 'ATL-CRM-PRO-YR', price: 79, category: 'SaaS Licences', active: true },
  { id: 'p2', name: 'Atlas CRM - Licence Starter (Annuelle)', sku: 'ATL-CRM-STR-YR', price: 29, category: 'SaaS Licences', active: true },
  { id: 'p3', name: 'AI Workforce - Agent de Service Client', sku: 'AI-WF-CS-01', price: 499, category: 'AI Addon', active: true },
  { id: 'p4', name: 'AI Workforce - Agent de Prospection Lead Gen', sku: 'AI-WF-LG-02', price: 699, category: 'AI Addon', active: true },
  { id: 'p5', name: 'Pack Heures Intégration Professionnelle', sku: 'SV-PROF-INT', price: 1500, category: 'Professional Services', active: true }
];

const INITIAL_QUOTES = [
  { id: 'q1', quoteNumber: 'QT-2026-001', clientName: 'Jean Dupont', company: 'Orange', amount: 948, date: '2026-08-01', status: 'Approved', items: [{ name: 'Atlas CRM - Licence Pro (Annuelle)', qty: 12, price: 79 }] },
  { id: 'q2', quoteNumber: 'QT-2026-002', clientName: 'Koffi Mensah', company: 'Ecobank', amount: 8388, date: '2026-08-03', status: 'Sent', items: [{ name: 'AI Workforce - Agent de Prospection Lead Gen', qty: 12, price: 699 }] },
  { id: 'q3', quoteNumber: 'QT-2026-003', clientName: 'Marie Martin', company: 'Société Générale', amount: 348, date: '2026-08-04', status: 'Draft', items: [{ name: 'Atlas CRM - Licence Starter (Annuelle)', qty: 12, price: 29 }] }
];

const INITIAL_ORDERS = [
  { id: 'o1', orderNumber: 'ORD-9021', clientName: 'Jean Dupont', amount: 948, status: 'Delivered', date: '2026-08-01' },
  { id: 'o2', orderNumber: 'ORD-9022', clientName: 'Koffi Mensah', amount: 8388, status: 'Pending', date: '2026-08-03' }
];

const INITIAL_INVOICES = [
  { id: 'i1', invoiceNumber: 'INV-2026-101', clientName: 'Jean Dupont', amount: 948, status: 'Paid', date: '2026-08-01' },
  { id: 'i2', invoiceNumber: 'INV-2026-102', clientName: 'Koffi Mensah', amount: 8388, status: 'Unpaid', date: '2026-08-03' },
  { id: 'i3', invoiceNumber: 'INV-2026-103', clientName: 'Marie Martin', amount: 348, status: 'Overdue', date: '2026-07-15' }
];

const INITIAL_PAYMENTS = [
  { id: 'pay1', transactionId: 'TX-83120', method: 'Stripe Credit Card', amount: 948, status: 'Success', date: '2026-08-01 14:22' },
  { id: 'pay2', transactionId: 'TX-83121', method: 'Bank Transfer', amount: 8388, status: 'Pending', date: '2026-08-03 09:15' }
];

const INITIAL_SUPPORT = [
  { id: 's1', ticketNumber: 'TK-1001', subject: 'Problème de synchronisation Google Calendar', status: 'Open', priority: 'High', assignee: 'Alexandre Ndour', contactName: 'Jean Dupont', message: 'La synchro s\'arrête avec l\'erreur 403.' },
  { id: 's2', ticketNumber: 'TK-1002', subject: 'Explication facturation licence Pro', status: 'In Progress', priority: 'Medium', assignee: 'Fatou Sow', contactName: 'Marie Martin', message: 'Je souhaite ajouter 5 sièges additionnels.' },
  { id: 's3', ticketNumber: 'TK-1003', subject: 'Erreur d\'API Webhook endpoint', status: 'Closed', priority: 'Low', assignee: 'Mamadou Ba', contactName: 'Amadou Diallo', message: 'Le ping ne renvoie pas de code 200.' }
];

const INITIAL_EMPLOYEES = [
  { id: 'emp1', name: 'Fatou Sow', email: 'fatou.sow@liafrik.com', role: 'Administrateur', department: 'Management', status: 'Active' },
  { id: 'emp2', name: 'Mamadou Ba', email: 'mamadou.ba@liafrik.com', role: 'Ingénieur AI', department: 'R&D AI', status: 'Active' },
  { id: 'emp3', name: 'Alexandre Ndour', email: 'alexandre.ndour@liafrik.com', role: 'Support Technique', department: 'Support', status: 'Active' },
  { id: 'emp4', name: 'Awa Cisse', email: 'awa.cisse@liafrik.com', role: 'Account Manager', department: 'Sales', status: 'Active' }
];

const INITIAL_AI_AGENTS = [
  { id: 'ag1', name: 'Prospector Elite v2', role: 'B2B Sales Outreach', systemPrompt: 'Tu es un agent expert en prospection commerciale froide sur LinkedIn et Email. Ton but est de qualifier les leads.', triggers: 'New Lead created', status: 'Running' },
  { id: 'ag2', name: 'CustomerCare Agent', role: 'Support & FAQs', systemPrompt: 'Tu es un agent de support technique de niveau 1. Tu réponds aux tickets en te basant sur la base de connaissances.', triggers: 'New Support Ticket', status: 'Standby' }
];

const INITIAL_AI_TASKS = [
  { id: 't1', name: 'Scraping Leads Capgemini', agent: 'Prospector Elite v2', status: 'Success', completedAt: '2026-08-08 12:15' },
  { id: 't2', name: 'Rédaction réponse Ticket TK-1001', agent: 'CustomerCare Agent', status: 'Running', completedAt: 'En cours...' }
];

const INITIAL_WORKFLOWS = [
  { id: 'w1', name: 'Auto-Assignation Leads Haute Valeur', trigger: 'Lead > 100k€', actions: 'Assigner à Awa Cisse + Créer Tâche de relance immédiate', status: 'Active' },
  { id: 'w2', name: 'Génération de devis automatique', trigger: 'Quote Drafted', actions: 'AI Agents rédige le mail d\'accompagnement', status: 'Inactive' }
];

const INITIAL_NOTIFICATIONS = [
  { id: 'n1', title: 'Nouveau Prospect Qualifié', description: 'Le lead Yasmine Benali (Maroc Telecom) a été qualifié automatiquement.', time: '10 mins ago', read: false },
  { id: 'n2', title: 'Facture impayée récurrente', description: 'La facture INV-2026-103 de Marie Martin est en retard de 15 jours.', time: '2 hours ago', read: false },
  { id: 'n3', title: 'Proposition Approuvée', description: 'Le devis QT-2026-001 a été signé par Orange.', time: '1 day ago', read: false },
  { id: 'n4', title: 'Système mis à jour', description: 'La plateforme Atlas CRM a été mise à jour à la version 2.4.0.', time: '2 days ago', read: true },
  { id: 'n5', title: 'Agent AI activé', description: 'L\'agent Prospector Elite v2 a scanné 15 nouveaux contacts.', time: '3 days ago', read: true }
];

const INITIAL_AUDIT_LOGS = [
  { id: 'log1', action: 'Connexion de l\'utilisateur', user: 'fatou.sow@liafrik.com', timestamp: '2026-08-08 14:00:23', details: 'Adresse IP: 196.207.240.1' },
  { id: 'log2', action: 'Modification Contact Marie Martin', user: 'fatou.sow@liafrik.com', timestamp: '2026-08-08 13:12:45', details: 'Changement du numéro de téléphone' },
  { id: 'log3', action: 'Création Devis QT-2026-003', user: 'awa.cisse@liafrik.com', timestamp: '2026-08-08 10:45:11', details: 'Montant: 348€' }
];

// Helper to safely load standard values from localStorage
export function loadFromStorage(key, initial) {
  try {
    const data = localStorage.getItem(`atlas_crm_${key}`);
    if (data) return JSON.parse(data);
    localStorage.setItem(`atlas_crm_${key}`, JSON.stringify(initial));
    return initial;
  } catch (e) {
    return initial;
  }
}

// Helper to save values
export function saveToStorage(key, data) {
  try {
    localStorage.setItem(`atlas_crm_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving data to local storage', e);
  }
}

export function initializeDatabase() {
  const keys = {
    contacts: INITIAL_CONTACTS,
    companies: INITIAL_COMPANIES,
    leads: INITIAL_LEADS,
    deals: INITIAL_DEALS,
    activities: INITIAL_ACTIVITIES,
    products: INITIAL_PRODUCTS,
    quotes: INITIAL_QUOTES,
    orders: INITIAL_ORDERS,
    invoices: INITIAL_INVOICES,
    payments: INITIAL_PAYMENTS,
    support: INITIAL_SUPPORT,
    employees: INITIAL_EMPLOYEES,
    aiAgents: INITIAL_AI_AGENTS,
    aiTasks: INITIAL_AI_TASKS,
    workflows: INITIAL_WORKFLOWS,
    notifications: INITIAL_NOTIFICATIONS,
    auditLogs: INITIAL_AUDIT_LOGS,
    billing: {
      plan: 'Free Trial',
      tier: 'Pro', // Starter or Pro
      trialStartDate: new Date().toISOString(),
      trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      cardLast4: '',
      isCanceled: false,
      subscriptionStatus: 'trialing'
    }
  };

  const db = {};
  for (const [key, initialValue] of Object.entries(keys)) {
    db[key] = loadFromStorage(key, initialValue);
  }
  return db;
}
