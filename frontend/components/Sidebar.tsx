// Sidebar.tsx — Obsidian dark glassmorphism sidebar

"use client"

import { Button } from "@/components/ui/button"
import { MessageSquare, Mail, Zap, Home as HomeIcon, LogOut, LogIn } from "lucide-react"
import React from "react"
import { useAuth } from "@/context/AuthContext"
import { signOut } from "next-auth/react"

interface SidebarProps {
  currentView: string
  setCurrentView: (view: string) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

const NavButton = ({
  isActive,
  onClick,
  children,
}: {
  isActive: boolean
  onClick: () => void
  children: React.ReactNode
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        relative justify-start w-full text-sm py-2.5 px-3 rounded-lg transition-all duration-200 font-medium
        ${isActive
          ? "bg-[rgba(77,252,224,0.1)] text-[#4dfce0]"
          : "bg-transparent text-[#94a3b8] hover:bg-white/[0.04] hover:text-[#e2e8f0]"
        }
      `}
    >
      {/* Active indicator bar */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#4dfce0] rounded-r-full shadow-[0_0_8px_rgba(77,252,224,0.4)]" />
      )}
      <div className="flex items-center">{children}</div>
    </button>
  )
}

export default function Sidebar({
  currentView,
  setCurrentView,
  sidebarOpen,
  setSidebarOpen,
}: SidebarProps) {
  const { session, status, requestProtectedAccess } = useAuth()

  const handleNavigation = (view: string) => {
    let accessGranted = true;

    if (view !== 'home') {
      accessGranted = requestProtectedAccess();
    }

    if (accessGranted) {
      setCurrentView(view)
      setSidebarOpen(false)
    }
  }

  const handleSignInClick = () => {
    requestProtectedAccess();
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 flex-col glass-sidebar p-5 md:flex ${
        sidebarOpen ? "flex" : "hidden"
      }`}
    >
      {/* Brand */}
      <div className="flex items-center gap-2 px-1 mb-1">
        <h2 className="text-xl font-bold gradient-text tracking-tight">
          StudySync
        </h2>
      </div>

      <div className="my-4 h-px w-full bg-white/[0.06]" />

      {/* Navigation */}
      <nav className="flex flex-col space-y-1 mt-1">
        <NavButton isActive={currentView === "home"} onClick={() => handleNavigation("home")}>
          <HomeIcon className="mr-3 h-4 w-4" />
          Home
        </NavButton>
        <NavButton isActive={currentView === "chat"} onClick={() => handleNavigation("chat")}>
          <MessageSquare className="mr-3 h-4 w-4" />
          Agent Chat
        </NavButton>
        <NavButton isActive={currentView === "updates"} onClick={() => handleNavigation("updates")}>
          <Mail className="mr-3 h-4 w-4" />
          Mail Updates
        </NavButton>
        <NavButton isActive={currentView === "advisor"} onClick={() => handleNavigation("advisor")}>
          <Zap className="mr-3 h-4 w-4" />
          Advisor Agent
        </NavButton>
      </nav>

      {/* User section */}
      <div className="mt-auto pt-4 border-t border-white/[0.06]">
        {status === 'authenticated' && session?.user ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[rgba(77,252,224,0.1)] flex items-center justify-center shrink-0">
                <span className="text-xs font-semibold text-[#4dfce0]">
                  {(session.user?.name || session.user?.email || '?').charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="truncate text-sm text-[#94a3b8]">
                {session.user?.name || session.user?.email}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut()}
              className="text-[#64748b] hover:text-[#ef4444] hover:bg-[rgba(239,68,68,0.08)] rounded-lg shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleSignInClick}
            className="justify-start w-full text-sm py-2.5 px-3 rounded-lg font-medium bg-[rgba(77,252,224,0.1)] text-[#4dfce0] hover:bg-[rgba(77,252,224,0.15)] border border-[rgba(77,252,224,0.2)] transition-all duration-200"
          >
            <div className="flex items-center">
              <LogIn className="mr-3 h-4 w-4" />
              Sign In
            </div>
          </Button>
        )}
      </div>
    </aside>
  )
}
