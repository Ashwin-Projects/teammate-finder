import React, { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useStore } from "../store/useStore"
import { Button } from "./ui/button"

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { name: "Recommended", icon: "auto_awesome", path: "/dashboard" },
    { name: "Profile", icon: "person", path: "/profile" },
    { name: "AI Suggestion Hub", icon: "psychology", path: "/settings?tab=ai" },
    { name: "Messages", icon: "forum", path: "/messages" },
  ]

  const isActive = (path: string) => location.pathname === path

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  // Determine if we should show the sidebar and header
  const isAuthPage = ["/login", "/signup", "/"].includes(location.pathname)

  if (isAuthPage) {
    return <div className="min-h-screen bg-background">{children}</div>
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-background font-body-base antialiased">
      {/* Desktop SideNavBar */}
      <aside className="hidden md:flex flex-col bg-surface-container-low text-primary fixed left-0 top-0 h-screen w-[240px] border-r border-border p-md gap-base z-40 overflow-y-auto">
        <div className="mb-xl px-sm pt-sm">
          <Link to="/" className="font-headline text-headline-sm font-bold text-on-surface tracking-tight block">
            DevMatch AI
          </Link>
          <p className="font-mono text-[10px] uppercase tracking-wider text-text-dim mt-xs">AI Matchmaking</p>
        </div>

        <div className="flex flex-col gap-xs flex-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-sm px-md py-sm rounded transition-colors duration-150 ${
                isActive(item.path)
                  ? "bg-surface-container-high text-on-surface font-medium border-l-2 border-primary"
                  : "text-text-dim hover:text-on-surface hover:bg-surface-hover"
              }`}
            >
              <span className={`material-symbols-outlined text-[18px] ${isActive(item.path) ? "fill-current text-primary" : ""}`}>
                {item.icon}
              </span>
              <span className="text-body-base">{item.name}</span>
            </Link>
          ))}
        </div>

        <Button
          variant="primary"
          onClick={() => navigate("/settings?tab=ai")}
          className="w-full mt-md flex items-center justify-center gap-sm bg-primary text-on-primary font-bold"
        >
          <span className="material-symbols-outlined text-[16px]">psychology</span>
          Find a Teammate
        </Button>

        <div className="mt-auto pt-xl border-t border-border flex flex-col gap-xs">
          <Link to="/settings" className="text-text-dim hover:text-on-surface flex items-center gap-sm px-md py-xs font-mono text-[11px] tracking-wide">
            <span className="material-symbols-outlined text-[14px]">settings</span>
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="text-text-dim hover:text-error flex items-center gap-sm px-md py-xs font-mono text-[11px] tracking-wide text-left"
          >
            <span className="material-symbols-outlined text-[14px]">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-[240px] h-screen min-w-0 bg-background relative">
        {/* TopNavBar */}
        <header className="bg-surface text-primary border-b border-border sticky top-0 z-50 shrink-0">
          <div className="flex items-center justify-between px-gutter h-[48px] w-full max-w-container-max mx-auto">
            <div className="flex items-center gap-xl">
              <span className="font-headline text-[16px] font-bold text-on-surface tracking-tight md:hidden">
                DevMatch AI
              </span>
              <nav className="hidden sm:flex items-center gap-lg">
                <Link
                  to="/dashboard"
                  className={`font-medium hover:text-on-surface transition-all duration-200 px-sm py-xs rounded ${
                    isActive("/dashboard") ? "text-on-surface font-semibold" : "text-text-dim"
                  }`}
                >
                  Matching
                </Link>
                <Link
                  to="/messages"
                  className={`font-medium hover:text-on-surface transition-all duration-200 px-sm py-xs rounded ${
                    isActive("/messages") ? "text-on-surface font-semibold" : "text-text-dim"
                  }`}
                >
                  Collab Room
                </Link>
                <Link
                  to="/profile"
                  className={`font-medium hover:text-on-surface transition-all duration-200 px-sm py-xs rounded ${
                    isActive("/profile") ? "text-on-surface font-semibold" : "text-text-dim"
                  }`}
                >
                  My Profile
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-md">
              {/* Search bar */}
              <div className="relative hidden lg:block group">
                <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-[16px] text-text-dim group-focus-within:text-primary">
                  search
                </span>
                <input
                  className="bg-surface-container-high border border-border focus:border-primary text-on-surface text-body-base h-[28px] pl-8 pr-sm rounded w-[200px] outline-none transition-colors placeholder:text-text-dim"
                  placeholder="Search matching stack..."
                  type="text"
                />
              </div>

              {/* Settings / Notifications */}
              <button
                onClick={() => navigate("/settings")}
                className="text-text-dim hover:text-on-surface transition-colors p-xs"
                title="Settings"
              >
                <span className="material-symbols-outlined text-[20px]">settings</span>
              </button>

              {user && (
                <div className="flex items-center gap-sm pl-sm border-l border-border">
                  <Link to="/profile" className="flex items-center gap-xs hover:opacity-85 transition-opacity">
                    <div className="w-[28px] h-[28px] rounded-full bg-secondary-container border border-border flex items-center justify-center text-[10px] text-on-background font-bold uppercase overflow-hidden">
                      {user.name.substring(0, 2)}
                    </div>
                    <span className="text-[12px] font-mono font-medium hidden md:inline text-text-dim hover:text-on-surface">
                      {user.name}
                    </span>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-text-dim hover:text-on-surface md:hidden transition-colors p-xs"
              >
                <span className="material-symbols-outlined text-[24px]">
                  {mobileMenuOpen ? "close" : "menu"}
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-[48px] inset-x-0 bg-surface border-b border-border z-50 flex flex-col p-md gap-sm">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-sm px-md py-sm rounded transition-colors ${
                  isActive(item.path)
                    ? "bg-surface-container-high text-on-surface font-medium"
                    : "text-text-dim hover:text-on-surface hover:bg-surface-hover"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
            <div className="h-[1px] bg-border my-xs"></div>
            <div className="flex justify-between items-center px-md py-xs">
              <span className="text-[12px] text-text-dim font-mono">{user?.name}</span>
              <button onClick={handleLogout} className="text-error text-[12px] font-mono">
                Log Out
              </button>
            </div>
          </div>
        )}

        {/* Page Canvas Container */}
        <main className="flex-1 overflow-y-auto w-full min-h-0 relative">
          {children}
        </main>
      </div>
    </div>
  )
}
