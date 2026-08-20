/**
 * ProfileGuard — all resume-builder sections are freely accessible.
 * No redirect or lock is enforced.
 */
import { Outlet } from 'react-router-dom'

export default function ProfileGuard() {
  return <Outlet />
}
