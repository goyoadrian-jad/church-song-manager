// Permission utilities for role-based access control

export type UserRole = "Admin" | "Lider" | "Multimedia"

export interface UserProfile {
  id: string
  role: UserRole
  first_name: string
  last_name: string
  email: string
}

// Permission checks
export function canManageUsers(role: UserRole): boolean {
  return role === "Admin"
}

export function canManageSongTypes(role: UserRole): boolean {
  return role === "Admin" || role === "Lider"
}

export function canManageSongs(role: UserRole): boolean {
  return role === "Admin" || role === "Lider"
}

export function canViewContent(role: UserRole): boolean {
  // All authenticated users can view content
  return true
}

// Role display helpers
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    Admin: "Administrador",
    Lider: "Líder",
    Multimedia: "Multimedia",
  }
  return roleNames[role]
}

export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    Admin: "Acceso completo al sistema. Puede gestionar usuarios, tipos de canciones y canciones.",
    Lider: "Puede gestionar tipos de canciones y canciones. No puede gestionar usuarios.",
    Multimedia: "Acceso de solo lectura. Puede ver todas las canciones y tipos.",
  }
  return descriptions[role]
}
