import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { UserForm } from "@/components/users/user-form"

export default async function CreateUserPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("user_id", user.id).single()

  if (profile?.role !== "Admin") {
    redirect("/dashboard/users")
  }

  return (
    <div className="min-h-svh bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-6 py-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/users">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Crear Nuevo Usuario</h1>
            <p className="text-muted-foreground">Completa los datos del usuario</p>
          </div>
        </div>

        <UserForm />
      </div>
    </div>
  )
}
