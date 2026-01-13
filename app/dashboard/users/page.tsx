import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { UsersTable } from "@/components/users/users-table"

export default async function UsersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: currentProfile } = await supabase.from("profiles").select("*").eq("user_id", user.id).single()

  const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

  const isAdmin = currentProfile?.role === "Admin"

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
              <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
              <p className="text-muted-foreground">Administra los usuarios del sistema</p>
            </div>
          </div>
          {isAdmin && (
            <Button asChild>
              <Link href="/dashboard/users/create">
                <UserPlus className="mr-2 h-4 w-4" />
                Nuevo Usuario
              </Link>
            </Button>
          )}
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <UsersTable users={profiles || []} isAdmin={isAdmin} currentUserId={user.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
