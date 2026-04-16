import React, { createContext, useContext, useEffect, useState } from 'react';

/** Minimal user shape (Shopify customer accounts are handled on the Shopify storefront). */
export interface AppUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}

export type AuthErrorLike = {
  message: string;
  name?: string;
  status?: number;
};

interface AuthContextType {
  user: AppUser | null;
  session: null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    metadata?: { name?: string }
  ) => Promise<{ error: AuthErrorLike | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthErrorLike | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthErrorLike | null }>;
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

const shopifyHint = (): AuthErrorLike => {
  const url = (import.meta.env.VITE_SHOPIFY_STORE_URL as string | undefined)?.replace(/\/$/, '');
  return {
    message: url
      ? `Las cuentas de cliente están en la tienda Shopify. Entra en ${url}/account/login`
      : 'Configura VITE_SHOPIFY_STORE_URL (dominio público de tu tienda, ej. https://tutienda.com) y usa Iniciar sesión en Shopify.',
    name: 'ShopifyAuth',
    status: 400,
  };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUser(null);
    setLoading(false);
  }, []);

  const signUp = async (_email: string, _password: string, _metadata?: { name?: string }) => {
    return { error: shopifyHint() };
  };

  const signIn = async (_email: string, _password: string) => {
    return { error: shopifyHint() };
  };

  const signOut = async () => {
    setUser(null);
  };

  const resetPassword = async (_email: string) => {
    return { error: shopifyHint() };
  };

  const value: AuthContextType = {
    user,
    session: null,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
