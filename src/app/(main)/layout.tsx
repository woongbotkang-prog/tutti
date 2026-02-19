import BottomNavBar from '@/components/BottomNavBar'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BottomNavBar />
    </>
  )
}
