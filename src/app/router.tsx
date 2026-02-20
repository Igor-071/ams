import { createBrowserRouter } from 'react-router'
import { RootLayout } from '@/components/layout/root-layout.tsx'
import { PublicLayout } from '@/components/layout/public-layout.tsx'
import { AuthLayout } from '@/components/layout/auth-layout.tsx'
import { DashboardLayout } from '@/components/layout/dashboard-layout.tsx'
import { AuthGuard } from '@/components/layout/auth-guard.tsx'
import { HomeRedirect } from '@/pages/home-redirect.tsx'
import { NotFoundPage } from '@/pages/not-found.tsx'
import { PlaceholderPage } from '@/pages/placeholder.tsx'
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
              { path: 'dashboard/services', element: <PlaceholderPage /> },
              { path: 'dashboard/services/:serviceId', element: <PlaceholderPage /> },
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
              { path: 'merchant', element: <PlaceholderPage /> },
              { path: 'merchant/services', element: <PlaceholderPage /> },
              { path: 'merchant/services/new', element: <PlaceholderPage /> },
              { path: 'merchant/services/:serviceId', element: <PlaceholderPage /> },
              { path: 'merchant/services/:serviceId/consumers', element: <PlaceholderPage /> },
              { path: 'merchant/consumers', element: <PlaceholderPage /> },
              { path: 'merchant/invoices', element: <PlaceholderPage /> },
              { path: 'merchant/invoices/:invoiceId', element: <PlaceholderPage /> },
              { path: 'merchant/images', element: <PlaceholderPage /> },
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
              { path: 'admin', element: <PlaceholderPage /> },
              { path: 'admin/merchants', element: <PlaceholderPage /> },
              { path: 'admin/merchants/:merchantId', element: <PlaceholderPage /> },
              { path: 'admin/consumers', element: <PlaceholderPage /> },
              { path: 'admin/consumers/:consumerId', element: <PlaceholderPage /> },
              { path: 'admin/services', element: <PlaceholderPage /> },
              { path: 'admin/services/:serviceId', element: <PlaceholderPage /> },
              { path: 'admin/governance', element: <PlaceholderPage /> },
            ],
          },
        ],
      },

      // 404
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
