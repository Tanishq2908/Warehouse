import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Package, ShoppingBag, AlertTriangle, Truck, Coins, TrendingUp, ArrowRight } from "lucide-react";

export default function Dashboard() {
  const { isAdmin, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/v1/dashboard")
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div>
      <h1 className="page-title">{greeting}, {user?.fullName?.split(" ")[0] || "there"} 👋</h1>
      <p className="page-sub">Your warehouse at a glance.</p>

      {/* Stat cards */}
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", marginBottom: 28 }}>
        {loading ? (
          [1,2,3,4].map(i => (
            <div key={i} className="glass stat-card">
              <div className="skeleton" style={{ height: 14, width: "60%", marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 36, width: "80%" }} />
            </div>
          ))
        ) : (
          <>
            <Stat testid="stat-pending" icon={Package} label="Pending orders"
              value={data?.pending_orders ?? "0"}
              hint={`₹ ${fmt(data?.pending_value)} value`}
              color="var(--st-pending)" />
            <Stat testid="stat-receipts" icon={Truck} label="Receipts this month"
              value={data?.receipts_this_month ?? "0"}
              color="var(--st-partial)" />
            <Stat testid="stat-lowstock" icon={AlertTriangle} label="Low-stock items"
              value={data?.low_stock_count ?? "0"}
              hint={`${data?.inventory_count ?? 0} tracked`}
              color="var(--st-alert)" />
            <Stat testid="stat-sales" icon={ShoppingBag} label="Sales this month"
              value={`₹ ${fmt(data?.sales_this_month?.gross)}`}
              hint={`${data?.sales_this_month?.count ?? 0} bills`}
              color="var(--st-pakka)" />
            {isAdmin && (
              <Stat testid="stat-profit" icon={Coins} label="Profit this month"
                value={`₹ ${fmt(data?.sales_this_month?.profit)}`}
                color="var(--marigold-500)" />
            )}
          </>
        )}
      </div>

      {/* Quick actions */}
      <div className="glass" data-testid="fab-cluster" style={{ padding: 20, marginBottom: 24 }}>
        <div className="muted" style={{ fontSize: "var(--fs-sm)", marginBottom: 12, fontWeight: 600 }}>
          ⚡ Quick actions
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link to="/orders/new" className="btn-primary" data-testid="quick-new-order">
            <Package size={15} /> New Order
          </Link>
          <Link to="/receive" className="btn-ghost" data-testid="quick-receive">
            <Truck size={15} /> Receive Goods
          </Link>
          <Link to="/sales/new" className="btn-ghost" data-testid="quick-new-sale">
            <ShoppingBag size={15} /> New Sale
          </Link>
        </div>
      </div>

      {/* Recent activity */}
      <div className="glass" style={{ padding: 20 }}>
        <div className="hstack" style={{ justifyContent: "space-between", marginBottom: 16 }}>
          <div className="display" style={{ fontSize: "var(--fs-lg)", fontWeight: 600 }}>Recent activity</div>
          <Link to="/orders" style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--marigold-500)", fontSize: "var(--fs-sm)", textDecoration: "none" }}>
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {loading && (
          <div className="vstack" style={{ gap: 8 }}>
            {[1,2,3].map(i => (
              <div key={i} className="glass-row" style={{ padding: 12 }}>
                <div className="skeleton" style={{ height: 16, width: "70%" }} />
              </div>
            ))}
          </div>
        )}
        {!loading && (!data?.recent || data.recent.length === 0) && (
          <div className="dim" style={{ padding: 20, textAlign: "center" }}>
            No activity yet — start by logging an order.
          </div>
        )}
        {!loading && data?.recent?.map((r, i) => (
          <div key={i} className="glass-row hstack" data-testid={`activity-${r.type}-${i}`}
            style={{ padding: 12, gap: 12, marginBottom: 8 }}>
            <span className="pill" style={{
              background: "var(--glass-fill)",
              color: r.type === "sale" ? "var(--st-pakka)"
                : r.type === "receipt" ? "var(--st-complete)" : "var(--marigold-500)",
              minWidth: 70, justifyContent: "center",
            }}>{r.type}</span>
            <span className="mono grow truncate">{r.label}</span>
            <span className="dim" style={{ fontSize: "var(--fs-xs)", whiteSpace: "nowrap" }}>
              {new Date(r.at).toLocaleDateString("en-IN")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, hint, testid, color }) {
  return (
    <div className="glass stat-card" data-testid={testid}>
      <div className="hstack" style={{ justifyContent: "space-between" }}>
        <span className="stat-label">{label}</span>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--glass-fill)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={18} color={color || "var(--marigold-500)"} />
        </div>
      </div>
      <div className="stat-value mono">{value}</div>
      {hint && <div className="stat-hint">{hint}</div>}
    </div>
  );
}

function fmt(n) {
  if (n === undefined || n === null) return "0";
  return Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}
