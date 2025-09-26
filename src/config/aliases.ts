// Configuración de alias de rutas

// Uso de alias:
// @/ - raíz de src/
// @/components/* - src/components/*
// @/pages/* - src/pages/*
// @/services/* - src/services/*
// @/models/* - src/models/*
// @/utils/* - src/utils/*
// @/hooks/* - src/hooks/*
// @/contexts/* - src/contexts/*
// @/types/* - src/types/*

// Ejemplos de uso:
// import { Button } from '@/components/ui/Button';
// import { User, Board } from '@/models';
// import { authService } from '@/services/authService';
// import { useAuth } from '@/hooks/useAuth';

export const ALIAS_CONFIG = {
  '@': 'src/',
  '@/components': 'src/components/',
  '@/pages': 'src/pages/',
  '@/services': 'src/services/',
  '@/models': 'src/models/',
  '@/utils': 'src/utils/',
  '@/hooks': 'src/hooks/',
  '@/contexts': 'src/contexts/',
  '@/types': 'src/types/',
} as const;