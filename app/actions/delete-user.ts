"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function deleteUser(userId: string) {
  const supabase = await createClient()

  // Verify current user is admin
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    return { error: "No autenticado" }
  }

  const { data: currentProfile } = await supabase.from("profiles").select("role").eq("user_id", currentUser.id).single()

  if (!currentProfile || currentProfile.role !== "Admin") {
    return { error: "No tienes permisos para eliminar usuarios" }
  }

  // Prevent self-deletion
  if (userId === currentUser.id) {
    return { error: "No puedes eliminarte a ti mismo" }
  }

  try {
    const { data: songs, error: songsError } = await supabase
      .from("songs")
      .select("id")
      .eq("created_by", userId)
      .limit(1)

    if (songsError) throw songsError

    if (songs && songs.length > 0) {
      return { error: "No puedes eliminar este usuario porque tiene canciones creadas" }
    }

    // Delete profile (will cascade to related records)
    const { error: profileError } = await supabase.from("profiles").delete().eq("user_id", userId)

    if (profileError) throw profileError

    revalidatePath("/dashboard/users")
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting user:", error)
    return { error: error.message || "Error al eliminar usuario" }
  }
}
