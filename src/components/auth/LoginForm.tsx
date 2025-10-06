import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Mail, Lock, AlertCircle } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/boards', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // La navegación se manejará en el useEffect cuando isAuthenticated cambie
    } catch (err) {
      console.error('LoginForm - error en login():', err);
      const apiErr = err as { errors?: Record<string, string[]>; message?: string };
      if (apiErr && typeof apiErr === 'object' && apiErr.errors) {
        try {
          const messages = Object.values(apiErr.errors).flat().filter(Boolean) as string[];
          if (messages.length > 0) {
            setError(messages.join(' - '));
          } else {
            setError(apiErr.message || 'Error al iniciar sesión');
          }
        } catch (parseErr) {
          console.error('LoginForm - error parsing ApiError.errors', parseErr);
          setError(apiErr.message || 'Error al iniciar sesión');
        }
      } else {
        // Si la API devolvió un mensaje genérico o 401, mostrar un texto más claro
        if (apiErr && apiErr.message && /unauthorized|credentials|invalid|401/i.test(apiErr.message)) {
          setError('Correo o contraseña incorrectos');
        } else {
          setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-kodigo-gradient py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-2xl p-8">
        <div>
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-kodigo-gradient rounded-xl flex items-center justify-center shadow-lg">
              <Mail className="h-6 w-6 text-white" />
            </div>
          </div>
          <h2 className="text-center text-3xl font-extrabold text-kodigo-gradient">
            Bienvenido a Kodigo
          </h2>
          <h3 className="mt-2 text-center text-xl font-bold text-gray-900">
            Iniciar Sesión
          </h3>
          <p className="mt-2 text-center text-sm text-gray-600">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="font-medium text-kodigo-primary hover:text-kodigo-dark transition-colors duration-200">
              Regístrate aquí
            </Link>
          </p>
          <div className="mt-2 text-center">
            <Link to="/" className="text-sm text-kodigo-primary hover:text-kodigo-dark transition-colors duration-150">Volver al inicio</Link>
          </div> 
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <Input
              label="Correo Electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              icon={<Mail className="h-5 w-5 text-gray-400" />}
            />
            
            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              icon={<Lock className="h-5 w-5 text-gray-400" />}
            />
          </div>

          <div>
            <Button
              type="submit"
              loading={loading}
              className="w-full"
              variant="gradient"
            >
              Iniciar Sesión
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};