import { useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, ShieldCheck, TrendingUp, Headphones, Bot, BarChart3,
  CheckCircle2, X, ArrowRight, Cloud, Lock, Globe2, Zap, Star,
} from 'lucide-react';

const products = [
  { icon: TrendingUp, name: 'Sales Cloud', tag: 'Ventes', desc: 'Pipelines, opportunités et automatisation des relances pour fermer plus vite.' },
  { icon: Headphones, name: 'Service Cloud', tag: 'Support', desc: 'Tickets, base de connaissances et SLA unifiés en un seul hub client.' },
  { icon: Bot, name: 'Agentforce', tag: 'IA', desc: 'Agents IA autonomes qui qualify, répondent et exécutent 24/7.' },
  { icon: BarChart3, name: 'Data Cloud', tag: 'Analytics', desc: 'Tableaux de bord temps réel et insights prédictifs sur vos données.' },
  { icon: Cloud, name: 'Integration Cloud', tag: 'API', desc: 'Webhooks, marketplace et connecteurs vers vos outils existants.' },
  { icon: ShieldCheck, name: 'Trust', tag: 'Sécurité', desc: 'RLS, conformité multi-régions et permissions granulaires.' },
];

const stats = [
  { value: '150K+', label: 'Utilisateurs actifs' },
  { value: '99,9%', label: 'Disponibilité garantie' },
  { value: '40+', label: 'Intégrations natives' },
  { value: '5', label: 'Langues supportées' },
];

const logos = ['LiAfrik', 'Dubai Trade', 'Sahara Logistics', 'Medina Bank', 'Atlas Energy', 'Nile Retail'];

const plans = [
  {
    name: 'Starter', monthly: 19, tagline: 'Pour démarrer',
    desc: 'Petites équipes qui veulent structurer leurs ventes.',
    cta: 'Commencer',
  },
  {
    name: 'Growth', monthly: 69, tagline: 'Le plus populaire', popular: true,
    desc: 'Croissance commerciale avec automatisation et marketing.',
    cta: 'Choisir Growth',
  },
  {
    name: 'Pro', monthly: 169, tagline: 'Haute performance',
    desc: 'Analyses IA, support prioritaire et workflows avancés.',
    cta: 'Choisir Pro',
  },
  {
    name: 'Enterprise', monthly: null, tagline: 'Sur mesure',
    desc: 'Solution dédiée, API illimitée et accompagnement.',
    cta: 'Contacter les ventes',
  },
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
      { label: 'Automations / workflows', values: [false, true, true, true] },
      { label: 'Agents IA (Agentforce)', values: [false, false, true, true] },
      { label: 'Analyses prédictives', values: [false, false, true, true] },
      { label: 'Workflows personnalisés', values: [false, false, true, true] },
    ],
  },
  {
    group: 'Support & Service',
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
  { q: 'Puis-je changer de plan à tout moment ?', a: 'Oui. Vous pouvez monter ou descendre de plan à tout moment, le prorata est calculé automatiquement.' },
  { q: 'Y a-t-il un essai gratuit ?', a: 'Chaque plan payant démarre par un essai gratuit de 14 jours, sans carte bancaire requise.' },
  { q: 'Mes données sont-elles sécurisées ?', a: 'Atlas CRM applique un chiffrement au repos et en transit, un Row-Level Security par organisation et une conformité multi-régions (RGPD, CCPA).' },
  { q: 'Quelles langues sont supportées ?', a: 'L’interface est disponible en français, anglais, espagnol, portugais et arabe (RTL inclus).' },
];

function Check({ value }: { value: boolean | string }) {
  if (value === true) return <CheckCircle2 size={18} className="mx-auto text-success-600" />;
  if (value === false) return <X size={16} className="mx-auto text-ink-300" />;
  return <span className="text-sm font-semibold text-ink-900">{value}</span>;
}

export function LandingPage() {
  const [annual, setAnnual] = useState(true);
  const price = (m: number | null) => (m === null ? 'Sur devis' : annual ? `$${Math.round(m * 10)}/an` : `$${m}/mois`);

  return (
    <div className="bg-white text-ink-900">
      {/* ───────── Top utility bar ───────── */}
      <div className="bg-ink-950 text-ink-300 text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 md:px-10">
          <span className="flex items-center gap-2"><Globe2 size={13} /> Dubai · Afrique · Monde</span>
          <span className="hidden sm:flex items-center gap-4">
            <a href="#contact" className="hover:text-white">Contact</a>
            <Link to="/auth" className="hover:text-white">Espace client</Link>
          </span>
        </div>
      </div>

      {/* ───────── Header ───────── */}
      <header className="sticky top-0 z-50 border-b border-ink-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
              <Sparkles size={18} />
            </div>
            <span className="text-lg font-bold tracking-tight">Atlas CRM</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium text-ink-600 lg:flex">
            <a href="#products" className="hover:text-primary-700 transition">Produits</a>
            <a href="#pricing" className="hover:text-primary-700 transition">Tarifs</a>
            <a href="#solutions" className="hover:text-primary-700 transition">Solutions</a>
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
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary-50 via-white to-white" />
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary-200/40 blur-3xl" />
          <div className="absolute -left-24 top-40 h-80 w-80 rounded-full bg-accent-200/30 blur-3xl" />
          <div className="relative mx-auto max-w-7xl px-6 py-20 md:px-10 lg:py-28">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-700 shadow-sm">
                <Zap size={13} /> CRM propulsé par l’IA · Nouveau
              </span>
              <h1 className="mt-7 text-4xl font-bold leading-[1.05] tracking-tight text-ink-950 sm:text-6xl">
                Développez votre entreprise<br />
                <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">avec la donnée au cœur</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-ink-600">
                Atlas CRM unifie vos ventes, votre service client et l’intelligence artificielle sur une seule plateforme cloud — pensée pour les équipes ambitieuses de Dubai, d’Afrique et du monde.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link to="/auth" className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-600/20 transition hover:bg-primary-700">
                  Démarrer l’essai gratuit <ArrowRight size={18} />
                </Link>
                <a href="#pricing" className="inline-flex items-center rounded-lg border border-ink-200 bg-white px-7 py-3.5 text-base font-semibold text-ink-800 transition hover:bg-ink-50">
                  Voir les tarifs
                </a>
              </div>
              <p className="mt-5 text-xs text-ink-500">14 jours gratuits · Sans carte bancaire · Annulez à tout moment</p>
            </div>

            {/* Product preview mockup */}
            <div className="mx-auto mt-16 max-w-5xl">
              <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-2xl shadow-ink-900/10">
                <div className="flex items-center gap-1.5 border-b border-ink-100 bg-ink-50 px-4 py-3">
                  <span className="h-3 w-3 rounded-full bg-error-400" />
                  <span className="h-3 w-3 rounded-full bg-warning-400" />
                  <span className="h-3 w-3 rounded-full bg-success-400" />
                  <span className="ml-3 text-xs font-medium text-ink-400">app.atlascrm.io</span>
                </div>
                <div className="grid grid-cols-[200px_1fr] gap-0">
                  <div className="hidden border-r border-ink-100 bg-ink-50 p-4 sm:block">
                    <div className="space-y-2">
                      {['Tableau de bord', 'Contacts', 'Pipelines', 'Devis', 'Factures', 'Agents IA'].map((item, i) => (
                        <div key={item} className={`rounded-md px-3 py-2 text-xs font-medium ${i === 0 ? 'bg-primary-100 text-primary-700' : 'text-ink-500'}`}>{item}</div>
                      ))}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-3 gap-4">
                      {[['Revenu', '$248K', '+12%'], ['Deals ouverts', '34', '+5'], ['Leads chauds', '18', '+3']].map(([l, v, t]) => (
                        <div key={l} className="rounded-lg border border-ink-100 p-3">
                          <p className="text-[10px] font-semibold uppercase text-ink-400">{l}</p>
                          <p className="mt-1 text-lg font-bold text-ink-900">{v}</p>
                          <p className="text-[10px] font-semibold text-success-600">{t}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex h-24 items-end gap-2 rounded-lg border border-ink-100 p-3">
                      {[40, 65, 50, 80, 60, 95, 70].map((h, i) => (
                        <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-primary-600 to-primary-400" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ───────── Logo cloud ───────── */}
        <section className="border-y border-ink-100 bg-white py-12">
          <div className="mx-auto max-w-7xl px-6 md:px-10">
            <p className="text-center text-xs font-semibold uppercase tracking-widest text-ink-400">
              La confiance d’entreprises en croissance
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {logos.map((logo) => (
                <span key={logo} className="text-lg font-bold text-ink-300 transition hover:text-ink-500">{logo}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ───────── Products ───────── */}
        <section id="products" className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary-600">Produits</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">Une plateforme, tous vos métiers</h2>
            <p className="mt-4 text-ink-600">Des clouds spécialisés qui partagent une même donnée client, pour une expérience unifiée.</p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <div key={p.name} className="group rounded-2xl border border-ink-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-600/5">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition group-hover:bg-primary-600 group-hover:text-white">
                    <p.icon size={22} />
                  </div>
                  <span className="rounded-full bg-ink-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink-500">{p.tag}</span>
                </div>
                <h3 className="mt-5 text-lg font-bold text-ink-900">{p.name}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-600">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ───────── Stats band ───────── */}
        <section className="bg-primary-700 text-white">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-14 md:grid-cols-4 md:px-10">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold sm:text-4xl">{s.value}</p>
                <p className="mt-1.5 text-sm text-primary-100">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ───────── Pricing ───────── */}
        <section id="pricing" className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary-600">Tarifs</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">Une tarification claire et transparente</h2>
            <p className="mt-4 text-ink-600">Choisissez le plan adapté à votre croissance. Engagement annuel et économies de 2 mois incluses.</p>
          </div>

          {/* Billing toggle */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${!annual ? 'text-ink-900' : 'text-ink-400'}`}>Mensuel</span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative h-7 w-12 rounded-full transition ${annual ? 'bg-primary-600' : 'bg-ink-200'}`}
              aria-label="Basculer la facturation"
            >
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${annual ? 'left-6' : 'left-1'}`} />
            </button>
            <span className={`text-sm font-medium ${annual ? 'text-ink-900' : 'text-ink-400'}`}>
              Annuel <span className="ml-1 rounded-full bg-success-100 px-2 py-0.5 text-xs font-semibold text-success-700">-17%</span>
            </span>
          </div>

          {/* Plan cards */}
          <div className="mt-12 grid gap-6 lg:grid-cols-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border p-7 transition ${plan.popular ? 'border-primary-600 bg-white shadow-2xl shadow-primary-600/10 lg:-translate-y-3' : 'border-ink-100 bg-white shadow-sm hover:shadow-lg'}`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow">
                    {plan.tagline}
                  </span>
                )}
                <h3 className="text-lg font-bold text-ink-900">{plan.name}</h3>
                {!plan.popular && <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-primary-600">{plan.tagline}</p>}
                <p className="mt-3 min-h-[2.5rem] text-sm leading-6 text-ink-600">{plan.desc}</p>
                <div className="mt-5">
                  <p className="text-3xl font-bold text-ink-950">{price(plan.monthly)}</p>
                  {plan.monthly !== null && <p className="mt-1 text-xs text-ink-400">{annual ? 'Facturé annuellement' : 'par utilisateur'}</p>}
                </div>
                <Link
                  to="/auth"
                  className={`mt-7 inline-flex w-full items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition ${plan.popular ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-ink-950 text-white hover:bg-ink-800'}`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* ───────── Comparison matrix ───────── */}
          <div id="matrix" className="mt-16">
            <h3 className="text-center text-2xl font-bold text-ink-950">Comparatif détaillé des forfaits</h3>
            <p className="mt-2 text-center text-sm text-ink-500">Tout ce qui est inclus, par plan.</p>
            <div className="mt-8 overflow-x-auto rounded-2xl border border-ink-100 shadow-sm">
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
                        <td className="sticky left-0 bg-white px-6 py-3.5 text-left text-ink-700">{row.label}</td>
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
        </section>

        {/* ───────── Solutions / trust ───────── */}
        <section id="solutions" className="bg-ink-50 py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-6 md:px-10">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-primary-600">Confiance</span>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">La sécurité d’abord, à l’échelle mondiale</h2>
                <p className="mt-4 text-ink-600">Atlas CRM est conçu pour respecter les normes internationales : chiffrement de bout en bout, Row-Level Security, et conformité RGPD, CCPA et SOC 2.</p>
                <ul className="mt-7 space-y-4">
                  {[
                    { icon: Lock, t: 'Chiffrement au repos et en transit', d: 'AES-256 sur toutes les données sensibles.' },
                    { icon: ShieldCheck, t: 'Conformité multi-régions', d: 'RGPD, CCPA, hébergement régional au choix.' },
                    { icon: Globe2, t: 'Disponibilité 99,9%', d: 'SLA garanti avec monitoring temps réel.' },
                  ].map((item) => (
                    <li key={item.t} className="flex gap-4">
                      <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-white text-primary-600 shadow-sm">
                        <item.icon size={18} />
                      </div>
                      <div>
                        <p className="font-semibold text-ink-900">{item.t}</p>
                        <p className="text-sm text-ink-500">{item.d}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-ink-100 bg-white p-8 shadow-xl">
                <div className="flex items-center gap-1 text-warning-400">
                  {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                </div>
                <blockquote className="mt-4 text-lg font-medium leading-7 text-ink-800">
                  « Atlas CRM a transformé notre pipeline commercial. L’IA qualifie nos leads pendant la nuit, et nos équipes ferment 30% plus vite. »
                </blockquote>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">AM</div>
                  <div>
                    <p className="text-sm font-semibold text-ink-900">Amina Mwangi</p>
                    <p className="text-xs text-ink-500">Directrice Commerciale · Sahara Logistics</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ───────── FAQ ───────── */}
        <section id="faq" className="mx-auto max-w-3xl px-6 py-20 md:px-10 lg:py-28">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary-600">FAQ</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">Questions fréquentes</h2>
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

        {/* ───────── Final CTA ───────── */}
        <section className="relative overflow-hidden bg-ink-950 py-20 text-white">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary-600/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-accent-600/20 blur-3xl" />
          <div className="relative mx-auto max-w-3xl px-6 text-center md:px-10">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Prêt à transformer votre relation client ?</h2>
            <p className="mt-4 text-ink-300">Rejoignez les équipes qui scalent avec Atlas CRM. Essai gratuit de 14 jours, sans carte bancaire.</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/auth" className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg transition hover:bg-primary-500">
                Démarrer maintenant <ArrowRight size={18} />
              </Link>
              <a href="#pricing" className="inline-flex rounded-lg border border-white/20 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-white/10">
                Comparer les plans
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ───────── Footer ───────── */}
      <footer id="contact" className="border-t border-ink-100 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14 md:px-10">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
                  <Sparkles size={18} />
                </div>
                <span className="text-lg font-bold">Atlas CRM</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-ink-500">La plateforme CRM cloud propulsée par l’IA, pour les équipes de Dubai, d’Afrique et du monde.</p>
            </div>
            {[
              { h: 'Produit', links: ['Sales Cloud', 'Service Cloud', 'Agentforce', 'Data Cloud'] },
              { h: 'Ressources', links: ['Tarifs', 'Documentation', 'Statut', 'Blog'] },
              { h: 'Entreprise', links: ['À propos', 'Sécurité', 'Contact', 'Carrières'] },
            ].map((col) => (
              <div key={col.h}>
                <p className="text-sm font-bold text-ink-900">{col.h}</p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l}><a href="#" className="text-sm text-ink-500 transition hover:text-primary-700">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-ink-100 pt-6 sm:flex-row">
            <p className="text-xs text-ink-400">© {new Date().getFullYear()} Atlas CRM · LiAfrik Dubai & Afrique. Tous droits réservés.</p>
            <div className="flex gap-5 text-xs text-ink-400">
              <a href="#" className="hover:text-ink-700">Confidentialité</a>
              <a href="#" className="hover:text-ink-700">Conditions</a>
              <a href="#" className="hover:text-ink-700">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
