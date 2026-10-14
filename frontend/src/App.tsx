import { useEffect, useState } from 'react'
import { api } from './lib/api'

type Health = { api: string; supabase: string }

function App() {
  const [health, setHealth] = useState<Health | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api<Health>('/health')
      .then(setHealth)
      .catch((e: Error) => setError(e.message))
  }, [])

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>Seguridad Informática</h1>
      <h2>Estado de la conexión</h2>
      {error && <p>Backend: error ({error})</p>}
      {!error && !health && <p>Comprobando...</p>}
      {health && (
        <ul>
          <li>Backend (NestJS): {health.api}</li>
          <li>Supabase: {health.supabase}</li>
        </ul>
      )}
    </main>
  )
}

export default App
