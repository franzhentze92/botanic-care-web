-- Función SQL para obtener emails de usuarios desde auth.users
-- Ejecuta este script en el SQL Editor de Supabase
-- Esta función permite que los admins obtengan los emails de los usuarios

-- Eliminar función si existe
DROP FUNCTION IF EXISTS get_user_emails(UUID[]);

-- Crear función
CREATE OR REPLACE FUNCTION get_user_emails(user_ids UUID[])
RETURNS TABLE(id UUID, email TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    COALESCE(au.email, '')::TEXT as email
  FROM auth.users au
  WHERE au.id = ANY(user_ids);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Dar permisos para ejecutar la función
GRANT EXECUTE ON FUNCTION get_user_emails(UUID[]) TO authenticated;

-- Verificar que la función funciona (opcional - puedes comentar esto después)
-- SELECT * FROM get_user_emails(ARRAY['<user-id-aqui>'::UUID]);

