import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, LogOut, User, Settings } from 'lucide-react';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="navbar-kodigo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white/90 rounded-lg flex items-center justify-center shadow-sm border border-white/20">
                <LayoutDashboard className="text-kodigo-primary" size={20} />
              </div>
              {/* Hide long title on very small screens */}
              <span className="hidden sm:inline text-lg font-bold text-white">Kodigo Kanban</span>
            </Link>
          </div>

          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white/30"
              aria-label="Abrir menú"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            {isAuthenticated && (
              <>
                <Link to="/boards" className="link-on-gradient">Mis Tableros</Link>
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-white hover:text-kodigo-light transition-colors duration-200"
                  >
                        <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                      <User className="text-white" size={16} />
                    </div>
                    <span className="font-medium">{user?.name}</span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border">
                      <div className="py-1">
                        <div className="px-4 py-2 text-sm text-gray-500 border-b">{user?.email}</div>
                        <button onClick={() => { setShowUserMenu(false); }} className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full">
                          <Settings size={16} />
                          <span>Configuración</span>
                        </button>
                        <button onClick={() => { setShowUserMenu(false); logout(); }} className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full">
                          <LogOut size={16} />
                          <span>Cerrar Sesión</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {!isAuthenticated && (
                <div className="flex items-center space-x-4">
                <Link to="/login"><Button variant="gradient" className="px-3 py-2 shadow-sm">Iniciar Sesión</Button></Link>
                    <Link to="/register"><Button variant="gradient" className="px-3 py-2 shadow-sm">Registrarse</Button></Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileOpen && (
          <div className="lg:hidden mt-2 pb-4">
            <div className="space-y-2">
              {isAuthenticated ? (
                <>
                  <Link to="/boards" className="block px-3 py-2 rounded-md text-base font-medium text-white">Mis Tableros</Link>
                  <div className="border-t border-white/10 pt-2">
                    <div className="px-3 text-sm text-white/90">{user?.name}</div>
                    <div className="px-3 text-xs text-white/60">{user?.email}</div>
                    <div className="mt-2 px-3 space-y-1">
                      <button onClick={() => setMobileOpen(false)} className="w-full text-left text-white/90">Configuración</button>
                      <button onClick={() => { setMobileOpen(false); logout(); }} className="w-full text-left text-white/90">Cerrar Sesión</button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="px-3 space-x-2">
                  <Link to="/login"><Button variant="gradient" className="px-3 py-2 shadow-sm">Iniciar Sesión</Button></Link>
                      <Link to="/register"><Button variant="gradient" className="px-3 py-2 shadow-sm">Registrarse</Button></Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};