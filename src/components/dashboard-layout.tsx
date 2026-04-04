import { DesktopSidebar, MobileSidebar } from '@/components/sidebar'
import type { Role } from '@/types'

type Props = {
  children: React.ReactNode
  role: Role
  fullName: string | null
  email: string
}

export default function DashboardLayout({ children, role, fullName, email }: Props) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-primary)' }}>

      {/* Desktop sidebar — hidden below 768px via CSS */}
      <style>{`
        .desktop-sidebar { display: flex; }
        .mobile-topbar   { display: none; }

        @media (max-width: 767px) {
          .desktop-sidebar { display: none !important; }
          .mobile-topbar   { display: block !important; }
          .main-content    { padding-top: 56px !important; }  /* room for fixed top bar */
        }
      `}</style>

      <div className="desktop-sidebar">
        <DesktopSidebar role={role} fullName={fullName} email={email} />
      </div>

      <div className="mobile-topbar">
        <MobileSidebar role={role} fullName={fullName} email={email} />
      </div>

      <main
        className="main-content"
        style={{
          flex: 1,
          overflowY: 'auto',
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
        }}
      >
        {children}
      </main>
    </div>
  )
}