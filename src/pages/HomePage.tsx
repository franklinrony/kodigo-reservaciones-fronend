import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { LayoutDashboard, Users, Zap } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-kodigo-gradient">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <div className="flex items-center justify-center mb-8">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl">
              <LayoutDashboard className="text-white" size={40} />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Organiza tus proyectos con{' '}
            <span className="block mt-2 text-white drop-shadow-lg">
              Kodigo Kanban
            </span>
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto drop-shadow">
            La herramienta perfecta para gestionar tus tareas y proyectos de manera visual e intuitiva. 
            Inspirado en la metodología Kanban para máxima productividad.
          </p>
          
          {isAuthenticated ? (
            <Link to="/boards">
              <Button size="lg" className="px-8 py-4 text-lg bg-white text-kodigo-primary hover:bg-gray-100 shadow-2xl">
                Ver mis tableros
              </Button>
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="px-8 py-4 text-lg bg-white text-kodigo-primary hover:bg-gray-100 shadow-2xl">
                  Comenzar gratis
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" className="px-8 py-4 text-lg bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/30 shadow-2xl">
                  Iniciar sesión
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-kodigo-gradient mb-4">
              ¿Por qué elegir Kodigo Kanban?
            </h2>
            <p className="text-lg text-gray-600">
              Diseñado para desarrolladores y equipos que buscan eficiencia
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-kodigo p-8 text-center hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-kodigo-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <LayoutDashboard className="text-kodigo-primary" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Tableros Kanban Intuitivos
              </h3>
              <p className="text-gray-600">
                Visualiza tu flujo de trabajo con tableros drag-and-drop fáciles de usar. 
                Organiza tareas en listas personalizables.
              </p>
            </div>

            <div className="card-kodigo p-8 text-center hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-kodigo-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="text-kodigo-secondary" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Colaboración en Tiempo Real
              </h3>
              <p className="text-gray-600">
                Trabaja en equipo con colaboradores, asigna tareas y mantén a todos 
                sincronizados en tiempo real.
              </p>
            </div>

            <div className="card-kodigo p-8 text-center hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-kodigo-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="text-kodigo-accent" size={32} />
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
    </div>
  );
};