-- Verificar y corregir la restricción de roles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Crear restricción con los roles correctos: Admin, Editor y Creador, Lector
ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('Admin', 'Editor y Creador', 'Lector'));

-- Actualizar roles existentes que puedan tener valores antiguos
UPDATE public.profiles 
SET role = 'Editor y Creador' 
WHERE role IN ('Editor', 'Lider', 'Multimedia');
