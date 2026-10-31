// App.jsx — the "map" of the application
// One route = one use case. Each role's pages are behind a ProtectedRoute.
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthProvider from "./context/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import Login from "./pages/Login";
import Catalogue from "./pages/Catalogue";
import AdminComptes from "./pages/AdminComptes";
import MentorProjets from "./pages/MentorProjets";
import RHStagiaires from "./pages/RHStagiaires";
import RHMentors from "./pages/RHMentors";
import RHConventions from "./pages/RHConventions";
import "./components/ui.css";

export default function App() {
  return (
    <BrowserRouter>
      {/* Every page below can use useAuth() */}
      <AuthProvider>
        <Routes>
          {/* Public pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/catalogue" element={<Catalogue />} />

          {/* Administrateur — guard → layout → page */}
          <Route element={<ProtectedRoute role="admin" />}>
            <Route path="/admin" element={<AppLayout />}>
              <Route path="comptes" element={<AdminComptes />} />
            </Route>
          </Route>

          {/* Mentor */}
          <Route element={<ProtectedRoute role="mentor" />}>
            <Route path="/mentor" element={<AppLayout />}>
              <Route path="projets" element={<MentorProjets />} />
            </Route>
          </Route>

          {/* Service RH */}
          <Route element={<ProtectedRoute role="rh" />}>
            <Route path="/rh" element={<AppLayout />}>
              <Route path="stagiaires" element={<RHStagiaires />} />
              <Route path="mentors" element={<RHMentors />} />
              <Route path="conventions" element={<RHConventions />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
