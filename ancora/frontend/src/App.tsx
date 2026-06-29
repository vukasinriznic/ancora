import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Home from './pages/Home'
import AuthShell from './components/AuthShell'
import Login from './pages/Login'
import Register from './pages/Register'
import Verify from './pages/Verify'
import NotFound from './pages/NotFound'

function App() {
  const { i18n } = useTranslation()

  // Sinhronizuje <html lang=""> sa aktivnim jezikom → screen readeri + SEO
  useEffect(() => {
    document.documentElement.lang = i18n.language?.startsWith('sr') ? 'sr' : 'en'
  }, [i18n.language])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Nested layout: AuthShell ostaje mirno mounted, kartice se animiraju */}
        <Route element={<AuthShell />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<Verify />} />
        </Route>
        {/* Catch-all → 404 u istom stilu */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
