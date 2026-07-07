import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Home from './pages/Home'
import AuthShell from './components/AuthShell'
import Login from './pages/Login'
import Register from './pages/Register'
import Verify from './pages/Verify'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Chat from './pages/Chat'
import NewChat from './pages/NewChat'
import ChatRoom from './pages/ChatRoom'
import Settings from './pages/Settings'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/ProtectedRoute'
import ChatShell from './components/ChatShell'

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
        {/* Chat — zaštićen dashboard layout (sidebar persistira), redirect na /login ako nije ulogovan */}
        <Route element={<ProtectedRoute><ChatShell /></ProtectedRoute>}>
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat/new" element={<NewChat />} />
          <Route path="/chat/:id" element={<ChatRoom />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        {/* Nested layout: AuthShell ostaje mirno mounted, kartice se animiraju */}
        <Route element={<AuthShell />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>
        {/* Catch-all → 404 u istom stilu */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
