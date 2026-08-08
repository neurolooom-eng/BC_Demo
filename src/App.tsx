import { useEffect, useState } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { RequirePermission } from './components/RequirePermission'
import { AccessProvider, useAccess } from './context/AccessContext'
import { ThemeProvider } from './context/ThemeContext'
import { ensureSeeded } from './data/credentials'
import { Accounts } from './pages/Accounts'
import { Admin } from './pages/Admin'
import { CheckSheets } from './pages/CheckSheets'
import { Config } from './pages/Config'
import { Dashboard } from './pages/Dashboard'
import { Documents } from './pages/Documents'
import { Ledgers } from './pages/Ledgers'
import { Login } from './pages/Login'
import { Purchase } from './pages/Purchase'
import { Settings } from './pages/Settings'
import { Specifications } from './pages/Specifications'
import { Stores } from './pages/Stores'

/** Gates the whole app behind sign-in; renders the Login page when signed out. */
function AuthGate() {
  const { isAuthenticated } = useAccess()
  const [ready, setReady] = useState(false)

  // Seed the demo admin credential once (no-op when a backend is configured).
  useEffect(() => {
    ensureSeeded().finally(() => setReady(true))
  }, [])

  if (!ready) return null
  if (!isAuthenticated) return <Login />

  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="documents" element={<Documents />} />
          <Route path="specifications" element={<Specifications />} />
          <Route path="check-sheets" element={<CheckSheets />} />
          <Route
            path="purchase"
            element={
              <RequirePermission permission="purchase:view">
                <Purchase />
              </RequirePermission>
            }
          />
          <Route
            path="stores"
            element={
              <RequirePermission permission="stores:view">
                <Stores />
              </RequirePermission>
            }
          />
          <Route
            path="accounts"
            element={
              <RequirePermission permission="accounts:view">
                <Accounts />
              </RequirePermission>
            }
          />
          <Route
            path="ledgers"
            element={
              <RequirePermission permission="ledgers:view">
                <Ledgers />
              </RequirePermission>
            }
          />
          <Route path="settings" element={<Settings />} />
          <Route
            path="admin"
            element={
              <RequirePermission permission="admin:access">
                <Admin />
              </RequirePermission>
            }
          />
          <Route
            path="config"
            element={
              <RequirePermission permission="config:access">
                <Config />
              </RequirePermission>
            }
          />
        </Route>
      </Routes>
    </HashRouter>
  )
}

function App() {
  return (
    <AccessProvider>
      <ThemeProvider>
        <AuthGate />
      </ThemeProvider>
    </AccessProvider>
  )
}

export default App
