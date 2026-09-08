import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppShell() {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-svh bg-cream">
      <div className="hidden lg:fixed lg:inset-y-0 lg:start-0 lg:flex lg:w-64">
        <Sidebar />
      </div>
      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-espresso/40"
            onClick={() => setOpen(false)}
          />
          <div className="relative h-full w-64">
            <Sidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
      <div className="lg:ps-64">
        <Topbar onMenu={() => setOpen(true)} />
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
