// Sidebar.tsx — Obsidian dark glassmorphism sidebar

"use client"

import { Button } from "@/components/ui/button"
import { HomeIcon, MessageSquare, Mail, Zap, LogOut, Loader2, User, LogIn } from "lucide-react"
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

  const navItems = [
    { id: 'home', label: 'Home', icon: HomeIcon, protected: false },
    { id: 'chat', label: 'Agent Chat', icon: MessageSquare, protected: true },
    { id: 'updates', label: 'Mail Updates', icon: Mail, protected: true },
    { id: 'advisor', label: 'Advisor Agent', icon: Zap, protected: true },
    { id: 'profile', label: 'Profile', icon: User, protected: true },
  ];

  const handleNavigation = (view: string) => {
    const item = navItems.find(item => item.id === view);
    let accessGranted = true;

    if (item?.protected) {
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
      className={`fixed inset-y-0 left-0 z-50 w-64 max-w-[calc(100vw-3rem)] flex-col glass-sidebar p-5 transition-transform duration-300 md:flex ${
        sidebarOpen ? "translate-x-0 flex" : "-translate-x-full hidden md:translate-x-0 md:flex"
      }`}
    >
      {/* Brand */}
      <div className="flex items-center gap-2 px-1 mb-1 pl-12 md:pl-1">
        <h2 className="text-xl font-bold gradient-text tracking-tight">
          StudySync
        </h2>
      </div>

      <div className="my-4 h-px w-full bg-white/[0.06]" />

      {/* Navigation */}
      <nav className="flex flex-col space-y-1 mt-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavButton
              key={item.id}
              isActive={currentView === item.id}
              onClick={() => handleNavigation(item.id)}
            >
              <Icon className="mr-3 h-4 w-4" />
              {item.label}
            </NavButton>
          );
        })}
      </nav>

      {/* User section */}
      <div className="mt-auto pt-4 border-t border-white/[0.08] bg-black/20 backdrop-blur-md -mx-5 px-5 pb-5">
        {status === 'authenticated' && session?.user ? (
          <div className="flex items-center justify-between px-2">
            <div
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => handleNavigation('profile')}
            >
              <div className="w-8 h-8 rounded-full bg-[#4dfce0]/20 flex items-center justify-center border border-[#4dfce0]/30 group-hover:bg-[#4dfce0]/30 transition-colors">
                <span className="text-sm font-semibold text-[#4dfce0]">
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
