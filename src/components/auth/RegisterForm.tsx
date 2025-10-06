import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';

export const RegisterForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, isAuthenticated, loading: authLoading } = useAuth();
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
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Validación cliente: contraseña mínima
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password, confirmPassword);
      // La navegación se manejará en el useEffect cuando isAuthenticated cambie
    } catch (errUnknown) {
      console.error('RegisterForm - error en register():', errUnknown);
      // Intentar extraer mensajes de validación del servidor (ApiError.errors)
      const apiErr = errUnknown as { errors?: Record<string, string[]>; message?: string };
      if (apiErr && typeof apiErr === 'object' && apiErr.errors) {
        try {
          const messages = Object.values(apiErr.errors).flat().filter(Boolean) as string[];
          if (messages.length > 0) {
            setError(messages.join(' - '));
          } else {
            setError(apiErr.message || 'Error en el registro');
          }
        } catch (parseErr) {
          console.error('RegisterForm - error parsing ApiError.errors', parseErr);
          setError(apiErr.message || 'Error en el registro');
        }
      } else {
        setError(errUnknown instanceof Error ? errUnknown.message : 'Error en el registro');
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
              <User className="h-6 w-6 text-white" />
            </div>
          </div>
          <h2 className="text-center text-3xl font-extrabold text-kodigo-gradient">
            Únete a Kodigo
          </h2>
          <h3 className="mt-2 text-center text-xl font-bold text-gray-900">
            Crear Cuenta
          </h3>
          <p className="mt-2 text-center text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-medium text-kodigo-primary hover:text-kodigo-dark transition-colors duration-200">
              Inicia sesión aquí
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
              label="Nombre Completo"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              icon={<User className="h-5 w-5 text-gray-400" />}
            />

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

            <Input
              label="Confirmar Contraseña"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              Crear Cuenta
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};