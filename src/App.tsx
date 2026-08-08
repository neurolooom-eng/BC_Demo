import { HashRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { RequirePermission } from './components/RequirePermission'
import { AccessProvider } from './context/AccessContext'
import { ThemeProvider } from './context/ThemeContext'
import { Accounts } from './pages/Accounts'
import { Admin } from './pages/Admin'
import { CheckSheets } from './pages/CheckSheets'
import { Config } from './pages/Config'
import { Dashboard } from './pages/Dashboard'
import { Documents } from './pages/Documents'
import { Ledgers } from './pages/Ledgers'
import { Purchase } from './pages/Purchase'
import { Settings } from './pages/Settings'
import { Specifications } from './pages/Specifications'
import { Stores } from './pages/Stores'

function App() {
  return (
    <AccessProvider>
      <ThemeProvider>
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
      </ThemeProvider>
    </AccessProvider>
  )
}

export default App
