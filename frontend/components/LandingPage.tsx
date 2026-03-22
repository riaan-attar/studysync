"use client"
import React from "react"
import { CalendarClock, FileText, Zap, BookOpen, Layers, Target, ArrowRight } from "lucide-react"
import { useAuth } from "../context/AuthContext"

interface LandingPageProps {
  setCurrentView: React.Dispatch<React.SetStateAction<string>>
}

/* ─── Animated Globe ─── */
const AnimatedGlobe = () => (
  <div className="relative w-full h-full flex items-center justify-center">
    {/* Ambient glow */}
    <div className="absolute w-72 h-72 rounded-full bg-[#4dfce0]/10 blur-[80px]" />

    <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80">
      {/* Globe sphere */}
      <div className="absolute inset-0 rounded-full border border-[#4dfce0]/20 bg-gradient-to-br from-[#4dfce0]/5 via-transparent to-[#4dfce0]/3" />

      {/* Latitude lines */}
      {[0.25, 0.45, 0.55, 0.75].map((pos, i) => (
        <div
          key={`lat-${i}`}
          className="absolute left-1/2 -translate-x-1/2 border border-[#4dfce0]/10 rounded-full"
          style={{
            top: `${pos * 100}%`,
            width: `${Math.sin(pos * Math.PI) * 100}%`,
            height: '1px',
          }}
        />
      ))}

      {/* Vertical meridian */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-full border border-[#4dfce0]/10 rounded-full" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[30%] h-full border border-[#4dfce0]/8 rounded-full" />

      {/* Rotating orbit ring 1 */}
      <div className="absolute -inset-6 animate-[spin_20s_linear_infinite]">
        <div className="absolute inset-0 rounded-full border border-dashed border-[#4dfce0]/15" style={{ transform: 'rotateX(60deg) rotateZ(15deg)' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#4dfce0] shadow-[0_0_12px_rgba(77,252,224,0.6)]" />
      </div>

      {/* Rotating orbit ring 2 */}
      <div className="absolute -inset-10 animate-[spin_30s_linear_infinite_reverse]">
        <div className="absolute inset-0 rounded-full border border-dashed border-[#4dfce0]/10" style={{ transform: 'rotateX(70deg) rotateZ(-30deg)' }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-[#4dfce0]/70 shadow-[0_0_8px_rgba(77,252,224,0.4)]" />
      </div>

      {/* Rotating orbit ring 3 */}
      <div className="absolute -inset-16 animate-[spin_40s_linear_infinite]">
        <div className="absolute inset-0 rounded-full border border-[#4dfce0]/6" />
        <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#4dfce0]/50 shadow-[0_0_6px_rgba(77,252,224,0.3)]" />
      </div>

      {/* Pulsing center dot */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-4 h-4 rounded-full bg-[#4dfce0]/30 animate-[pulse-glow_3s_ease-in-out_infinite]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#4dfce0]" />
      </div>

      {/* Scattered connection dots */}
      {[
        { top: '20%', left: '35%' }, { top: '40%', left: '70%' },
        { top: '65%', left: '25%' }, { top: '30%', left: '55%' },
        { top: '75%', left: '60%' }, { top: '50%', left: '40%' },
      ].map((pos, i) => (
        <div
          key={`dot-${i}`}
          className="absolute w-1.5 h-1.5 rounded-full bg-[#4dfce0]/40"
          style={{ top: pos.top, left: pos.left, animationDelay: `${i * 0.5}s`, animation: 'pulse-glow 4s ease-in-out infinite' }}
        />
      ))}
    </div>
  </div>
);

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="glass-card rounded-xl p-6 hover:border-[rgba(77,252,224,0.2)] transition-all duration-300 group">
    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[rgba(77,252,224,0.08)] mb-4 group-hover:bg-[rgba(77,252,224,0.12)] transition-colors duration-300">
      <div className="text-[#4dfce0]">{icon}</div>
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-2">
      {title}
    </h3>
    <p className="text-[#94a3b8] text-sm leading-relaxed">{description}</p>
  </div>
);

const HowItWorksStep = ({ stepNumber, title, description, icon }: { stepNumber: number, title: string, description: string, icon: React.ReactNode }) => (
  <div className="flex flex-col items-center text-center group">
    <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl glass-accent mb-6 group-hover:glow-accent-sm transition-all duration-300">
      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#4dfce0] text-[#0a0a0f] text-xs font-bold flex items-center justify-center">
        {stepNumber}
      </span>
      <div className="text-[#4dfce0]">{icon}</div>
    </div>
    <h3 className="text-xl font-semibold text-foreground mb-3">
      {title}
    </h3>
    <p className="text-[#94a3b8] max-w-sm leading-relaxed text-sm">{description}</p>
  </div>
);

export default function LandingPage({ setCurrentView }: LandingPageProps) {
  const { isFullyAuthenticated, requestProtectedAccess } = useAuth();

  const handleGetStarted = () => {
    if (isFullyAuthenticated) {
      setCurrentView('chat');
    } else {
      requestProtectedAccess();
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col text-foreground relative overflow-x-hidden">

      {/* Section 1: Hero */}
      <section className="flex items-center justify-center grow pt-12 sm:pt-20 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-24 relative overflow-visible">
        {/* Background gradient */}
        <div className="absolute inset-0 gradient-bg pointer-events-none" />

        <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-16 z-10 relative">
          {/* Left Side: Text Content */}
          <div className="space-y-6 sm:space-y-8 text-center lg:text-left relative">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-2 tracking-tight">
              Study<br />
              <span className="gradient-text" style={{ fontSize: "1em" }}>
                Sync
              </span>
            </h1>
            <p className="text-lg sm:text-xl font-medium text-[#e2e8f0]/80 mb-2 italic">
              Never miss a moment that matters.
            </p>
            <p className="text-base sm:text-lg text-[#94a3b8] leading-relaxed max-w-xl mx-auto lg:mx-0">
              Stay ahead of your deadlines, events, and goals with your smart AI-powered planner.
              StudySync brings together schedules, updates, and insights — so student life feels
              clear and under control.
            </p>
            <button
              onClick={handleGetStarted}
              className="group inline-flex items-center gap-2 px-8 py-3.5 bg-[#4dfce0] text-[#0a0a0f] font-semibold rounded-lg text-lg hover:bg-[#3ae0c6] hover:shadow-[0_0_30px_rgba(77,252,224,0.3)] transition-all duration-300 active:scale-[0.98]"
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          {/* Right Side: Animated Globe */}
          <div className="flex relative h-[300px] sm:h-[400px] lg:h-[500px] items-center justify-center lg:order-last order-first">
            <AnimatedGlobe />
          </div>
        </div>
      </section>

      {/* Section 2: Features */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(77,252,224,0.02)] to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="space-y-3 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              An Agent That Does It <span className="gradient-text">All</span>
            </h2>
            <p className="text-lg text-[#94a3b8] max-w-3xl mx-auto leading-relaxed">
              From proactive scheduling to strategic planning, your AI companion ensures you&apos;re
              always organized and stress-free.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<CalendarClock className="w-7 h-7" />}
              title="Automated Scheduling"
              description="Automatically scans websites, emails, and PDFs for events and adds them to your calendar, so you never miss a deadline or meeting."
            />
            <FeatureCard
              icon={<FileText className="w-7 h-7" />}
              title="Document Q&A"
              description="Upload a syllabus or a research paper and ask direct questions. Get summaries and key insights instantly."
            />
            <FeatureCard
              icon={<Zap className="w-7 h-7" />}
              title="Strategic Advisor"
              description="Get personalized, step-by-step roadmaps for complex goals like preparing for a hackathon or learning a new skill."
            />
          </div>
        </div>
      </section>

      {/* Section 3: How It Works */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 relative">
        <div className="max-w-7xl mx-auto text-center">
          <div className="space-y-3 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-lg text-[#94a3b8] max-w-3xl mx-auto leading-relaxed">
              Just three easy steps to turn your messy schedule into a clear plan.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <HowItWorksStep
              stepNumber={1}
              title="Connect Accounts"
              description="Securely link your university email and calendar for seamless integration."
              icon={<Layers className="w-8 h-8" />}
            />
            <HowItWorksStep
              stepNumber={2}
              title="Ask Anything"
              description="Chat naturally to get answers, summarize documents, or generate a personalized action plan."
              icon={<BookOpen className="w-8 h-8" />}
            />
            <HowItWorksStep
              stepNumber={3}
              title="Stay Ahead"
              description="Receive important updates, manage your schedule, and achieve your academic goals with ease."
              icon={<Target className="w-8 h-8" />}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full glass py-10 px-6 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-[#64748b] text-sm">
            &copy; {new Date().getFullYear()} StudySync. All rights reserved.
          </p>
          <div className="flex justify-center space-x-8 mt-4">
            <a href="#" className="text-[#64748b] hover:text-[#4dfce0] text-sm transition-colors">Privacy</a>
            <a href="#" className="text-[#64748b] hover:text-[#4dfce0] text-sm transition-colors">Terms</a>
            <a href="#" className="text-[#64748b] hover:text-[#4dfce0] text-sm transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}