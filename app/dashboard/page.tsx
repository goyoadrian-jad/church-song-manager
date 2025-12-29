import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ListMusic, Mic2, LogOut, UserCircle } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/auth/login")
  }

  const canManageUsers = profile?.role === "Admin"

  return (
    <div className="min-h-svh bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Panel de Control</h1>
            <p className="text-muted-foreground">
              Bienvenido, {profile?.first_name} {profile?.last_name} ({profile?.role})
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild className="bg-transparent">
              <Link href="/dashboard/profile">
                <UserCircle className="mr-2 h-4 w-4" />
                Mi Perfil
              </Link>
            </Button>
            <form action={handleSignOut}>
              <Button variant="outline" type="submit" className="bg-transparent">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </Button>
            </form>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {canManageUsers && (
            <Link href="/dashboard/users">
              <Card className="hover:border-primary transition-colors cursor-pointer">
                <CardHeader>
                  <Users className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Usuarios</CardTitle>
                  <CardDescription>Gestionar usuarios del sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Ver y administrar usuarios, roles y permisos</p>
                </CardContent>
              </Card>
            </Link>
          )}

          <Link href="/dashboard/song-types">
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader>
                <Mic2 className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Tipos de Canciones</CardTitle>
                <CardDescription>Gestionar categorías</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Adoración, Congregacional, Especial, etc.</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/songs">
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader>
                <ListMusic className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Canciones</CardTitle>
                <CardDescription>Gestionar repertorio</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Ver, agregar y editar canciones del repertorio</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
