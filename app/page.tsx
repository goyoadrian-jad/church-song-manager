import { Button } from "@/components/ui/button"
import { Music2, Users, ListMusic, Mic2 } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-svh w-full bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-6 py-16">
        <div className="flex flex-col items-center justify-center gap-12 text-center">
          {/* Hero Section */}
          <div className="flex flex-col items-center gap-4 max-w-3xl">
            <div className="flex items-center gap-3">
              <Music2 className="h-16 w-16 text-primary" />
              <h1 className="text-5xl font-bold tracking-tight">Repertorio Iglesia</h1>
            </div>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Sistema completo de gestión musical para tu congregación. Organiza canciones, gestiona el equipo y mantén
              todo tu repertorio en un solo lugar.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-8">
            <div className="flex flex-col items-center gap-3 p-6 rounded-lg border bg-card">
              <Users className="h-10 w-10 text-primary" />
              <h3 className="font-semibold text-lg">Gestión de Usuarios</h3>
              <p className="text-sm text-muted-foreground">Administra roles: Admin, Líder y Multimedia</p>
            </div>
            <div className="flex flex-col items-center gap-3 p-6 rounded-lg border bg-card">
              <ListMusic className="h-10 w-10 text-primary" />
              <h3 className="font-semibold text-lg">Organiza Canciones</h3>
              <p className="text-sm text-muted-foreground">Letras, tonalidades, links de YouTube y multitrack</p>
            </div>
            <div className="flex flex-col items-center gap-3 p-6 rounded-lg border bg-card">
              <Mic2 className="h-10 w-10 text-primary" />
              <h3 className="font-semibold text-lg">Tipos de Repertorio</h3>
              <p className="text-sm text-muted-foreground">Clasifica: Adoración, Congregacional, Especial y más</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/auth/login">Iniciar Sesión</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 bg-transparent">
              <Link href="/auth/sign-up">Registrarse</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
