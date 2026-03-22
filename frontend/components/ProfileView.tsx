"use client"
import React, { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, User, Phone, MapPin, AlignLeft, Calendar as CalendarIcon, Save, Image as ImageIcon } from "lucide-react"
import Image from "next/image"

interface UserProfile {
  name: string
  email: string
  phone_number: string | null
  address: string | null
  bio: string | null
  date_of_birth: string | null
  profile_image: string | null
}

const AVATAR_OPTIONS = [
  { id: 'default', src: '/avatars/male_avatar.svg', label: 'Male Avatar' },
  { id: 'default_female', src: '/avatars/female_avatar.svg', label: 'Female Avatar' }
]

export default function ProfileView() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`
        }
      });
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
      } else {
        throw new Error('Failed to fetch profile')
      }
    } catch (error) {
      console.error(error)
      setMessage({ text: 'Error fetching profile.', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfile(prev => prev ? { ...prev, [name]: value } : null)
  }

  const handleAvatarSelect = (src: string) => {
    setProfile(prev => prev ? { ...prev, profile_image: src } : null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setIsSaving(true)
    setMessage(null)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify({
          name: profile.name,
          phone_number: profile.phone_number,
          address: profile.address,
          bio: profile.bio,
          date_of_birth: profile.date_of_birth,
          profile_image: profile.profile_image
        })
      });

      if (res.ok) {
        setMessage({ text: 'Profile updated successfully!', type: 'success' })
        const updated = await res.json()
        setProfile(updated)
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      console.error(error)
      setMessage({ text: 'Error updating profile. Please try again.', type: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#4dfce0]" />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar relative px-4 sm:px-6 py-6 sm:py-8">
      {/* Background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-20 bg-gradient-to-br from-[#4dfce0]/20 to-transparent blur-[120px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Your Profile</h1>
          <p className="text-[#94a3b8] mt-2 text-sm">Manage your personal information and avatar</p>
        </div>

        {message && (
          <div className={`p-4 rounded-lg border text-sm flex items-center ${
            message.type === 'success' 
              ? 'bg-[#4dfce0]/10 border-[#4dfce0]/20 text-[#4dfce0]' 
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Avatar & Basic Info */}
            <div className="space-y-8 lg:col-span-1">
              {/* Profile Avatar Selection */}
              <div className="glass-card rounded-xl p-6 border border-white/[0.08] shadow-lg flex flex-col items-center">
                <div className="relative w-32 h-32 rounded-full mb-6 overflow-hidden border-2 border-[#4dfce0]/30 shadow-[0_0_20px_rgba(77,252,224,0.15)] bg-black/40">
                  <Image 
                    src={profile?.profile_image || AVATAR_OPTIONS[0].src} 
                    alt="Current Avatar" 
                    fill 
                    className="object-cover"
                  />
                </div>
                
                <h3 className="text-sm font-semibold text-foreground mb-4 w-full text-center flex items-center justify-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#4dfce0]" />
                  Select Avatar
                </h3>
                
                <div className="flex gap-4 justify-center w-full">
                  {AVATAR_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleAvatarSelect(opt.src)}
                      className={`relative w-14 h-14 rounded-full overflow-hidden border-2 transition-all duration-300 ${
                        profile?.profile_image === opt.src || (!profile?.profile_image && opt.id === 'default')
                          ? 'border-[#4dfce0] shadow-[0_0_15px_rgba(77,252,224,0.4)] scale-110'
                          : 'border-transparent hover:border-white/20 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image src={opt.src} alt={opt.label} fill className="object-cover p-1 bg-black/40 rounded-full" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Details Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card rounded-xl p-6 border border-white/[0.08] shadow-lg space-y-5">
                <h2 className="text-lg font-semibold text-white border-b border-white/[0.08] pb-3 mb-5">
                  Personal Details
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[#94a3b8] flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-[#4dfce0]" /> Full Name
                    </label>
                    <Input 
                      name="name"
                      value={profile?.name || ""}
                      onChange={handleChange}
                      placeholder="Jane Doe"
                      className="glass-input h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[#94a3b8] flex items-center gap-2 opacity-70">
                      Email Address (Read-only)
                    </label>
                    <Input 
                      value={profile?.email || ""}
                      readOnly
                      className="glass-input h-11 opacity-50 cursor-not-allowed bg-black/40"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[#94a3b8] flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#4dfce0]" /> Phone Number
                    </label>
                    <Input 
                      name="phone_number"
                      value={profile?.phone_number || ""}
                      onChange={handleChange}
                      placeholder="+1 (555) 000-0000"
                      className="glass-input h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[#94a3b8] flex items-center gap-2">
                      <CalendarIcon className="w-3.5 h-3.5 text-[#4dfce0]" /> Date of Birth
                    </label>
                    <Input 
                      name="date_of_birth"
                      type="date"
                      value={profile?.date_of_birth || ""}
                      onChange={handleChange}
                      className="glass-input h-11 text-white [color-scheme:dark]"
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-medium text-[#94a3b8] flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#4dfce0]" /> Address
                    </label>
                    <Input 
                      name="address"
                      value={profile?.address || ""}
                      onChange={handleChange}
                      placeholder="123 University Ave, City, Country"
                      className="glass-input h-11"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-medium text-[#94a3b8] flex items-center gap-2">
                      <AlignLeft className="w-3.5 h-3.5 text-[#4dfce0]" /> Bio
                    </label>
                    <Textarea 
                      name="bio"
                      value={profile?.bio || ""}
                      onChange={handleChange}
                      placeholder="Tell us a little about yourself, your major, or your goals..."
                      className="glass-input min-h-[120px] resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="w-full sm:w-auto px-8 py-5 sm:py-6 rounded-lg font-semibold bg-[#4dfce0] text-[#0a0a0f] hover:bg-[#3ae0c6] hover:shadow-[0_0_20px_rgba(77,252,224,0.3)] transition-all flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
