# Seguridad Informática

Monorepo del proyecto universitario:

- `frontend/` — React + Vite + TypeScript
- `backend/` — NestJS + TypeScript
- Base de datos: Supabase (solo el backend se conecta; el frontend únicamente habla con el backend)
- Despliegue: Render (`render.yaml`)

> Hay un único `.env` en la raíz y se sube al repo a propósito para que todo el equipo tenga acceso.
> Usar solo la **anon public** key de Supabase, nunca la `service_role`.

## Requisitos

- Node.js 22 o superior
- npm

## Primeros pasos

```bash
git clone https://github.com/NicoBA-Dev/Seguridad-informatica.git
cd Seguridad-informatica

cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

Levantar en dos terminales:

```bash
# Terminal 1
cd backend && npm run start:dev    # http://localhost:3000/api

# Terminal 2
cd frontend && npm run dev         # http://localhost:5173
```

La página principal del frontend muestra si el backend y Supabase están conectados.

## Variables de entorno

Todo está en el `.env` de la raíz (lo leen tanto el backend como el frontend):

| Variable | Uso |
| --- | --- |
| `SUPABASE_URL`, `SUPABASE_KEY` | Conexión del backend a Supabase (Project Settings → API) |
| `PORT` | Puerto del backend |
| `VITE_API_URL` | URL del backend que usa el frontend |

## Cómo usar Supabase

Solo desde el backend, inyectando `SupabaseService`:

```ts
constructor(private readonly supabase: SupabaseService) {}

const { data, error } = await this.supabase.client.from('mi_tabla').select('*');
```

El frontend pide los datos al backend:

```ts
import { api } from './lib/api'

const datos = await api('/mi-endpoint')
```

## Despliegue en Render

1. En Render: **New → Blueprint** y elegir este repositorio (lee `render.yaml`).
2. Se crean dos servicios: `seguridad-informatica-backend` y `seguridad-informatica-frontend`.
3. Si la URL del backend no es `https://seguridad-informatica-backend.onrender.com`,
   actualizar `VITE_API_URL` en `render.yaml` y hacer push.

Nota: en el plan gratis el backend se duerme tras 15 min sin uso; la primera petición tarda ~1 min.
