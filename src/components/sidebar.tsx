'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Role } from '@/types'

const studentLinks = [
  { label: 'Dashboard',       href: '/student',              icon: '🏠' },
  { label: 'Browse PFEs',     href: '/student/projects',     icon: '🔍' },
  { label: 'My Applications', href: '/student/applications', icon: '📋' },
  { label: 'Forums',          href: '/student/forums',       icon: '🎪' },
  { label: 'My CV',           href: '/student/cv',           icon: '📄' },
  { label: 'My Profile',      href: '/student/profile',      icon: '👤' },
]
const companyLinks = [
  { label: 'Dashboard',    href: '/company',              icon: '🏠' },
  { label: 'My Projects',  href: '/company/projects',     icon: '📁' },
  { label: 'Applications', href: '/company/applications', icon: '👥' },
  { label: 'Forums',       href: '/company/forums',       icon: '🎪' },
  { label: 'Profile',      href: '/company/profile',      icon: '🏢' },
]
const adminLinks = [
  { label: 'Dashboard',    href: '/admin',                icon: '🏠' },
  { label: 'Users',        href: '/admin/users',          icon: '👤' },
  { label: 'Companies',    href: '/admin/companies',      icon: '🏢' },
  { label: 'Projects',     href: '/admin/projects',       icon: '📁' },
  { label: 'Applications', href: '/admin/applications',   icon: '📋' },
  { label: 'Forums',       href: '/admin/forums',         icon: '🎪' },
]

const linksByRole: Record<Role, typeof studentLinks> = {
  student: studentLinks,
  company: companyLinks,
  admin:   adminLinks,
}

type Props = { role: Role; fullName: string | null; email: string; onClose?: () => void }

// ── Shared nav link list (used in both desktop sidebar & mobile drawer)
function NavLinks({ links, onNavigate }: { links: typeof studentLinks; onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {links.map(link => {
        const isActive = pathname === link.href
        return (
          <Link key={link.href} href={link.href} onClick={onNavigate}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '10px',
              fontSize: '14px', fontWeight: 500, textDecoration: 'none',
              background: isActive ? 'rgba(91,110,245,0.15)' : 'transparent',
              color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              transition: 'all 0.15s',
            }}>
            <span>{link.icon}</span>
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}

// ── Desktop sidebar (hidden on mobile)
export function DesktopSidebar({ role, fullName, email }: Props) {
  const router = useRouter()
  const links  = linksByRole[role]

  const roleColors: Record<Role, string> = {
    student: '#818cf8', company: '#a78bfa', admin: '#f87171',
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <aside style={{
      display: 'flex', flexDirection: 'column',
      height: '100vh', width: '256px', minWidth: '256px',
      background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', height: '64px', alignItems: 'center', gap: '12px', padding: '0 24px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '12px', flexShrink: 0 }}>
          EN
        </div>
        <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
          ENET&apos;Com PFE
        </span>
      </div>

      {/* Role badge */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: 500,
          background: `${roleColors[role]}20`, color: roleColors[role],
        }}>
          {role === 'student' ? '🎓' : role === 'company' ? '🏢' : '⚙️'} {role}
        </span>
      </div>

      {/* Links */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }}>
        <NavLinks links={links} />
      </div>

      {/* User + logout */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ marginBottom: '12px', padding: '0 4px' }}>
          <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {fullName ?? 'User'}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {email}
          </p>
        </div>
        <button onClick={handleLogout}
          style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}
          onMouseEnter={e => { const el = e.currentTarget; el.style.background = 'rgba(248,113,113,0.1)'; el.style.color = 'var(--danger)'; el.style.borderColor = 'rgba(248,113,113,0.3)' }}
          onMouseLeave={e => { const el = e.currentTarget; el.style.background = 'transparent'; el.style.color = 'var(--text-secondary)'; el.style.borderColor = 'var(--border)' }}>
          Sign out
        </button>
      </div>
    </aside>
  )
}

// ── Mobile top bar + slide-in drawer
export function MobileSidebar({ role, fullName, email }: Props) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const links  = linksByRole[role]
  const pathname = usePathname()

  // Close drawer on route change
  useEffect(() => { setOpen(false) }, [pathname])
  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const currentLink = links.find(l => l.href === pathname)

  return (
    <>
      {/* Top bar */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px',
        background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)',
      }}>
        {/* Hamburger */}
        <button onClick={() => setOpen(true)} style={{
          width: '40px', height: '40px', borderRadius: '10px', border: '1px solid var(--border)',
          background: 'var(--bg-card)', cursor: 'pointer', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '5px', flexShrink: 0,
        }}>
          <span style={{ width: '18px', height: '2px', background: 'var(--text-primary)', borderRadius: '2px', display: 'block' }} />
          <span style={{ width: '18px', height: '2px', background: 'var(--text-primary)', borderRadius: '2px', display: 'block' }} />
          <span style={{ width: '18px', height: '2px', background: 'var(--text-primary)', borderRadius: '2px', display: 'block' }} />
        </button>

        {/* Current page title */}
        <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
          {currentLink ? `${currentLink.icon} ${currentLink.label}` : 'ENET\'Com PFE'}
        </span>

        {/* Logo pill */}
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '11px', flexShrink: 0 }}>
          EN
        </div>
      </header>

      {/* Backdrop */}
      {open && (
        <div onClick={() => setOpen(false)} style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)',
        }} />
      )}

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 300,
        width: '280px', maxWidth: '85vw',
        background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: open ? '4px 0 24px rgba(0,0,0,0.15)' : 'none',
      }}>
        {/* Drawer header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '12px' }}>
              EN
            </div>
            <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
              ENET&apos;Com PFE
            </span>
          </div>
          <button onClick={() => setOpen(false)} style={{
            width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border)',
            background: 'var(--bg-card)', cursor: 'pointer', fontSize: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-secondary)',
          }}>✕</button>
        </div>

        {/* User info */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {fullName ?? 'User'}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {email}
          </p>
        </div>

        {/* Links */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          <NavLinks links={links} onNavigate={() => setOpen(false)} />
        </div>

        {/* Logout */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <button onClick={handleLogout} style={{
            width: '100%', padding: '10px 12px', borderRadius: '10px',
            border: '1px solid var(--border)', background: 'transparent',
            color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
          }}>
            Sign out
          </button>
        </div>
      </div>
    </>
  )
}

// ── Default export for backward compat (desktop only)
export default function Sidebar(props: Props) {
  return <DesktopSidebar {...props} />
}