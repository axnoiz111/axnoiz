import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        height: '100svh',
        background: '#020409',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '13px',
        letterSpacing: '0.1em',
      }}>
        Loading...
      </div>
    )
  }

  return user ? <Outlet /> : <Navigate to="/" replace />
}
