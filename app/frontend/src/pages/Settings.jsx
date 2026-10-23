import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useConfirm } from "@/components/Confirm";
import { Save, AlertTriangle } from "lucide-react";

const SETTINGS_META = {
  "inventory.allow_negative_stock": { label: "Allow Negative Stock", type: "bool", desc: "Permit stock to go below zero on sale" },
  "purchase.allow_over_receipt": { label: "Allow Over-Receipt", type: "bool", desc: "Permit receiving more than ordered quantity" },
  "sales.tax_base": { label: "Tax Base", type: "select", options: ["TAXABLE", "GROSS", "PAYABLE"], desc: "Base amount for tax calculation" },
  "sales.rebate_base": { label: "Rebate Base", type: "select", options: ["TAXABLE", "GROSS", "PAYABLE"], desc: "Base amount for rebate calculation" },
  "sales.profit_formula": { label: "Profit Formula", type: "text", desc: "Arithmetic formula: payable, taxable, gross, tax_amount, rebate_amount" },
};

export default function Settings() {
  const { isAdmin } = useAuth();
  const [settings, setSettings] = useState([]);
  const [local, setLocal] = useState({});
  const [saving, setSaving] = useState({});
  const [msg, setMsg] = useState({});
  const [lite, setLite] = useState(() => document.documentElement.getAttribute("data-lite") === "true");
  const [clearing, setClearing] = useState(false);
  const [clearInput, setClearInput] = useState("");
  const confirm = useConfirm();

  useEffect(() => {
    api.get("/v1/settings").then(({ data }) => {
      setSettings(data);
      const map = {};
      data.forEach(s => { map[s.key] = s.value; });
      setLocal(map);
    }).catch(() => {});
  }, []);

  const applyLite = (val) => {
    document.documentElement.setAttribute("data-lite", val ? "true" : "false");
    setLite(val);
  };

  const saveSetting = async (key) => {
    setSaving(p => ({ ...p, [key]: true }));
    try {
      const meta = SETTINGS_META[key];
      let value = local[key];
      if (meta?.type === "bool") value = Boolean(value);
      await api.put(`/v1/settings/${key}`, { value });
      setMsg(p => ({ ...p, [key]: "✓ Saved" }));
      setTimeout(() => setMsg(p => ({ ...p, [key]: "" })), 2000);
    } catch {
      setMsg(p => ({ ...p, [key]: "Couldn’t save. Try again." }));
    } finally { setSaving(p => ({ ...p, [key]: false })); }
  };

  const set = (k, v) => setLocal(p => ({ ...p, [k]: v }));

  const handleClearData = async () => {
    if (clearInput !== "DELETE ALL DATA") { return; }
    const ok = await confirm({
      title: "⚠️ Clear All Data?",
      message: "This will permanently delete ALL orders, receipts, inventory and sales. Master data (users, lookups, products) will be preserved.",
      detail: "This action cannot be undone.",
      okLabel: "Yes, delete everything",
      danger: true,
    });
    if (!ok) return;
    setClearing(true);
    try {
      await api.post("/v1/admin/clear-data", { confirm: "DELETE_ALL_DATA" });
      setClearInput("");
      alert("All transactional data cleared successfully.");
    } catch {
      alert("We couldn’t clear the data. Try again.");
    } finally { setClearing(false); }
  };

  return (
    <div>
      <h1 className="page-title">Settings</h1>
      <p className="page-sub">Preferences & configuration.</p>

      {/* Appearance */}
      <div className="glass" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ fontWeight: 600, marginBottom: 14 }}>Appearance</div>
        <label className="hstack" style={{ gap: 8, cursor: "pointer" }}>
          <input type="checkbox" checked={lite} onChange={e => applyLite(e.target.checked)} />
          <div>
            <div style={{ fontSize: "var(--fs-sm)", fontWeight: 500 }}>Performance mode (Lite)</div>
            <div className="dim" style={{ fontSize: "var(--fs-xs)" }}>Disables blur effects — recommended for older Android devices</div>
          </div>
        </label>
      </div>



      {/* App settings (admin only) */}
      {isAdmin && (
        <div className="glass" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ fontWeight: 600, marginBottom: 16 }}>Application Settings</div>

          {settings.length === 0 && (
            <div className="dim" style={{ textAlign: "center", padding: 24 }}>No settings available.</div>
          )}

          <div className="vstack" style={{ gap: 14 }}>
            {settings.map((s) => {
              const meta = SETTINGS_META[s.key];
              if (!meta) return null;
              return (
                <div key={s.key} className="glass-row" style={{ padding: 16 }}>
                  <div className="hstack" style={{ marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{meta.label}</div>
                      <div className="dim" style={{ fontSize: "var(--fs-xs)" }}>{meta.desc}</div>
                    </div>
                    {msg[s.key] && (
                      <span className="pill complete" style={{ fontSize: "var(--fs-xs)" }}>{msg[s.key]}</span>
                    )}
                  </div>

                  <div className="hstack" style={{ gap: 10 }}>
                    {meta.type === "bool" ? (
                      <label className="hstack" style={{ gap: 8, cursor: "pointer", flex: 1 }}>
                        <input type="checkbox" checked={!!local[s.key]}
                          onChange={e => set(s.key, e.target.checked)}
                          data-testid={`setting-${s.key}`} />
                        <span style={{ fontSize: "var(--fs-sm)" }}>{local[s.key] ? "Enabled" : "Disabled"}</span>
                      </label>
                    ) : meta.type === "select" ? (
                      <select className="input select" value={local[s.key] || ""}
                        onChange={e => set(s.key, e.target.value)}
                        style={{ flex: 1, maxWidth: 200 }} data-testid={`setting-${s.key}`}>
                        {meta.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input className="input" value={local[s.key] || ""}
                        onChange={e => set(s.key, e.target.value)}
                        style={{ flex: 1 }} data-testid={`setting-${s.key}`} />
                    )}

                    <button className="btn-ghost btn-sm" onClick={() => saveSetting(s.key)}
                      disabled={saving[s.key]} data-testid={`save-${s.key}`}>
                      <Save size={14} /> {saving[s.key] ? "…" : "Save"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Danger zone — clear data */}
      {isAdmin && (
        <div className="glass" style={{ padding: 20, marginBottom: 20, border: "1px solid var(--st-alert)" }}>
          <div className="hstack" style={{ marginBottom: 12 }}>
            <AlertTriangle size={20} color="var(--st-alert)" />
            <div style={{ fontWeight: 600, color: "var(--st-alert)" }}>Danger Zone</div>
          </div>
          <div className="dim" style={{ fontSize: "var(--fs-sm)", marginBottom: 16 }}>
            Clears all orders, receipts, inventory & sales. Master data is preserved.
          </div>
          <label className="field" style={{ marginBottom: 12 }}>
            <div className="lbl">Type <strong>DELETE ALL DATA</strong> to confirm</div>
            <input className="input" value={clearInput} onChange={e => setClearInput(e.target.value)}
              placeholder="DELETE ALL DATA" data-testid="clear-confirm-input" />
          </label>
          <button className="btn-danger" onClick={handleClearData}
            disabled={clearing || clearInput !== "DELETE ALL DATA"}
            style={{ opacity: clearInput !== "DELETE ALL DATA" ? 0.5 : 1 }}
            data-testid="clear-data-btn">
            <AlertTriangle size={14} /> {clearing ? "Clearing…" : "Clear All Data"}
          </button>
        </div>
      )}

      {!isAdmin && (
        <div className="glass" style={{ padding: 24, textAlign: "center" }}>
          <div className="dim">Only administrators can change application settings.</div>
        </div>
      )}

      <div className="glass-row" style={{ padding: 16 }}>
        <div className="dim" style={{ fontSize: "var(--fs-xs)", textAlign: "center" }}>
          Warehouse · v1.0
        </div>
      </div>
    </div>
  );
}
