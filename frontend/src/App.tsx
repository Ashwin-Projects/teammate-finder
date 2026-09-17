import React, { useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useStore } from "./store/useStore"
import { Layout } from "./components/Layout"
import { Landing } from "./pages/Landing"
import { Login } from "./pages/Login"
import { Signup } from "./pages/Signup"
import { Dashboard } from "./pages/Dashboard"
import { Profile } from "./pages/Profile"
import { Messages } from "./pages/Messages"
import { Settings } from "./pages/Settings"

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user, fetchCurrentUser, authLoading } = useStore()

  useEffect(() => {
    if (token && !user) {
      fetchCurrentUser().catch((err) => {
        console.error("Token authentication failed:", err)
      })
    }
  }, [token, user, fetchCurrentUser])

  if (authLoading && !user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-sm">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="font-mono text-[12px] text-text-dim">Verifying user credentials...</p>
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default function App() {
  const { connectSocket, user } = useStore()

  // Automatically connect sockets when user is logged in
  useEffect(() => {
    if (user) {
      connectSocket()
    }
  }, [user, connectSocket])

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          
          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  )
}
