"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { SetlistsTable } from "./setlists-table"

interface SetlistsPageClientProps {
  setlists: any[]
  profile: {
    role: string
  }
}

export function SetlistsPageClient({ setlists, profile }: SetlistsPageClientProps) {
  const canCreate = profile.role === "Admin" || profile.role === "Editor y Creador"

  return (
    <div className="min-h-svh bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Setlists</h1>
            <p className="text-muted-foreground">Listas de canciones por reunión</p>
          </div>
          {canCreate && (
            <Button asChild>
              <Link href="/dashboard/setlists/create">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Lista
              </Link>
            </Button>
          )}
        </div>

        <SetlistsTable setlists={setlists} canEdit={canCreate} />
      </div>
    </div>
  )
}
