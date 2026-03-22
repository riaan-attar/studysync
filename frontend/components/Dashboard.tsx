"use client"

import { Button } from "@/components/ui/button"
import { Menu as MenuIcon } from "lucide-react"
import Sidebar from "./Sidebar"
import ChatSection from "./ChatSection"
import AdvisorView from "./AdvisorView"
import UpdatesView from "./UpdatesView"
import ProfileView from './ProfileView';
import { useAuth } from '../context/AuthContext';
import React, { useState } from "react"
import LandingPage from "./LandingPage"

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentView, setCurrentView] = useState("home")

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return <LandingPage setCurrentView={setCurrentView} />;
      case 'chat':
        return <ChatSection />;
      case 'updates':
        return <UpdatesView />;
      case 'advisor':
        return <AdvisorView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <LandingPage setCurrentView={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-foreground flex relative">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="ambient-orb w-[600px] h-[600px] -top-[200px] -left-[100px]" />
        <div className="ambient-orb w-[400px] h-[400px] bottom-[10%] right-[5%] opacity-[0.06]" />
      </div>

      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile hamburger */}
      <Button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-60 md:hidden"
        variant="outline"
        size="icon"
      >
        <MenuIcon className="w-5 h-5" />
      </Button>

      {/* Main content */}
      <main className="flex flex-1 flex-col transition-all duration-300 md:pl-64 relative z-10">
        {renderContent()}
      </main>
    </div>
  )
}
