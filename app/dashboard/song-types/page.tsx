import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { SongTypesTable } from "@/components/song-types/song-types-table"

export default async function SongTypesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get current user profile
  const { data: currentProfile } = await supabase.from("users").select("*").eq("id", user.id).single()

  // Get all song types
  const { data: songTypes } = await supabase.from("song_types").select("*").order("created_at", { ascending: false })

  const canManage = currentProfile?.role === "Admin" || currentProfile?.role === "Lider"

  return (
    <div className="min-h-svh bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Tipos de Canciones</h1>
              <p className="text-muted-foreground">Gestiona las categorías del repertorio</p>
            </div>
          </div>
          {canManage && (
            <Button asChild>
              <Link href="/dashboard/song-types/create">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Tipo
              </Link>
            </Button>
          )}
        </div>

        {/* Song Types Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Tipos</CardTitle>
          </CardHeader>
          <CardContent>
            <SongTypesTable songTypes={songTypes || []} canManage={canManage} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
