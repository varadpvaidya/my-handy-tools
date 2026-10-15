
import PressureVesselCalculator from './tools/pressure-vessel-calculator/PressureVesselCalculator'

import { useEffect, useState } from 'react'
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Wrench,
} from 'lucide-react'

function AppLayout() {
  const [dark, setDark] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  }, [dark])

  const isCalculator = location.pathname === '/tools/pressure-vessel-calculator'

  return (
    <div className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className="sidebar">
        <Link to="/" className="brand" aria-label="My Handy Tools home">
          <span className="brand-icon"><Wrench size={19} /></span>
          {!collapsed && <span>My Handy Tools</span>}
        </Link>

        <nav className="side-nav">
          <Link to="/" className={`nav-link ${!isCalculator ? 'active' : ''}`}>
            <Calculator size={18} />
            {!collapsed && <span>Tools</span>}
          </Link>
        </nav>

        <button
          className="sidebar-collapse"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
        </button>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <Link to="/" className="mobile-brand">
            <Wrench size={18} />
            <span>My Handy Tools</span>
          </Link>

          <div className="topbar-spacer" />

          <button
            className="icon-button theme-toggle"
            onClick={() => setDark(!dark)}
            aria-label={`Switch to ${dark ? 'light' : 'dark'} theme`}
            title={`Switch to ${dark ? 'light' : 'dark'} theme`}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        <div className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route
              path="/tools/pressure-vessel-calculator"
              element={<ToolPlaceholder />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

function Dashboard() {
  return (
    <section className="dashboard">
      <h1>Tools</h1>

      <div className="tool-list">
        <Link
          to="/tools/pressure-vessel-calculator"
          className="tool-row"
        >
          <span className="tool-icon">
            <Calculator size={19} />
          </span>
          <span className="tool-name">Pressure Vessel Calculator</span>
          <ArrowRight size={17} className="tool-arrow" />
        </Link>
      </div>
    </section>
  )
}


function ToolPlaceholder() {
  const navigate = useNavigate()

  return (
    <section className="placeholder-page">
      <button className="back-button" onClick={() => navigate('/')}>
        <ArrowLeft size={17} />
        <span>Back to Tools</span>
      </button>

      <PressureVesselCalculator />
    </section>
  )
}


function NotFound() {
  return (
    <section className="placeholder-page">
      <h1>Page not found</h1>
      <Link to="/" className="back-link">Back to Tools</Link>
    </section>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}
