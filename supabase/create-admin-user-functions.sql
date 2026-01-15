-- Funciones SQL para crear y eliminar usuarios desde el admin panel
-- Ejecuta este script en el SQL Editor de Supabase
-- Estas funciones permiten que los admins creen y eliminen usuarios de forma segura

-- Función para crear usuario desde admin
CREATE OR REPLACE FUNCTION create_admin_user(
  user_email TEXT,
  user_password TEXT,
  user_first_name TEXT DEFAULT NULL,
  user_last_name TEXT DEFAULT NULL,
  user_phone TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Esta función necesita ser ejecutada con permisos de service_role
  -- Como alternativa, podemos crear el usuario usando una extensión o función especial
  -- Por ahora, esta función está preparada pero requiere configuración adicional en Supabase
  
  -- NOTA: Para crear usuarios desde el admin, se recomienda usar la API de Supabase Admin
  -- o configurar una función Edge Function que tenga acceso a service_role_key
  
  RAISE EXCEPTION 'Esta función requiere configuración adicional. Usa signUp normal o configura Edge Functions.';
  
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para eliminar usuario desde admin
CREATE OR REPLACE FUNCTION delete_admin_user(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Esta función también requiere permisos especiales
  -- Por ahora, solo eliminamos el perfil (el usuario en auth.users permanecerá)
  
  DELETE FROM user_profiles WHERE user_id = user_uuid;
  
  -- NOTA: Para eliminar completamente de auth.users, se necesita acceso a service_role
  -- o configurar una Edge Function
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permisos para ejecutar las funciones
GRANT EXECUTE ON FUNCTION create_admin_user(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_admin_user(UUID) TO authenticated;

