import { useEffect, useState } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { RequirePermission } from './components/RequirePermission'
import { AccessProvider, useAccess } from './context/AccessContext'
import { NavPrefsProvider } from './context/NavPrefsContext'
import { PcsDayProvider } from './context/PcsDayContext'
import { ThemeProvider } from './context/ThemeContext'
import { ensureSeeded } from './data/credentials'
import { Accounts } from './pages/Accounts'
import { Admin } from './pages/Admin'
import { CheckSheets } from './pages/CheckSheets'
import { Config } from './pages/Config'
import { Dashboard } from './pages/Dashboard'
import { DayCheckSheet } from './pages/DayCheckSheet'
import { Documents } from './pages/Documents'
import { KnowledgeBase } from './pages/KnowledgeBase'
import { Ledgers } from './pages/Ledgers'
import { Login } from './pages/Login'
import { Purchase } from './pages/Purchase'
import { Requirements } from './pages/Requirements'
import { Settings } from './pages/Settings'
import { Specifications } from './pages/Specifications'
import { Stores } from './pages/Stores'
import { Uat } from './pages/Uat'

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
            path="day-check-sheet"
            element={
              <RequirePermission permission="checksheets:view">
                <DayCheckSheet />
              </RequirePermission>
            }
          />
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
          <Route path="knowledge-base" element={<KnowledgeBase />} />
          <Route
            path="requirements"
            element={
              <RequirePermission permission="dev:access">
                <Requirements />
              </RequirePermission>
            }
          />
          <Route
            path="uat"
            element={
              <RequirePermission permission="dev:access">
                <Uat />
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
        <NavPrefsProvider>
          <PcsDayProvider>
            <AuthGate />
          </PcsDayProvider>
        </NavPrefsProvider>
      </ThemeProvider>
    </AccessProvider>
  )
}

export default App
