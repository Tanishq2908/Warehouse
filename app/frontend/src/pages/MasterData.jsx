import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useConfirm } from "@/components/Confirm";
import LookupSelect from "@/components/LookupSetup";
import {
  Plus, X, ChevronRight, Trash2, Edit2, Users, Key,
  Package, Palette, Building2, Hash, Settings, ToggleLeft, ToggleRight
} from "lucide-react";

const ENTITY_TYPES = [
  { key: "PURCHASE_ORDER", label: "Purchase Order" },
  { key: "PURCHASE_ORDER_ITEM", label: "Order Line Item" },
  { key: "GOODS_RECEIPT", label: "Goods Receipt" },
  { key: "GOODS_RECEIPT_ITEM", label: "Receipt Line Item" },
  { key: "SALE", label: "Sale" },
  { key: "SALE_ITEM", label: "Sale Line Item" },
  { key: "PARTY", label: "Party" },
  { key: "PRODUCT", label: "Product" },
  { key: "DESIGN", label: "Design" },
];

export default function MasterData() {
  const { isAdmin } = useAuth();
  const [tab, setTab] = useState("parties");

  const tabs = [
    { key: "parties", label: "Parties", icon: <Building2 size={14} /> },
    { key: "products", label: "Products", icon: <Package size={14} /> },
    { key: "designs", label: "Designs", icon: <Palette size={14} /> },
    { key: "lookups", label: "Lookups", icon: <ChevronRight size={14} /> },
    ...(isAdmin ? [
      { key: "fields", label: "Custom Fields", icon: <Settings size={14} /> },
      { key: "users", label: "Users", icon: <Users size={14} /> },
    ] : []),
  ];

  return (
    <div>
      <h1 className="page-title">Master Data</h1>
      <p className="page-sub">Parties, products, designs, lookups & users.</p>

      <div className="tab-bar">
        {tabs.map((t) => (
          <button key={t.key}
            className={`tab-btn ${tab === t.key ? "active" : ""}`}
            onClick={() => setTab(t.key)}
            data-testid={`tab-${t.key}`}
            style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {tab === "parties" && <PartiesTab isAdmin={isAdmin} />}
      {tab === "products" && <ProductsTab />}
      {tab === "designs" && <DesignsTab />}
      {tab === "lookups" && <LookupsTab isAdmin={isAdmin} />}
      {tab === "fields" && isAdmin && <FieldsTab />}
      {tab === "users" && isAdmin && <UsersTab />}
    </div>
  );
}

/* ─── Parties ─────────────────────────────────────────────────────────────── */
function PartiesTab({ isAdmin }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [drawer, setDrawer] = useState(null);
  const [editing, setEditing] = useState(null);
  const confirm = useConfirm();

  const load = async () => {
    setLoading(true);
    try { const { data } = await api.get("/v1/parties", { params: { q, role: role || undefined } }); setRows(data); }
    catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [q, role]);

  const deletePty = async (id) => {
    const ok = await confirm({ title: "Deactivate Party?", message: "The party will be hidden from dropdowns.", okLabel: "Deactivate", danger: true });
    if (!ok) return;
    await api.delete(`/v1/parties/${id}`).catch(() => {});
    load();
  };

  const ROLE_ICONS = { Provider: "🏭", Customer: "🛒", Seller: "🤝" };

  return (
    <div>
      <div className="hstack" style={{ marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
        <input className="input" placeholder="Search…" value={q} onChange={e => setQ(e.target.value)} style={{ maxWidth: 200 }} />
        <select className="input select" value={role} onChange={e => setRole(e.target.value)} style={{ maxWidth: 160 }}>
          <option value="">All roles</option>
          <option value="PROVIDER">Provider</option>
          <option value="CUSTOMER">Customer</option>
          <option value="SELLER">Seller</option>
        </select>
        <div style={{ flex: 1 }} />
        <button className="btn-primary" onClick={() => { setEditing(null); setDrawer("party"); }} data-testid="add-party-btn">
          <Plus size={15} /> Add Party
        </button>
      </div>

      {loading && <div className="skeleton" style={{ height: 200, borderRadius: 16 }} />}
      {!loading && rows.map((p) => {
        const roles = [p.is_provider && "Provider", p.is_customer && "Customer", p.is_seller && "Seller"].filter(Boolean);
        return (
          <div key={p.id} className="glass-row hstack" style={{ padding: 14, marginBottom: 8, gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: "var(--glass-fill-strong)", display: "flex", alignItems: "center",
              justifyContent: "center", flexShrink: 0, fontSize: 18
            }}>
              {ROLE_ICONS[roles[0]] || "🏢"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{p.name}</div>
              <div className="dim" style={{ fontSize: "var(--fs-xs)" }}>
                {roles.join(" · ")}
                {p.phone && ` · 📞 ${p.phone}`}
                {p.city && ` · 📍 ${p.city}`}
                {p.gstin && ` · GST: ${p.gstin}`}
              </div>
            </div>
            <button className="btn-ghost btn-sm" onClick={() => { setEditing(p); setDrawer("party"); }}>
              <Edit2 size={14} />
            </button>
            {isAdmin && (
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--st-alert)", padding: 8 }}
                onClick={() => deletePty(p.id)}>
                <Trash2 size={14} />
              </button>
            )}
          </div>
        );
      })}
      {!loading && rows.length === 0 && <div className="dim" style={{ textAlign: "center", padding: 40 }}>No parties found.</div>}

      {drawer === "party" && (
        <>
          <div className="drawer-backdrop" onClick={() => setDrawer(null)} />
          <PartyForm party={editing} onClose={() => setDrawer(null)} onSaved={() => { setDrawer(null); load(); }} />
        </>
      )}
    </div>
  );
}

function PartyForm({ party, onClose, onSaved }) {
  const [f, setF] = useState({
    name: party?.name || "", legal_name: party?.legal_name || "",
    phone: party?.phone || "", email: party?.email || "",
    gstin: party?.gstin || "", address_line: party?.address_line || "",
    city: party?.city || "", state: party?.state || "", pincode: party?.pincode || "",
    is_provider: party?.is_provider ?? false, is_customer: party?.is_customer ?? false,
    is_seller: party?.is_seller ?? false, opening_balance: party?.opening_balance ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      if (party) await api.put(`/v1/parties/${party.id}`, { ...f, custom_fields: {} });
      else await api.post("/v1/parties", { ...f, custom_fields: {} });
      onSaved();
    } catch { setErr("We couldn’t save the party. Check the details and try again."); }
    finally { setSaving(false); }
  };

  return (
    <div className="drawer glass-strong">
      <div className="hstack" style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: "var(--fs-lg)", flex: 1 }}>{party ? "Edit Party" : "New Party"}</div>
        <button className="btn-ghost btn-sm" onClick={onClose}><X size={16} /></button>
      </div>
      <form onSubmit={submit} className="vstack" style={{ gap: 12 }}>
        <label className="field"><div className="lbl">Name *</div>
          <input className="input" value={f.name} onChange={e => set("name", e.target.value)} required /></label>
        <label className="field"><div className="lbl">Legal Name</div>
          <input className="input" value={f.legal_name} onChange={e => set("legal_name", e.target.value)} /></label>
        <div className="grid-2">
          <label className="field"><div className="lbl">Phone</div>
            <input className="input" value={f.phone} onChange={e => set("phone", e.target.value)} /></label>
          <label className="field"><div className="lbl">Email</div>
            <input className="input" type="email" value={f.email} onChange={e => set("email", e.target.value)} /></label>
          <label className="field"><div className="lbl">GSTIN</div>
            <input className="input" value={f.gstin} onChange={e => set("gstin", e.target.value)} /></label>
          <label className="field"><div className="lbl">City</div>
            <input className="input" value={f.city} onChange={e => set("city", e.target.value)} /></label>
          <label className="field"><div className="lbl">State</div>
            <input className="input" value={f.state} onChange={e => set("state", e.target.value)} /></label>
          <label className="field"><div className="lbl">Pincode</div>
            <input className="input" value={f.pincode} onChange={e => set("pincode", e.target.value)} /></label>
        </div>
        <label className="field"><div className="lbl">Address</div>
          <textarea className="input" rows={2} value={f.address_line} onChange={e => set("address_line", e.target.value)} /></label>
        <div style={{ fontWeight: 600, fontSize: "var(--fs-xs)", marginBottom: 4, color: "var(--text-mid)" }}>ROLES</div>
        <div className="hstack" style={{ gap: 16 }}>
          {[["is_provider", "Provider 🏭"], ["is_customer", "Customer 🛒"], ["is_seller", "Seller 🤝"]].map(([k, l]) => (
            <label key={k} className="hstack" style={{ gap: 6, cursor: "pointer" }}>
              <input type="checkbox" checked={f[k]} onChange={e => set(k, e.target.checked)} />
              <span>{l}</span>
            </label>
          ))}
        </div>
        {err && <div className="pill alert" style={{ padding: "8px 12px" }}>{err}</div>}
        <button className="btn-primary" type="submit" disabled={saving}>{saving ? "Saving…" : "Save Party"}</button>
      </form>
    </div>
  );
}

/* ─── Products ────────────────────────────────────────────────────────────── */
function ProductsTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [drawer, setDrawer] = useState(null);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    try { const { data } = await api.get("/v1/products", { params: { q } }); setRows(data); }
    catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [q]);

  return (
    <div>
      <div className="hstack" style={{ marginBottom: 12 }}>
        <input className="input" placeholder="Search…" value={q} onChange={e => setQ(e.target.value)} style={{ maxWidth: 220 }} />
        <div style={{ flex: 1 }} />
        <button className="btn-primary" onClick={() => { setEditing(null); setDrawer("product"); }} data-testid="add-product-btn">
          <Plus size={15} /> Add Product
        </button>
      </div>
      {loading && <div className="skeleton" style={{ height: 180, borderRadius: 16 }} />}
      {!loading && rows.map(p => (
        <div key={p.id} className="glass-row hstack" style={{ padding: 14, marginBottom: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--glass-fill-strong)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18 }}>
            📦
          </div>
          <div style={{ flex: 1, marginLeft: 10 }}>
            <div style={{ fontWeight: 600 }}>{p.name}</div>
            <div className="dim mono" style={{ fontSize: "var(--fs-xs)" }}>
              {p.code}{p.hsn_code ? ` · HSN: ${p.hsn_code}` : ""}
              {p.default_unit_id && ` · Unit set`}
            </div>
          </div>
          <button className="btn-ghost btn-sm" onClick={() => { setEditing(p); setDrawer("product"); }}>
            <Edit2 size={14} />
          </button>
        </div>
      ))}
      {!loading && rows.length === 0 && <div className="dim" style={{ textAlign: "center", padding: 40 }}>No products found.</div>}
      {drawer === "product" && (
        <>
          <div className="drawer-backdrop" onClick={() => setDrawer(null)} />
          <ProductForm product={editing} onClose={() => setDrawer(null)} onSaved={() => { setDrawer(null); load(); }} />
        </>
      )}
    </div>
  );
}

function ProductForm({ product, onClose, onSaved }) {
  const [name, setName] = useState(product?.name || "");
  const [hsn, setHsn] = useState(product?.hsn_code || "");
  const [defaultUnitId, setDefaultUnitId] = useState(product?.default_unit_id || "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      const payload = { name, hsn_code: hsn || null, default_unit_id: defaultUnitId || null, custom_fields: {} };
      if (product) await api.put(`/v1/products/${product.id}`, payload);
      else await api.post("/v1/products", payload);
      onSaved();
    } catch { setErr("We couldn’t save the product. Check the details and try again."); }
    finally { setSaving(false); }
  };

  return (
    <div className="drawer glass-strong">
      <div className="hstack" style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, flex: 1 }}>{product ? "Edit Product" : "New Product"}</div>
        <button className="btn-ghost btn-sm" onClick={onClose}><X size={16} /></button>
      </div>
      <form onSubmit={submit} className="vstack" style={{ gap: 12 }}>
        <label className="field"><div className="lbl">Name *</div>
          <input className="input" value={name} onChange={e => setName(e.target.value)} required /></label>
        <label className="field"><div className="lbl">HSN Code</div>
          <input className="input" value={hsn} onChange={e => setHsn(e.target.value)} placeholder="e.g. 52010000" /></label>
        <label className="field">
          <div className="lbl">Default Unit</div>
          <LookupSelect typeCode="UNIT" value={defaultUnitId} onChange={setDefaultUnitId} placeholder="Select default unit…" />
        </label>
        {err && <div className="pill alert" style={{ padding: "8px 12px" }}>{err}</div>}
        <button className="btn-primary" type="submit" disabled={saving}>{saving ? "Saving…" : "Save Product"}</button>
      </form>
    </div>
  );
}

/* ─── Designs ─────────────────────────────────────────────────────────────── */
function DesignsTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState("");
  const [drawer, setDrawer] = useState(null);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    try { const { data } = await api.get("/v1/designs", { params: { q, productId: productId || undefined } }); setRows(data); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { api.get("/v1/products").then(({ data }) => setProducts(data)).catch(() => {}); }, []);
  useEffect(() => { load(); }, [q, productId]);

  return (
    <div>
      <div className="hstack" style={{ marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
        <input className="input" placeholder="Search design…" value={q} onChange={e => setQ(e.target.value)} style={{ maxWidth: 200 }} />
        <select className="input select" value={productId} onChange={e => setProductId(e.target.value)} style={{ maxWidth: 200 }}>
          <option value="">All products</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <div style={{ flex: 1 }} />
        <button className="btn-primary" onClick={() => { setEditing(null); setDrawer("design"); }} data-testid="add-design-btn">
          <Plus size={15} /> Add Design
        </button>
      </div>
      {loading && <div className="skeleton" style={{ height: 180, borderRadius: 16 }} />}
      {!loading && rows.map(d => (
        <div key={d.id} className="glass-row hstack" style={{ padding: 14, marginBottom: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--glass-fill-strong)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18 }}>
            🎨
          </div>
          <div style={{ flex: 1, marginLeft: 10 }}>
            <div style={{ fontWeight: 600 }}>{d.design_code} — {d.name}</div>
            <div className="dim" style={{ fontSize: "var(--fs-xs)" }}>
              {products.find(p => p.id === d.product_id)?.name || ""}
              {d.notes && ` · ${d.notes}`}
            </div>
          </div>
          <button className="btn-ghost btn-sm" onClick={() => { setEditing(d); setDrawer("design"); }}>
            <Edit2 size={14} />
          </button>
        </div>
      ))}
      {!loading && rows.length === 0 && <div className="dim" style={{ textAlign: "center", padding: 40 }}>No designs.</div>}
      {drawer === "design" && (
        <>
          <div className="drawer-backdrop" onClick={() => setDrawer(null)} />
          <DesignForm design={editing} products={products} onClose={() => setDrawer(null)} onSaved={() => { setDrawer(null); load(); }} />
        </>
      )}
    </div>
  );
}

function DesignForm({ design, products, onClose, onSaved }) {
  const [name, setName] = useState(design?.name || "");
  const [productId, setProductId] = useState(design?.product_id || "");
  const [notes, setNotes] = useState(design?.notes || "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      const payload = { name, product_id: productId || null, notes: notes || null, custom_fields: {} };
      if (design) await api.put(`/v1/designs/${design.id}`, payload);
      else await api.post("/v1/designs", payload);
      onSaved();
    } catch { setErr("We couldn’t save the design. Check the details and try again."); }
    finally { setSaving(false); }
  };

  return (
    <div className="drawer glass-strong">
      <div className="hstack" style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, flex: 1 }}>{design ? "Edit Design" : "New Design"}</div>
        <button className="btn-ghost btn-sm" onClick={onClose}><X size={16} /></button>
      </div>
      <form onSubmit={submit} className="vstack" style={{ gap: 12 }}>
        <label className="field"><div className="lbl">Design Name *</div>
          <input className="input" value={name} onChange={e => setName(e.target.value)} required /></label>
        <label className="field"><div className="lbl">Linked Product</div>
          <select className="input select" value={productId} onChange={e => setProductId(e.target.value)}>
            <option value="">None</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select></label>
        <label className="field"><div className="lbl">Notes</div>
          <textarea className="input" rows={2} value={notes} onChange={e => setNotes(e.target.value)} /></label>
        {err && <div className="pill alert" style={{ padding: "8px 12px" }}>{err}</div>}
        <button className="btn-primary" type="submit" disabled={saving}>{saving ? "Saving…" : "Save Design"}</button>
      </form>
    </div>
  );
}

/* ─── Lookups ─────────────────────────────────────────────────────────────── */
function LookupsTab({ isAdmin }) {
  const [types, setTypes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showAddType, setShowAddType] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeCode, setNewTypeCode] = useState("");
  const [addingType, setAddingType] = useState(false);

  const load = () => {
    api.get("/v1/lookup-types").then(({ data }) => setTypes(data)).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const addType = async () => {
    if (!newTypeName.trim() || !newTypeCode.trim()) return;
    setAddingType(true);
    try {
      await api.post("/v1/lookup-types", { code: newTypeCode.trim(), name: newTypeName.trim() });
      setNewTypeName(""); setNewTypeCode(""); setShowAddType(false); load();
    } catch {} finally { setAddingType(false); }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 1fr" : "1fr", gap: 16 }}>
      <div>
        <div className="hstack" style={{ marginBottom: 10 }}>
          <div style={{ fontWeight: 600, flex: 1 }}>Lookup Types</div>
          {isAdmin && (
            <button className="btn-ghost btn-sm" onClick={() => setShowAddType(s => !s)}>
              <Plus size={13} /> New Type
            </button>
          )}
        </div>

        {isAdmin && showAddType && (
          <div className="glass-row" style={{ padding: 12, marginBottom: 10 }}>
            <div className="vstack" style={{ gap: 8 }}>
              <input className="input" placeholder="Display name (e.g. Colour)" value={newTypeName}
                onChange={e => setNewTypeName(e.target.value)} />
              <input className="input mono" placeholder="Code e.g. COLOUR" value={newTypeCode}
                onChange={e => setNewTypeCode(e.target.value.toUpperCase())} />
              <div className="hstack" style={{ gap: 8 }}>
                <button className="btn-primary" style={{ flex: 1 }} onClick={addType} disabled={addingType || !newTypeName || !newTypeCode}>
                  {addingType ? "Creating…" : "Create Type"}
                </button>
                <button className="btn-ghost" onClick={() => setShowAddType(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {types.map(t => (
          <button key={t.id} onClick={() => setSelected(t)}
            style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 6 }}>
            <div className={`glass-row hstack`}
              style={{ padding: 12, border: selected?.id === t.id ? "1px solid var(--marigold-500)" : undefined }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{t.name}</div>
                <div className="mono dim" style={{ fontSize: "var(--fs-xs)" }}>{t.code}</div>
              </div>
              <ChevronRight size={16} color="var(--text-low)" />
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <LookupValuesPanel typeCode={selected.code} typeName={selected.name} isAdmin={isAdmin}
          onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function LookupValuesPanel({ typeCode, typeName, isAdmin, onClose }) {
  const [values, setValues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newLabel, setNewLabel] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState("");

  const load = async () => {
    setLoading(true);
    try { const { data } = await api.get(`/v1/lookups/${typeCode}/values`, { params: { activeOnly: false } }); setValues(data); }
    catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [typeCode]);

  const addValue = async () => {
    if (!newLabel.trim()) return;
    setAdding(true);
    try { await api.post(`/v1/lookups/${typeCode}/values`, { label: newLabel.trim() }); setNewLabel(""); load(); }
    catch {} finally { setAdding(false); }
  };

  const saveEdit = async (id) => {
    if (!editLabel.trim()) return;
    await api.put(`/v1/lookup-values/${id}`, { label: editLabel.trim() }).catch(() => {});
    setEditingId(null); load();
  };

  const toggle = async (id, isActive) => {
    await api.put(`/v1/lookup-values/${id}`, { is_active: !isActive }).catch(() => {});
    load();
  };

  return (
    <div className="glass" style={{ padding: 16 }}>
      <div className="hstack" style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 600, flex: 1 }}>{typeName}</div>
        <span className="mono dim" style={{ fontSize: "var(--fs-xs)", marginRight: 8 }}>{typeCode}</span>
        <button className="btn-ghost btn-sm" onClick={onClose}><X size={16} /></button>
      </div>

      {loading && <div className="skeleton" style={{ height: 120 }} />}
      {!loading && values.length === 0 && (
        <div className="dim" style={{ textAlign: "center", padding: 24 }}>No values yet. Add one below.</div>
      )}
      {!loading && values.map(v => (
        <div key={v.id} className="glass-row" style={{ padding: "8px 12px", marginBottom: 6, opacity: v.is_active ? 1 : 0.5 }}>
          {editingId === v.id ? (
            <div className="hstack">
              <input className="input" value={editLabel} onChange={e => setEditLabel(e.target.value)}
                style={{ flex: 1 }} onKeyDown={e => e.key === "Enter" && saveEdit(v.id)} autoFocus />
              <button className="btn-primary btn-sm" onClick={() => saveEdit(v.id)}>Save</button>
              <button className="btn-ghost btn-sm" onClick={() => setEditingId(null)}>×</button>
            </div>
          ) : (
            <div className="hstack">
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "var(--fs-sm)", fontWeight: 500 }}>{v.label}</div>
                <div className="mono dim" style={{ fontSize: "var(--fs-xs)" }}>{v.code}</div>
              </div>
              <button className="btn-ghost btn-sm" onClick={() => { setEditingId(v.id); setEditLabel(v.label); }}>
                <Edit2 size={12} />
              </button>
              {isAdmin && (
                <button style={{
                  background: "none", border: "none", cursor: "pointer", fontSize: "var(--fs-xs)",
                  color: v.is_active ? "var(--st-alert)" : "var(--st-complete)", padding: "4px 8px"
                }}
                  onClick={() => toggle(v.id, v.is_active)}>
                  {v.is_active ? "Disable" : "Enable"}
                </button>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Quick-add */}
      <div className="hstack" style={{ marginTop: 12 }}>
        <input className="input" placeholder="New value label…" value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addValue())}
          style={{ flex: 1 }} />
        <button className="btn-primary" onClick={addValue} disabled={adding || !newLabel.trim()}
          style={{ padding: "10px 14px" }}>
          {adding ? "…" : <Plus size={16} />}
        </button>
      </div>
      <div className="dim" style={{ fontSize: "10px", marginTop: 4 }}>Press Enter to quickly add multiple values</div>
    </div>
  );
}

/* ─── Custom Fields ───────────────────────────────────────────────────────── */
function FieldsTab() {
  const [entityType, setEntityType] = useState(ENTITY_TYPES[0].key);
  const [defs, setDefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [lookupTypes, setLookupTypes] = useState([]);
  const confirm = useConfirm();

  const load = async () => {
    setLoading(true);
    try { const { data } = await api.get(`/v1/meta/fields/${entityType}`); setDefs(data); }
    catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [entityType]);
  useEffect(() => { api.get("/v1/lookup-types").then(({ data }) => setLookupTypes(data)).catch(() => {}); }, []);

  const deactivate = async (id) => {
    const ok = await confirm({ title: "Remove Field?", message: "Data in this field will no longer appear in forms.", okLabel: "Remove", danger: true });
    if (!ok) return;
    await api.delete(`/v1/meta/fields/${id}`).catch(() => {});
    load();
  };

  const toggleRequired = async (d) => {
    await api.put(`/v1/meta/fields/${d.id}`, { is_required: !d.is_required }).catch(() => {});
    load();
  };

  return (
    <div>
      <div className="hstack" style={{ marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
        <select className="input select" value={entityType}
          onChange={e => setEntityType(e.target.value)} style={{ maxWidth: 260 }}>
          {ENTITY_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
        </select>
        <div style={{ flex: 1 }} />
        <button className="btn-primary" onClick={() => setDrawer(true)} data-testid="add-field-btn">
          <Plus size={15} /> Add Field
        </button>
      </div>

      {loading && <div className="skeleton" style={{ height: 160, borderRadius: 16 }} />}

      {!loading && defs.length === 0 && (
        <div className="glass-row" style={{ padding: 32, textAlign: "center" }}>
          <div className="dim">No custom fields for {ENTITY_TYPES.find(t => t.key === entityType)?.label || entityType}.</div>
          <div className="dim" style={{ fontSize: "var(--fs-xs)", marginTop: 6 }}>
            Click "Add Field" to define extra data fields for this form.
          </div>
        </div>
      )}

      {!loading && defs.map(d => (
        <div key={d.id} className="glass-row hstack" style={{ padding: 12, marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>
              {d.label}
              {d.is_required && <span style={{ color: "var(--st-alert)", marginLeft: 4 }}>*</span>}
            </div>
            <div className="mono dim" style={{ fontSize: "var(--fs-xs)" }}>
              {d.field_key} · {d.data_type}
            </div>
          </div>
          {/* Toggle required inline */}
          <button
            onClick={() => toggleRequired(d)}
            title={d.is_required ? "Click to make optional" : "Click to make required"}
            style={{
              background: "none", border: "none", cursor: "pointer", padding: "4px 8px",
              color: d.is_required ? "var(--st-alert)" : "var(--text-low)",
              display: "flex", alignItems: "center", gap: 4, fontSize: "var(--fs-xs)"
            }}>
            {d.is_required
              ? <><ToggleRight size={18} /><span>Required</span></>
              : <><ToggleLeft size={18} /><span>Optional</span></>
            }
          </button>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--st-alert)", padding: 8 }}
            onClick={() => deactivate(d.id)}>
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      {drawer && (
        <>
          <div className="drawer-backdrop" onClick={() => setDrawer(false)} />
          <FieldForm entityType={entityType} lookupTypes={lookupTypes}
            onClose={() => setDrawer(false)} onSaved={() => { setDrawer(false); load(); }} />
        </>
      )}
    </div>
  );
}

function FieldForm({ entityType, lookupTypes, onClose, onSaved }) {
  const [f, setF] = useState({
    entity_type: entityType, field_key: "", label: "",
    data_type: "TEXT", lookup_type_id: "", is_required: false, sort_order: 0,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  // Auto-generate field_key from label
  const handleLabelChange = (val) => {
    set("label", val);
    if (!f.field_key || f.field_key === autoKey(f.label)) {
      set("field_key", autoKey(val));
    }
  };
  const autoKey = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      await api.post("/v1/meta/fields", {
        ...f,
        lookup_type_id: f.lookup_type_id || null,
        validation: {}, default_value: null, show_in_list: true,
      });
      onSaved();
    } catch { setErr("We couldn’t save the field. Check the details and try again."); }
    finally { setSaving(false); }
  };

  return (
    <div className="drawer glass-strong">
      <div className="hstack" style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, flex: 1 }}>New Custom Field</div>
        <button className="btn-ghost btn-sm" onClick={onClose}><X size={16} /></button>
      </div>
      <div className="dim" style={{ fontSize: "var(--fs-xs)", marginBottom: 12 }}>
        Adding to: <strong>{ENTITY_TYPES.find(t => t.key === entityType)?.label || entityType}</strong>
      </div>
      <form onSubmit={submit} className="vstack" style={{ gap: 12 }}>
        <label className="field"><div className="lbl">Label (shown in form) *</div>
          <input className="input" value={f.label} onChange={e => handleLabelChange(e.target.value)} required /></label>
        <label className="field">
          <div className="lbl">Field Key (snake_case) *</div>
          <input className="input mono" value={f.field_key} onChange={e => set("field_key", e.target.value)}
            required placeholder="e.g. lot_number" />
          <div className="dim" style={{ fontSize: "10px", marginTop: 2 }}>Auto-generated from label. Must be unique.</div>
        </label>
        <label className="field"><div className="lbl">Data Type *</div>
          <select className="input select" value={f.data_type} onChange={e => set("data_type", e.target.value)}>
            {[
              ["TEXT", "Text (short)"],
              ["MULTILINE", "Text (multiline)"],
              ["NUMBER", "Number (decimal)"],
              ["INTEGER", "Number (integer)"],
              ["DATE", "Date"],
              ["DATETIME", "Date & Time"],
              ["BOOLEAN", "Yes / No checkbox"],
              ["LOOKUP", "Dropdown (lookup)"],
            ].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select></label>
        {f.data_type === "LOOKUP" && (
          <label className="field"><div className="lbl">Lookup Type *</div>
            <select className="input select" value={f.lookup_type_id}
              onChange={e => set("lookup_type_id", e.target.value)} required>
              <option value="">Select…</option>
              {lookupTypes.map(lt => <option key={lt.id} value={lt.id}>{lt.name} ({lt.code})</option>)}
            </select></label>
        )}
        <label className="field"><div className="lbl">Sort Order</div>
          <input className="input num" type="number" value={f.sort_order} onChange={e => set("sort_order", Number(e.target.value))} /></label>
        <label className="hstack" style={{ gap: 8, cursor: "pointer" }}>
          <input type="checkbox" checked={f.is_required} onChange={e => set("is_required", e.target.checked)} />
          <span>Required field <span className="dim" style={{ fontSize: "var(--fs-xs)" }}>(user must fill this)</span></span>
        </label>
        {err && <div className="pill alert" style={{ padding: "8px 12px" }}>{err}</div>}
        <button className="btn-primary" type="submit" disabled={saving}>{saving ? "Saving…" : "Add Field"}</button>
      </form>
    </div>
  );
}

/* ─── Users ──────────────────────────────────────────────────────────────── */
function UsersTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(null);
  const [editing, setEditing] = useState(null);
  const confirm = useConfirm();

  const load = async () => {
    setLoading(true);
    try { const { data } = await api.get("/auth/users"); setRows(data); }
    catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const toggleActive = async (u) => {
    const action = u.is_active ? "Deactivate" : "Activate";
    const ok = await confirm({ title: `${action} User?`, message: `${action} ${u.full_name}?`, okLabel: action, danger: u.is_active });
    if (!ok) return;
    await api.delete(`/auth/users/${u.id}`).catch(() => {});
    load();
  };

  const ROLE_COLOR = { ADMIN: "var(--marigold-500)", MANAGER: "var(--st-partial)", STAFF: "var(--text-mid)" };

  return (
    <div>
      <div className="hstack" style={{ marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600 }}>Staff Accounts</div>
          <div className="dim" style={{ fontSize: "var(--fs-xs)" }}>Manage who can log in and what they can access</div>
        </div>
        <button className="btn-primary" onClick={() => { setEditing(null); setDrawer("user"); }}>
          <Plus size={15} /> Add User
        </button>
      </div>

      {loading && <div className="skeleton" style={{ height: 180, borderRadius: 16 }} />}
      {!loading && rows.map(u => (
        <div key={u.id} className="glass-row hstack" style={{ padding: 14, marginBottom: 8, gap: 12, opacity: u.is_active ? 1 : 0.55 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--glass-fill-strong)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Users size={18} color="var(--marigold-500)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>{u.full_name}</div>
            <div className="dim" style={{ fontSize: "var(--fs-xs)" }}>
              @{u.username} · {u.phone || "—"}
            </div>
          </div>
          <span className="pill" style={{ background: "var(--glass-fill)", color: ROLE_COLOR[u.role], padding: "2px 8px", fontSize: "10px" }}>
            {u.role}
          </span>
          <button className="btn-ghost btn-sm" onClick={() => { setEditing(u); setDrawer("user"); }}><Edit2 size={14} /></button>
          <button className="btn-ghost btn-sm" onClick={() => { setEditing(u); setDrawer("password"); }}><Key size={14} /></button>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: u.is_active ? "var(--st-alert)" : "var(--st-complete)", padding: 8 }}
            onClick={() => toggleActive(u)}>
            {u.is_active ? "Disable" : "Enable"}
          </button>
        </div>
      ))}
      {!loading && rows.length === 0 && <div className="dim" style={{ textAlign: "center", padding: 40 }}>No users found.</div>}

      {drawer === "user" && (
        <>
          <div className="drawer-backdrop" onClick={() => setDrawer(null)} />
          <UserForm user={editing} onClose={() => setDrawer(null)} onSaved={() => { setDrawer(null); load(); }} />
        </>
      )}
      {drawer === "password" && (
        <>
          <div className="drawer-backdrop" onClick={() => setDrawer(null)} />
          <PasswordForm user={editing} onClose={() => setDrawer(null)} onSaved={() => { setDrawer(null); load(); }} />
        </>
      )}
    </div>
  );
}

function UserForm({ user, onClose, onSaved }) {
  const [f, setF] = useState({
    full_name: user?.full_name || "",
    username: user?.username || "",
    password: "",
    phone: user?.phone || "",
    role: user?.role || "STAFF",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      if (user) {
        const upd = { full_name: f.full_name, phone: f.phone, role: f.role };
        await api.put(`/auth/users/${user.id}`, upd);
      } else {
        await api.post("/auth/users", f);
      }
      onSaved();
    } catch { setErr("We couldn’t save the user. Check the details and try again."); }
    finally { setSaving(false); }
  };

  return (
    <div className="drawer glass-strong">
      <div className="hstack" style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: "var(--fs-lg)", flex: 1 }}>{user ? "Edit User" : "New User"}</div>
        <button className="btn-ghost btn-sm" onClick={onClose}><X size={16} /></button>
      </div>
      <form onSubmit={submit} className="vstack" style={{ gap: 12 }}>
        <label className="field"><div className="lbl">Full Name *</div>
          <input className="input" value={f.full_name} onChange={e => set("full_name", e.target.value)} required /></label>
        {!user && (
          <>
            <label className="field"><div className="lbl">Username *</div>
              <input className="input" value={f.username} onChange={e => set("username", e.target.value)}
                required placeholder="e.g. ravi_sales" /></label>
            <label className="field"><div className="lbl">Password * (min 4 chars)</div>
              <input className="input" type="password" value={f.password}
                onChange={e => set("password", e.target.value)} required minLength={4} /></label>
          </>
        )}
        <label className="field"><div className="lbl">Phone</div>
          <input className="input" value={f.phone} onChange={e => set("phone", e.target.value)} /></label>
        <label className="field"><div className="lbl">Role *</div>
          <select className="input select" value={f.role} onChange={e => set("role", e.target.value)}>
            <option value="STAFF">Staff — standard access</option>
            <option value="MANAGER">Manager — elevated access</option>
            <option value="ADMIN">Admin — full access including adjustments</option>
          </select></label>
        {err && <div className="pill alert" style={{ padding: "8px 12px" }}>{err}</div>}
        <button className="btn-primary" type="submit" disabled={saving}>
          {saving ? "Saving…" : user ? "Update User" : "Create User"}
        </button>
      </form>
    </div>
  );
}

function PasswordForm({ user, onClose, onSaved }) {
  const [password, setPassword] = useState("");
  const [confirm2, setConfirm2] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (password !== confirm2) { setErr("Passwords don't match"); return; }
    if (password.length < 4) { setErr("Min 4 characters"); return; }
    setSaving(true); setErr("");
    try {
      await api.put(`/auth/users/${user.id}`, { password });
      onSaved();
    } catch { setErr("We couldn’t change the password. Try again."); }
    finally { setSaving(false); }
  };

  return (
    <div className="drawer glass-strong">
      <div className="hstack" style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, flex: 1 }}>Change Password — {user?.full_name}</div>
        <button className="btn-ghost btn-sm" onClick={onClose}><X size={16} /></button>
      </div>
      <form onSubmit={submit} className="vstack" style={{ gap: 12 }}>
        <label className="field"><div className="lbl">New Password *</div>
          <input className="input" type="password" value={password}
            onChange={e => setPassword(e.target.value)} required minLength={4} autoFocus /></label>
        <label className="field"><div className="lbl">Confirm Password *</div>
          <input className="input" type="password" value={confirm2}
            onChange={e => setConfirm2(e.target.value)} required /></label>
        {err && <div className="pill alert" style={{ padding: "8px 12px" }}>{err}</div>}
        <button className="btn-primary" type="submit" disabled={saving}>
          {saving ? "Saving…" : "Change Password"}
        </button>
      </form>
    </div>
  );
}
