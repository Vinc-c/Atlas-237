import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AuthPage } from '@/pages/AuthPage';
import { LandingPage } from '@/pages/LandingPage';
import { LegalPage } from '@/pages/LegalPage';
import { AppLayout } from '@/components/AppLayout';
import { Paywall } from '@/components/Paywall';
import { Loading } from '@/components/Loading';
import { DashboardPage } from '@/pages/DashboardPage';
import { AskAtlasPage, NotificationsPage, AuditLogPage, SettingsPage, BillingPage, UsagePage } from '@/pages/SystemPages';
import { ContactsPage, CompaniesPage, LeadsPage, DealsPage, PipelinesPage, ActivitiesPage, CalendarPage } from '@/pages/CRMPages';
import { ProductsPage, QuotesPage, OrdersPage, InvoicesPage, PaymentsPage, MarketingPage, SupportPage } from '@/pages/BusinessPages';
import { AIEmployeesPage, AITasksPage, ApprovalsPage, AIWorkflowsPage, AIMemoryPage, KnowledgeBasePage } from '@/pages/AIPages';
import { ReportsPage, DashboardsPage, AIInsightsPage } from '@/pages/AnalyticsPages';
import { EmployeesPage, TeamsPage, PermissionsPage } from '@/pages/TeamPages';
import { MarketplacePage, ConnectedAppsPage, APIWebhooksPage } from '@/pages/IntegrationPages';
import {
  SuperAdminLayout, SuperAdminDashboard, SuperAdminUsersPage,
  SuperAdminSubscriptionsPage, SuperAdminAnalyticsPage, SuperAdminEmployeesPage,
  SuperAdminSalesCodesPage, SuperAdminPermissionsPage, SuperAdminAuditPage,
} from '@/pages/SuperAdminPages';

function ProtectedRoutes() {
  const { session, loading } = useAuth();

  if (loading) return <Loading fullPage />;
  if (!session) return <Navigate to="/auth" replace />;

  return (
    <Paywall>
      <AppLayout>
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
            <Route index element={<SuperAdminDashboard />} />
            <Route path="users" element={<SuperAdminUsersPage />} />
            <Route path="subscriptions" element={<SuperAdminSubscriptionsPage />} />
            <Route path="analytics" element={<SuperAdminAnalyticsPage />} />
            <Route path="employees" element={<SuperAdminEmployeesPage />} />
            <Route path="sales-codes" element={<SuperAdminSalesCodesPage />} />
            <Route path="permissions" element={<SuperAdminPermissionsPage />} />
            <Route path="audit" element={<SuperAdminAuditPage />} />
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
  return <LegalPage page={page as any} />;
}

function SuperAdminRoute() {
  const { session, loading, isSuperAdmin } = useAuth();
  if (loading) return <Loading fullPage />;
  if (!session) return <Navigate to="/auth" replace />;
  if (!isSuperAdmin) return <Navigate to="/app" replace />;
  return <SuperAdminLayout />;
}
