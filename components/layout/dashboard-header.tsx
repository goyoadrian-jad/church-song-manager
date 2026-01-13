"use client"

import { useEffect, useState } from "react"
import { UserCircle, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface DashboardHeaderProps {
  profile: {
    first_name: string
    last_name: string
    role: string
  } | null
}

export function DashboardHeader({ profile }: DashboardHeaderProps) {
  const [currentDateTime, setCurrentDateTime] = useState("")
  const router = useRouter()

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      const formatted = now.toLocaleString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      setCurrentDateTime(formatted.charAt(0).toUpperCase() + formatted.slice(1))
    }

    updateDateTime()
    const interval = setInterval(updateDateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <div className="sticky top-0 z-50 bg-background border-b shadow-sm">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-xl font-bold hover:text-primary transition-colors">
              Repertorio Iglesia
            </Link>
            <div className="hidden md:block text-sm text-muted-foreground">{currentDateTime}</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">
                {profile?.first_name} {profile?.last_name}
              </p>
              <p className="text-xs text-muted-foreground">{profile?.role}</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/profile">
                <UserCircle className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Mi Perfil</span>
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
