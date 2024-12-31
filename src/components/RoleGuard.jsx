import { Navigate, useLocation } from 'react-router-dom'

export default function RoleGuard({ allowedRoles = [], children }) {
  const location = useLocation()
  const isAuthed = localStorage.getItem('ck_auth') === '1'
  const role = localStorage.getItem('ck_role')

  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!role) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}
