"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react"
import { useSession, signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Define the scopes your app needs again for the sign-in function
const REQUIRED_SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/gmail.readonly",
  "openid",
  "email",
  "profile"
]

interface AuthContextType {
  session: ReturnType<typeof useSession>["data"]
  status: ReturnType<typeof useSession>["status"]
  isFullyAuthenticated: boolean
  requestProtectedAccess: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [showAuthModal, setShowAuthModal] = useState(false)

  // This state prevents us from spamming the backend
  const [isTokenStored, setIsTokenStored] = useState(false)

  const isFullyAuthenticated =
    status === "authenticated" &&
    !session?.error

  useEffect(() => {
    // This handles the "renewal" requirement.
    if (status === "authenticated" && session?.error && !showAuthModal) {
      setShowAuthModal(true)
    }
  }, [status, session, showAuthModal])

  // This automatically stores the refresh token on the backend
  useEffect(() => {
    if (isFullyAuthenticated && session.refreshToken && !isTokenStored) {
      console.log("AuthProvider: Storing refresh token...")
      setIsTokenStored(true)

      const storeToken = async () => {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL;
          const response = await fetch(`${apiUrl}/api/users/store_refresh_token`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${session.accessToken}`
            },
            body: JSON.stringify({
              refresh_token: session.refreshToken
            })
          })

          if (response.ok) {
            console.log("AuthProvider: Refresh token stored successfully.")
          } else {
            console.error("AuthProvider: Failed to store refresh token. Server response:", await response.text())
            setIsTokenStored(false)
          }
        } catch (error) {
          console.error("AuthProvider: Error storing refresh token:", error)
          setIsTokenStored(false)
        }
      }

      storeToken()
    }
  }, [isFullyAuthenticated, session, isTokenStored])

  const requestProtectedAccess = () => {
    if (isFullyAuthenticated) {
      return true
    }

    setShowAuthModal(true)
    return false
  }

  const handleSignIn = () => {
    signIn("google", undefined, {
      prompt: "consent",
      access_type: "offline",
      scope: REQUIRED_SCOPES.join(" ")
    })
  }

  return (
    <AuthContext.Provider value={{ session, status, isFullyAuthenticated, requestProtectedAccess }}>
      {children}

      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              className="relative w-full max-w-md rounded-2xl glass-modal p-8"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 p-2 rounded-lg text-[#64748b] hover:text-foreground hover:bg-white/[0.06] transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="text-center text-2xl font-bold text-foreground">
                Connect Your Account
              </h2>
              <p className="mt-4 text-center text-sm text-[#94a3b8]">
                To use the agent features, StudySync needs your permission to:
              </p>
              <ul className="my-6 space-y-3">
                <li className="flex items-center text-sm text-foreground">
                  <CheckCircle2 className="mr-3 h-5 w-5 shrink-0 text-[#4dfce0]" />
                  Read your Google emails (for Mail Updates)
                </li>
                <li className="flex items-center text-sm text-foreground">
                  <CheckCircle2 className="mr-3 h-5 w-5 shrink-0 text-[#4dfce0]" />
                  Manage your Google Calendar (to schedule events)
                </li>
              </ul>
              <p className="mb-6 text-center text-xs text-[#64748b]">
                {session?.error ? "Your permissions may have expired. Please reconnect." : "Please sign in to continue."}
              </p>
              <Button
                onClick={handleSignIn}
                className="w-full rounded-lg py-6 text-base font-semibold"
              >
                Sign In & Grant Permissions
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
