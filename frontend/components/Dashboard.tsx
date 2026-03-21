"use client"

import { Button } from "@/components/ui/button"
import { Menu as MenuIcon } from "lucide-react"
import Sidebar from "./Sidebar"
import ChatSection from "./ChatSection"
import AdvisorView from "./AdvisorView"
import UpdatesView from "./UpdatesView"
import React, { useState } from "react"
import LandingPage from "./LandingPage"

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentView, setCurrentView] = useState("home")

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
        {currentView === "home" && (
          <LandingPage setCurrentView={setCurrentView} />
        )}
        {currentView === "chat" && <ChatSection />}
        {currentView === "updates" && <UpdatesView />}
        {currentView === "advisor" && <AdvisorView />}
      </main>
    </div>
  )
}
