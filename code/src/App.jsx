import { useState, useEffect } from "react";
import Nav from "./components/Nav.jsx";
import Profile from "./components/Profile.jsx";
import Education from "./sections/Education.jsx";
import Experience from "./sections/Experience.jsx";
import Blog from "./sections/Blog.jsx";
import Gallery from "./sections/Gallery.jsx";
import "./styles/global.css";
import { useAuth } from "./context/AuthContext.jsx";

/**
 * App (root) component
 *
 * Responsibilities:
 * - Composes the main layout: sidebar Profile + main content area.
 * - Persists the active tab to localStorage for UX continuity.
 * - Hosts an authentication modal (login/create) that can be opened by children.
 *
 * Data flow:
 * - 'Nav' controls 'active' tab via onChange.
 * - 'Profile' can request auth via 'onRequestAuth', which opens 'AuthModal'.
 * - Section components ('Education', 'Experience', 'Blog', 'Gallery') render conditionally.
 */

export default function App() {
  const { isAuthed } = useAuth(); // consumed here only to let modal auto-close on auth from child
  const [active, setActive] = useState("Education"); // current tab label
  const [authModal, setAuthModal] = useState({ open: false, mode: "login" }); // auth dialog state

  // Open/close helpers for auth modal; 'mode' is either "login" or "create"
  const openAuth = (mode = "login") => setAuthModal({ open: true, mode });
  const closeAuth = () => setAuthModal((a) => ({ ...a, open: false }));

  // On mount: restore the last active tab from localStorage (if present)
  useEffect(() => {
    const saved = localStorage.getItem("activeTab");
    if (saved) setActive(saved);
  }, []);

  // Whenever 'active' changes, persist it
  useEffect(() => {
    localStorage.setItem("activeTab", active);
  }, [active]);

  return (
    <>
      {/* Auth modal (portaled dialog logic lives inside AuthModal) */}
      {authModal.open && (
        <AuthModal mode={authModal.mode} onClose={closeAuth} />
      )}

      {/* Two-column layout: left profile, right content */}
      <div className="layout">
        <aside style={{ paddingRight: 0 }}>
          {/* Profile can trigger opening the auth modal via onRequestAuth */}
          <Profile onRequestAuth={openAuth} />
        </aside>

        <main className="content">
          {/* Top navigation controlling tab state */}
          <Nav active={active} onChange={setActive} />

          {/* Card container for current section */}
          <section className="card">
            {active === "Education" && <Education />}
            {active === "Experience" && <Experience />}
            {active === "Blog" && <Blog />}
            {active === "Gallery" && <Gallery />}
          </section>
        </main>
      </div>
    </>
  );
}

/**
 * AuthModal
 *
 * Modal dialog that handles login and account creation.
 * - Controlled by 'mode' prop ("login" | "create"); can be switched via tabs.
 * - Uses AuthContext methods: login() and createAccount().
 * - Basic validation: requires password; confirm password must match on create.
 * - Auto-closes when 'isAuthed' flips true (successful auth).
 *
 * Props:
 * @param {{ mode?: 'login' | 'create', onClose: () => void }} props
 *   - mode: initial mode when opening the modal
 *   - onClose: callback to dismiss the modal
 */
function AuthModal({ mode: initialMode = "login", onClose }) {
  const { isAuthed, login, createAccount } = useAuth();

  // Local UI state for the form and control flow
  const [mode, setMode] = useState(initialMode);
  const [un, setUn] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  // Reset inputs when switching between login/create tabs
  useEffect(() => {
    setUn("");
    setPw("");
    setPw2("");
    setErr("");
  }, [mode]);

  // If auth succeeds elsewhere (context state changes), close the modal
  useEffect(() => {
    if (isAuthed) onClose?.();
  }, [isAuthed]);

  // Submit handler for both login and create flows
  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    const password = pw;

    // Minimal validation: require password
    if (!password) {
      setErr("Password required");
      return;
    }
    // For account creation, confirm both password fields match
    if (mode === "create" && pw2 !== pw) {
      setErr("Passwords do not match");
      return;
    }

    setBusy(true);
    try {
      // Delegate to context API; both methods return { ok, error? }
      const res =
        mode === "login"
          ? await login(un, password)
          : await createAccount(un, password);

      // Surface a user-friendly error message if auth failed
      if (!res || res.ok !== true) {
        setErr(
          res?.error ||
            (mode === "login"
              ? "Incorrect username or password"
              : "Could not create account")
        );
      }
    } catch (e) {
      // Catch-all in case something throws above the context layer
      setErr("Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  // Disable submit when inputs are incomplete (especially on create)
  const canSubmit =
    mode === "login" ? Boolean(pw) : Boolean(pw && pw2 && pw2 === pw);

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={mode === "login" ? "Login" : "Create Account"}
    >
      <div className="modal">
        {/* Header with title, mode tabs, and close button */}
        <div className="modal__header">
          <h3 style={{ margin: 0 }}>
            {mode === "login" ? "Login" : "Create Account"}
          </h3>
          <div className="modal__tabs">
            <button
              className={mode === "login" ? "active" : ""}
              onClick={() => setMode("login")}
              disabled={busy}
            >
              Login
            </button>
            <button
              className={mode === "create" ? "active" : ""}
              onClick={() => setMode("create")}
              disabled={busy}
            >
              Create Account
            </button>
          </div>
          <button
            className="ghost"
            onClick={onClose}
            disabled={busy}
            aria-label="Close auth dialog"
          >
            ✕
          </button>
        </div>

        {/* Body: simple form that adapts to mode */}
        <form className="modal__body" onSubmit={onSubmit}>
          <input
            className="input"
            type="text"
            placeholder="Username"
            autoComplete="username"
            value={un}
            onChange={(e) => setUn(e.target.value)}
            disabled={busy}
          />
          <input
            className="input"
            type="password"
            placeholder="Password"
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            disabled={busy}
          />
          {mode === "create" && (
            <input
              className="input"
              type="password"
              placeholder="Confirm password"
              autoComplete="new-password"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              disabled={busy}
            />
          )}

          {/* Error feedback (shows under inputs) */}
          {err ? <small style={{ color: "crimson" }}>{err}</small> : null}

          {/* Submit button shows a busy state; className toggles primary style */}
          <button
            className={busy ? "" : "active"}
            disabled={!canSubmit || busy}
          >
            {busy
              ? "Please wait…"
              : mode === "login"
              ? "Login"
              : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
