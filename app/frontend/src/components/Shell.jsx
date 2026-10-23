import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard, Package, Truck, Boxes, ShoppingBag, Database, LogOut, Settings,
  Menu, X, Repeat2,
} from "lucide-react";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, testid: "nav-dashboard" },
  { to: "/orders", label: "Orders", icon: Package, testid: "nav-orders" },
  { to: "/receive", label: "Receive", icon: Truck, testid: "nav-receive" },
  { to: "/inventory", label: "Inventory", icon: Boxes, testid: "nav-inventory" },
  { to: "/sales", label: "Sales", icon: ShoppingBag, testid: "nav-sales" },
  { to: "/convert", label: "Convert", icon: Repeat2, testid: "nav-convert", highlight: true },
  { to: "/master", label: "Master Data", icon: Database, testid: "nav-master" },
  { to: "/settings", label: "Settings", icon: Settings, testid: "nav-settings" },
];

const BOTTOM_NAV = [
  { to: "/", label: "Home", icon: LayoutDashboard, testid: "nav-dashboard-mobile" },
  { to: "/orders", label: "Orders", icon: Package, testid: "nav-orders-mobile" },
  { to: "/receive", label: "Receive", icon: Truck, testid: "nav-receive-mobile" },
  { to: "/convert", label: "Convert", icon: Repeat2, testid: "nav-convert-mobile" },
  { to: "/sales", label: "Sales", icon: ShoppingBag, testid: "nav-sales-mobile" },
];

export default function Shell({ children }) {
  const { user, logout } = useAuth();
  const [mobileMenu, setMobileMenu] = useState(false);

  const SidebarContent = ({ onNav }) => (
    <>
      <div className="brand">
        <span style={{
          display: "inline-block", width: 28, height: 28, borderRadius: 8,
          background: "linear-gradient(135deg, var(--marigold-500), var(--indigo-400))",
          flexShrink: 0,
        }} />
        <span>Warehouse</span>
      </div>
      <nav data-testid="sidebar-nav">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.to === "/"} data-testid={n.testid}
            className={({ isActive }) => isActive ? "active" : ""}
            onClick={onNav}
            style={n.highlight ? ({ isActive }) => ({
              position: "relative",
              ...(isActive ? {} : {
                background: "var(--fill-accent)",
                borderLeft: "2px solid var(--marigold-500)",
              }),
            }) : undefined}>
            <n.icon size={20} />
            <span className="label">{n.label}</span>
            {n.highlight && (
              <span style={{
                marginLeft: "auto",
                fontSize: 9, fontWeight: 700, letterSpacing: ".04em",
                padding: "2px 6px", borderRadius: 6,
                background: "var(--marigold-500)", color: "var(--color-base)",
              }}>NEW</span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="user-card">
        <div className="glass-row" style={{ padding: 12, marginBottom: 8 }}>
          <div className="user-info">
            <div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>{user?.fullName}</div>
            <div className="dim" style={{ fontSize: "var(--fs-xs)" }}>
              {user?.username} · <span className="pill" style={{
                padding: "1px 6px", fontSize: "10px",
                background: user?.role === "ADMIN" ? "var(--fill-accent)" : "var(--glass-fill)",
                color: user?.role === "ADMIN" ? "var(--marigold-500)" : "var(--text-mid)",
              }}>{user?.role}</span>
            </div>
          </div>
        </div>
        <button className="btn-ghost" data-testid="logout-btn" onClick={logout}
          style={{ width: "100%", justifyContent: "center" }}>
          <LogOut size={16} /><span className="label">Sign out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="shell">
      <div className="mesh-bg" aria-hidden="true" />

      {/* Desktop / Tablet sidebar */}
      <aside className="sidebar glass-strong" style={{ borderRadius: 0, margin: 0 }}>
        <SidebarContent />
      </aside>

      {/* Mobile header */}
      <div className="mobile-header">
        <button className="hamburger-btn" onClick={() => setMobileMenu(true)} aria-label="Menu">
          <Menu size={24} />
        </button>
        <span className="brand" style={{ flex: 1 }}>Warehouse</span>
      </div>

      {/* Mobile drawer */}
      {mobileMenu && (
        <>
          <div className="mobile-drawer-backdrop" onClick={() => setMobileMenu(false)} />
          <div className="mobile-drawer glass-strong" style={{ padding: "20px 14px" }}>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
              <button className="hamburger-btn" onClick={() => setMobileMenu(false)}>
                <X size={24} />
              </button>
            </div>
            <SidebarContent onNav={() => setMobileMenu(false)} />
          </div>
        </>
      )}

      <main className="main">
        {children}
      </main>

      <nav className="bottom-nav" data-testid="bottom-nav">
        {BOTTOM_NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.to === "/"} data-testid={n.testid}
            className={({ isActive }) => isActive ? "active" : ""}>
            <n.icon size={20} />
            <span>{n.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
