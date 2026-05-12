import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import Dashboard from '@/pages/Dashboard'
import Channels from '@/pages/Channels'
import Generate from '@/pages/Generate'
import Library from '@/pages/Library'
import Analytics from '@/pages/Analytics'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="channels" element={<Channels />} />
        <Route path="generate" element={<Generate />} />
        <Route path="library" element={<Library />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>
    </Routes>
  )
}
