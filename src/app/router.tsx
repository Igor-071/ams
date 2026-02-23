import { createBrowserRouter } from 'react-router'
import { RootLayout } from '@/components/layout/root-layout.tsx'
import { PublicLayout } from '@/components/layout/public-layout.tsx'
import { AuthLayout } from '@/components/layout/auth-layout.tsx'
import { DashboardLayout } from '@/components/layout/dashboard-layout.tsx'
import { AuthGuard } from '@/components/layout/auth-guard.tsx'
import { HomeRedirect } from '@/pages/home-redirect.tsx'
import { NotFoundPage } from '@/pages/not-found.tsx'
import { LoginPage } from '@/features/auth/pages/login-page.tsx'
import { RegisterPage } from '@/features/auth/pages/register-page.tsx'
import { MerchantRegisterPage } from '@/features/auth/pages/merchant-register-page.tsx'
import { CatalogPage } from '@/features/marketplace/pages/catalog-page.tsx'
import { ServiceDetailPage } from '@/features/marketplace/pages/service-detail-page.tsx'
import { DashboardPage } from '@/features/consumer/pages/dashboard-page.tsx'
import { ApiKeysPage } from '@/features/consumer/pages/api-keys-page.tsx'
import { ApiKeyNewPage } from '@/features/consumer/pages/api-key-new-page.tsx'
import { ApiKeyDetailPage } from '@/features/consumer/pages/api-key-detail-page.tsx'
import { UsagePage } from '@/features/consumer/pages/usage-page.tsx'
import { ImagesPage } from '@/features/consumer/pages/images-page.tsx'
import { ProjectsPage } from '@/features/consumer/pages/projects-page.tsx'
import { ProjectDetailPage } from '@/features/consumer/pages/project-detail-page.tsx'
import { ConsumerServicesPage } from '@/features/consumer/pages/consumer-services-page.tsx'
import { ConsumerServiceDetailPage } from '@/features/consumer/pages/consumer-service-detail-page.tsx'
import { ConsumerUsageDetailPage } from '@/features/consumer/pages/consumer-usage-detail-page.tsx'
import { MerchantDashboardPage } from '@/features/merchant/pages/merchant-dashboard-page.tsx'
import { MerchantServicesPage } from '@/features/merchant/pages/merchant-services-page.tsx'
import { MerchantServiceNewPage } from '@/features/merchant/pages/merchant-service-new-page.tsx'
import { MerchantServiceDetailPage } from '@/features/merchant/pages/merchant-service-detail-page.tsx'
import { MerchantServiceConsumersPage } from '@/features/merchant/pages/merchant-service-consumers-page.tsx'
import { MerchantConsumersPage } from '@/features/merchant/pages/merchant-consumers-page.tsx'
import { MerchantInvoicesPage } from '@/features/merchant/pages/merchant-invoices-page.tsx'
import { MerchantInvoiceDetailPage } from '@/features/merchant/pages/merchant-invoice-detail-page.tsx'
import { MerchantImagesPage } from '@/features/merchant/pages/merchant-images-page.tsx'
import { MerchantUsagePage } from '@/features/merchant/pages/merchant-usage-page.tsx'
import { MerchantUsageDetailPage } from '@/features/merchant/pages/merchant-usage-detail-page.tsx'
import { AdminDashboardPage } from '@/features/admin/pages/admin-dashboard-page.tsx'
import { AdminMerchantsPage } from '@/features/admin/pages/admin-merchants-page.tsx'
import { AdminMerchantDetailPage } from '@/features/admin/pages/admin-merchant-detail-page.tsx'
import { AdminConsumersPage } from '@/features/admin/pages/admin-consumers-page.tsx'
import { AdminConsumerDetailPage } from '@/features/admin/pages/admin-consumer-detail-page.tsx'
import { AdminServicesPage } from '@/features/admin/pages/admin-services-page.tsx'
import { AdminServiceDetailPage } from '@/features/admin/pages/admin-service-detail-page.tsx'
import { AdminGovernancePage } from '@/features/admin/pages/admin-governance-page.tsx'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // Root redirect
      { index: true, element: <HomeRedirect /> },

      // Public routes
      {
        element: <PublicLayout />,
        children: [
          { path: 'marketplace', element: <CatalogPage /> },
          { path: 'marketplace/:serviceId', element: <ServiceDetailPage /> },
        ],
      },

      // Auth routes
      {
        element: <AuthLayout />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
          { path: 'register/merchant', element: <MerchantRegisterPage /> },
        ],
      },

      // Consumer dashboard
      {
        element: <AuthGuard allowedRoles={['consumer']} />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              { path: 'dashboard', element: <DashboardPage /> },
              { path: 'dashboard/api-keys', element: <ApiKeysPage /> },
              { path: 'dashboard/api-keys/new', element: <ApiKeyNewPage /> },
              { path: 'dashboard/api-keys/:keyId', element: <ApiKeyDetailPage /> },
              { path: 'dashboard/usage', element: <UsagePage /> },
              { path: 'dashboard/usage/:date', element: <ConsumerUsageDetailPage /> },
              { path: 'dashboard/services', element: <ConsumerServicesPage /> },
              { path: 'dashboard/services/:serviceId', element: <ConsumerServiceDetailPage /> },
              { path: 'dashboard/images', element: <ImagesPage /> },
              { path: 'dashboard/projects', element: <ProjectsPage /> },
              { path: 'dashboard/projects/:projectId', element: <ProjectDetailPage /> },
            ],
          },
        ],
      },

      // Merchant dashboard
      {
        element: <AuthGuard allowedRoles={['merchant']} />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              { path: 'merchant', element: <MerchantDashboardPage /> },
              { path: 'merchant/services', element: <MerchantServicesPage /> },
              { path: 'merchant/services/new', element: <MerchantServiceNewPage /> },
              { path: 'merchant/services/:serviceId', element: <MerchantServiceDetailPage /> },
              { path: 'merchant/services/:serviceId/consumers', element: <MerchantServiceConsumersPage /> },
              { path: 'merchant/consumers', element: <MerchantConsumersPage /> },
              { path: 'merchant/invoices', element: <MerchantInvoicesPage /> },
              { path: 'merchant/invoices/:invoiceId', element: <MerchantInvoiceDetailPage /> },
              { path: 'merchant/usage', element: <MerchantUsagePage /> },
              { path: 'merchant/usage/:date', element: <MerchantUsageDetailPage /> },
              { path: 'merchant/images', element: <MerchantImagesPage /> },
            ],
          },
        ],
      },

      // Admin dashboard
      {
        element: <AuthGuard allowedRoles={['admin']} />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              { path: 'admin', element: <AdminDashboardPage /> },
              { path: 'admin/merchants', element: <AdminMerchantsPage /> },
              { path: 'admin/merchants/:merchantId', element: <AdminMerchantDetailPage /> },
              { path: 'admin/consumers', element: <AdminConsumersPage /> },
              { path: 'admin/consumers/:consumerId', element: <AdminConsumerDetailPage /> },
              { path: 'admin/services', element: <AdminServicesPage /> },
              { path: 'admin/services/:serviceId', element: <AdminServiceDetailPage /> },
              { path: 'admin/governance', element: <AdminGovernancePage /> },
            ],
          },
        ],
      },

      // 404
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
