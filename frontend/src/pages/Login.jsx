// Login.jsx — use case "s'authentifier"
import { useState } from "react";
import { useNavigate, useLocation, Link, Navigate } from "react-router-dom"; // ★ + useLocation, Navigate
import { Code2, Eye, EyeOff, LogIn } from "lucide-react";
import Field from "../components/Field";
import Button from "../components/Button";
import { COMPTES, HOME_BY_ROLE } from "../data/comptes";
import { useAuth } from "../hooks/useAuth"; // ★
import "./login.css";

export default function Login() {
  const [login, setLogin] = useState("");
  const [mdp, setMdp] = useState("");
  const [showMdp, setShowMdp] = useState(false);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation(); // ★ to read state.from
  const { user, login: connecter } = useAuth(); // ★ rename: "login" is already our input's state

  // ★ Already logged in? No need to see the login page → go home.
  //   ⚠️ This "return" must come AFTER all the hooks above:
  //   React requires hooks to be called in the same order at every render
  //   (ESLint's "rules-of-hooks" will warn you if you put it before).
  if (user) {
    return <Navigate to={HOME_BY_ROLE[user.role]} replace />;
  }

  function validate() {
    const newErrors = {};
    if (login.trim() === "") newErrors.login = "Le login est obligatoire.";
    if (mdp === "") newErrors.mdp = "Le mot de passe est obligatoire.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
    setAuthError("");
    if (!validate()) return;

    setLoading(true);
    setTimeout(() => {
      const compte = COMPTES.find(
        (c) => c.login === login.trim() && c.mdp === mdp,
      );
      setLoading(false);

      if (!compte) {
        setAuthError("Login ou mot de passe incorrect.");
        return;
      }

      // ★ A deactivated account (managed by the admin) can't log in
      if (!compte.actif) {
        setAuthError("Ce compte est désactivé. Contactez l'administrateur.");
        return;
      }

      connecter(compte); // ★ save the user in the context (+ localStorage)

      // ★ Go back to the page he wanted, or to his home page.
      //   ?. = "if location.state exists", ?? = "otherwise use this"
      //   (If "from" belongs to another role, ProtectedRoute will redirect him anyway.)
      const destination = location.state?.from ?? HOME_BY_ROLE[compte.role];
      navigate(destination, { replace: true });
    }, 600);
  }

  // ---------- 4) DISPLAY ----------
  return (
    <div className="login-page">
      {/* Left panel: presentation of the system */}
      <section className="login-brand">
        <div className="sidebar-brand" style={{ padding: 0 }}>
          <span className="sidebar-logo">
            <Code2 size={20} aria-hidden="true" />
          </span>
          DevTec
        </div>

        <div>
          <p className="login-eyebrow">Système de gestion des stages</p>
          <h1>Projets, candidatures et conventions, au même endroit.</h1>
          <p>
            Un espace centralisé pour le service RH, les mentors et
            l'administrateur. Chaque compte n'accède qu'aux fonctionnalités de
            son rôle.
          </p>
        </div>

        <div className="login-roles">
          <span>Service RH</span>
          <span>Mentor</span>
          <span>Administrateur</span>
        </div>
      </section>

      {/* Right zone: the form */}
      <section className="login-form-zone">
        {/* noValidate: we use OUR validation messages, not the browser's */}
        <form className="login-card" onSubmit={handleSubmit} noValidate>
          <div>
            <h2>Connexion</h2>
            <p className="subtitle">
              Entrez les identifiants fournis par l'administrateur.
            </p>
          </div>

          {/* Global error, shown only if authError is not empty */}
          {authError && (
            <div className="login-alert" role="alert">
              {authError}
            </div>
          )}

          {/* LOGIN field — controlled input: value comes from state */}
          <Field label="Login" id="login" error={errors.login}>
            <input
              id="login"
              className="input"
              type="text"
              autoComplete="username"
              value={login}
              onChange={(e) => setLogin(e.target.value)} // every key typed updates the state
              aria-invalid={errors.login ? "true" : "false"} // red border if error
            />
          </Field>

          {/* PASSWORD field with show/hide button */}
          <Field label="Mot de passe" id="mdp" error={errors.mdp}>
            <div className="password-wrapper">
              <input
                id="mdp"
                className="input"
                type={showMdp ? "text" : "password"} // switch between hidden and visible
                autoComplete="current-password"
                value={mdp}
                onChange={(e) => setMdp(e.target.value)}
                aria-invalid={errors.mdp ? "true" : "false"}
              />
              <button
                type="button" // not "submit": must not send the form
                className="password-toggle"
                onClick={() => setShowMdp(!showMdp)}
                // icon-only button → needs a text label for screen readers (skill rule)
                aria-label={
                  showMdp
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
              >
                {showMdp ? (
                  <EyeOff size={20} aria-hidden="true" />
                ) : (
                  <Eye size={20} aria-hidden="true" />
                )}
              </button>
            </div>
          </Field>

          {/* type="submit" → triggers onSubmit of the form (also works with the Enter key) */}
          <Button type="submit" icon={LogIn} disabled={loading}>
            {loading ? "Connexion…" : "Se connecter"}
          </Button>

          {/* Candidates have no account (no «include» on "soumettre candidature") */}
          <p className="login-footer">
            Vous êtes candidat ?{" "}
            <Link to="/catalogue">Consulter le catalogue des stages</Link>
          </p>
        </form>
      </section>
    </div>
  );
}
