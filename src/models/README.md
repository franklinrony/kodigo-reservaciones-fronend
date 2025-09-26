# Modelos de Datos

Esta carpeta contiene todos los modelos de datos organizados de manera modular para mejor mantenimiento y reutilización.

## Estructura

### Modelos Principales
- **User.ts**: Modelo del usuario
- **Board.ts**: Modelo del tablero Kanban
- **BoardList.ts**: Modelo de las listas dentro de un tablero
- **Card.ts**: Modelo de las tarjetas Kanban
- **Label.ts**: Modelo de las etiquetas
- **Comment.ts**: Modelo de los comentarios
- **BoardCollaborator.ts**: Modelo de colaboradores del tablero

### Carpeta `requests/`
Contiene todos los tipos para las peticiones a la API:
- **AuthRequests.ts**: Login, registro
- **BoardRequests.ts**: Crear tablero
- **ListRequests.ts**: Crear lista
- **CardRequests.ts**: Crear/actualizar tarjeta
- **LabelRequests.ts**: Crear etiqueta
- **CommentRequests.ts**: Crear comentario

### Carpeta `responses/`
Contiene todos los tipos para las respuestas de la API:
- **AuthResponses.ts**: Respuestas de autenticación
- **ApiResponses.ts**: Respuestas genéricas de la API

## Uso

Para importar los modelos, usa:

```typescript
import { User, Board, Card, LoginRequest, AuthResponse } from '../models';
```

O desde cualquier parte del proyecto:

```typescript
import { User, Board, Card } from './path/to/models';
```

## Ventajas de esta estructura

1. **Modularidad**: Cada modelo está en su propio archivo
2. **Separación de responsabilidades**: Requests, responses y modelos separados
3. **Reutilización**: Fácil importación de tipos específicos
4. **Mantenimiento**: Más fácil encontrar y modificar tipos específicos
5. **TypeScript**: Mejor intellisense y detección de errores