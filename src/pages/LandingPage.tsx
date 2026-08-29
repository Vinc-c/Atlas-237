import { useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, TrendingUp, Bot, BarChart3,
  CheckCircle2, X, ArrowRight, Cloud, Globe2, Zap, Star,
  MessageSquare, Database, Workflow, PlayCircle, Building2, Globe,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';
import { useScrollReveal } from '@/lib/useScrollReveal';

const cloudProducts = [
  { icon: MessageSquare, name: { fr: 'Slack', en: 'Slack' }, desc: { fr: 'Connectez workflows et données conversationnelles là où le travail se fait.', en: 'Connect workflows and conversational data where work happens.' } },
  { icon: BarChart3, name: { fr: 'Atlas Dashboards', en: 'Atlas Dashboards' }, desc: { fr: 'Transformez l’analytique agentique en intelligence actionable.', en: 'Turn agentic analytics into actionable intelligence.' } },
  { icon: Bot, name: { fr: 'Atlas AI Workforce', en: 'Atlas AI Workforce' }, desc: { fr: 'Créez des expériences agentiques de confiance qui agissent avec intention.', en: 'Build trusted agentic experiences that act with intention.' } },
  { icon: Cloud, name: { fr: 'Atlas 360', en: 'Atlas 360' }, desc: { fr: 'Ancrez chaque décision dans un contexte métier éprouvé.', en: 'Anchor every decision in proven business context.' } },
  { icon: Database, name: { fr: 'Atlas Data Hub', en: 'Atlas Data Hub' }, desc: { fr: 'Une fondation de données gouvernée, unifiée et fiable.', en: 'A governed, unified, and trusted data foundation.' } },
];

const industries = [
  { icon: Building2, name: { fr: 'Services financiers', en: 'Financial Services' }, desc: { fr: 'Connectez-vous proactivement aux clients pour des expériences IA à forte valeur.', en: 'Proactively connect with clients for high-value AI experiences.' } },
  { icon: TrendingUp, name: { fr: 'Retail', en: 'Retail' }, desc: { fr: 'Acquérez des clients rentables plus vite avec des données unifiées en temps réel.', en: 'Acquire profitable customers faster with unified real-time data.' } },
  { icon: ShieldCheck, name: { fr: 'Santé & Sciences de la vie', en: 'Health & Life Sciences' }, desc: { fr: 'Élevez vos équipes avec des agents IA pour des communautés plus saines.', en: 'Empower your teams with AI agents for healthier communities.' } },
  { icon: Building2, name: { fr: 'Construction & Immobilier', en: 'Construction & Real Estate' }, desc: { fr: 'Fluidifiez vos processus et atteignez l’excellence opérationnelle.', en: 'Streamline your processes and reach operational excellence.' } },
  { icon: Bot, name: { fr: 'Éducation', en: 'Education' }, desc: { fr: 'Boostez la productivité et le support étudiant 24/7 avec une IA dédiée.', en: 'Boost productivity and 24/7 student support with dedicated AI.' } },
  { icon: Workflow, name: { fr: 'Services pro', en: 'Professional Services' }, desc: { fr: 'Renforcez la confiance client, recrutez les bons talents et bâtissez la culture.', en: 'Strengthen client trust, hire the right talent, and build culture.' } },
  { icon: Cloud, name: { fr: 'Technologie', en: 'Technology' }, desc: { fr: 'Automatisez les workflows, unifiez les données et prospérez avec une IA fiable.', en: 'Automate workflows, unify data, and thrive with trusted AI.' } },
  { icon: Workflow, name: { fr: 'Industrie', en: 'Manufacturing' }, desc: { fr: 'Intégrez toutes vos données sur une chaîne de valeur unifiée.', en: 'Integrate all your data on a unified value chain.' } },
];

const reports = [
  { tag: { fr: 'Guide', en: 'Guide' }, title: { fr: 'Comment l’IA agentique change la manière de vendre en 2026', en: 'How agentic AI is changing the way teams sell in 2026' }, cta: { fr: 'Lire le guide', en: 'Read the guide' } },
  { tag: { fr: 'Étude de cas', en: 'Case study' }, title: { fr: 'Comment Sahara Logistics a fermé 30% de deals en plus avec Atlas CRM', en: 'How Sahara Logistics closed 30% more deals with Atlas CRM' }, cta: { fr: 'Lire l’étude de cas', en: 'Read the case study' } },
  { tag: { fr: 'Product tour', en: 'Product tour' }, title: { fr: 'Découvrez les agents IA d’Atlas CRM en action', en: 'See Atlas CRM’s AI agents in action' }, cta: { fr: 'Voir la démo', en: 'Watch the demo' } },
];

const plans = [
  { name: 'Starter', monthly: 19, tagline: { fr: 'Pour démarrer', en: 'To get started' }, desc: { fr: 'Ventes, service et marketing avec des agents pré-construits.', en: 'Sales, service and marketing with pre-built agents.' }, cta: { fr: 'Commencer', en: 'Get started' }, popular: false },
  { name: 'Growth', monthly: 49, tagline: { fr: 'Le plus populaire', en: 'Most popular' }, desc: { fr: 'Automatisation, campagnes et croissance commerciale.', en: 'Automation, campaigns and business growth.' }, cta: { fr: 'Choisir Growth', en: 'Choose Growth' }, popular: true },
  { name: 'Pro', monthly: 119, tagline: { fr: 'Haute performance', en: 'High performance' }, desc: { fr: 'Analyses IA, support prioritaire et workflows avancés.', en: 'AI analytics, priority support and advanced workflows.' }, cta: { fr: 'Choisir Pro', en: 'Choose Pro' }, popular: false },
  { name: 'Enterprise', monthly: 219, tagline: { fr: 'Le plus complet', en: 'Most complete' }, desc: { fr: 'Solution dédiée, API illimitée et accompagnement.', en: 'Dedicated solution, unlimited API and support.' }, cta: { fr: 'Choisir Enterprise', en: 'Choose Enterprise' }, popular: false },
];

type Row = { label: { fr: string; en: string }; values: (boolean | string)[] };

const faqs = [
  { q: 'Qu’est-ce qu’Atlas CRM ?', qEn: 'What is Atlas CRM?', a: 'Atlas CRM est la plateforme de gestion de la relation client n°1 propulsée par l’IA agentique. Elle réunit entreprises et clients via un ensemble unifié d’applications — alimentées par l’IA agentique et la donnée — qui aident chaque département (ventes, service, marketing, commerce, IT) à travailler comme un seul.', aEn: 'Atlas CRM is the #1 customer relationship management platform powered by agentic AI. It brings together companies and customers through a unified suite of applications — powered by agentic AI and data — that helps every department (sales, service, marketing, commerce, IT) work as one.' },
  { q: 'Qu’est-ce qu’un CRM et pourquoi en ai-je besoin ?', qEn: 'What is a CRM and why do I need one?', a: 'Un CRM gère toutes les relations et interactions de votre entreprise avec ses clients. Il vous aide à organiser les contacts, automatiser les tâches (logs d’appels, relances) et analyser les données pour comprendre le comportement client — vous donnant une vue à 360° de chaque client.', aEn: 'A CRM manages all your company’s relationships and interactions with customers. It helps you organize contacts, automate tasks (call logs, follow-ups), and analyze data to understand customer behavior — giving you a 360° view of every customer.' },
  { q: 'Qu’est-ce que l’IA agentique et comment l’utilise Atlas CRM ?', qEn: 'What is agentic AI and how does Atlas CRM use it?', a: 'L’IA agentique désigne des systèmes d’IA capables d’agir de manière autonome pour atteindre un objectif. Dans Atlas CRM (via Atlas AI Workforce), elle automatise des workflows complexes (qualification de leads, résolution de tickets), prédit les résultats et personnalise chaque interaction client.', aEn: 'Agentic AI refers to AI systems capable of acting autonomously to achieve a goal. In Atlas CRM (via Atlas AI Workforce), it automates complex workflows (lead qualification, ticket resolution), predicts outcomes, and personalizes every customer interaction.' },
  { q: 'Comment Atlas CRM aide-t-il ma PME à grandir ?', qEn: 'How does Atlas CRM help my SMB grow?', a: 'Atlas CRM propose des solutions adaptées à toutes les tailles. La plateforme flexible vous permet de démarrer avec l’essentiel (ventes, service, marketing) puis d’ajouter des fonctions à mesure que vous grandissez — vous ne payez que ce que vous utilisez.', aEn: 'Atlas CRM offers solutions for all sizes. The flexible platform lets you start with the essentials (sales, service, marketing) and add capabilities as you grow — you only pay for what you use.' },
];

function Check({ value }: { value: boolean | string }) {
  if (value === true) return <CheckCircle2 size={18} className="mx-auto text-primary-600" />;
  if (value === false) return <X size={16} className="mx-auto text-ink-300" />;
  return <span className="text-sm font-semibold text-ink-900">{value}</span>;
}

export function LandingPage() {
  const { language, setLanguage } = useAuth();
  const lang = language;
  // La page d'accueil n'a de copy qu'en fr/en ; on retombe sur 'en' pour les autres langues
  // pour éviter un contenu vide si le profil utilisateur est en es/pt/ar.
  const contentLang: 'fr' | 'en' = lang === 'fr' ? 'fr' : 'en';
  // Pricing is a flat monthly amount per organization, charged the same
  // way every time by every PSP (Flutterwave/Paystack/PayUnit — see
  // src/lib/plans.ts PLAN_PRICES and each PSP's checkout code). There is
  // no annual billing option anywhere in the real checkout flow
  // (PayUnit's edge function even hardcodes billing_cycle: "monthly"), so
  // this page must never advertise one — an "Annual, -17%" toggle used to
  // sit here showing a discounted yearly price purely for display, with
  // zero connection to what a customer would actually be charged after
  // signing up. Don't reintroduce an annual price display without first
  // building real annual billing all the way through checkout.
  useScrollReveal();
  const price = (m: number | null) => (m === null ? (lang === 'fr' ? 'Sur devis' : 'Custom') : `$${m}/${lang === 'fr' ? 'mois' : 'mo'}`);

  const matrixGroups: { group: { fr: string; en: string }; rows: Row[] }[] = [
    {
      group: { fr: 'Ventes & CRM', en: 'Sales & CRM' },
      rows: [
        { label: { fr: 'Contacts illimités', en: 'Unlimited contacts' }, values: [true, true, true, true] },
        { label: { fr: 'Pipelines de ventes', en: 'Sales pipelines' }, values: [true, true, true, true] },
        { label: { fr: 'Devis & facturation', en: 'Quotes & invoicing' }, values: [false, true, true, true] },
        { label: { fr: 'Utilisateurs inclus', en: 'Included users' }, values: ['3', '10', '25', lang === 'fr' ? 'Illimité' : 'Unlimited'] },
      ],
    },
    {
      group: { fr: 'Automatisation & IA', en: 'Automation & AI' },
      rows: [
        { label: { fr: 'Agents IA pré-construits' , en: 'Pre-built AI agents' }, values: [true, true, true, true] },
        { label: { fr: 'Automations / workflows', en: 'Automations / workflows' }, values: [false, true, true, true] },
        { label: { fr: 'Analyses prédictives', en: 'Predictive analytics' }, values: [false, false, true, true] },
        { label: { fr: 'Workflows personnalisés', en: 'Custom workflows' }, values: [false, false, true, true] },
      ],
    },
    {
      group: { fr: 'Service & Support', en: 'Service & Support' },
      rows: [
        { label: { fr: 'Tickets clients', en: 'Customer tickets' }, values: [false, true, true, true] },
        { label: { fr: 'Base de connaissances', en: 'Knowledge base' }, values: [false, false, true, true] },
        { label: { fr: 'SLA & escalade', en: 'SLA & escalation' }, values: [false, false, true, true] },
      ],
    },
    {
      group: { fr: 'Sécurité & Administration', en: 'Security & Administration' },
      rows: [
        { label: { fr: 'SSO / SAML', en: 'SSO / SAML' }, values: [false, false, true, true] },
        { label: { fr: 'Journal d\'audit', en: 'Audit log' }, values: [false, true, true, true] },
        { label: { fr: 'Support dédié', en: 'Dedicated support' }, values: ['Email', lang === 'fr' ? 'Prioritaire' : 'Priority', '24/7', lang === 'fr' ? 'Délégué' : 'Dedicated'] },
      ],
    },
  ];

  return (
    <div className="bg-white text-ink-900">
      {/* ───────── Header ───────── */}
      <header className="sticky top-0 z-50 border-b border-ink-100 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5 md:px-10">
          <Link to="/" className="flex items-center gap-2.5 animate-fade-in">
            <Logo size={36} />
            <span className="text-lg font-bold tracking-tight">Atlas CRM</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-ink-600 lg:flex">
            <a href="#products" className="hover:text-primary-700 transition">{lang === 'fr' ? 'Produits' : 'Products'}</a>
            <a href="#pricing" className="hover:text-primary-700 transition">{lang === 'fr' ? 'Tarifs' : 'Pricing'}</a>
            <a href="#industries" className="hover:text-primary-700 transition">{lang === 'fr' ? 'Industries' : 'Industries'}</a>
            <a href="#faq" className="hover:text-primary-700 transition">FAQ</a>
          </nav>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setLanguage(lang === 'fr' ? 'en' : 'fr')}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition hover:bg-ink-50"
              title={lang === 'fr' ? 'Switch to English' : 'Passer au français'}
            >
              <Globe size={16} />
              {lang === 'fr' ? 'EN' : 'FR'}
            </button>
            <Link to="/auth" className="hidden rounded-lg px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50 sm:inline-flex">
              {lang === 'fr' ? 'Se connecter' : 'Sign in'}
            </Link>
            <Link to="/auth" className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700">
              {lang === 'fr' ? 'Essai gratuit' : 'Free trial'}
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ───────── Hero ───────── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 via-white to-white">
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary-200/40 blur-3xl animate-pulse-slow" />
          <div className="absolute -left-24 top-40 h-80 w-80 rounded-full bg-accent-200/20 blur-3xl" />
          <div className="relative mx-auto max-w-4xl px-6 pt-20 pb-14 text-center md:px-10 lg:pt-28 lg:pb-16">
            <span className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white/80 px-4 py-1.5 text-xs font-semibold text-primary-700 shadow-sm backdrop-blur-sm">
              <Zap size={13} className="text-primary-600" /> {lang === 'fr' ? 'Propulsé par l’IA agentique' : 'Powered by agentic AI'}
            </span>
            <h1 className="animate-fade-in-up mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-ink-950 sm:text-6xl" style={{ animationDelay: '0.05s' }}>
              {lang === 'fr' ? <>Commencez avec le <span className="text-primary-600">CRM agentique n°1</span></> : <>Get started with the <span className="text-primary-600">#1 Agentic CRM</span></>}
            </h1>
            <p className="animate-fade-in-up mx-auto mt-6 max-w-2xl text-lg leading-8 text-ink-600" style={{ animationDelay: '0.1s' }}>
              {lang === 'fr'
                ? 'Là où les personnes, les agents, les applications et les données se rejoignent sur une plateforme intégrée et fiable, qui travaille au cœur des systèmes qui font tourner votre entreprise.'
                : 'Where people, agents, apps, and data come together on a unified, trusted platform that works at the heart of the systems running your business.'}
            </p>
            <div className="animate-fade-in-up mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row" style={{ animationDelay: '0.2s' }}>
              <Link to="/auth" className="group inline-flex items-center gap-2 rounded-lg bg-primary-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-600/20 transition hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-600/30">
                {lang === 'fr' ? 'Commencer gratuitement' : 'Start for free'} <ArrowRight size={18} className="transition group-hover:translate-x-1" />
              </Link>
              <Link to="/auth" className="inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-7 py-3.5 text-base font-semibold text-ink-800 transition hover:bg-ink-50 hover:border-ink-300">
                <PlayCircle size={18} /> {lang === 'fr' ? 'Voir la démo' : 'Watch demo'}
              </Link>
            </div>
            <p className="mt-5 text-xs text-ink-500">{lang === 'fr' ? 'Rien à installer · Sans carte bancaire · 14 jours gratuits' : 'Nothing to install · No credit card · 14-day free trial'}</p>
          </div>
          <div className="reveal relative border-t border-ink-100/80 bg-white/60 py-8 backdrop-blur-sm">
            <div className="mx-auto max-w-5xl px-6 md:px-10">
              <p className="text-center text-xs font-semibold uppercase tracking-wide text-ink-400">
                {lang === 'fr' ? 'La confiance de plus de 500 entreprises à Dubai, en Afrique et au-delà' : 'Trusted by 500+ businesses across Dubai, Africa, and beyond'}
              </p>
              <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
                {[
                  { v: '500+', l: { fr: 'Entreprises actives', en: 'Active companies' } },
                  { v: '2.4M+', l: { fr: 'Contacts gérés', en: 'Contacts managed' } },
                  { v: '99.9%', l: { fr: 'Disponibilité', en: 'Uptime' } },
                  { v: '4.9/5', l: { fr: 'Satisfaction client', en: 'Customer rating' } },
                ].map((stat) => (
                  <div key={stat.v} className="text-center">
                    <p className="text-2xl font-bold text-ink-950 sm:text-3xl">{stat.v}</p>
                    <p className="mt-1 text-xs text-ink-500">{stat.l[contentLang]}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ───────── Agentic Enterprise / product cloud grid ───────── */}
        <section id="products" className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:py-24">
          <div className="mx-auto max-w-2xl text-center reveal">
            <h2 className="text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">{lang === 'fr' ? 'Bienvenue dans l’Entreprise Agentique' : 'Welcome to the Agentic Enterprise'}</h2>
            <p className="mt-3 text-lg text-ink-600">{lang === 'fr' ? 'Là où les humains, les agents et les plateformes conduisent ensemble la réussite client.' : 'Where humans, agents, and platforms drive customer success together.'}</p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cloudProducts.map((p) => (
              <div key={p.name[contentLang]} className="group reveal flex gap-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-600/5">
                <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition group-hover:scale-110 group-hover:bg-primary-600 group-hover:text-white">
                  <p.icon size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-ink-900">{p.name[contentLang]}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-ink-600">{p.desc[contentLang]}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="reveal mx-auto mt-14 max-w-4xl rounded-2xl bg-primary-50 p-8 text-center md:p-12">
            <p className="text-lg leading-8 text-ink-700">
              {lang === 'fr'
                ? <>Les humains et les <Link to="/auth" className="font-semibold text-primary-700 underline-offset-2 hover:underline">agents</Link> travaillent au cœur des systèmes qui font tourner votre entreprise. Résultat : des décisions plus rapides, des relations client plus fortes et une croissance continue.</>
                : <>Humans and <Link to="/auth" className="font-semibold text-primary-700 underline-offset-2 hover:underline">agents</Link> work at the heart of the systems running your business. The result: faster decisions, stronger customer relationships, and continuous growth.</>}
            </p>
          </div>
        </section>

        {/* ───────── Customer trust / testimonials ───────── */}
        <section className="bg-ink-50 py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 md:px-10">
            <h2 className="reveal text-center text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">{lang === 'fr' ? 'Découvrez pourquoi les clients nous font confiance' : 'Discover why customers trust us'}</h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                { name: 'Amina Mwangi', role: lang === 'fr' ? 'Directrice Commerciale · Sahara Logistics' : 'Sales Director · Sahara Logistics', quote: lang === 'fr' ? 'Atlas CRM a transformé notre pipeline. L’IA qualifie nos leads la nuit et nos équipes ferment 30% plus vite.' : 'Atlas CRM transformed our pipeline. AI qualifies our leads overnight and our teams close 30% faster.' },
                { name: 'Karim Ouedraogo', role: 'CTO · Medina Bank', quote: lang === 'fr' ? 'La vue 360° client nous a fait gagner un temps fou. Nos conseillers ont toutes les infos en un coup d’œil.' : 'The 360° customer view saved us enormous time. Our advisors have all the info at a glance.' },
                { name: 'Reina Diallo', role: lang === 'fr' ? 'VP Service Client · Nile Retail' : 'VP Customer Service · Nile Retail', quote: lang === 'fr' ? 'Les agents IA gèrent 66% de nos tickets en autonomie. Notre satisfaction client n’a jamais été aussi haute.' : 'AI agents handle 66% of our tickets autonomously. Our customer satisfaction has never been higher.' },
              ].map((t) => (
                <div key={t.name} className="reveal rounded-2xl border border-ink-100 bg-white p-7 shadow-sm transition hover:shadow-lg">
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
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl animate-pulse-slow" />
          <div className="relative mx-auto max-w-7xl px-6 md:px-10">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="reveal">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{lang === 'fr' ? 'Une IA intégrée pour chaque partie de votre entreprise' : 'Built-in AI for every part of your business'}</h2>
                <p className="mt-4 text-lg leading-8 text-primary-100">
                  {lang === 'fr'
                    ? <>Mettez l’IA au travail sur les ventes, le service et le marketing avec <strong className="text-white">Starter Suite</strong> — un CRM qui connaît votre métier et automatise des expériences client dont vous serez fier. Démarrez simplement avec une configuration rapide et des agents pré-construits.</>
                    : <>Put AI to work across sales, service, and marketing with <strong className="text-white">Starter Suite</strong> — a CRM that knows your business and automates customer experiences you’ll be proud of. Get started fast with quick setup and pre-built agents.</>}
                </p>
                <p className="mt-4 text-sm text-primary-200"><em>{lang === 'fr' ? '19 $ USD/mois.' : '$19 USD/month.'}</em> <a href="#matrix" className="font-semibold text-white underline-offset-2 hover:underline">{lang === 'fr' ? 'Voir tous les tarifs' : 'See all pricing'}</a></p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link to="/auth" className="group inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-primary-700 transition hover:bg-primary-50">
                    {lang === 'fr' ? 'Commencer gratuitement' : 'Start for free'} <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                  </Link>
                  <Link to="/auth" className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                    <PlayCircle size={16} /> {lang === 'fr' ? 'Voir la démo' : 'Watch demo'}
                  </Link>
                </div>
              </div>
              <div className="reveal rounded-2xl bg-white/10 p-8 backdrop-blur-sm">
                <div className="grid gap-4">
                  {[
                    [lang === 'fr' ? 'Conversations gérées par l’IA' : 'AI-handled conversations', '4M+'],
                    [lang === 'fr' ? 'Résolution autonome des cas' : 'Autonomous case resolution', '66%'],
                    [lang === 'fr' ? 'Pipeline marketing supplémentaire' : 'Additional marketing pipeline', '+15%'],
                    [lang === 'fr' ? 'Conversion de leads' : 'Lead conversion', '1.8x'],
                  ].map(([l, v]) => (
                    <div key={l} className="flex items-center justify-between rounded-xl bg-white/10 px-5 py-4 transition hover:bg-white/20">
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
          <div className="reveal mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">{lang === 'fr' ? 'Atlas CRM est la plateforme' : 'Atlas CRM is the platform'}</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-primary-600 sm:text-4xl">{lang === 'fr' ? 'pour l’Entreprise Agentique' : 'for the Agentic Enterprise'}</p>
            <p className="mt-5 text-lg text-ink-600">{lang === 'fr' ? 'Notre plateforme profondément unifiée réunit applications, données, agents et métadonnées pour la réussite client et employé. Avec la confiance et la gouvernance intégrées, votre IA et votre entreprise passent à l’échelle de façon sécurisée et fiable.' : 'Our deeply unified platform brings together apps, data, agents, and metadata for customer and employee success. With trust and governance built in, your AI and your business scale securely and reliably.'}</p>
            <Link to="/auth" className="group mt-7 inline-flex items-center gap-2 rounded-lg bg-ink-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-ink-800">
              {lang === 'fr' ? 'Voir tous les produits' : 'See all products'} <ArrowRight size={16} className="transition group-hover:translate-x-1" />
            </Link>
          </div>
          {/* Layered architecture diagram */}
          <div className="reveal mx-auto mt-14 max-w-3xl space-y-3">
            {[
              { label: lang === 'fr' ? 'Atlas AI Workforce' : 'Atlas AI Workforce', desc: lang === 'fr' ? 'IA agentique au-dessus de tout' : 'Agentic AI on top of everything', color: 'bg-primary-600 text-white' },
              { label: lang === 'fr' ? 'Produits (Ventes, Service, Marketing, Commerce)' : 'Products (Sales, Service, Marketing, Commerce)', desc: lang === 'fr' ? 'Bâtis sur la donnée et la confiance' : 'Built on data and trust', color: 'bg-primary-100 text-primary-800' },
              { label: lang === 'fr' ? 'Atlas Data Hub' : 'Atlas Data Hub', desc: lang === 'fr' ? 'Fondation de données gouvernée et unifiée' : 'Governed, unified data foundation', color: 'bg-primary-50 text-primary-800' },
              { label: lang === 'fr' ? 'Plateforme Atlas' : 'Atlas Platform', desc: lang === 'fr' ? 'Workflows, IA, sécurité & métadonnées' : 'Workflows, AI, security & metadata', color: 'bg-ink-100 text-ink-700' },
            ].map((layer) => (
              <div key={layer.label} className={`rounded-xl px-6 py-4 transition hover:scale-[1.02] ${layer.color}`}>
                <p className="font-bold">{layer.label}</p>
                <p className="text-sm opacity-80">{layer.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ───────── Industries ───────── */}
        <section id="industries" className="bg-ink-50 py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 md:px-10">
            <div className="reveal mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">{lang === 'fr' ? 'Démarrez plus vite avec 16+ solutions, conçues pour votre industrie' : 'Start faster with 16+ solutions, designed for your industry'}</h2>
              <p className="mt-4 text-ink-600">{lang === 'fr' ? 'Conçues avec une expertise métier, ces solutions prêtes à l’emploi s’alignent sur vos workflows, données et besoins client.' : 'Built with industry expertise, these ready-to-use solutions align with your workflows, data, and customer needs.'}</p>
            </div>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {industries.map((ind) => (
                <div key={ind.name[contentLang]} className="group reveal rounded-2xl border border-ink-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition group-hover:scale-110 group-hover:bg-primary-600 group-hover:text-white">
                    <ind.icon size={20} />
                  </div>
                  <h3 className="mt-4 font-bold text-ink-900">{ind.name[contentLang]}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-ink-600">{ind.desc[contentLang]}</p>
                  <Link to="/auth" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:underline">
                    {lang === 'fr' ? 'En savoir plus' : 'Learn more'} <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
            <div className="reveal mt-10 text-center">
              <Link to="/auth" className="inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-6 py-3 text-sm font-semibold text-ink-800 transition hover:bg-ink-100">
                {lang === 'fr' ? 'Voir toutes les industries' : 'See all industries'} <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* ───────── Resources ───────── */}
        <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:py-24">
          <div className="reveal mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">{lang === 'fr' ? 'Découvrez Atlas CRM en profondeur' : 'Go deeper with Atlas CRM'}</h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {reports.map((r) => (
              <div key={r.title[contentLang]} className="reveal flex flex-col rounded-2xl border border-ink-100 bg-white p-7 shadow-sm transition hover:shadow-lg">
                <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700 self-start">{r.tag[contentLang]}</span>
                <h3 className="mt-4 flex-1 text-lg font-bold leading-7 text-ink-900">{r.title[contentLang]}</h3>
                <Link to="/auth" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:underline">{r.cta[contentLang]} <ArrowRight size={14} /></Link>
              </div>
            ))}
          </div>
        </section>

        {/* ───────── Pricing + comparison matrix ───────── */}
        <section className="bg-ink-50 py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 md:px-10">
            <div className="reveal mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">{lang === 'fr' ? 'Une tarification claire et transparente' : 'Clear and transparent pricing'}</h2>
              <p className="mt-4 text-ink-600">{lang === 'fr' ? 'Choisissez le plan adapté à votre croissance.' : 'Choose the plan that fits your growth.'}</p>
            </div>
            <div className="mt-12 grid gap-6 lg:grid-cols-4">
              {plans.map((plan) => (
                <div key={plan.name} className={`reveal relative flex flex-col rounded-2xl border p-7 transition ${plan.popular ? 'border-primary-600 bg-white shadow-2xl shadow-primary-600/10 lg:-translate-y-3' : 'border-ink-100 bg-white shadow-sm hover:shadow-lg hover:border-ink-200'}`}>
                  {plan.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow">{plan.tagline[contentLang]}</span>}
                  <h3 className="text-lg font-bold text-ink-900">{plan.name}</h3>
                  {!plan.popular && <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-primary-600">{plan.tagline[contentLang]}</p>}
                  <p className="mt-3 min-h-[2.5rem] text-sm leading-6 text-ink-600">{plan.desc[contentLang]}</p>
                  <div className="mt-5">
                    <p className="text-3xl font-bold text-ink-950">{price(plan.monthly)}</p>
                    {plan.monthly !== null && <p className="mt-1 text-xs text-ink-400">{lang === 'fr' ? 'par organisation, facturation mensuelle' : 'per organization, billed monthly'}</p>}
                  </div>
                  <Link to="/auth" className={`mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition ${plan.popular ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-ink-950 text-white hover:bg-ink-800'}`}>{plan.cta[contentLang]} <ArrowRight size={14} /></Link>
                </div>
              ))}
            </div>

            {/* Comparison matrix */}
            <div id="matrix" className="reveal mt-16">
              <h3 className="text-center text-2xl font-bold text-ink-950">{lang === 'fr' ? 'Comparatif détaillé des forfaits' : 'Detailed plan comparison'}</h3>
              <div className="mt-8 overflow-x-auto rounded-2xl border border-ink-100 bg-white shadow-sm">
                <table className="w-full min-w-[640px] border-collapse text-sm">
                  <thead>
                    <tr className="bg-ink-50">
                      <th className="sticky left-0 bg-ink-50 px-6 py-4 text-left font-semibold text-ink-700">{lang === 'fr' ? 'Fonctionnalité' : 'Feature'}</th>
                      {plans.map((p) => (
                        <th key={p.name} className={`px-6 py-4 text-center font-semibold ${p.popular ? 'text-primary-700' : 'text-ink-700'}`}>
                          {p.name}
                          {p.popular && <span className="block text-[10px] font-bold uppercase text-primary-500">{lang === 'fr' ? 'Populaire' : 'Popular'}</span>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matrixGroups.map((group) => (
                      <Fragment key={group.group[contentLang]}>
                        <tr className="bg-primary-50/50">
                          <td colSpan={5} className="px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-primary-700">{group.group[contentLang]}</td>
                        </tr>
                        {group.rows.map((row) => (
                          <tr key={row.label[contentLang]} className="border-t border-ink-100 hover:bg-ink-50/50">
                            <td className="px-6 py-3.5 text-left text-ink-700">{row.label[contentLang]}</td>
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
            <div className="reveal">
              <h2 className="text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">{lang === 'fr' ? 'Nous croyons que l’entreprise est la plus grande plateforme de changement' : 'We believe business is the greatest platform for change'}</h2>
              <p className="mt-4 text-ink-600">{lang === 'fr' ? 'Fondés sur la confiance, la réussite client, l’innovation, l’égalité et la durabilité, nous nous engageons à bien faire en affaires et à faire le bien dans le monde — en investissant 1% de notre équité, technologie et temps pour créer un changement durable.' : 'Founded on trust, customer success, innovation, equality, and sustainability, we are committed to doing well in business and doing good in the world — investing 1% of our equity, technology, and time to create lasting change.'}</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link to="/legal/about" className="group inline-flex items-center gap-2 rounded-lg bg-ink-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-ink-800">{lang === 'fr' ? 'Voir ce qui nous anime' : 'See what drives us'} <ArrowRight size={16} className="transition group-hover:translate-x-1" /></Link>
                <Link to="/legal/pledge" className="inline-flex items-center gap-2 rounded-lg border border-ink-200 px-6 py-3 text-sm font-semibold text-ink-800 transition hover:bg-ink-50">{lang === 'fr' ? "Prendre l'engagement" : 'Take the pledge'}</Link>
              </div>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: ShieldCheck, t: lang === 'fr' ? 'Confiance' : 'Trust', d: lang === 'fr' ? 'Sécurité et gouvernance au cœur de tout.' : 'Security and governance at the core.' },
                { icon: TrendingUp, t: lang === 'fr' ? 'Réussite client' : 'Customer success', d: lang === 'fr' ? 'La croissance de nos clients drive la nôtre.' : 'Our customers’ growth drives ours.' },
                { icon: Zap, t: lang === 'fr' ? 'Innovation' : 'Innovation', d: lang === 'fr' ? 'L’IA agentique au service de tous.' : 'Agentic AI for everyone.' },
                { icon: Globe2, t: lang === 'fr' ? 'Durabilité' : 'Sustainability', d: lang === 'fr' ? 'Investir 1% pour un changement durable.' : 'Investing 1% for lasting change.' },
              ].map((v) => (
                <li key={v.t} className="reveal group rounded-2xl border border-ink-100 bg-white p-5 shadow-sm transition hover:shadow-lg">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600 transition group-hover:scale-110 group-hover:bg-primary-600 group-hover:text-white"><v.icon size={18} /></div>
                  <p className="mt-3 font-bold text-ink-900">{v.t}</p>
                  <p className="mt-1 text-sm text-ink-500">{v.d}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ───────── Final CTA ───────── */}
        <section className="bg-primary-700 py-20 text-white">
          <div className="reveal mx-auto max-w-3xl px-6 text-center md:px-10">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{lang === 'fr' ? 'Commencez dès aujourd’hui' : 'Get started today'}</h2>
            <p className="mt-4 text-lg text-primary-100">{lang === 'fr' ? 'Rien à installer. Sans carte bancaire. 14 jours gratuits.' : 'Nothing to install. No credit card. 14-day free trial.'}</p>
            <Link to="/auth" className="group mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-base font-semibold text-primary-700 shadow-lg transition hover:bg-primary-50">
              {lang === 'fr' ? 'Essayer gratuitement' : 'Try for free'} <ArrowRight size={18} className="transition group-hover:translate-x-1" />
            </Link>
          </div>
        </section>

        {/* ───────── FAQ ───────── */}
        <section id="faq" className="mx-auto max-w-3xl px-6 py-20 md:px-10 lg:py-24">
          <div className="reveal text-center">
            <h2 className="text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">{lang === 'fr' ? 'Questions fréquentes' : 'Frequently asked questions'}</h2>
          </div>
          <div className="mt-10 space-y-4">
            {faqs.map((f) => (
              <details key={f.q} className="group reveal rounded-xl border border-ink-100 bg-white p-5 open:shadow-sm">
                <summary className="flex cursor-pointer items-center justify-between font-semibold text-ink-900">
                  {lang === 'fr' ? f.q : f.qEn}
                  <span className="text-primary-600 transition group-open:rotate-45"><ArrowRight size={18} /></span>
                </summary>
                <p className="mt-3 text-sm leading-6 text-ink-600">{lang === 'fr' ? f.a : f.aEn}</p>
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
                <Logo size={36} />
                <span className="text-lg font-bold text-white">Atlas CRM</span>
              </Link>
              <p className="mt-4 text-sm leading-6 text-ink-400">{lang === 'fr' ? 'La plateforme CRM agentique n°1. Ventes, service, marketing et IA réunis sur un seul cloud — pour Dubai, l’Afrique et le monde.' : 'The #1 Agentic CRM platform. Sales, service, marketing, and AI united on a single cloud — for Dubai, Africa, and the world.'}</p>
            </div>
            {[
              { h: lang === 'fr' ? 'Produit' : 'Product', links: [
                { l: lang === 'fr' ? 'Atlas Sales' : 'Atlas Sales', to: '/legal/sales-cloud' },
                { l: lang === 'fr' ? 'Atlas Service' : 'Atlas Service', to: '/legal/service-cloud' },
                { l: lang === 'fr' ? 'Atlas AI Workforce' : 'Atlas AI Workforce', to: '/legal/agentforce' },
                { l: lang === 'fr' ? 'Atlas Data Hub' : 'Atlas Data Hub', to: '/legal/data-360' },
                { l: lang === 'fr' ? 'Atlas Dashboards' : 'Atlas Dashboards', to: '/legal/tableau' },
              ] },
              { h: lang === 'fr' ? 'Ressources' : 'Resources', links: [
                { l: lang === 'fr' ? 'Tarifs' : 'Pricing', to: '/legal/pricing' },
                { l: lang === 'fr' ? 'Documentation' : 'Documentation', to: '/legal/docs' },
                { l: 'Statut', to: '/legal/status' },
                { l: lang === 'fr' ? 'Communauté' : 'Community', to: '/legal/community' },
                { l: 'Blog', to: '/legal/blog' },
              ] },
              { h: lang === 'fr' ? 'Entreprise' : 'Company', links: [
                { l: lang === 'fr' ? 'À propos' : 'About', to: '/legal/about' },
                { l: lang === 'fr' ? 'Sécurité' : 'Security', to: '/legal/security' },
                { l: lang === 'fr' ? 'Contact' : 'Contact', to: '/legal/contact' },
                { l: lang === 'fr' ? 'Carrières' : 'Careers', to: '/legal/careers' },
                { l: 'Pledge 1%', to: '/legal/pledge' },
              ] },
            ].map((col) => (
              <div key={col.h}>
                <p className="text-sm font-bold text-white">{col.h}</p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.l}><Link to={link.to} className="text-sm text-ink-400 transition hover:text-white">{link.l}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-ink-800 pt-6 sm:flex-row">
            <p className="text-xs text-ink-500">© {new Date().getFullYear()} Atlas CRM · LiAfrik Dubai & {lang === 'fr' ? 'Afrique' : 'Africa'}. {lang === 'fr' ? 'Tous droits réservés.' : 'All rights reserved.'}</p>
            <div className="flex gap-5 text-xs text-ink-500">
              <Link to="/legal/privacy" className="hover:text-white transition">{lang === 'fr' ? 'Confidentialité' : 'Privacy'}</Link>
              <Link to="/legal/terms" className="hover:text-white transition">{lang === 'fr' ? 'Conditions' : 'Terms'}</Link>
              <Link to="/legal/cookies" className="hover:text-white transition">Cookies</Link>
              <Link to="/legal/gdpr" className="hover:text-white transition">RGPD / GDPR</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
