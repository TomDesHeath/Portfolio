import { createContext, useContext } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

const AuthContext = createContext(null);

/**
 * AuthProvider Component
 *
 * Implements a simple authentication system backed by localStorage.
 * - Stores whether the user is logged in ('isAuthed').
 * - Stores a single account with username + password.
 * - Provides login, account creation, and logout functions to the rest of the app.
 *
 * Usage:
 *   Wrap the entire app with <AuthProvider> so that any child can call useAuth().
 *
 * @param {{ children: React.ReactNode }} props
 */
export function AuthProvider({ children }) {
  // Tracks whether user is logged in; persisted to localStorage
  const [isAuthed, setAuthed] = useLocalStorage("isAuthed", false);

  // Stores a single account record { username, password }
  const [storedAccount, setStoredAccount] = useLocalStorage(
    "auth:account",
    null
  );

  /**
   * Attempt to log in with provided username and password.
   * Returns an object { ok: boolean, error?: string }
   */
  async function login(un, pw) {
    try {
      const user = String(un ?? "").trim();
      const input = String(pw ?? "").trim();

      if (!user || !input) {
        return { ok: false, error: "Incorrect username or password" };
      }

      const acc = storedAccount ?? null;
      if (acc && user === acc.username && input === acc.password) {
        setAuthed(true);
        return { ok: true };
      }
      return { ok: false, error: "Incorrect username or password" };
    } catch (err) {
      console.error("[auth] login error:", err);
      return { ok: false, error: "Internal auth error" };
    }
  }

  /**
   * Create a new account with given username and password.
   * Returns { ok: boolean, created?: true, error?: string }
   *
   * - Usernames must be unique (no duplicate allowed).
   * - Credentials are stored in localStorage.
   */
  async function createAccount(un, pw) {
    try {
      const user = String(un ?? "").trim();
      const input = String(pw ?? "").trim();
      if (!user) return { ok: false, error: "Username required" };
      if (!input) return { ok: false, error: "Password required" };

      // Prevent overwriting existing account if the username already exists
      if (storedAccount && storedAccount.username === user) {
        return { ok: false, error: "Account already exists" };
      }

      setStoredAccount({ username: user, password: input });
      setAuthed(true);
      return { ok: true, created: true };
    } catch (err) {
      console.error("[auth] createAccount error:", err);
      return { ok: false, error: "Failed to create account" };
    }
  }

  /** Log out the current user (does not clear stored account). */
  function logout() {
    setAuthed(false);
  }

  // Expose auth state and functions to consumers
  const value = { isAuthed, login, createAccount, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to consume the AuthContext.
 * Returns { isAuthed, login, createAccount, logout }.
 */
export function useAuth() {
  return useContext(AuthContext);
}
