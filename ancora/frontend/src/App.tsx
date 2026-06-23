import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Home from './pages/Home'

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
      </Routes>
    </BrowserRouter>
  )
}

export default App
