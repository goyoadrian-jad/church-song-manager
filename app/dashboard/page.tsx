import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ListMusic, Mic2, Calendar } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile, error } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle()

  // If profile doesn't exist, create a basic one
  if (!profile && !error) {
    const { data: newProfile } = await supabase
      .from("profiles")
      .insert({
        user_id: user.id,
        first_name: user.email?.split("@")[0] || "Usuario",
        last_name: "Nuevo",
        role: "Multimedia",
      })
      .select()
      .single()

    if (newProfile) {
      redirect("/dashboard/profile")
    }
  }

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/auth/login")
  }

  const canManageUsers = profile?.role === "Admin"
  const canManageSongTypes = profile?.role === "Admin"

  return (
    <div className="min-h-svh bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Panel de Control</h1>
          <p className="text-muted-foreground">
            Bienvenido, {profile?.first_name} {profile?.last_name} ({profile?.role})
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/dashboard/setlists">
            <Card className="hover:border-primary transition-colors cursor-pointer h-full">
              <CardHeader>
                <Calendar className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Listas de Canciones</CardTitle>
                <CardDescription>Ver listas programadas</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Consulta las canciones programadas para cada reunión</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/songs">
            <Card className="hover:border-primary transition-colors cursor-pointer h-full">
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

          {canManageSongTypes && (
            <Link href="/dashboard/song-types">
              <Card className="hover:border-primary transition-colors cursor-pointer h-full">
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
          )}

          {canManageUsers && (
            <Link href="/dashboard/users">
              <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                <CardHeader>
                  <Users className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Usuarios</CardTitle>
                  <CardDescription>Gestionar usuarios</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Ver y administrar usuarios, roles y permisos</p>
                </CardContent>
              </Card>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
