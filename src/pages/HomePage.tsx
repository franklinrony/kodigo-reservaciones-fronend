import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { LayoutDashboard, Users, Zap } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Organiza tus proyectos con{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Kodigo Kanban
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            La herramienta perfecta para gestionar tus tareas y proyectos de manera visual e intuitiva. 
            Inspirado en la metodología Kanban para máxima productividad.
          </p>
          
          {isAuthenticated ? (
            <Link to="/boards">
              <Button size="lg" className="px-8 py-4 text-lg">
                Ver mis tableros
              </Button>
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="px-8 py-4 text-lg">
                  Comenzar gratis
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="lg" className="px-8 py-4 text-lg">
                  Iniciar sesión
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            ¿Por qué elegir Kodigo Kanban?
          </h2>
          <p className="text-lg text-gray-600">
            Diseñado para desarrolladores y equipos que buscan eficiencia
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <LayoutDashboard className="text-blue-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Tableros Kanban Intuitivos
            </h3>
            <p className="text-gray-600">
              Visualiza tu flujo de trabajo con tableros drag-and-drop fáciles de usar. 
              Organiza tareas en listas personalizables.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="text-purple-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Colaboración en Tiempo Real
            </h3>
            <p className="text-gray-600">
              Trabaja en equipo con colaboradores, asigna tareas y mantén a todos 
              sincronizados en tiempo real.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="text-orange-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Potente y Rápido
            </h3>
            <p className="text-gray-600">
              Interfaz optimizada con tecnología moderna. Cambia entre vista Kanban 
              y tabla según tus necesidades.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};