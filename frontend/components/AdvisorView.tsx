"use client"
import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import MyRoadmaps from "@/app/components/MyRoadmaps"
import GenerateRoadmap from "@/app/components/GenerateRoadmap"

import { useAuth } from "@/context/AuthContext"

// Tab button with accent indicator
const TabButton = ({ isActive, onClick, children }: { isActive: boolean, onClick: () => void, children: React.ReactNode }) => (
  <Button
    onClick={onClick}
    variant="ghost"
    className={`pb-2 text-sm font-medium rounded-none border-b-2 transition-all duration-200
      ${isActive
        ? 'text-[#4dfce0] border-[#4dfce0]'
        : 'text-[#64748b] border-transparent hover:text-[#94a3b8]'
      }
    `}
  >
    {children}
  </Button>
)

export default function AdvisorView() {
  const [view, setView] = useState<'generate' | 'my_roadmaps'>('generate');
  const { session, isFullyAuthenticated, requestProtectedAccess } = useAuth()

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center glass px-6 py-4 justify-between flex-wrap">
        <h1 className="text-xl font-semibold text-foreground">
          Advisor Agent
        </h1>
      </header>

      {/* Tab Navigation */}
      <div className="px-6 border-b border-white/[0.06]">
        <div className="flex gap-4">
          <TabButton isActive={view === 'generate'} onClick={() => setView('generate')}>
            Generate New
          </TabButton>
          <TabButton isActive={view === 'my_roadmaps'} onClick={() => setView('my_roadmaps')}>
            My Roadmaps
          </TabButton>
        </div>
      </div>

      {/* Conditional View Rendering */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="w-full max-w-4xl mx-auto">
          {view === 'generate' && (
            <GenerateRoadmap
              session={session}
              isFullyAuthenticated={isFullyAuthenticated}
              requestProtectedAccess={requestProtectedAccess}
            />
          )}
          {view === 'my_roadmaps' && (
            <MyRoadmaps
              session={session}
              isFullyAuthenticated={isFullyAuthenticated}
            />
          )}
        </div>
      </div>
    </div>
  )
}