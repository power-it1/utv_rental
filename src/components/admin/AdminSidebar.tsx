'use client';

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface NavItem {
  href: string
  label: string
  icon: ReactNode
  badge?: string
}

interface AdminSidebarProps {
  items: NavItem[]
  cta?: {
    href: string
    label: string
  }
  profileName?: string | null
}

export default function AdminSidebar({ items, cta, profileName }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-72 xl:w-80 border-r border-white/30 bg-white/70 backdrop-blur-xl shadow-xl min-h-screen">
      <div className="px-6 pt-8 pb-6 border-b border-white/40">
        <p className="text-sm uppercase tracking-[0.24em] text-pine-500 font-semibold">Adventure Ops</p>
        <h1 className="mt-3 text-2xl font-bold text-pine-800">Command Center</h1>
        <p className="mt-2 text-sm text-rock-500">{profileName ? `Signed in as ${profileName}` : 'Admin user'}</p>
      </div>

      <nav className="flex-1 px-2 py-6 space-y-2">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between rounded-2xl px-4 py-3 transition-all duration-200 ${
                active
                  ? 'bg-gradient-to-r from-orange-500/90 to-orange-400 text-white shadow-lg shadow-orange-200/40'
                  : 'text-rock-600 hover:text-pine-700 hover:bg-sky-100'
              }`}
            >
              <span className="flex items-center gap-3 text-sm font-semibold">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${
                    active
                      ? 'bg-white/20'
                      : 'bg-sky-100 text-pine-600 group-hover:bg-sky-200'
                  }`}
                >
                  {item.icon}
                </span>
                {item.label}
              </span>
              {item.badge && (
                <span
                  className={`ml-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                    active ? 'bg-white/30 text-white' : 'bg-orange-100 text-orange-600'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {cta && (
        <div className="px-6 pb-8">
          <Link
            href={cta.href}
            className="block rounded-2xl bg-gradient-to-r from-pine-600 to-lagoon-500 px-6 py-4 text-center text-sm font-semibold text-white shadow-lg shadow-pine-200/30 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-xl"
          >
            {cta.label}
          </Link>
        </div>
      )}
    </aside>
  )
}
