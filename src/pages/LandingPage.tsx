import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, TrendingUp, Layers, CheckCircle2 } from 'lucide-react';

const features = [
  {
    title: 'Ventes intelligentes',
    description: 'Suivez chaque opportunité, automatisez les relances et fermez plus vite.',
    icon: TrendingUp,
  },
  {
    title: 'Service client unifié',
    description: 'Regroupez tickets, chat et base de connaissances dans un seul hub.',
    icon: Layers,
  },
  {
    title: 'Sécurité à l’échelle',
    description: 'Contrôles multi-régions, permissions granulaires et conformité.',
    icon: ShieldCheck,
  },
];

const pricingPlans = [
  {
    title: 'Starter',
    price: '$19',
    description: 'Pour les petites équipes qui veulent mieux gérer les ventes.',
    features: ['Contacts', 'Pipelines', 'E-mails', 'Rapports limités'],
    highlight: false,
  },
  {
    title: 'Growth',
    price: '$69',
    description: 'Automatisation, marketing et croissance commerciale.',
    features: ['Tout Starter', 'Automations', 'Devis', 'Campagnes'],
    highlight: true,
  },
  {
    title: 'Pro',
    price: '$169',
    description: 'Analyses IA, support prioritaire et workflows avancés.',
    features: ['Tout Growth', 'Support client', 'Analyses IA', 'Workflows'],
    highlight: false,
  },
  {
    title: 'Custom',
    price: 'Custom',
    description: 'Solution sur mesure, intégrations API et support dédié.',
    features: ['Tout Pro', 'Intégrations API', 'Formation dédiée', 'Support premium'],
    highlight: false,
  },
];

const accessRows = [
  { label: 'Gestion des contacts', starter: true, growth: true, pro: true, custom: true },
  { label: 'Pipelines de ventes', starter: true, growth: true, pro: true, custom: true },
  { label: 'Automations', starter: false, growth: true, pro: true, custom: true },
  { label: 'Devis & facturation', starter: false, growth: true, pro: true, custom: true },
  { label: 'Support client', starter: false, growth: false, pro: true, custom: true },
  { label: 'Analyses IA', starter: false, growth: false, pro: true, custom: true },
  { label: 'Workflows personnalisés', starter: false, growth: false, pro: true, custom: true },
];

export function LandingPage() {
  return (
    <div className="bg-ink-50 text-ink-900">
      <header className="border-b border-ink-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-sm">
              <Sparkles size={22} />
            </div>
            <div>
              <p className="text-base font-semibold">Atlas CRM</p>
              <p className="text-xs text-ink-500">LiAfrik Dubai & Afrique</p>
            </div>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-ink-700 md:flex">
            <a href="#product" className="hover:text-ink-900 transition">Produit</a>
            <a href="#plans" className="hover:text-ink-900 transition">Plans</a>
            <a href="#access" className="hover:text-ink-900 transition">Accès</a>
            <a href="#contact" className="hover:text-ink-900 transition">Contact</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/auth" className="rounded-full border border-ink-200 bg-white px-5 py-2 text-sm font-semibold text-ink-900 transition hover:bg-ink-100">
              Se connecter
            </Link>
            <Link to="/auth" className="rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-500">
              Essayer
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-slate-950 text-white">
          <div className="absolute inset-x-0 top-0 h-60 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.15),_transparent_45%)]" />
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-[1.15fr_0.85fr] md:px-10 lg:px-16">
            <div className="space-y-8">
              <p className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm uppercase tracking-[0.3em] text-white/70">
                CRM global pour entreprises ambitieuses
              </p>
              <h1 className="max-w-3xl text-5xl font-semibold leading-tight sm:text-6xl">
                La plateforme CRM qui connecte ventes, support et intelligence.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-white/80">
                Atlas CRM réunit l’automatisation, les données client et la collaboration dans un espace unifié, conçu pour les équipes de Dubai et d’Afrique.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link to="/auth" className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-primary-700 shadow-xl shadow-primary-500/20 transition hover:bg-primary-50">
                  Commencer à 19$
                </Link>
                <a href="#plans" className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-7 py-3 text-sm font-semibold text-white transition hover:border-white/60 hover:bg-white/15">
                  Voir les plans
                </a>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {features.map((feature) => (
                  <div key={feature.title} className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl shadow-black/10 backdrop-blur-sm">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                      <feature.icon size={20} />
                    </div>
                    <h2 className="text-lg font-semibold">{feature.title}</h2>
                    <p className="mt-3 text-sm leading-6 text-white/70">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <div className="rounded-3xl bg-white/10 p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-white/70">Atlas CRM</p>
                <h2 className="mt-4 text-3xl font-semibold text-white">Pilotage, croissance et sécurité.</h2>
                <p className="mt-4 text-sm leading-6 text-white/70">
                  Accédez à votre CRM, gérez vos équipes et développez votre activité sur une plateforme performante.
                </p>
                <div className="mt-6 grid gap-3 text-sm text-white/80">
                  <div className="rounded-2xl bg-white/10 p-4">Programmes de prix clairs à 19$, 69$, 169$ et Custom.</div>
                  <div className="rounded-2xl bg-white/10 p-4">Accès différencié selon le plan et les fonctionnalités.</div>
                  <div className="rounded-2xl bg-white/10 p-4">Auth responsive et sécurisé pour toutes les équipes.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="plans" className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-16">
          <div className="mb-12 text-center">
            <p className="text-sm uppercase tracking-[0.32em] text-primary-600">Plans</p>
            <h2 className="mt-4 text-4xl font-semibold text-ink-900">Tarifs simples et adaptés à chaque organisation</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-ink-600">
              Choisissez le plan qui correspond à votre croissance, avec un accès clair aux fonctionnalités essentielles.
            </p>
          </div>
          <div className="grid gap-6 xl:grid-cols-4">
            {pricingPlans.map((plan) => (
              <div
                key={plan.title}
                className={`rounded-[2rem] border p-8 shadow-xl transition ${plan.highlight ? 'border-primary-500 bg-primary-600/10 text-white' : 'border-ink-200 bg-white'}`}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className={`text-2xl font-semibold ${plan.highlight ? 'text-white' : 'text-ink-900'}`}>{plan.title}</h3>
                    <p className={`mt-2 text-sm ${plan.highlight ? 'text-white/70' : 'text-ink-500'}`}>{plan.description}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${plan.highlight ? 'bg-white/10 text-white' : 'bg-ink-100 text-ink-900'}`}>{plan.price}</span>
                </div>
                <div className={`mt-8 space-y-4 text-sm leading-6 ${plan.highlight ? 'text-white/80' : 'text-ink-600'}`}>
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <CheckCircle2 size={18} className={`${plan.highlight ? 'text-primary-300' : 'text-primary-600'}`} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <Link
                  to="/auth"
                  className={`mt-10 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${plan.highlight ? 'bg-white text-primary-700 hover:bg-white/90' : 'bg-ink-950 text-white hover:bg-ink-900'}`}
                >
                  {plan.title === 'Custom' ? 'Contact Sales' : 'Je choisis'}
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section id="access" className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-16">
          <div className="mb-10 text-center">
            <p className="text-sm uppercase tracking-[0.32em] text-primary-600">Accès par plan</p>
            <h2 className="mt-4 text-4xl font-semibold text-ink-900">Fonctionnalités incluses par forfait</h2>
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-ink-200 bg-white shadow-card">
            <div className="grid grid-cols-2 gap-1 border-b border-ink-200 bg-ink-50 px-6 py-4 text-sm font-semibold text-ink-700 sm:grid-cols-5">
              <div>Fonctionnalité</div>
              <div className="text-center">Starter</div>
              <div className="text-center">Growth</div>
              <div className="text-center">Pro</div>
              <div className="text-center">Custom</div>
            </div>
            {accessRows.map((row) => (
              <div key={row.label} className="grid grid-cols-2 gap-1 border-t border-ink-200 px-6 py-4 text-sm text-ink-700 sm:grid-cols-5 sm:text-center">
                <div className="text-left sm:text-left">{row.label}</div>
                <div>{row.starter ? <CheckCircle2 size={18} className="mx-auto text-primary-600" /> : <span className="text-ink-400">—</span>}</div>
                <div>{row.growth ? <CheckCircle2 size={18} className="mx-auto text-primary-600" /> : <span className="text-ink-400">—</span>}</div>
                <div>{row.pro ? <CheckCircle2 size={18} className="mx-auto text-primary-600" /> : <span className="text-ink-400">—</span>}</div>
                <div>{row.custom ? <CheckCircle2 size={18} className="mx-auto text-primary-600" /> : <span className="text-ink-400">—</span>}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer id="contact" className="border-t border-ink-200 bg-white py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 md:flex-row md:items-center md:justify-between md:px-10">
          <div>
            <p className="text-sm font-semibold text-ink-900">Atlas CRM</p>
            <p className="mt-2 text-sm text-ink-600">La solution CRM de LiAfrik Dubai & Afrique pour les équipes qui veulent scaler.</p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-ink-500">
            <a href="#product" className="hover:text-ink-900">Produit</a>
            <a href="#plans" className="hover:text-ink-900">Plans</a>
            <a href="#access" className="hover:text-ink-900">Accès</a>
            <a href="#contact" className="hover:text-ink-900">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
