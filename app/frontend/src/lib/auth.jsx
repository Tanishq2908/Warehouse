import { createContext, useContext, useEffect, useState } from "react";
import { api, storageGet, storageSet, storageRemove } from "@/lib/api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // start loading until storage is read

  // Load user from device storage on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await storageGet("wms.user");
        if (raw) {
          const parsed = JSON.parse(raw);
          setUser(parsed);
          // Silently verify token is still valid
          const tok = await storageGet("wms.accessToken");
          if (tok) {
            api.get("/auth/me")
              .then(({ data }) => {
                setUser(data);
                storageSet("wms.user", JSON.stringify(data));
              })
              .catch(() => {});
          }
        }
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  const login = async (username, password) => {
    const { data } = await api.post("/auth/login", { username, password });
    await storageSet("wms.accessToken", data.accessToken);
    await storageSet("wms.refreshToken", data.refreshToken);
    await storageSet("wms.user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = async () => {
    const rt = await storageGet("wms.refreshToken");
    try { if (rt) await api.post("/auth/logout", { refreshToken: rt }); } catch {}
    await storageRemove("wms.accessToken");
    await storageRemove("wms.refreshToken");
    await storageRemove("wms.user");
    setUser(null);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, var(--marigold-500), var(--indigo-400))", margin: "0 auto 12px" }} />
        <div className="dim" style={{ fontSize: "var(--fs-sm)" }}>Loading…</div>
      </div>
    </div>
  );

  return (
    <AuthCtx.Provider value={{ user, login, logout, loading, isAdmin: user?.role === "ADMIN" }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
