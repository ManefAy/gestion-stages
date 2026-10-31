// AppLayout.jsx — sidebar + content area, shared by RH, Admin and Mentor
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Code2,
  Users,
  GraduationCap,
  UserRound,
  FileText,
  FolderKanban,
  LogOut,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { ROLE_LABELS, initiales } from "../data/comptes";
import "../components/ui.css";

// The menu of each actor = their use cases in the teacher's diagram
const MENUS = {
  rh: {
    title: "Service RH",
    links: [
      { to: "/rh/stagiaires", label: "Gérer stagiaires", icon: GraduationCap },
      { to: "/rh/mentors", label: "Gérer mentors", icon: UserRound },
      { to: "/rh/conventions", label: "Gérer conventions", icon: FileText },
    ],
  },
  admin: {
    title: "Administration",
    links: [{ to: "/admin/comptes", label: "Gérer comptes", icon: Users }],
  },
  mentor: {
    title: "Espace mentor",
    links: [
      { to: "/mentor/projets", label: "Gérer projets", icon: FolderKanban },
    ],
  },
};

export default function AppLayout() {
  const { user, logout } = useAuth(); // the REAL logged-in user
  const navigate = useNavigate();

  // ProtectedRoute guarantees we have a user here, so user.role is safe
  const menu = MENUS[user.role];

  function seDeconnecter() {
    logout(); // forget the user (state + localStorage)
    navigate("/login", { replace: true }); // back to login, can't go "back" into the app
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-logo">
            <Code2 size={20} aria-hidden="true" />
          </span>
          DevTec Stages
        </div>

        <div>
          <p className="sidebar-section-title">{menu.title}</p>
          <nav aria-label={`Menu ${menu.title}`}>
            {menu.links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink key={link.to} to={link.to} className="sidebar-link">
                  <Icon size={20} aria-hidden="true" />
                  {link.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-user">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
            }}
          >
            <span className="sidebar-avatar" aria-hidden="true">
              {initiales(user.nom)}
            </span>
            <div>
              <div style={{ fontWeight: 600, color: "#FFFFFF" }}>
                {user.nom}
              </div>
              <div style={{ fontSize: 13 }}>{ROLE_LABELS[user.role]}</div>
            </div>
          </div>
          {/* A <button>, not a <Link>: logging out is an ACTION, not just navigation */}
          <button
            type="button"
            className="sidebar-link"
            onClick={seDeconnecter}
          >
            <LogOut size={20} aria-hidden="true" />
            Se déconnecter
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
