import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import useAppStore from '@/store/useAppStore'

export default function Layout() {
  const fetchChannels = useAppStore((s) => s.fetchChannels)

  useEffect(() => {
    fetchChannels()
  }, [fetchChannels])

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
