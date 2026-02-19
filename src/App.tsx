import { useState, useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { supabase } from "./services/supabase"
import Login from "./pages/Login.tsx"
import DashboardAdmin from "./pages/DashboardAdmin.tsx"
import DashboardLeader from "./pages/DashboardLeader.tsx"
import DashboardMember from "./pages/DashboardMember.tsx"
import DashboardLayout from "./components/layout/DashboardLayout.tsx"
import Membros from "./modules/membros/Membros.tsx"
import GerenciamentoDepartamentos from "./pages/GerenciamentoDepartamentos.tsx"
import GerenciamentoPastores from "./pages/GerenciamentoPastores.tsx"

function App() {
  const [session, setSession] = useState<any>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchRole(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchRole(session.user.id)
      else {
        setRole(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchRole(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Erro ao buscar role:', error)
      } else {
        setRole(data?.role || "member")
      }
    } catch (err) {
      console.error("Erro inesperado ao buscar role:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-slate-900 text-white font-bold">Carregando Sistema...</div>
  }

  if (!session) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route
          path="/dashboard"
          element={
            <DashboardLayout>
              {role === "admin" && <DashboardAdmin />}
              {role === "leader" && <DashboardLeader />}
              {role === "member" && <DashboardMember />}
            </DashboardLayout>
          }
        />

        <Route
          path="/membros"
          element={
            <DashboardLayout>
              <Membros />
            </DashboardLayout>
          }
        />

        <Route
          path="/departamentos"
          element={
            <DashboardLayout>
              <GerenciamentoDepartamentos />
            </DashboardLayout>
          }
        />

        <Route
          path="/pastores"
          element={
            <DashboardLayout>
              <GerenciamentoPastores />
            </DashboardLayout>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
