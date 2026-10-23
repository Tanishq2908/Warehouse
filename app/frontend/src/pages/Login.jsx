import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

export default function Login() {
  const { login, loading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await login(username, password);
      nav("/");
    } catch {
      setErr("We couldn’t sign you in. Check your details and try again.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, position: "relative" }}>
      <div className="mesh-bg" aria-hidden="true" />
      <div className="glass-strong" style={{ width: "100%", maxWidth: 440, padding: 32, position: "relative", zIndex: 2 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{
              display: "inline-block", width: 32, height: 32, borderRadius: 10,
              background: "linear-gradient(135deg, var(--marigold-500), var(--indigo-400))",
            }} />
            <span className="display" style={{ fontSize: "var(--fs-xl)", fontWeight: 600 }}>Warehouse</span>
          </div>
          <h1 className="display" style={{ fontSize: "var(--fs-2xl)", fontWeight: 600, margin: 0 }}>
            Sign in
          </h1>
          <p className="muted" style={{ marginTop: 6 }}>Manage stock, orders, and sales from one place.</p>
        </div>

        <form onSubmit={submit} className="vstack" style={{ gap: 14 }}>
          <label className="field">
            <div className="lbl">Username</div>
            <input data-testid="login-username" className="input" autoComplete="username"
                   value={username} onChange={(e) => setUsername(e.target.value)} required />
          </label>
          <label className="field">
            <div className="lbl">Password</div>
            <input data-testid="login-password" className="input" type="password"
                   autoComplete="current-password"
                   value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          {err && <div className="pill alert" style={{ padding: "8px 12px" }}>{err}</div>}
          <button data-testid="login-submit" className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

      </div>
    </div>
  );
}
