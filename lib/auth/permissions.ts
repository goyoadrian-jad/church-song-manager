// Permission utilities for role-based access control

export type UserRole = "Admin" | "Editor y Creador" | "Lector"

export interface UserProfile {
  id: string
  role: UserRole
  first_name: string
  last_name: string
  email: string
}

// Permission checks
export function canManageUsers(role: UserRole): boolean {
  // Solo Admin puede gestionar usuarios
  return role === "Admin"
}

export function canManageSongTypes(role: UserRole): boolean {
  // Solo Admin puede gestionar tipos de canciones
  return role === "Admin"
}

export function canCreateSongs(role: UserRole): boolean {
  // Admin y Editor pueden crear canciones
  return role === "Admin" || role === "Editor y Creador"
}

export const canCreateSong = canCreateSongs

export function canEditSongs(role: UserRole): boolean {
  // Solo Admin puede editar canciones
  return role === "Admin"
}

export function canDeleteSongs(role: UserRole): boolean {
  // Solo Admin puede eliminar canciones
  return role === "Admin"
}

export function canViewContent(role: UserRole): boolean {
  // Todos los usuarios autenticados pueden ver contenido
  return true
}

// Role display helpers
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    Admin: "Administrador",
    "Editor y Creador": "Editor y Creador",
    Lector: "Lector",
  }
  return roleNames[role]
}

export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    Admin:
      "Acceso completo al sistema. Puede gestionar usuarios, tipos de canciones y todas las operaciones con canciones.",
    "Editor y Creador": "Puede crear nuevas canciones. No puede editar, eliminar ni gestionar usuarios o tipos.",
    Lector: "Acceso de solo lectura. Puede ver todas las canciones y usar los filtros de búsqueda.",
  }
  return descriptions[role]
}
