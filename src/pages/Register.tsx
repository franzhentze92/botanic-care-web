import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle, Loader2, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import Layout from '@/components/Layout';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();

  const validatePassword = (pwd: string) => {
    return pwd.length >= 6;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validatePassword(password)) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUp(email, password, { name });

      if (error) {
        // Traducir mensajes de error comunes a español
        let errorMessage = error.message;
        
        if (error.message.includes('already registered') || error.message.includes('already exists') || error.message.includes('already been registered')) {
          errorMessage = 'Este correo electrónico ya está registrado. Por favor, inicia sesión o usa otro correo.';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Por favor, ingresa un correo electrónico válido.';
        } else if (error.message.includes('Password')) {
          errorMessage = 'La contraseña no cumple con los requisitos.';
        } else if (error.message.includes('Database error') || error.message.includes('database')) {
          errorMessage = 'Error al guardar los datos. Por favor, intenta nuevamente.';
        }
        
        setError(errorMessage);
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error('Error during registration:', err);
      setError(err?.message || 'Ocurrió un error inesperado. Por favor, intenta nuevamente.');
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 font-editorial-new">
              Crea Tu <span className="text-[#7d8768]">Cuenta</span>
            </h1>
            <p className="text-gray-600 font-audrey">Únete a nuestra comunidad de cuidado natural</p>
          </div>

          <Card className="border border-gray-200 shadow-2xl bg-white">
            <CardHeader>
              <CardTitle className="text-2xl font-editorial-new">Registro</CardTitle>
              <CardDescription className="font-body">
                Completa el formulario para crear tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name" className="font-body">
                    Nombre Completo
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tu nombre completo"
                      className="pl-10 border-gray-200 focus:border-[#7d8768] focus:ring-[#7d8768] rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="font-gilda-display">
                    Correo Electrónico
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="pl-10 border-gray-200 focus:border-[#7d8768] focus:ring-[#7d8768] rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="font-gilda-display">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="pl-10 pr-10 border-gray-200 focus:border-[#7d8768] focus:ring-[#7d8768] rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {password && !validatePassword(password) && (
                    <p className="text-xs text-red-500 font-body">
                      La contraseña debe tener al menos 6 caracteres
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="font-gilda-display">
                    Confirmar Contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirma tu contraseña"
                      className="pl-10 pr-10 border-gray-200 focus:border-[#7d8768] focus:ring-[#7d8768] rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-500 font-body">
                      Las contraseñas no coinciden
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !validatePassword(password) || password !== confirmPassword}
                  className="w-full bg-[#7d8768] hover:bg-[#6d7660] text-white font-body py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creando cuenta...
                    </>
                  ) : (
                    'Crear Cuenta'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 font-body">
                  ¿Ya tienes una cuenta?{' '}
                  <Link
                    to="/login"
                    className="text-[#7d8768] hover:underline font-body"
                  >
                    Inicia sesión aquí
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Register;

