import { Link } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import type { Plan } from '@/types';
import { PLAN_PRICES } from '@/lib/plans';

interface UpgradeGateProps {
  language: string;
  feature: string;
  minPlan: Plan;
}

const PLAN_LABEL: Record<Plan, string> = {
  starter: 'Starter',
  growth: 'Growth',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

/**
 * Full-page gate shown when the current org's plan doesn't include `feature`.
 * Use together with `hasFeature(plan, feature)` from '@/lib/plans' — this
 * component only renders the "locked" state; callers decide when to show it.
 */
export function UpgradeGate({ language, feature, minPlan }: UpgradeGateProps) {
  const fr = language === 'fr';
  const price = PLAN_PRICES[minPlan];
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-fade-in">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-500">
        <Lock size={28} />
      </div>
      <h3 className="text-lg font-bold text-ink-900 mb-1">
        {fr ? 'Fonctionnalité verrouillée' : 'Feature locked'}
      </h3>
      <p className="text-sm text-ink-500 max-w-sm mb-1">
        {fr
          ? `${feature} est disponible à partir du plan ${PLAN_LABEL[minPlan]}.`
          : `${feature} is available starting on the ${PLAN_LABEL[minPlan]} plan.`}
      </p>
      <p className="text-xs text-ink-400 max-w-sm mb-5">
        {fr ? `À partir de $${price.monthly}/mois.` : `Starting at $${price.monthly}/mo.`}
      </p>
      <Link to="/app/billing" className="btn-primary btn-sm">
        {fr ? 'Voir les plans' : 'View plans'} <ArrowRight size={14} />
      </Link>
    </div>
  );
}
