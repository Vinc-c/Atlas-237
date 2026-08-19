// Plan-based feature gating — ensures module access matches subscription plan.
// Coherent with the pricing grid advertised on the landing page.

import type { Plan } from '@/types';

export interface PlanFeatures {
  maxContacts: number | 'unlimited';
  maxAIEmployees: number | 'unlimited';
  maxUsers: number | 'unlimited';
  advancedAnalytics: boolean;
  apiAccess: boolean;
  webhooks: boolean;
  customDashboards: boolean;
  customBranding: boolean;
  ssoSaml: boolean;
  customAITraining: boolean;
  prioritySupport: boolean;
  dedicatedManager: boolean;
  sla: boolean;
  exportData: boolean;
  customRoles: boolean;
  salesCodeTracking: boolean;
}

export const PLAN_FEATURES: Record<Plan, PlanFeatures> = {
  starter: {
    maxContacts: 'unlimited',
    maxAIEmployees: 5,
    maxUsers: 3,
    advancedAnalytics: false,
    apiAccess: false,
    webhooks: false,
    customDashboards: false,
    customBranding: false,
    ssoSaml: false,
    customAITraining: false,
    prioritySupport: false,
    dedicatedManager: false,
    sla: false,
    exportData: true,
    customRoles: false,
    salesCodeTracking: false,
  },
  growth: {
    maxContacts: 'unlimited',
    maxAIEmployees: 15,
    maxUsers: 10,
    advancedAnalytics: true,
    apiAccess: true,
    webhooks: true,
    customDashboards: false,
    customBranding: true,
    ssoSaml: false,
    customAITraining: false,
    prioritySupport: true,
    dedicatedManager: false,
    sla: false,
    exportData: true,
    customRoles: true,
    salesCodeTracking: true,
  },
  pro: {
    maxContacts: 'unlimited',
    maxAIEmployees: 'unlimited',
    maxUsers: 25,
    advancedAnalytics: true,
    apiAccess: true,
    webhooks: true,
    customDashboards: true,
    customBranding: true,
    ssoSaml: true,
    customAITraining: false,
    prioritySupport: true,
    dedicatedManager: false,
    sla: true,
    exportData: true,
    customRoles: true,
    salesCodeTracking: true,
  },
  enterprise: {
    maxContacts: 'unlimited',
    maxAIEmployees: 'unlimited',
    maxUsers: 'unlimited',
    advancedAnalytics: true,
    apiAccess: true,
    webhooks: true,
    customDashboards: true,
    customBranding: true,
    ssoSaml: true,
    customAITraining: true,
    prioritySupport: true,
    dedicatedManager: true,
    sla: true,
    exportData: true,
    customRoles: true,
    salesCodeTracking: true,
  },
};

export const PLAN_PRICES: Record<Plan, { monthly: number; label: string }> = {
  starter: { monthly: 19, label: 'Starter' },
  growth: { monthly: 49, label: 'Growth' },
  pro: { monthly: 119, label: 'Pro' },
  enterprise: { monthly: -1, label: 'Enterprise' },
};

export function getPlanFeatures(plan: Plan): PlanFeatures {
  return PLAN_FEATURES[plan] || PLAN_FEATURES.starter;
}

export function hasFeature(plan: Plan, feature: keyof PlanFeatures): boolean {
  const features = getPlanFeatures(plan);
  return Boolean(features[feature]);
}

export function featureGated(plan: Plan, feature: keyof PlanFeatures): { allowed: boolean; upgradeTo?: Plan } {
  const features = getPlanFeatures(plan);
  if (features[feature]) return { allowed: true };
  // Suggest minimum plan for this feature
  const planOrder: Plan[] = ['starter', 'growth', 'pro', 'enterprise'];
  for (const p of planOrder) {
    if (PLAN_FEATURES[p][feature]) return { allowed: false, upgradeTo: p };
  }
  return { allowed: false };
}
