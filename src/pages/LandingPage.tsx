import { useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, ShieldCheck, TrendingUp, Bot, BarChart3,
  CheckCircle2, X, ArrowRight, Cloud, Globe2, Zap, Star,
  MessageSquare, Database, Workflow, PlayCircle, Building2,
} from 'lucide-react';

const cloudProducts = [
  { icon: MessageSquare, name: 'Slack', desc: 'Connectez workflows et données conversationnelles là où le travail se fait.' },
  { icon: BarChart3, name: 'Tableau', desc: 'Transformez l’analytique agentique en intelligence actionable.' },
  { icon: Bot, name: 'Agentforce', desc: 'Créez des expériences agentiques de confiance qui agissent avec intention.' },
  { icon: Cloud, name: 'Customer 360', desc: 'Ancrez chaque décision dans un contexte métier éprouvé.' },
  { icon: Database, name: 'Data 360', desc: 'Une fondation de données gouvernée, unifiée et fiable.' },
];

const industries = [
  { icon: Building2, name: 'Services financiers', desc: 'Connectez-vous proactivement aux clients pour des expériences IA à forte valeur.' },
  { icon: TrendingUp, name: 'Retail', desc: 'Acquérez des clients rentables plus vite avec des données unifiées en temps réel.' },
  { icon: ShieldCheck, name: 'Santé & Sciences de la vie', desc: 'Élevez vos équipes avec des agents IA pour des communautés plus saines.' },
  { icon: Building2, name: 'Construction & Immobilier', desc: 'Fluidifiez vos processus et atteignez l’excellence opérationnelle.' },
  { icon: Bot, name: 'Éducation', desc: 'Boostez la productivité et le support étudiant 24/7 avec une IA dédiée.' },
  { icon: Workflow, name: 'Services pro', desc: 'Renforcez la confiance client, recrutez les bons talents et bâtissez la culture.' },
  { icon: Cloud, name: 'Technologie', desc: 'Automatisez les workflows, unifiez les données et prospérez avec une IA fiable.' },
  { icon: Workflow, name: 'Industrie', desc: 'Intégrez toutes vos données sur une chaîne de valeur unifiée.' },
];

const reports = [
  { tag: 'Rapport', title: 'Agentforce délivre un ROI plus rapide et à moindre coût qu’une approche DIY', cta: 'Lire le rapport Valoir' },
  { tag: 'Rapport', title: 'Salesforce est élu n°1 des éditeurs logiciers mondiaux sur G2', cta: 'Lire le rapport G2' },
  { tag: 'Rapport', title: 'Pourquoi Agentforce est le chemin le plus rapide vers la valeur entreprise', cta: 'Lire le rapport Futurum' },
];

const plans = [
  { name: 'Starter', monthly: 25, tagline: 'Pour démarrer', desc: 'Ventes, service et marketing avec des agents pré-construits.', cta: 'Commencer gratuitement', popular: false },
  { name: 'Growth', monthly: 80, tagline: 'Le plus populaire', desc: 'Automatisation, campagnes et croissance commerciale.', cta: 'Choisir Growth', popular: true },
  { name: 'Pro', monthly: 165, tagline: 'Haute performance', desc: 'Analyses IA, support prioritaire et workflows avancés.', cta: 'Choisir Pro', popular: false },
  { name: 'Enterprise', monthly: null, tagline: 'Sur mesure', desc: 'Solution dédiée, API illimitée et accompagnement.', cta: 'Contacter les ventes', popular: false },
];

type Row = { label: string; values: (boolean | string)[] };
const matrixGroups: { group: string; rows: Row[] }[] = [
  {
    group: 'Ventes & CRM',
    rows: [
      { label: 'Contacts illimités', values: [true, true, true, true] },
      { label: 'Pipelines de ventes', values: [true, true, true, true] },
      { label: 'Devis & facturation', values: [false, true, true, true] },
      { label: 'Utilisateurs inclus', values: ['3', '10', '25', 'Illimité'] },
    ],
  },
  {
    group: 'Automatisation & IA',
    rows: [
      { label: 'Agents pré-construits (Agentforce)', values: [true, true, true, true] },
      { label: 'Automations / workflows', values: [false, true, true, true] },
      { label: 'Analyses prédictives', values: [false, false, true, true] },
      { label: 'Workflows personnalisés', values: [false, false, true, true] },
    ],
  },
  {
    group: 'Service & Support',
    rows: [
      { label: 'Tickets clients', values: [false, true, true, true] },
      { label: 'Base de connaissances', values: [false, false, true, true] },
      { label: 'SLA & escalade', values: [false, false, true, true] },
    ],
  },
  {
    group: 'Sécurité & Administration',
    rows: [
      { label: 'SSO / SAML', values: [false, false, true, true] },
      { label: 'Audit log', values: [false, true, true, true] },
      { label: 'Support dédié', values: ['Email', 'Prioritaire', '24/7', 'Délégué'] },
    ],
  },
];

const faqs = [
  { q: 'Qu’est-ce qu’Atlas CRM ?', a: 'Atlas CRM est la plateforme de gestion de la relation client n°1 propulsée par l’IA agentique. Elle réunit entreprises et clients via un ensemble unifié d’applications — alimentées par l’IA agentique et la donnée — qui aident chaque département (ventes, service, marketing, commerce, IT) à travailler comme un seul.' },
  { q: 'Qu’est-ce qu’un CRM et pourquoi en ai-je besoin ?', a: 'Un CRM gère toutes les relations et interactions de votre entreprise avec ses clients. Il vous aide à organiser les contacts, automatiser les tâches (logs d’appels, relances) et analyser les données pour comprendre le comportement client — vous donnant une vue à 360° de chaque client.' },
  { q: 'Qu’est-ce que l’IA agentique et comment l’utilise Atlas CRM ?', a: 'L’IA agentique désigne des systèmes d’IA capables d’agir de manière autonome pour atteindre un objectif. Dans Atlas CRM (via Agentforce), elle automatise des workflows complexes (qualification de leads, résolution de tickets), prédit les résultats et personnalise chaque interaction client.' },
  { q: 'Comment Atlas CRM aide-t-il ma PME à grandir ?', a: 'Atlas CRM propose des solutions adaptées à toutes les tailles. La plateforme flexible vous permet de démarrer avec l’essentiel (ventes, service, marketing) puis d’ajouter des fonctions à mesure que vous grandissez — vous ne payez que ce que vous utilisez.' },
];

function Check({ value }: { value: boolean | string }) {
  if (value === true) return <CheckCircle2 size={18} className="mx-auto text-primary-600" />;
  if (value === false) return <X size={16} className="mx-auto text-ink-300" />;
  return <span className="text-sm font-semibold text-ink-900">{value}</span>;
}

export function LandingPage() {
  const [annual, setAnnual] = useState(true);
  const price = (m: number | null) => (m === null ? 'Sur devis' : annual ? `$${Math.round(m * 10)}/an` : `$${m}/mois`);

  return (
    <div className="bg-white text-ink-900">
      {/* ───────── Header ───────── */}
      <header className="sticky top-0 z-50 border-b border-ink-100 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5 md:px-10">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
              <Sparkles size={18} />
            </div>
            <span className="text-lg font-bold tracking-tight">Atlas CRM</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-ink-600 lg:flex">
            <a href="#products" className="hover:text-primary-700 transition">Produits</a>
            <a href="#pricing" className="hover:text-primary-700 transition">Tarifs</a>
            <a href="#industries" className="hover:text-primary-700 transition">Industries</a>
            <a href="#faq" className="hover:text-primary-700 transition">FAQ</a>
          </nav>
          <div className="flex items-center gap-2.5">
            <Link to="/auth" className="hidden rounded-lg px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50 sm:inline-flex">
              Se connecter
            </Link>
            <Link to="/auth" className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700">
              Essai gratuit
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ───────── Hero ───────── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 via-white to-white">
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary-200/40 blur-3xl" />
          <div className="absolute -left-24 top-40 h-80 w-80 rounded-full bg-accent-200/20 blur-3xl" />
          <div className="relative mx-auto max-w-4xl px-6 py-20 text-center md:px-10 lg:py-28">
            <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-ink-950 sm:text-6xl">
              Commencez avec le <span className="text-primary-600">CRM agentique n°1</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-ink-600">
              Là où les personnes, les agents, les applications et les données se rejoignent sur une plateforme intégrée et fiable, qui travaille au cœur des systèmes qui font tourner votre entreprise.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/auth" className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-600/20 transition hover:bg-primary-700">
                Commencer gratuitement <ArrowRight size={18} />
              </Link>
              <Link to="/auth" className="inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-7 py-3.5 text-base font-semibold text-ink-800 transition hover:bg-ink-50">
                <PlayCircle size={18} /> Voir la démo
              </Link>
            </div>
            <p className="mt-5 text-xs text-ink-500">Rien à installer · Sans carte bancaire · 30 jours gratuits</p>
          </div>
        </section>

        {/* ───────── Agentic Enterprise / product cloud grid ───────── */}
        <section id="products" className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">Bienvenue dans l’Entreprise Agentique</h2>
            <p className="mt-3 text-lg text-ink-600">Là où les humains, les agents et les plateformes conduisent ensemble la réussite client.</p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cloudProducts.map((p) => (
              <div key={p.name} className="group flex gap-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-600/5">
                <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition group-hover:bg-primary-600 group-hover:text-white">
                  <p.icon size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-ink-900">{p.name}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-ink-600">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-14 max-w-4xl rounded-2xl bg-primary-50 p-8 text-center md:p-12">
            <p className="text-lg leading-8 text-ink-700">
              Les humains et les <Link to="/auth" className="font-semibold text-primary-700 underline-offset-2 hover:underline">agents</Link> travaillent au cœur des systèmes qui font tourner votre entreprise. Résultat : des décisions plus rapides, des relations client plus fortes et une croissance continue.
            </p>
          </div>
        </section>

        {/* ───────── Customer trust / testimonials ───────── */}
        <section className="bg-ink-50 py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 md:px-10">
            <h2 className="text-center text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">Découvrez pourquoi les clients nous font confiance</h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                { name: 'Amina Mwangi', role: 'Directrice Commerciale · Sahara Logistics', quote: 'Atlas CRM a transformé notre pipeline. L’IA qualifie nos leads la nuit et nos équipes ferment 30% plus vite.' },
                { name: 'Karim Ouedraogo', role: 'CTO · Medina Bank', quote: 'La vue 360° client nous a fait gagner un temps fou. Nos conseillers ont toutes les infos en un coup d’œil.' },
                { name: 'Reina Diallo', role: 'VP Service Client · Nile Retail', quote: 'Les agents IA gèrent 66% de nos tickets en autonomie. Notre satisfaction client n’a jamais été aussi haute.' },
              ].map((t) => (
                <div key={t.name} className="rounded-2xl border border-ink-100 bg-white p-7 shadow-sm">
                  <div className="flex items-center gap-1 text-warning-400">
                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                  </div>
                  <blockquote className="mt-4 text-base leading-7 text-ink-700">« {t.quote} »</blockquote>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">{t.name.split(' ').map((n) => n[0]).join('')}</div>
                    <div>
                      <p className="text-sm font-semibold text-ink-900">{t.name}</p>
                      <p className="text-xs text-ink-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── Built-in AI / Starter Suite ───────── */}
        <section id="pricing" className="relative overflow-hidden bg-primary-700 py-20 text-white lg:py-24">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="relative mx-auto max-w-7xl px-6 md:px-10">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Une IA intégrée pour chaque partie de votre entreprise</h2>
                <p className="mt-4 text-lg leading-8 text-primary-100">
                  Mettez l’IA au travail sur les ventes, le service et le marketing avec <strong className="text-white">Starter Suite</strong> — un CRM qui connaît votre métier et automatise des expériences client dont vous serez fier. Démarrez simplement avec une configuration rapide et des agents pré-construits.
                </p>
                <p className="mt-4 text-sm text-primary-200"><em>25 $ USD/utilisateur/mois.</em> <a href="#matrix" className="font-semibold text-white underline-offset-2 hover:underline">Voir tous les tarifs</a></p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link to="/auth" className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-primary-700 transition hover:bg-primary-50">
                    Commencer gratuitement <ArrowRight size={16} />
                  </Link>
                  <Link to="/auth" className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                    <PlayCircle size={16} /> Voir la démo
                  </Link>
                </div>
              </div>
              <div className="rounded-2xl bg-white/10 p-8 backdrop-blur-sm">
                <div className="grid gap-4">
                  {[['Conversations gérées par Agentforce', '4M+'], ['Résolution autonome des cas', '66%'], ['Pipeline marketing supplémentaire', '+15%'], ['Conversion de leads', '1,8x']].map(([l, v]) => (
                    <div key={l} className="flex items-center justify-between rounded-xl bg-white/10 px-5 py-4">
                      <span className="text-sm text-primary-100">{l}</span>
                      <span className="text-2xl font-bold text-white">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ───────── Platform / architecture ───────── */}
        <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">Atlas CRM est la plateforme</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-primary-600 sm:text-4xl">pour l’Entreprise Agentique</p>
            <p className="mt-5 text-lg text-ink-600">Notre plateforme profondément unifiée réunit applications, données, agents et métadonnées pour la réussite client et employé. Avec la confiance et la gouvernance intégrées, votre IA et votre entreprise passent à l’échelle de façon sécurisée et fiable.</p>
            <Link to="/auth" className="mt-7 inline-flex items-center gap-2 rounded-lg bg-ink-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-ink-800">
              Voir tous les produits <ArrowRight size={16} />
            </Link>
          </div>
          {/* Layered architecture diagram */}
          <div className="mx-auto mt-14 max-w-3xl space-y-3">
            {[
              { label: 'Agentforce', desc: 'IA agentique au-dessus de tout', color: 'bg-primary-600 text-white' },
              { label: 'Produits (Ventes, Service, Marketing, Commerce)', desc: 'Bâtis sur la donnée et la confiance', color: 'bg-primary-100 text-primary-800' },
              { label: 'Data 360', desc: 'Fondation de données gouvernée et unifiée', color: 'bg-primary-50 text-primary-800' },
              { label: 'Plateforme Atlas', desc: 'Workflows, IA, sécurité & métadonnées', color: 'bg-ink-100 text-ink-700' },
            ].map((layer) => (
              <div key={layer.label} className={`rounded-xl px-6 py-4 ${layer.color}`}>
                <p className="font-bold">{layer.label}</p>
                <p className="text-sm opacity-80">{layer.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ───────── Industries ───────── */}
        <section id="industries" className="bg-ink-50 py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 md:px-10">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">Démarrez plus vite avec 16+ solutions, conçues pour votre industrie</h2>
              <p className="mt-4 text-ink-600">Conçues avec une expertise métier, ces solutions prêtes à l’emploi s’alignent sur vos workflows, données et besoins client.</p>
            </div>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {industries.map((ind) => (
                <div key={ind.name} className="group rounded-2xl border border-ink-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition group-hover:bg-primary-600 group-hover:text-white">
                    <ind.icon size={20} />
                  </div>
                  <h3 className="mt-4 font-bold text-ink-900">{ind.name}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-ink-600">{ind.desc}</p>
                  <a href="#" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:underline">
                    En savoir plus <ArrowRight size={14} />
                  </a>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <a href="#" className="inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-6 py-3 text-sm font-semibold text-ink-800 transition hover:bg-ink-100">
                Voir toutes les industries <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </section>

        {/* ───────── Analyst reports ───────── */}
        <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">Pourquoi les analystes s’accordent : Atlas CRM doit être votre partenaire IA agentique</h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {reports.map((r) => (
              <div key={r.title} className="flex flex-col rounded-2xl border border-ink-100 bg-white p-7 shadow-sm">
                <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700 self-start">{r.tag}</span>
                <h3 className="mt-4 flex-1 text-lg font-bold leading-7 text-ink-900">{r.title}</h3>
                <a href="#" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:underline">{r.cta} <ArrowRight size={14} /></a>
              </div>
            ))}
          </div>
        </section>

        {/* ───────── Pricing + comparison matrix ───────── */}
        <section className="bg-ink-50 py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 md:px-10">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">Une tarification claire et transparente</h2>
              <p className="mt-4 text-ink-600">Choisissez le plan adapté à votre croissance. Engagement annuel et 2 mois offerts.</p>
            </div>
            <div className="mt-8 flex items-center justify-center gap-4">
              <span className={`text-sm font-medium ${!annual ? 'text-ink-900' : 'text-ink-400'}`}>Mensuel</span>
              <button onClick={() => setAnnual(!annual)} className={`relative h-7 w-12 rounded-full transition ${annual ? 'bg-primary-600' : 'bg-ink-300'}`} aria-label="Basculer la facturation">
                <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${annual ? 'left-6' : 'left-1'}`} />
              </button>
              <span className={`text-sm font-medium ${annual ? 'text-ink-900' : 'text-ink-400'}`}>Annuel <span className="ml-1 rounded-full bg-success-100 px-2 py-0.5 text-xs font-semibold text-success-700">-17%</span></span>
            </div>
            <div className="mt-12 grid gap-6 lg:grid-cols-4">
              {plans.map((plan) => (
                <div key={plan.name} className={`relative flex flex-col rounded-2xl border p-7 transition ${plan.popular ? 'border-primary-600 bg-white shadow-2xl shadow-primary-600/10 lg:-translate-y-3' : 'border-ink-100 bg-white shadow-sm hover:shadow-lg'}`}>
                  {plan.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow">{plan.tagline}</span>}
                  <h3 className="text-lg font-bold text-ink-900">{plan.name}</h3>
                  {!plan.popular && <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-primary-600">{plan.tagline}</p>}
                  <p className="mt-3 min-h-[2.5rem] text-sm leading-6 text-ink-600">{plan.desc}</p>
                  <div className="mt-5">
                    <p className="text-3xl font-bold text-ink-950">{price(plan.monthly)}</p>
                    {plan.monthly !== null && <p className="mt-1 text-xs text-ink-400">{annual ? 'Facturé annuellement' : 'par utilisateur'}</p>}
                  </div>
                  <Link to="/auth" className={`mt-7 inline-flex w-full items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition ${plan.popular ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-ink-950 text-white hover:bg-ink-800'}`}>{plan.cta}</Link>
                </div>
              ))}
            </div>

            {/* Comparison matrix */}
            <div id="matrix" className="mt-16">
              <h3 className="text-center text-2xl font-bold text-ink-950">Comparatif détaillé des forfaits</h3>
              <div className="mt-8 overflow-x-auto rounded-2xl border border-ink-100 bg-white shadow-sm">
                <table className="w-full min-w-[640px] border-collapse text-sm">
                  <thead>
                    <tr className="bg-ink-50">
                      <th className="sticky left-0 bg-ink-50 px-6 py-4 text-left font-semibold text-ink-700">Fonctionnalité</th>
                      {plans.map((p) => (
                        <th key={p.name} className={`px-6 py-4 text-center font-semibold ${p.popular ? 'text-primary-700' : 'text-ink-700'}`}>
                          {p.name}
                          {p.popular && <span className="block text-[10px] font-bold uppercase text-primary-500">Populaire</span>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matrixGroups.map((group) => (
                      <Fragment key={group.group}>
                        <tr className="bg-primary-50/50">
                          <td colSpan={5} className="px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-primary-700">{group.group}</td>
                        </tr>
                        {group.rows.map((row) => (
                          <tr key={row.label} className="border-t border-ink-100 hover:bg-ink-50/50">
                            <td className="px-6 py-3.5 text-left text-ink-700">{row.label}</td>
                            {row.values.map((v, i) => (
                              <td key={i} className="px-6 py-3.5 text-center"><Check value={v} /></td>
                            ))}
                          </tr>
                        ))}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* ───────── Values ───────── */}
        <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">Nous croyons que l’entreprise est la plus grande plateforme de changement</h2>
              <p className="mt-4 text-ink-600">Fondés sur la confiance, la réussite client, l’innovation, l’égalité et la durabilité, nous nous engageons à bien faire en affaires et à faire le bien dans le monde — en investissant 1% de notre équité, technologie et temps pour créer un changement durable.</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a href="#" className="inline-flex items-center gap-2 rounded-lg bg-ink-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-ink-800">Voir ce qui nous anime <ArrowRight size={16} /></a>
                <a href="#" className="inline-flex items-center gap-2 rounded-lg border border-ink-200 px-6 py-3 text-sm font-semibold text-ink-800 transition hover:bg-ink-50">Prendre l’engagement</a>
              </div>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: ShieldCheck, t: 'Confiance', d: 'Sécurité et gouvernance au cœur de tout.' },
                { icon: TrendingUp, t: 'Réussite client', d: 'La croissance de nos clients drive la nôtre.' },
                { icon: Zap, t: 'Innovation', d: 'L’IA agentique au service de tous.' },
                { icon: Globe2, t: 'Durabilité', d: 'Investir 1% pour un changement durable.' },
              ].map((v) => (
                <li key={v.t} className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600"><v.icon size={18} /></div>
                  <p className="mt-3 font-bold text-ink-900">{v.t}</p>
                  <p className="mt-1 text-sm text-ink-500">{v.d}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ───────── Final CTA ───────── */}
        <section className="bg-primary-700 py-20 text-white">
          <div className="mx-auto max-w-3xl px-6 text-center md:px-10">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Commencez dès aujourd’hui</h2>
            <p className="mt-4 text-lg text-primary-100">Rien à installer. Sans carte bancaire. 30 jours gratuits.</p>
            <Link to="/auth" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-base font-semibold text-primary-700 shadow-lg transition hover:bg-primary-50">
              Essayer gratuitement <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        {/* ───────── FAQ ───────── */}
        <section id="faq" className="mx-auto max-w-3xl px-6 py-20 md:px-10 lg:py-24">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">Questions fréquentes</h2>
          </div>
          <div className="mt-10 space-y-4">
            {faqs.map((f) => (
              <details key={f.q} className="group rounded-xl border border-ink-100 bg-white p-5 open:shadow-sm">
                <summary className="flex cursor-pointer items-center justify-between font-semibold text-ink-900">
                  {f.q}
                  <span className="text-primary-600 transition group-open:rotate-45"><ArrowRight size={18} /></span>
                </summary>
                <p className="mt-3 text-sm leading-6 text-ink-600">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      {/* ───────── Footer ───────── */}
      <footer className="border-t border-ink-100 bg-ink-950 text-ink-300">
        <div className="mx-auto max-w-7xl px-6 py-14 md:px-10">
          <div className="grid gap-10 md:grid-cols-5">
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white"><Sparkles size={18} /></div>
                <span className="text-lg font-bold text-white">Atlas CRM</span>
              </Link>
              <p className="mt-4 text-sm leading-6 text-ink-400">La plateforme CRM agentique n°1. Ventes, service, marketing et IA réunis sur un seul cloud — pour Dubai, l’Afrique et le monde.</p>
            </div>
            {[
              { h: 'Produit', links: ['Sales Cloud', 'Service Cloud', 'Agentforce', 'Data 360', 'Tableau'] },
              { h: 'Ressources', links: ['Tarifs', 'Documentation', 'Statut', 'Communauté', 'Blog'] },
              { h: 'Entreprise', links: ['À propos', 'Sécurité', 'Contact', 'Carrières', 'Pledge 1%'] },
            ].map((col) => (
              <div key={col.h}>
                <p className="text-sm font-bold text-white">{col.h}</p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l}><a href="#" className="text-sm text-ink-400 transition hover:text-white">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-ink-800 pt-6 sm:flex-row">
            <p className="text-xs text-ink-500">© {new Date().getFullYear()} Atlas CRM · LiAfrik Dubai & Afrique. Tous droits réservés.</p>
            <div className="flex gap-5 text-xs text-ink-500">
              <a href="#" className="hover:text-white">Confidentialité</a>
              <a href="#" className="hover:text-white">Conditions</a>
              <a href="#" className="hover:text-white">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
