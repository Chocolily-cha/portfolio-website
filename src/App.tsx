import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import Gallery from './pages/Gallery'
import Detail from './pages/Detail'
import Contact from './pages/Contact'
import Admin from './pages/Admin'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-dark-500">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery/:category" element={<Gallery />} />
          <Route path="/detail/:id" element={<Detail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
