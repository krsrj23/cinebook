import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

import Home from './pages/Home'
import MovieDetail from './pages/MovieDetail'
import SeatSelection from './pages/SeatSelection'
import BookingConfirmation from './pages/BookingConfirmation'
import MyBookings from './pages/MyBookings'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'

import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageMovies from './pages/admin/ManageMovies'
import ManageVenues from './pages/admin/ManageVenues'
import ManageShows from './pages/admin/ManageShows'
import AllBookings from './pages/admin/AllBookings'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="movies/:id" element={<MovieDetail />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="shows/:showId/seats" element={<SeatSelection />} />
            <Route path="bookings/:bookingId/payment" element={<BookingConfirmation />} />
            <Route path="my-bookings" element={<MyBookings />} />
          </Route>

          <Route path="admin" element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="movies" element={<ManageMovies />} />
              <Route path="venues" element={<ManageVenues />} />
              <Route path="shows" element={<ManageShows />} />
              <Route path="bookings" element={<AllBookings />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
