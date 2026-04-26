import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardPage from './Pages/Dashboard/DashboardPage'
import TankDetailPage from './Pages/TankDetail/TankDetailPage'
import TanksPage from './Pages/Tanks/TanksPage'
import AlertsPage from './Pages/Alerts/AlertsPage'
import ReportsPage from './Pages/Reports/ReportsPage'
import SustainabilityPage from './Pages/Sustainability/SustainabilityPage'
import SettingsPage from './Pages/Settings/SettingsPage'
import LoginPage from './Pages/Login/LoginPage'
import Layout from './components/ui/Layout'
import ProtectedRoute from './components/ui/ProtectedRoute'
import ToastContainer from './components/ui/Toast'

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tanks" element={<TanksPage />} />
            <Route path="/tanks/:id" element={<TankDetailPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/sustainability" element={<SustainabilityPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <ToastContainer />
    </>
  )
}

export default App