import { Badge } from "@/components/ui/badge"
import type { UserRole } from "@/lib/auth/permissions"

interface RoleBadgeProps {
  role: UserRole
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const variants = {
    Admin: "default" as const,
    Editor: "secondary" as const,
    Lector: "outline" as const,
  }

  return <Badge variant={variants[role]}>{role}</Badge>
}
