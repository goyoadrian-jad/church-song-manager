"use server"

import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import { createClient as createServerClient } from "@/lib/supabase/server"

export async function createUser(formData: {
  email: string
  password: string
  firstName: string
  lastName: string
  role: string
}) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()

    if (!currentUser) {
      return { error: "No autenticado" }
    }

    // Verificar rol de admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("user_id", currentUser.id).single()

    if (!profile || profile.role !== "Admin") {
      return { error: "No tienes permisos para crear usuarios" }
    }

    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers?.users.find((u) => u.email === formData.email)

    let userId: string

    if (existingUser) {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", existingUser.id)
        .maybeSingle()

      if (existingProfile) {
        return { error: "Ya existe un usuario con este correo electrónico y perfil creado" }
      }

      // Tiene cuenta auth pero no perfil, crear solo el perfil
      userId = existingUser.id
    } else {
      // Usuario no existe, crear cuenta nueva
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true,
        user_metadata: {
          first_name: formData.firstName,
          last_name: formData.lastName,
        },
      })

      if (authError) {
        return { error: authError.message }
      }

      if (!authData.user) {
        return { error: "No se pudo crear el usuario" }
      }

      userId = authData.user.id
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      user_id: userId,
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      role: formData.role,
    })

    if (profileError) {
      // Si el usuario fue recién creado y falla el perfil, eliminar el usuario
      if (!existingUser) {
        await supabaseAdmin.auth.admin.deleteUser(userId)
      }
      return { error: profileError.message }
    }

    revalidatePath("/dashboard/users")
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error desconocido" }
  }
}

export async function updateUser(
  userId: string,
  formData: {
    firstName: string
    lastName: string
    email: string
    role: string
    password?: string
  },
) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()

    if (!currentUser) {
      return { error: "No autenticado" }
    }

    // Verificar permisos
    const { data: profile } = await supabase.from("profiles").select("role").eq("user_id", currentUser.id).single()

    if (!profile || profile.role !== "Admin") {
      return { error: "No tienes permisos para editar usuarios" }
    }

    // Actualizar perfil
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        role: formData.role,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)

    if (profileError) {
      return { error: profileError.message }
    }

    // Si hay nueva contraseña, actualizar
    if (formData.password) {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        },
      )

      const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: formData.password,
      })

      if (passwordError) {
        return { error: passwordError.message }
      }
    }

    revalidatePath("/dashboard/users")
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Error desconocido" }
  }
}
