import { Badge } from "@/components/ui/badge"
import type { UserRole } from "@/lib/auth/permissions"

interface RoleBadgeProps {
  role: UserRole
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const variants = {
    Admin: "default" as const,
    Lider: "secondary" as const,
    Multimedia: "outline" as const,
  }

  return <Badge variant={variants[role]}>{role}</Badge>
}
