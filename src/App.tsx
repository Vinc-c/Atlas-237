import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AuthPage } from '@/pages/AuthPage';
import { LandingPage } from '@/pages/LandingPage';
import { LegalPage, type LegalPage as LegalPageKey } from '@/pages/LegalPage';
import { AppLayout } from '@/components/AppLayout';
import { Paywall } from '@/components/Paywall';
import { Loading } from '@/components/Loading';

// Lazy-load protected pages for faster initial load (smaller main bundle)
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const AskAtlasPage = lazy(() => import('@/pages/SystemPages').then(m => ({ default: m.AskAtlasPage })));
const NotificationsPage = lazy(() => import('@/pages/SystemPages').then(m => ({ default: m.NotificationsPage })));
const AuditLogPage = lazy(() => import('@/pages/SystemPages').then(m => ({ default: m.AuditLogPage })));
const SettingsPage = lazy(() => import('@/pages/SystemPages').then(m => ({ default: m.SettingsPage })));
const BillingPage = lazy(() => import('@/pages/SystemPages').then(m => ({ default: m.BillingPage })));
const UsagePage = lazy(() => import('@/pages/SystemPages').then(m => ({ default: m.UsagePage })));
const ContactsPage = lazy(() => import('@/pages/CRMPages').then(m => ({ default: m.ContactsPage })));
const CompaniesPage = lazy(() => import('@/pages/CRMPages').then(m => ({ default: m.CompaniesPage })));
const LeadsPage = lazy(() => import('@/pages/CRMPages').then(m => ({ default: m.LeadsPage })));
const DealsPage = lazy(() => import('@/pages/CRMPages').then(m => ({ default: m.DealsPage })));
const PipelinesPage = lazy(() => import('@/pages/CRMPages').then(m => ({ default: m.PipelinesPage })));
const ActivitiesPage = lazy(() => import('@/pages/CRMPages').then(m => ({ default: m.ActivitiesPage })));
const CalendarPage = lazy(() => import('@/pages/CRMPages').then(m => ({ default: m.CalendarPage })));
const ProductsPage = lazy(() => import('@/pages/BusinessPages').then(m => ({ default: m.ProductsPage })));
const QuotesPage = lazy(() => import('@/pages/BusinessPages').then(m => ({ default: m.QuotesPage })));
const OrdersPage = lazy(() => import('@/pages/BusinessPages').then(m => ({ default: m.OrdersPage })));
const InvoicesPage = lazy(() => import('@/pages/BusinessPages').then(m => ({ default: m.InvoicesPage })));
const PaymentsPage = lazy(() => import('@/pages/BusinessPages').then(m => ({ default: m.PaymentsPage })));
const MarketingPage = lazy(() => import('@/pages/BusinessPages').then(m => ({ default: m.MarketingPage })));
const SupportPage = lazy(() => import('@/pages/BusinessPages').then(m => ({ default: m.SupportPage })));
const AIEmployeesPage = lazy(() => import('@/pages/AIPages').then(m => ({ default: m.AIEmployeesPage })));
const AITasksPage = lazy(() => import('@/pages/AIPages').then(m => ({ default: m.AITasksPage })));
const ApprovalsPage = lazy(() => import('@/pages/AIPages').then(m => ({ default: m.ApprovalsPage })));
const AIWorkflowsPage = lazy(() => import('@/pages/AIPages').then(m => ({ default: m.AIWorkflowsPage })));
const AIMemoryPage = lazy(() => import('@/pages/AIPages').then(m => ({ default: m.AIMemoryPage })));
const KnowledgeBasePage = lazy(() => import('@/pages/AIPages').then(m => ({ default: m.KnowledgeBasePage })));
const ReportsPage = lazy(() => import('@/pages/AnalyticsPages').then(m => ({ default: m.ReportsPage })));
const DashboardsPage = lazy(() => import('@/pages/AnalyticsPages').then(m => ({ default: m.DashboardsPage })));
const AIInsightsPage = lazy(() => import('@/pages/AnalyticsPages').then(m => ({ default: m.AIInsightsPage })));
const EmployeesPage = lazy(() => import('@/pages/TeamPages').then(m => ({ default: m.EmployeesPage })));
const TeamsPage = lazy(() => import('@/pages/TeamPages').then(m => ({ default: m.TeamsPage })));
const PermissionsPage = lazy(() => import('@/pages/TeamPages').then(m => ({ default: m.PermissionsPage })));
const MarketplacePage = lazy(() => import('@/pages/IntegrationPages').then(m => ({ default: m.MarketplacePage })));
const ConnectedAppsPage = lazy(() => import('@/pages/IntegrationPages').then(m => ({ default: m.ConnectedAppsPage })));
const APIWebhooksPage = lazy(() => import('@/pages/IntegrationPages').then(m => ({ default: m.APIWebhooksPage })));
const SuperAdminLayout = lazy(() => import('@/pages/SuperAdminPages').then(m => ({ default: m.SuperAdminLayout })));
const SuperAdminDashboard = lazy(() => import('@/pages/SuperAdminPages').then(m => ({ default: m.SuperAdminDashboard })));
const SuperAdminUsersPage = lazy(() => import('@/pages/SuperAdminPages').then(m => ({ default: m.SuperAdminUsersPage })));
const SuperAdminSubscriptionsPage = lazy(() => import('@/pages/SuperAdminPages').then(m => ({ default: m.SuperAdminSubscriptionsPage })));
const SuperAdminAnalyticsPage = lazy(() => import('@/pages/SuperAdminPages').then(m => ({ default: m.SuperAdminAnalyticsPage })));
const SuperAdminEmployeesPage = lazy(() => import('@/pages/SuperAdminPages').then(m => ({ default: m.SuperAdminEmployeesPage })));
const SuperAdminSalesCodesPage = lazy(() => import('@/pages/SuperAdminPages').then(m => ({ default: m.SuperAdminSalesCodesPage })));
const SuperAdminPermissionsPage = lazy(() => import('@/pages/SuperAdminPages').then(m => ({ default: m.SuperAdminPermissionsPage })));
const SuperAdminAuditPage = lazy(() => import('@/pages/SuperAdminPages').then(m => ({ default: m.SuperAdminAuditPage })));
const SuperAdminStaffPage = lazy(() => import('@/pages/SuperAdminPages').then(m => ({ default: m.SuperAdminStaffPage })));
const SuperAdminAccountingPage = lazy(() => import('@/pages/SuperAdminPages').then(m => ({ default: m.SuperAdminAccountingPage })));

const PageFallback = () => <div className="flex h-full items-center justify-center"><Loading /></div>;

function ProtectedRoutes() {
  const { session, loading } = useAuth();

  if (loading) return <Loading fullPage />;
  if (!session) return <Navigate to="/auth" replace />;

  return (
    <Paywall>
      <AppLayout>
        <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route index element={<DashboardPage />} />
        <Route path="ask-atlas" element={<AskAtlasPage />} />
        <Route path="approvals" element={<ApprovalsPage />} />
        {/* CRM */}
        <Route path="contacts" element={<ContactsPage />} />
        <Route path="companies" element={<CompaniesPage />} />
        <Route path="leads" element={<LeadsPage />} />
        <Route path="deals" element={<DealsPage />} />
        <Route path="pipelines" element={<PipelinesPage />} />
        <Route path="activities" element={<ActivitiesPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        {/* Business */}
        <Route path="products" element={<ProductsPage />} />
        <Route path="quotes" element={<QuotesPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="marketing" element={<MarketingPage />} />
        <Route path="support" element={<SupportPage />} />
        {/* AI Workforce */}
        <Route path="ai-employees" element={<AIEmployeesPage />} />
        <Route path="ai-tasks" element={<AITasksPage />} />
        <Route path="ai-workflows" element={<AIWorkflowsPage />} />
        <Route path="ai-memory" element={<AIMemoryPage />} />
        <Route path="knowledge-base" element={<KnowledgeBasePage />} />
        {/* Analytics */}
        <Route path="reports" element={<ReportsPage />} />
        <Route path="dashboards" element={<DashboardsPage />} />
        <Route path="ai-insights" element={<AIInsightsPage />} />
        {/* Team */}
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="teams" element={<TeamsPage />} />
        <Route path="permissions" element={<PermissionsPage />} />
        {/* Integrations */}
        <Route path="marketplace" element={<MarketplacePage />} />
        <Route path="connected-apps" element={<ConnectedAppsPage />} />
        <Route path="api-webhooks" element={<APIWebhooksPage />} />
        {/* System */}
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="audit-log" element={<AuditLogPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="usage" element={<UsagePage />} />
      </Routes>
        </Suspense>
      </AppLayout>
    </Paywall>
  );
}

function LandingRoutes() {
  const { session, loading } = useAuth();
  if (loading) return <Loading fullPage />;
  if (session) return <Navigate to="/app" replace />;
  return <LandingPage />;
}

function AuthRoutes() {
  const { session, loading } = useAuth();
  if (loading) return <Loading fullPage />;
  if (session) return <Navigate to="/app" replace />;
  return <AuthPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingRoutes />} />
          <Route path="/auth" element={<AuthRoutes />} />
          <Route path="/app/*" element={<ProtectedRoutes />} />
          <Route path="/super-admin" element={<SuperAdminRoute />}>
            <Route index element={<Suspense fallback={<PageFallback />}><SuperAdminDashboard /></Suspense>} />
            <Route path="users" element={<Suspense fallback={<PageFallback />}><SuperAdminUsersPage /></Suspense>} />
            <Route path="subscriptions" element={<Suspense fallback={<PageFallback />}><SuperAdminSubscriptionsPage /></Suspense>} />
            <Route path="analytics" element={<Suspense fallback={<PageFallback />}><SuperAdminAnalyticsPage /></Suspense>} />
            <Route path="employees" element={<Suspense fallback={<PageFallback />}><SuperAdminEmployeesPage /></Suspense>} />
            <Route path="sales-codes" element={<Suspense fallback={<PageFallback />}><SuperAdminSalesCodesPage /></Suspense>} />
            <Route path="permissions" element={<Suspense fallback={<PageFallback />}><SuperAdminPermissionsPage /></Suspense>} />
            <Route path="audit" element={<Suspense fallback={<PageFallback />}><SuperAdminAuditPage /></Suspense>} />
            <Route path="staff" element={<Suspense fallback={<PageFallback />}><SuperAdminStaffPage /></Suspense>} />
            <Route path="accounting" element={<Suspense fallback={<PageFallback />}><SuperAdminAccountingPage /></Suspense>} />
          </Route>
          <Route path="/legal/:page" element={<LegalRoute />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

const LEGAL_PAGES = ['privacy','terms','cookies','about','security','contact','careers','pricing','docs','status','community','blog','gdpr','pledge','sales-cloud','service-cloud','agentforce','data-360','tableau'];

function LegalRoute() {
  const { page } = useParams();
  if (!page || !LEGAL_PAGES.includes(page)) return <Navigate to="/" replace />;
  return <LegalPage page={page as LegalPageKey} />;
}

function SuperAdminRoute() {
  const { session, loading, isSuperAdmin } = useAuth();
  if (loading) return <Loading fullPage />;
  if (!session) return <Navigate to="/auth" replace />;
  if (!isSuperAdmin) return <Navigate to="/app" replace />;
  return <Suspense fallback={<Loading fullPage />}><SuperAdminLayout /></Suspense>;
}
