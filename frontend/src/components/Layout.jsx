import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-cinema-950">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-cinema-800 py-6 text-center text-xs text-cinema-500">
        <p>CineBook — a portfolio project. Not a real ticketing service.</p>
      </footer>
    </div>
  )
}
