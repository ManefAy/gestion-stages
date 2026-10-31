// ProtectedRoute.jsx — the guard in front of the pages of one role
// Usage in App.jsx: <Route element={<ProtectedRoute role="rh" />}> ...pages... </Route>
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { HOME_BY_ROLE } from "../data/comptes";

export default function ProtectedRoute({ role }) {
  const { user } = useAuth();
  const location = useLocation(); // the URL the user is trying to open

  // 1) Not authenticated → login page.
  //    state.from = "where he wanted to go", read later by Login.jsx
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // 2) Authenticated but NOT allowed (e.g. a mentor opening /rh/stagiaires)
  //    → back to his own first page (restriction by role)
  if (user.role !== role) {
    return <Navigate to={HOME_BY_ROLE[user.role]} replace />;
  }

  // 3) Allowed → display the child routes
  return <Outlet />;
}
