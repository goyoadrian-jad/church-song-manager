import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { UserForm } from "@/components/users/user-form"

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is Admin
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (profile?.role !== "Admin") {
    redirect("/dashboard/users")
  }

  // Get user to edit
  const { data: userToEdit } = await supabase.from("users").select("*").eq("id", id).single()

  if (!userToEdit) {
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
            <h1 className="text-3xl font-bold">Editar Usuario</h1>
            <p className="text-muted-foreground">Actualiza los datos del usuario</p>
          </div>
        </div>

        <UserForm user={userToEdit} />
      </div>
    </div>
  )
}
