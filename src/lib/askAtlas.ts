import { supabase } from './supabase';

type Answer = { text: string; route?: string };

const norm = (s: string) => s.toLowerCase().trim();
const has = (q: string, ...keys: string[]) => keys.some((k) => q.includes(k));

export async function askAtlas(question: string, lang: 'en' | 'fr' | 'es' | 'pt' | 'ar' = 'fr'): Promise<Answer> {
  const q = norm(question);
  const fr = lang === 'fr';

  const pick = (frTxt: string, enTxt: string) => (fr ? frTxt : enTxt);

  // ---- Contacts ----
  if (has(q, 'contact', 'contacts') && !has(q, 'deal', 'lead')) {
    const { count } = await supabase.from('contacts').select('*', { count: 'exact', head: true });
    return { text: pick(`Vous avez ${count ?? 0} contacts enregistrés.`, `You have ${count ?? 0} contacts.`), route: '/app/contacts' };
  }

  // ---- Leads (hot / new) ----
  if (has(q, 'lead', 'leads', 'prospect')) {
    if (has(q, 'hot', 'chaud', 'qualifié', 'qualified')) {
      const { count } = await supabase.from('leads').select('*', { count: 'exact', head: true }).eq('temperature', 'hot').neq('status', 'converted');
      return { text: pick(`Il y a ${count ?? 0} leads chauds non convertis à qualifier.`, `There are ${count ?? 0} hot unconverted leads.`), route: '/app/leads' };
    }
    if (has(q, 'new', 'nouveau', 'nouveaux', 'recent', 'récent')) {
      const since = new Date(Date.now() - 7 * 86400000).toISOString();
      const { count } = await supabase.from('leads').select('*', { count: 'exact', head: true }).gte('created_at', since);
      return { text: pick(`${count ?? 0} nouveaux leads cette semaine.`, `${count ?? 0} new leads this week.`), route: '/app/leads' };
    }
    const { count } = await supabase.from('leads').select('*', { count: 'exact', head: true });
    return { text: pick(`Vous avez ${count ?? 0} leads au total.`, `You have ${count ?? 0} leads in total.`), route: '/app/leads' };
  }

  // ---- Deals / pipeline ----
  if (has(q, 'deal', 'deals', 'opportunit', 'pipeline', 'affaire')) {
    if (has(q, 'risk', 'risque', 'retard', 'late', 'overdue')) {
      const { count } = await supabase.from('deals').select('*', { count: 'exact', head: true }).eq('status', 'open').lt('closing_date', new Date().toISOString());
      return { text: pick(`${count ?? 0} opportunités sont en retard (date de clôture dépassée).`, `${count ?? 0} deals are overdue.`), route: '/app/deals' };
    }
    const { count } = await supabase.from('deals').select('*', { count: 'exact', head: true }).eq('status', 'open');
    return { text: pick(`Il y a ${count ?? 0} opportunités ouvertes dans votre pipeline.`, `There are ${count ?? 0} open deals in your pipeline.`), route: '/app/deals' };
  }

  // ---- Revenue / payments ----
  if (has(q, 'revenue', 'chiffre', 'recette', 'revenu', 'payment', 'paiement', 'montant', 'money')) {
    const { data } = await supabase.from('payments').select('amount').eq('status', 'completed');
    const total = (data || []).reduce((s, p: { amount: number }) => s + (Number(p.amount) || 0), 0);
    const fmt = new Intl.NumberFormat(lang, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(total);
    return { text: pick(`Le revenu encaissé est de ${fmt}.`, `Collected revenue is ${fmt}.`) };
  }

  // ---- Invoices / unpaid ----
  if (has(q, 'invoice', 'facture', 'unpaid', 'impayé', 'impayee', 'due')) {
    const { count } = await supabase.from('invoices').select('*', { count: 'exact', head: true }).neq('payment_status', 'paid');
    return { text: pick(`${count ?? 0} factures impayées à relancer.`, `${count ?? 0} unpaid invoices to follow up.`), route: '/app/invoices' };
  }

  // ---- Tickets / support ----
  if (has(q, 'ticket', 'support', 'incident', 'problème', 'probleme', 'client issue')) {
    const { count } = await supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'open');
    return { text: pick(`${count ?? 0} tickets de support ouverts.`, `${count ?? 0} open support tickets.`), route: '/app/support' };
  }

  // ---- Tasks / overdue ----
  if (has(q, 'task', 'tâche', 'tache', 'todo', 'à faire')) {
    if (has(q, 'overdue', 'en retard', 'retard', 'late')) {
      const { count } = await supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'pending').lt('due_date', new Date().toISOString());
      return { text: pick(`${count ?? 0} tâches en retard.`, `${count ?? 0} overdue tasks.`) };
    }
    const { count } = await supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    return { text: pick(`Il vous reste ${count ?? 0} tâches en cours.`, `You have ${count ?? 0} pending tasks.`) };
  }

  // ---- Meetings / calendar ----
  if (has(q, 'meeting', 'réunion', 'reunion', 'rendez', 'appointment', 'calendar', 'calendrier', 'agenda')) {
    const { count } = await supabase.from('activities').select('*', { count: 'exact', head: true }).eq('type', 'meeting').eq('status', 'pending').gte('scheduled_at', new Date().toISOString());
    return { text: pick(`${count ?? 0} réunions à venir.`, `${count ?? 0} upcoming meetings.`), route: '/app/calendar' };
  }

  // ---- AI tasks / agents ----
  if (has(q, 'ai', 'agent', 'automation', 'automatisation', 'robot')) {
    const { count: pending } = await supabase.from('ai_tasks').select('*', { count: 'exact', head: true }).in('status', ['pending', 'in_progress']);
    const { count: done } = await supabase.from('ai_tasks').select('*', { count: 'exact', head: true }).eq('status', 'completed');
    return { text: pick(`Tâches IA : ${done ?? 0} terminées, ${pending ?? 0} en cours.`, `AI tasks: ${done ?? 0} completed, ${pending ?? 0} pending.`), route: '/app/ai-tasks' };
  }

  // ---- Employees / team ----
  if (has(q, 'employee', 'employé', 'employe', 'team', 'équipe', 'equipe', 'staff', 'collaborateur')) {
    const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    return { text: pick(`Votre équipe compte ${count ?? 0} membre(s).`, `Your team has ${count ?? 0} member(s).`), route: '/app/employees' };
  }

  // ---- Overview / summary ----
  if (has(q, 'summary', 'résumé', 'resume', 'overview', 'aperçu', 'apercu', 'rapport', 'comment', 'state', 'situation', 'report', 'status', 'statut', 'today', 'aujourd')) {
    const [contacts, leads, deals, tickets] = await Promise.all([
      supabase.from('contacts').select('*', { count: 'exact', head: true }),
      supabase.from('leads').select('*', { count: 'exact', head: true }),
      supabase.from('deals').select('*', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    ]);
    return {
      text: pick(
        `Aperçu : ${contacts.count ?? 0} contacts, ${leads.count ?? 0} leads, ${deals.count ?? 0} deals ouverts, ${tickets.count ?? 0} tickets ouverts.`,
        `Overview: ${contacts.count ?? 0} contacts, ${leads.count ?? 0} leads, ${deals.count ?? 0} open deals, ${tickets.count ?? 0} open tickets.`
      ),
    };
  }

  // ---- Help / fallback ----
  return {
    text: pick(
      'Je peux vous renseigner sur vos contacts, leads, opportunités, revenus, factures, tickets, tâches, réunions et tâches IA. Posez une question comme "Combien de deals ouverts ?" ou "Quels sont mes leads chauds ?".',
      'I can answer about your contacts, leads, deals, revenue, invoices, tickets, tasks, meetings and AI tasks. Try "How many open deals?" or "Show my hot leads".'
    ),
  };
}
