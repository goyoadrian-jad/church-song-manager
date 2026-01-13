import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { RoleBadge } from "@/components/ui/role-badge"
import { getRoleDescription } from "@/lib/auth/permissions"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user.id).single()

  if (!profile) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-svh bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-6 py-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Mi Perfil</h1>
            <p className="text-muted-foreground">Información de tu cuenta</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>Detalles de tu cuenta en el sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Nombre Completo</p>
                <p className="text-lg font-medium">
                  {profile.first_name} {profile.last_name}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Correo Electrónico</p>
                <p className="text-lg font-medium">{user.email}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Rol</p>
                <div className="mt-1">
                  <RoleBadge role={profile.role} />
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Descripción del Rol</p>
                <p className="text-sm leading-relaxed mt-1">{getRoleDescription(profile.role)}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Miembro desde</p>
                <p className="text-sm">
                  {new Date(profile.created_at).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
