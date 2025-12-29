# Sistema de Gestión de Repertorio para Iglesia

Sistema completo de gestión musical para iglesias con autenticación, roles de usuario y administración de canciones.

## Características

- **Autenticación con Supabase**: Sistema de login y registro seguro
- **Control de Acceso por Roles**:
  - **Admin**: Acceso completo - gestiona usuarios, tipos de canciones y canciones
  - **Líder**: Gestiona tipos de canciones y canciones (sin gestión de usuarios)
  - **Multimedia**: Solo lectura - puede ver todo el contenido

- **Gestión de Usuarios (ABM)**: CRUD completo de usuarios con roles
- **Gestión de Tipos de Canciones (ABM)**: Categorización del repertorio
- **Gestión de Canciones (ABM)**: 
  - Información completa: nombre, artista, letra, tonalidad
  - Links opcionales: YouTube, multitrack, acordes
  - Vista detallada con diseño optimizado

## Stack Tecnológico

- **Framework**: Next.js 16 con App Router
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Seguridad**: Row Level Security (RLS)
- **UI**: shadcn/ui + Tailwind CSS v4
- **Lenguaje**: TypeScript

## Estructura de la Base de Datos

### Tablas

1. **users**: Perfiles de usuario extendidos
   - first_name, last_name, email, role
   - Referencia a auth.users

2. **song_types**: Categorías de canciones
   - name, description

3. **songs**: Repertorio musical completo
   - name, artist, lyrics, key
   - youtube_link, multitrack_link, chord_chart_link
   - song_type_id (FK), created_by (FK)

### Seguridad (RLS)

Todas las tablas tienen políticas de Row Level Security:

- **users**: Admin full access, users can view all y update own
- **song_types**: Todos pueden ver, Admin/Líder pueden gestionar
- **songs**: Todos pueden ver, Admin/Líder pueden gestionar

## Instalación

1. Ejecuta los scripts SQL en orden desde la carpeta `/scripts`:
   - `001_create_tables.sql` - Crea tablas y políticas RLS
   - `002_create_user_trigger.sql` - Trigger para crear perfil automáticamente
   - `003_seed_data.sql` - Datos iniciales de tipos de canciones

2. Las variables de entorno ya están configuradas en el proyecto

3. La aplicación está lista para usar

## Uso

1. **Registro**: Crea una cuenta con email, contraseña y selecciona tu rol
2. **Confirmación**: Verifica tu email antes de iniciar sesión
3. **Dashboard**: Accede a las secciones según tu rol
4. **Gestión**: CRUD completo en cada módulo según permisos

## Permisos por Rol

| Acción | Admin | Líder | Multimedia |
|--------|-------|-------|------------|
| Ver Usuarios | ✓ | ✓ | ✓ |
| Gestionar Usuarios | ✓ | ✗ | ✗ |
| Ver Tipos | ✓ | ✓ | ✓ |
| Gestionar Tipos | ✓ | ✓ | ✗ |
| Ver Canciones | ✓ | ✓ | ✓ |
| Gestionar Canciones | ✓ | ✓ | ✗ |

## Diseño

Diseño minimalista con toques musicales:
- Gradientes sutiles de fondo
- Iconos musicales (notas, micrófonos)
- Paleta de colores sobria y profesional
- Optimizado para móvil y desktop
