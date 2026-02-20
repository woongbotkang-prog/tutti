import BottomNavBar from '@/components/BottomNavBar'
import { ToastProvider } from '@/components/Toast'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
      <BottomNavBar />
    </ToastProvider>
  )
}
