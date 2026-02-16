import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: { name?: string }) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Escuchar cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Cuando el usuario confirma su email y obtiene sesión, actualizar el perfil con el nombre
      if (event === 'SIGNED_IN' && session?.user) {
        const userMetadata = session.user.user_metadata;
        if (userMetadata?.name) {
          // Dividir el nombre completo en first_name y last_name
          const splitName = (fullName?: string) => {
            if (!fullName || fullName.trim() === '') {
              return { first_name: null, last_name: null };
            }
            
            const nameParts = fullName.trim().split(/\s+/);
            if (nameParts.length === 1) {
              return { first_name: nameParts[0], last_name: null };
            }
            
            const last_name = nameParts[nameParts.length - 1];
            const first_name = nameParts.slice(0, -1).join(' ');
            
            return { first_name, last_name };
          };

          const { first_name, last_name } = splitName(userMetadata.name);

          // Intentar actualizar el perfil con el nombre
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({
              first_name: first_name || null,
              last_name: last_name || null,
            })
            .eq('user_id', session.user.id);

          if (updateError && updateError.code !== 'PGRST116') {
            console.warn('No se pudo actualizar el perfil con el nombre:', updateError);
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata?: { name?: string }) => {
    // Crear usuario en Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (error) {
      return { error };
    }

    if (!data.user) {
      return { 
        error: { 
          message: 'No se pudo crear el usuario', 
          name: 'SignUpError',
          status: 500
        } as AuthError 
      };
    }

    // Dividir el nombre completo en first_name y last_name
    const splitName = (fullName?: string) => {
      if (!fullName || fullName.trim() === '') {
        return { first_name: null, last_name: null };
      }
      
      const nameParts = fullName.trim().split(/\s+/);
      if (nameParts.length === 1) {
        return { first_name: nameParts[0], last_name: null };
      }
      
      // La última palabra es el apellido, el resto es el nombre
      const last_name = nameParts[nameParts.length - 1];
      const first_name = nameParts.slice(0, -1).join(' ');
      
      return { first_name, last_name };
    };

    const { first_name, last_name } = splitName(metadata?.name);

    // Crear perfil de usuario explícitamente
    // El trigger debería crear el perfil automáticamente, pero lo creamos explícitamente para asegurar que funcione
    // Esperar un momento para asegurar que la sesión esté activa
    if (data.session) {
      // Si tenemos sesión, intentar crear/actualizar el perfil inmediatamente
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([{
          user_id: data.user.id,
          first_name: first_name || null,
          last_name: last_name || null,
        }])
        .select()
        .single();

      // Si el perfil ya existe (creado por trigger), intentar actualizarlo con el nombre
      if (profileError) {
        // Error 23505 = duplicate key (el perfil ya existe)
        if (profileError.code === '23505') {
          // Actualizar el perfil existente con el nombre
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({
              first_name: first_name || null,
              last_name: last_name || null,
            })
            .eq('user_id', data.user.id);

          if (updateError) {
            console.error('Error updating user profile:', updateError);
            // No retornar error aquí, el usuario ya fue creado exitosamente
            // Solo loguear el error para debugging
          }
        } else {
          // Si es otro tipo de error, loguearlo pero no fallar el registro
          console.error('Error creating user profile:', profileError);
          // El usuario ya fue creado en auth, así que continuamos
          // El trigger debería haber creado el perfil, así que esto es solo para agregar el nombre
        }
      }
    } else {
      // Si no hay sesión (email requiere confirmación), el trigger debería crear el perfil
      // Intentaremos actualizar el perfil más tarde cuando el usuario confirme su email
      console.log('Usuario creado pero requiere confirmación de email. El perfil se creará automáticamente.');
    }

    setUser(data.user);
    setSession(data.session);
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error };
    }

    setUser(data.user);
    setSession(data.session);
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

