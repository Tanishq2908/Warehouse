import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import DataGrid from "@/components/DataGrid";
import LookupSelect from "@/components/LookupSetup";
import { useConfirm } from "@/components/Confirm";
import { Plus, X, Trash2, CheckCircle, Edit2, ChevronDown, Hash } from "lucide-react";

const STATUS_CLASS = {
  PENDING: "pending",
  PARTIALLY_RECEIVED: "partial",
  FULLY_RECEIVED: "complete",
  CANCELLED: "cancelled",
};

const EMPTY_ITEM = () => ({
  _key: Math.random(),
  line_no: 1,
  product_id: "",
  design_id: "",
  qty_ordered: "",
  unit_id: "",
  hsn_code: "",
  quality_id: "",
  rate: "",
  piece_no: "",
  extra_fields: [],   // [{label, value}]
});

export default function Orders({ openNew }) {
  const { isAdmin } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drawer, setDrawer] = useState(openNew ? "new" : null);
  const [selected, setSelected] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (q) params.q = q;
      const { data } = await api.get("/v1/purchase-orders", { params });
      setRows(data);
    } catch {
      setError("We couldn’t load orders. Refresh and try again.");
    } finally { setLoading(false); }
  }, [statusFilter, q]);

  useEffect(() => { load(); }, [load]);

  const columns = [
    { key: "order_no", label: "Order #", sortable: true },
    { key: "provider_name", label: "Provider", render: (v) => v || <span className="dim">—</span> },
    { key: "order_date", label: "Date", sortable: true },
    {
      key: "status", label: "Status",
      render: (v) => <span className={`pill ${STATUS_CLASS[v] || ""}`}>{v?.replace(/_/g, " ")}</span>
    },
    { key: "totals_value", label: "Value ₹", num: true, sortable: true, render: (_, row) => fmt(row.totals?.value) },
    {
      key: "fill", label: "Fill", num: true,
      render: (_, row) => {
        const pct = row.totals?.fill_pct ?? 0;
        const cls = STATUS_CLASS[row.status] || "pending";
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
            <div className={`bolt ${cls}`} style={{ height: 28 }}>
              <div className="bolt-fill" style={{ height: `${Math.min(pct, 100)}%` }} />
            </div>
            <span className="mono" style={{ fontSize: "var(--fs-xs)", minWidth: 36 }}>{pct}%</span>
          </div>
        );
      }
    },
  ];

  return (
    <div>
      <div className="hstack" style={{ marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <h1 className="page-title" style={{ margin: 0, flex: 1 }}>Purchase Orders</h1>
        <button className="btn-primary" data-testid="new-order-btn"
          onClick={() => { setSelected(null); setDrawer("new"); }}>
          <Plus size={16} /> New Order
        </button>
      </div>

      <div className="glass filter-bar" style={{ marginBottom: 16 }}>
        <input className="input" placeholder="Search order #…" value={q}
          onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 200 }} data-testid="order-search" />
        <select className="input select" value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)} style={{ maxWidth: 200 }} data-testid="status-filter">
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PARTIALLY_RECEIVED">Partially Received</option>
          <option value="FULLY_RECEIVED">Fully Received</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="glass" style={{ overflow: "hidden" }}>
        <DataGrid columns={columns} rows={rows} loading={loading} error={error}
          onRowClick={(row) => { setSelected(row); setDrawer("view"); }}
          emptyMessage="No orders found. Create one to get started." />
      </div>

      {drawer && (
        <>
          <div className="drawer-backdrop" onClick={() => setDrawer(null)} />
          {drawer === "new" || drawer === "edit" ? (
            <OrderForm
              order={drawer === "edit" ? selected : null}
              onClose={() => setDrawer(null)}
              onSaved={() => { setDrawer(null); load(); }} />
          ) : (
            <OrderDetail
              order={selected}
              isAdmin={isAdmin}
              onClose={() => setDrawer(null)}
              onEdit={() => setDrawer("edit")}
              onRefresh={load} />
          )}
        </>
      )}
    </div>
  );
}

/* ─── Order Form ─────────────────────────────────────────────────────────── */
function OrderForm({ order, onClose, onSaved }) {
  const [provider, setProvider] = useState(order?.provider_id || "");
  const [date, setDate] = useState(order?.order_date || today());
  const [expected, setExpected] = useState(order?.expected_date || "");
  const [notes, setNotes] = useState(order?.notes || "");
  const [items, setItems] = useState(
    order?.items?.map((i) => ({ ...i, _key: Math.random(), piece_no: i.piece_no || "", extra_fields: [] })) || [EMPTY_ITEM()]
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [providers, setProviders] = useState([]);
  const [products, setProducts] = useState([]);
  const [designs, setDesigns] = useState({});

  // Quick-create state
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddDesign, setShowAddDesign] = useState(false);
  const [addDesignForKey, setAddDesignForKey] = useState(null);

  const loadProviders = () =>
    api.get("/v1/parties", { params: { role: "PROVIDER" } }).then(({ data }) => setProviders(data)).catch(() => {});
  const loadProducts = () =>
    api.get("/v1/products").then(({ data }) => setProducts(data)).catch(() => {});

  useEffect(() => { loadProviders(); loadProducts(); }, []);

  const loadDesigns = async (productId, key) => {
    if (!productId) return;
    try {
      const { data } = await api.get("/v1/designs", { params: { productId } });
      setDesigns((d) => ({ ...d, [key]: data }));
    } catch {}
  };

  const setItem = (key, field, val) => {
    setItems((prev) => prev.map((it) => {
      if (it._key !== key) return it;
      const updated = { ...it, [field]: val };
      if (field === "product_id") { updated.design_id = ""; loadDesigns(val, key); }
      return updated;
    }));
  };

  const addExtraField = (key) => {
    setItems(prev => prev.map(it => {
      if (it._key !== key) return it;
      return { ...it, extra_fields: [...(it.extra_fields || []), { label: "", value: "" }] };
    }));
  };
  const setExtraField = (key, idx, k, v) => {
    setItems(prev => prev.map(it => {
      if (it._key !== key) return it;
      const ef = [...(it.extra_fields || [])];
      ef[idx] = { ...ef[idx], [k]: v };
      return { ...it, extra_fields: ef };
    }));
  };
  const removeExtraField = (key, idx) => {
    setItems(prev => prev.map(it => {
      if (it._key !== key) return it;
      const ef = [...(it.extra_fields || [])];
      ef.splice(idx, 1);
      return { ...it, extra_fields: ef };
    }));
  };

  const duplicateLast = () => {
    if (items.length === 0) return;
    const last = items[items.length - 1];
    const copy = { ...last, _key: Math.random(), qty_ordered: "", piece_no: "", extra_fields: [] };
    setItems((p) => [...p, copy]);
    if (last.product_id) loadDesigns(last.product_id, copy._key);
  };

  const gross = items.reduce((s, i) => s + (Number(i.qty_ordered) || 0) * (Number(i.rate) || 0), 0);

  const submit = async (e) => {
    e.preventDefault(); setErr(""); setSaving(true);
    try {
      const payload = {
        provider_id: provider, order_date: date,
        expected_date: expected || null, notes: notes || null, custom_fields: {},
        items: items.map((it, i) => {
          const cf = {};
          (it.extra_fields || []).forEach(f => { if (f.label.trim()) cf[f.label.trim()] = f.value; });
          return {
            line_no: i + 1, product_id: it.product_id, design_id: it.design_id || null,
            qty_ordered: Number(it.qty_ordered), unit_id: it.unit_id,
            hsn_code: it.hsn_code || "", quality_id: it.quality_id || null,
            rate: Number(it.rate),
            piece_no: it.piece_no?.trim() || null,
            custom_fields: cf,
          };
        }),
      };
      if (order) await api.put(`/v1/purchase-orders/${order.id}`, payload);
      else await api.post("/v1/purchase-orders", payload);
      onSaved();
    } catch {
      setErr("We couldn’t save the order. Check the details and try again.");
    } finally { setSaving(false); }
  };

  return (
    <div className="drawer glass-strong">
      <div className="hstack" style={{ marginBottom: 20 }}>
        <div className="display" style={{ fontSize: "var(--fs-lg)", fontWeight: 600, flex: 1 }}>
          {order ? "Edit Order" : "New Purchase Order"}
        </div>
        <button className="btn-ghost btn-sm" onClick={onClose}><X size={16} /></button>
      </div>

      <form onSubmit={submit} className="vstack" style={{ gap: 14 }}>
        {/* Provider with quick-add */}
        <div>
          <div className="hstack" style={{ marginBottom: 4 }}>
            <span className="lbl" style={{ flex: 1 }}>Provider *</span>
            <button type="button" className="btn-ghost btn-sm"
              style={{ fontSize: "var(--fs-xs)", padding: "2px 8px" }}
              onClick={() => setShowAddProvider(true)}>
              <Plus size={11} /> New Provider
            </button>
          </div>
          <select className="input select" value={provider}
            onChange={(e) => setProvider(e.target.value)} required data-testid="order-provider">
            <option value="">Select provider…</option>
            {providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="grid-2">
          <label className="field">
            <div className="lbl">Order Date *</div>
            <input className="input" type="date" value={date}
              onChange={(e) => setDate(e.target.value)} required data-testid="order-date" />
          </label>
          <label className="field">
            <div className="lbl">Expected Date</div>
            <input className="input" type="date" value={expected}
              onChange={(e) => setExpected(e.target.value)} data-testid="order-expected" />
          </label>
        </div>

        {/* Line items */}
        <div style={{ borderTop: "1px solid var(--glass-stroke)", paddingTop: 12 }}>
          <div className="hstack" style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 600, flex: 1 }}>Line Items</div>
            <button type="button" className="btn-ghost btn-sm" onClick={duplicateLast}>Duplicate last</button>
            <button type="button" className="btn-ghost btn-sm"
              onClick={() => setItems((p) => [...p, EMPTY_ITEM()])}>
              <Plus size={14} /> Add Line
            </button>
          </div>

          {items.map((it, idx) => (
            <div key={it._key} className="glass-row" style={{ padding: 12, marginBottom: 10, borderRadius: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span className="dim" style={{ fontSize: "var(--fs-xs)" }}>Line {idx + 1}</span>
                {items.length > 1 && (
                  <button type="button" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--st-alert)" }}
                    onClick={() => setItems((p) => p.filter((x) => x._key !== it._key))}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <div className="grid-2">
                {/* Product with quick-add */}
                <div>
                  <div className="hstack" style={{ marginBottom: 4 }}>
                    <span className="lbl" style={{ flex: 1, fontSize: "var(--fs-xs)" }}>Product *</span>
                    <button type="button" className="btn-ghost btn-sm"
                      style={{ fontSize: "10px", padding: "1px 6px" }}
                      onClick={() => setShowAddProduct(true)}>
                      <Plus size={10} />
                    </button>
                  </div>
                  <select className="input select" value={it.product_id}
                    onChange={(e) => setItem(it._key, "product_id", e.target.value)} required>
                    <option value="">Select…</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                {/* Design with quick-add */}
                <div>
                  <div className="hstack" style={{ marginBottom: 4 }}>
                    <span className="lbl" style={{ flex: 1, fontSize: "var(--fs-xs)" }}>Design</span>
                    <button type="button" className="btn-ghost btn-sm"
                      style={{ fontSize: "10px", padding: "1px 6px" }}
                      onClick={() => { setAddDesignForKey(it._key); setShowAddDesign(true); }}
                      disabled={!it.product_id}>
                      <Plus size={10} />
                    </button>
                  </div>
                  <select className="input select" value={it.design_id}
                    onChange={(e) => setItem(it._key, "design_id", e.target.value)}>
                    <option value="">Any / None</option>
                    {(designs[it._key] || []).map((d) =>
                      <option key={d.id} value={d.id}>{d.design_code} — {d.name}</option>
                    )}
                  </select>
                </div>

                <label className="field">
                  <div className="lbl">Qty *</div>
                  <input className="input num" type="number" step="any" min="0.001"
                    value={it.qty_ordered}
                    onChange={(e) => setItem(it._key, "qty_ordered", e.target.value)} required />
                </label>
                <label className="field">
                  <div className="lbl">Unit *</div>
                  <LookupSelect typeCode="UNIT" value={it.unit_id}
                    onChange={(v) => setItem(it._key, "unit_id", v)} placeholder="Unit" />
                </label>
                <label className="field">
                  <div className="lbl">Rate ₹ *</div>
                  <input className="input num" type="number" step="any" min="0"
                    value={it.rate}
                    onChange={(e) => setItem(it._key, "rate", e.target.value)} required />
                </label>
                <label className="field">
                  <div className="lbl"><Hash size={11} style={{ display: "inline", marginRight: 2 }} />Piece No.</div>
                  <input className="input mono" value={it.piece_no}
                    onChange={(e) => setItem(it._key, "piece_no", e.target.value)}
                    placeholder="optional" />
                </label>
                <label className="field">
                  <div className="lbl">Quality</div>
                  <LookupSelect typeCode="QUALITY" value={it.quality_id}
                    onChange={(v) => setItem(it._key, "quality_id", v)} placeholder="Quality" allowCreate={false} />
                </label>
                <label className="field">
                  <div className="lbl">HSN Code</div>
                  <input className="input" value={it.hsn_code}
                    onChange={(e) => setItem(it._key, "hsn_code", e.target.value)} />
                </label>
              </div>

              {/* Extra fields per line */}
              {(it.extra_fields || []).length > 0 && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--glass-stroke)" }}>
                  <div className="dim" style={{ fontSize: "var(--fs-xs)", marginBottom: 6 }}>Additional Fields</div>
                  {it.extra_fields.map((ef, fidx) => (
                    <div key={fidx} className="hstack" style={{ gap: 8, marginBottom: 6 }}>
                      <input className="input" placeholder="Field name…" value={ef.label}
                        onChange={e => setExtraField(it._key, fidx, "label", e.target.value)}
                        style={{ flex: 1 }} />
                      <input className="input" placeholder="Value…" value={ef.value}
                        onChange={e => setExtraField(it._key, fidx, "value", e.target.value)}
                        style={{ flex: 2 }} />
                      <button type="button" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--st-alert)", padding: 6 }}
                        onClick={() => removeExtraField(it._key, fidx)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="hstack" style={{ marginTop: 8, justifyContent: "space-between", alignItems: "center" }}>
                <button type="button" className="btn-ghost btn-sm"
                  style={{ fontSize: "var(--fs-xs)" }}
                  onClick={() => addExtraField(it._key)}>
                  <Plus size={12} /> Add Field
                </button>
                <span className="dim" style={{ fontSize: "var(--fs-xs)" }}>
                  Line total: ₹{fmt((Number(it.qty_ordered) || 0) * (Number(it.rate) || 0))}
                </span>
              </div>
            </div>
          ))}

          <div className="hstack" style={{ justifyContent: "flex-end", paddingTop: 8 }}>
            <span className="dim" style={{ fontSize: "var(--fs-sm)" }}>Order Total:</span>
            <span className="mono" style={{ fontWeight: 700, marginLeft: 8, fontSize: "var(--fs-lg)" }}>₹{fmt(gross)}</span>
          </div>
        </div>

        <label className="field">
          <div className="lbl">Notes</div>
          <textarea className="input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>

        {err && <div className="pill alert" style={{ padding: "8px 12px" }}>{err}</div>}
        <button className="btn-primary" type="submit" disabled={saving} data-testid="order-save">
          {saving ? "Saving…" : order ? "Update Order" : "Create Order"}
        </button>
      </form>

      {/* Quick-create modals */}
      {showAddProvider && (
        <QuickAddProvider
          onClose={() => setShowAddProvider(false)}
          onSaved={(p) => { setShowAddProvider(false); loadProviders(); setProvider(p.id); }}
        />
      )}
      {showAddProduct && (
        <QuickAddProduct
          onClose={() => setShowAddProduct(false)}
          onSaved={(p) => { setShowAddProduct(false); loadProducts(); }}
        />
      )}
      {showAddDesign && addDesignForKey && (
        <QuickAddDesign
          productId={items.find(i => i._key === addDesignForKey)?.product_id}
          products={products}
          onClose={() => { setShowAddDesign(false); setAddDesignForKey(null); }}
          onSaved={(d) => {
            setShowAddDesign(false);
            if (addDesignForKey) {
              const itm = items.find(i => i._key === addDesignForKey);
              if (itm?.product_id) loadDesigns(itm.product_id, addDesignForKey);
            }
            setAddDesignForKey(null);
          }}
        />
      )}
    </div>
  );
}

/* ─── Quick-create mini-modals ───────────────────────────────────────────── */
function QuickAddProvider({ onClose, onSaved }) {
  const [f, setF] = useState({ name: "", phone: "", city: "", is_provider: true });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      const { data } = await api.post("/v1/parties", {
        ...f, legal_name: null, email: null, gstin: null,
        address_line: null, state: null, pincode: null,
        is_customer: false, is_seller: false, opening_balance: 0, custom_fields: {},
      });
      onSaved(data);
    } catch { setErr("We couldn’t save the party. Try again."); }
    finally { setSaving(false); }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1100, display: "flex",
      alignItems: "center", justifyContent: "center"
    }}>
      <div style={{ position: "absolute", inset: 0, background: "var(--overlay)" }} onClick={onClose} />
      <div className="glass-strong" style={{ position: "relative", zIndex: 1101, padding: 24, borderRadius: 20, width: 360, maxWidth: "90vw" }}>
        <div className="hstack" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700 }}>New Provider</div>
          <button className="btn-ghost btn-sm" style={{ marginLeft: "auto" }} onClick={onClose}><X size={15} /></button>
        </div>
        <form onSubmit={submit} className="vstack" style={{ gap: 10 }}>
          <label className="field">
            <div className="lbl">Name *</div>
            <input className="input" value={f.name} onChange={e => set("name", e.target.value)} required autoFocus />
          </label>
          <div className="grid-2">
            <label className="field">
              <div className="lbl">Phone</div>
              <input className="input" value={f.phone} onChange={e => set("phone", e.target.value)} />
            </label>
            <label className="field">
              <div className="lbl">City</div>
              <input className="input" value={f.city} onChange={e => set("city", e.target.value)} />
            </label>
          </div>
          {err && <div className="pill alert" style={{ padding: "6px 10px", fontSize: "var(--fs-xs)" }}>{err}</div>}
          <button className="btn-primary" type="submit" disabled={saving}>{saving ? "Saving…" : "Create Provider"}</button>
        </form>
      </div>
    </div>
  );
}

function QuickAddProduct({ onClose, onSaved }) {
  const [name, setName] = useState("");
  const [hsn, setHsn] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      const { data } = await api.post("/v1/products", { name, hsn_code: hsn || null, custom_fields: {} });
      onSaved(data);
    } catch { setErr("We couldn’t save the product. Try again."); }
    finally { setSaving(false); }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1100, display: "flex",
      alignItems: "center", justifyContent: "center"
    }}>
      <div style={{ position: "absolute", inset: 0, background: "var(--overlay)" }} onClick={onClose} />
      <div className="glass-strong" style={{ position: "relative", zIndex: 1101, padding: 24, borderRadius: 20, width: 360, maxWidth: "90vw" }}>
        <div className="hstack" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700 }}>New Product</div>
          <button className="btn-ghost btn-sm" style={{ marginLeft: "auto" }} onClick={onClose}><X size={15} /></button>
        </div>
        <form onSubmit={submit} className="vstack" style={{ gap: 10 }}>
          <label className="field">
            <div className="lbl">Product Name *</div>
            <input className="input" value={name} onChange={e => setName(e.target.value)} required autoFocus />
          </label>
          <label className="field">
            <div className="lbl">HSN Code</div>
            <input className="input" value={hsn} onChange={e => setHsn(e.target.value)} />
          </label>
          {err && <div className="pill alert" style={{ padding: "6px 10px", fontSize: "var(--fs-xs)" }}>{err}</div>}
          <button className="btn-primary" type="submit" disabled={saving}>{saving ? "Saving…" : "Create Product"}</button>
        </form>
      </div>
    </div>
  );
}

function QuickAddDesign({ productId, products, onClose, onSaved }) {
  const [name, setName] = useState("");
  const [selProduct, setSelProduct] = useState(productId || "");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      const { data } = await api.post("/v1/designs", {
        name, product_id: selProduct || null, notes: notes || null, custom_fields: {},
      });
      onSaved(data);
    } catch { setErr("We couldn’t save the design. Try again."); }
    finally { setSaving(false); }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1100, display: "flex",
      alignItems: "center", justifyContent: "center"
    }}>
      <div style={{ position: "absolute", inset: 0, background: "var(--overlay)" }} onClick={onClose} />
      <div className="glass-strong" style={{ position: "relative", zIndex: 1101, padding: 24, borderRadius: 20, width: 360, maxWidth: "90vw" }}>
        <div className="hstack" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700 }}>New Design</div>
          <button className="btn-ghost btn-sm" style={{ marginLeft: "auto" }} onClick={onClose}><X size={15} /></button>
        </div>
        <form onSubmit={submit} className="vstack" style={{ gap: 10 }}>
          <label className="field">
            <div className="lbl">Design Name *</div>
            <input className="input" value={name} onChange={e => setName(e.target.value)} required autoFocus />
          </label>
          <label className="field">
            <div className="lbl">Product</div>
            <select className="input select" value={selProduct} onChange={e => setSelProduct(e.target.value)}>
              <option value="">None</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
          <label className="field">
            <div className="lbl">Notes</div>
            <input className="input" value={notes} onChange={e => setNotes(e.target.value)} />
          </label>
          {err && <div className="pill alert" style={{ padding: "6px 10px", fontSize: "var(--fs-xs)" }}>{err}</div>}
          <button className="btn-primary" type="submit" disabled={saving}>{saving ? "Saving…" : "Create Design"}</button>
        </form>
      </div>
    </div>
  );
}

/* ─── Order Detail ───────────────────────────────────────────────────────── */
function OrderDetail({ order, isAdmin, onClose, onEdit, onRefresh }) {
  const [actLoading, setActLoading] = useState(false);
  const confirm = useConfirm();

  const markReceived = async () => {
    const pendingPct = 100 - (order.totals?.fill_pct ?? 100);
    const ok = pendingPct > 5
      ? await confirm({
          title: "Mark Fully Received?",
          message: `${pendingPct.toFixed(0)}% of ordered quantity is still pending. Mark this order fully received anyway?`,
          okLabel: "Yes, mark received",
          danger: false,
        })
      : true;
    if (!ok) return;
    setActLoading(true);
    try {
      await api.post(`/v1/purchase-orders/${order.id}/mark-received`);
      onRefresh(); onClose();
    } catch { alert("We couldn’t complete the update. Try again."); }
    finally { setActLoading(false); }
  };

  const deleteOrder = async () => {
    const ok = await confirm({
      title: "Delete Order?",
      message: "This will permanently delete the order and all its lines.",
      okLabel: "Delete", danger: true,
    });
    if (!ok) return;
    try {
      await api.delete(`/v1/purchase-orders/${order.id}`);
      onRefresh(); onClose();
    } catch { alert("We couldn’t delete that item. Try again."); }
  };

  const st = STATUS_CLASS[order?.status] || "";
  const fill = order?.totals?.fill_pct ?? 0;

  return (
    <div className="drawer glass-strong">
      <div className="hstack" style={{ marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <div className="display mono" style={{ fontWeight: 700, fontSize: "var(--fs-lg)" }}>{order?.order_no}</div>
          <div className="hstack" style={{ gap: 8, marginTop: 4 }}>
            <span className={`pill ${st}`}>{order?.status?.replace(/_/g, " ")}</span>
            {order?.provider_name && <span className="dim" style={{ fontSize: "var(--fs-xs)" }}>{order.provider_name}</span>}
          </div>
        </div>
        <button className="btn-ghost btn-sm" onClick={onClose}><X size={16} /></button>
      </div>

      {/* Fill progress */}
      <div className="glass-row" style={{ padding: 16, marginBottom: 16 }}>
        <div className="hstack" style={{ marginBottom: 8 }}>
          <span className="dim" style={{ fontSize: "var(--fs-sm)" }}>Fill progress</span>
          <span className="mono" style={{ fontWeight: 700, marginLeft: "auto" }}>{fill}%</span>
        </div>
        <div style={{ height: 8, borderRadius: 4, background: "var(--glass-fill)", overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${Math.min(fill, 100)}%`, borderRadius: 4,
            background: fill >= 100 ? "var(--st-complete)" : fill > 0 ? "var(--st-partial)" : "var(--st-pending)",
            transition: "width .5s ease",
          }} />
        </div>
      </div>

      <div className="vstack" style={{ gap: 8, marginBottom: 16 }}>
        <Row label="Order Date" value={order?.order_date} />
        <Row label="Expected" value={order?.expected_date || "—"} />
        <Row label="Order Value" value={`₹ ${fmt(order?.totals?.value)}`} />
        <Row label="Qty Ordered" value={order?.totals?.qty_ordered} />
        <Row label="Qty Received" value={order?.totals?.qty_received} />
        {order?.notes && <Row label="Notes" value={order.notes} />}
      </div>

      <div style={{ fontWeight: 600, marginBottom: 10 }}>Items ({order?.items?.length ?? 0})</div>
      {order?.items?.map((it) => (
        <div key={it.id} className="glass-row" style={{ padding: 12, marginBottom: 8 }}>
          <div className="hstack" style={{ justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>
              {it.product_name || "Line"} {it.design_code ? `— ${it.design_code}` : ""}
            </span>
            <span className="mono" style={{ fontSize: "var(--fs-sm)" }}>
              ₹{fmt(it.qty_ordered * it.rate)}
            </span>
          </div>
          <div className="dim" style={{ fontSize: "var(--fs-xs)" }}>
            Ordered: {it.qty_ordered} {it.unit_label || ""} · Received: {it.qty_received ?? 0} · Pending: {it.qty_pending ?? it.qty_ordered}
          </div>
          {it.piece_no && (
            <div className="dim" style={{ fontSize: "var(--fs-xs)", marginTop: 2 }}>
              <Hash size={10} style={{ display: "inline", marginRight: 2 }} />Piece: <span className="mono">{it.piece_no}</span>
            </div>
          )}
        </div>
      ))}

      <div className="hstack" style={{ marginTop: 20, flexWrap: "wrap", gap: 8 }}>
        {order?.status !== "FULLY_RECEIVED" && order?.status !== "CANCELLED" && (
          <>
            <button className="btn-ghost" onClick={onEdit} data-testid="order-edit-btn">
              <Edit2 size={14} /> Edit
            </button>
            <button className="btn-primary" onClick={markReceived} disabled={actLoading} data-testid="mark-received-btn">
              <CheckCircle size={15} /> {actLoading ? "…" : "Mark Received"}
            </button>
          </>
        )}
        {isAdmin && (
          <button className="btn-danger" onClick={deleteOrder} data-testid="order-delete-btn">
            <Trash2 size={14} /> Delete
          </button>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="hstack" style={{ justifyContent: "space-between" }}>
      <span className="dim" style={{ fontSize: "var(--fs-sm)" }}>{label}</span>
      <span style={{ fontSize: "var(--fs-sm)" }}>{value}</span>
    </div>
  );
}

function today() { return new Date().toISOString().slice(0, 10); }
function fmt(n) {
  if (n === undefined || n === null) return "0";
  return Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}
