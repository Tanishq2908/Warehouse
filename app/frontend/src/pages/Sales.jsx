import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import DataGrid from "@/components/DataGrid";
import LookupSelect from "@/components/LookupSetup";
import { useConfirm } from "@/components/Confirm";
import { Plus, X, Trash2, Edit2 } from "lucide-react";

const EMPTY_ITEM = () => ({
  _key: Math.random(),
  line_no: 1, raw_material_id: "", product_id: "", design_id: "",
  piece_no: "", design_no: "",
  quantity: "", unit_id: "", rate: "", available_qty: null,
});

export default function Sales({ openNew }) {
  const { isAdmin } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drawer, setDrawer] = useState(openNew ? "new" : null);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await api.get("/v1/sales");
      setRows(data);
    } catch {
      setError("We couldn’t load sales. Refresh and try again.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const columns = [
    { key: "sale_no", label: "Sale #", sortable: true },
    { key: "sale_date", label: "Date", sortable: true },
    ...(isAdmin ? [{ key: "bill_type", label: "Type", render: (_, row) => {
      if (!row.bill_type_label) return null;
      const isKaccha = row.bill_type_label.toLowerCase().includes("kaccha");
      return <span className={`pill ${isKaccha ? "kaccha" : "pakka"}`}>{row.bill_type_label}</span>;
    }}] : []),
    { key: "customer_name", label: "Customer", render: (v) => v || <span className="dim">—</span> },
    { key: "gross_amount", label: "Gross ₹", num: true, render: (v) => fmt(v) },
    ...(isAdmin ? [
      { key: "payable_amount", label: "Payable ₹", num: true, render: (v) => v != null ? fmt(v) : <span className="dim">—</span> },
      {
        key: "profit_amount", label: "Profit ₹", num: true,
        render: (v) => v != null
          ? <span style={{ color: v >= 0 ? "var(--st-complete)" : "var(--st-alert)", fontFamily: "inherit" }}>{fmt(v)}</span>
          : <span className="dim">—</span>
      },
    ] : []),
    { key: "bill_no", label: "Bill No", render: (v) => v || <span className="dim">—</span> },
  ];

  return (
    <div>
      <div className="hstack" style={{ marginBottom: 20 }}>
        <h1 className="page-title" style={{ margin: 0, flex: 1 }}>Sales</h1>
        <button className="btn-primary" data-testid="new-sale-btn"
          onClick={() => { setSelected(null); setDrawer("new"); }}>
          <Plus size={16} /> New Sale
        </button>
      </div>

      <div className="glass" style={{ overflow: "hidden" }}>
        <DataGrid
          columns={columns} rows={rows} loading={loading} error={error}
          onRowClick={(row) => { setSelected(row); setDrawer("view"); }}
          emptyMessage="No sales yet. Record a new sale to get started." />
      </div>

      {drawer && (
        <>
          <div className="drawer-backdrop" onClick={() => setDrawer(null)} />
          {drawer === "new" || drawer === "edit" ? (
            <SaleForm
              sale={drawer === "edit" ? selected : null}
              isAdmin={isAdmin}
              onClose={() => setDrawer(null)}
              onSaved={() => { setDrawer(null); load(); }} />
          ) : (
            <SaleDetail
              sale={selected} isAdmin={isAdmin}
              onClose={() => setDrawer(null)}
              onEdit={() => setDrawer("edit")}
              onRefresh={load} />
          )}
        </>
      )}
    </div>
  );
}

function SaleForm({ sale, isAdmin, onClose, onSaved }) {
  const [date, setDate] = useState(sale?.sale_date || today());
  const [billTypeId, setBillTypeId] = useState(sale?.bill_type_id || "");
  const [billNo, setBillNo] = useState(sale?.bill_no || "");
  const [billDate, setBillDate] = useState(sale?.bill_date || "");
  const [notes, setNotes] = useState(sale?.notes || "");
  const [payable, setPayable] = useState(sale?.payable_amount ?? "");
  const [taxable, setTaxable] = useState(sale?.taxable_amount ?? "");
  const [taxPct, setTaxPct] = useState(sale?.tax_percent ?? "");
  const [rebatePct, setRebatePct] = useState(sale?.rebate_percent ?? "");
  const [customerId, setCustomerId] = useState(sale?.customer_party_id || "");
  const [sellerId, setSellerId] = useState(sale?.seller_party_id || "");
  const [items, setItems] = useState(sale?.items?.map(i => ({ ...i, _key: Math.random() })) || [EMPTY_ITEM()]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [billTypes, setBillTypes] = useState([]);
  const [selectedBT, setSelectedBT] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    // Staff only sees non-admin-only bill types — backend filters this
    api.get("/v1/lookups/BILL_TYPE/values").then(({ data }) => {
      // Admin sees all; staff sees only non-admin-only
      const filtered = isAdmin ? data : data.filter(bt => !(bt.attributes?.admin_only));
      setBillTypes(filtered);
      const selected = sale?.bill_type_id
        ? data.find(x => x.id === sale.bill_type_id)
        : !isAdmin ? filtered[0] : null;
      if (selected) {
        setSelectedBT(selected);
        setBillTypeId(selected.id);
      }
    }).catch(() => {});
    api.get("/v1/parties", { params: { role: "CUSTOMER" } }).then(({ data }) => setCustomers(data)).catch(() => {});
    api.get("/v1/parties", { params: { role: "SELLER" } }).then(({ data }) => setSellers(data)).catch(() => {});
    api.get("/v1/raw-materials").then(({ data }) => {
      setInventory(data);
      setItems(prev => prev.map(it => {
        if (it.raw_material_id) {
          const found = data.find(x => x.id === it.raw_material_id);
          if (found) {
            return { ...it, available_qty: found.quantity, unit_code: found.unit?.code || found.unit?.label || "" };
          }
        }
        return it;
      }));
    }).catch(() => {});
  }, [isAdmin, sale?.bill_type_id]);

  const handleBillType = (id) => {
    setBillTypeId(id);
    setSelectedBT(billTypes.find(x => x.id === id) || null);
  };

  const setItem = (key, field, val) => {
    setItems(prev => prev.map(it => {
      if (it._key !== key) return it;
      const u = { ...it, [field]: val };
      if (field === "raw_material_id") {
        const inv = inventory.find(x => x.id === val);
        if (inv) {
          u.product_id = inv.product_id || inv.product?.id || "";
          u.design_id = inv.design_id || inv.design?.id || "";
          u.piece_no = inv.piece_no || "";
          u.design_no = inv.design_no || "";
          u.unit_id = inv.unit_id || inv.unit?.id || "";
          u.available_qty = inv.quantity;
          u.unit_code = inv.unit?.code || inv.unit?.label || "";
          u.product_name = inv.converted_name || inv.product?.name || "";
          u.design_code = inv.design?.design_code || "";
          if (!u.rate && (inv.avg_rate || inv.last_rate)) {
            u.rate = inv.avg_rate || inv.last_rate;
          }
        } else {
          u.product_id = ""; u.design_id = ""; u.piece_no = ""; u.design_no = ""; u.available_qty = null;
        }
      }
      return u;
    }));
  };

  const isSplit = selectedBT?.attributes?.split_amounts;
  const gross = items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.rate) || 0), 0);
  const taxAmt = isSplit ? ((Number(taxable) || gross) * (Number(taxPct) || 0) / 100).toFixed(2) : null;
  const rebateAmt = isSplit ? ((Number(taxable) || gross) * (Number(rebatePct) || 0) / 100).toFixed(2) : null;

  const submit = async (e) => {
    e.preventDefault(); setErr(""); setSaving(true);
    try {
      const payload = {
        sale_date: date, bill_type_id: billTypeId,
        bill_no: billNo || null, bill_date: billDate || null,
        seller_party_id: sellerId || null, customer_party_id: customerId || null,
        notes: notes || null, custom_fields: {},
        ...(isSplit ? {
          payable_amount: Number(payable),
          taxable_amount: taxable ? Number(taxable) : undefined,
          tax_percent: taxPct ? Number(taxPct) : 0,
          rebate_percent: rebatePct ? Number(rebatePct) : 0,
        } : {}),
        items: items.map((it, i) => ({
          line_no: i + 1,
          raw_material_id: it.raw_material_id || null,
          product_id: it.product_id || null,
          design_id: it.design_id || null,
          piece_no: it.piece_no || null,
          design_no: it.design_no || null,
          quantity: Number(it.quantity),
          unit_id: it.unit_id,
          rate: Number(it.rate),
          custom_fields: {},
        })),
      };
      if (sale) await api.put(`/v1/sales/${sale.id}`, payload);
      else await api.post("/v1/sales", payload);
      onSaved();
    } catch {
      setErr("We couldn’t save the sale. Check the details and try again.");
    } finally { setSaving(false); }
  };

  return (
    <div className="drawer glass-strong">
      <div className="hstack" style={{ marginBottom: 20 }}>
        <div className="display" style={{ fontSize: "var(--fs-lg)", fontWeight: 600, flex: 1 }}>
          {sale ? "Edit Sale" : "New Sale"}
        </div>
        <button className="btn-ghost btn-sm" onClick={onClose}><X size={16} /></button>
      </div>

      <form onSubmit={submit} className="vstack" style={{ gap: 14 }}>
        <div className="grid-2">
          <label className="field">
            <div className="lbl">Sale Date *</div>
            <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} required data-testid="sale-date" />
          </label>
          <label className="field">
            <div className="lbl">Bill Type *</div>
            <select className="input select" value={billTypeId} onChange={e => handleBillType(e.target.value)} required data-testid="sale-bill-type">
              <option value="">Select…</option>
              {billTypes.map(bt => <option key={bt.id} value={bt.id}>{bt.label}</option>)}
            </select>
          </label>
          <label className="field">
            <div className="lbl">Bill No</div>
            <input className="input" value={billNo} onChange={e => setBillNo(e.target.value)} data-testid="sale-bill-no" />
          </label>
          <label className="field">
            <div className="lbl">Bill Date</div>
            <input className="input" type="date" value={billDate} onChange={e => setBillDate(e.target.value)} />
          </label>
          <label className="field">
            <div className="lbl">Customer</div>
            <select className="input select" value={customerId} onChange={e => setCustomerId(e.target.value)}>
              <option value="">None</option>
              {customers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
          <label className="field">
            <div className="lbl">Seller</div>
            <select className="input select" value={sellerId} onChange={e => setSellerId(e.target.value)}>
              <option value="">None</option>
              {sellers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
        </div>

        {/* Split amounts panel */}
        {isSplit && (
          <div className="glass-row" style={{ padding: 14 }}>
            <div className="dim" style={{ fontSize: "var(--fs-xs)", marginBottom: 8, fontWeight: 600 }}>
              Split Amounts — Gross: ₹{fmt(gross)}
            </div>
            <div className="grid-2">
              <label className="field">
                <div className="lbl">Taxable ₹</div>
                <input className="input num" type="number" step="any" value={taxable}
                  onChange={e => setTaxable(e.target.value)} placeholder={fmt(gross)} />
              </label>
              <label className="field">
                <div className="lbl">Payable ₹ *</div>
                <input className="input num" type="number" step="any" value={payable}
                  onChange={e => setPayable(e.target.value)} required={isSplit} data-testid="sale-payable" />
              </label>
              <label className="field">
                <div className="lbl">Tax %</div>
                <input className="input num" type="number" step="any" value={taxPct}
                  onChange={e => setTaxPct(e.target.value)} />
              </label>
              <label className="field">
                <div className="lbl">Rebate %</div>
                <input className="input num" type="number" step="any" value={rebatePct}
                  onChange={e => setRebatePct(e.target.value)} />
              </label>
            </div>
            {(taxAmt || rebateAmt) && (
              <div className="hstack" style={{ marginTop: 8, gap: 16, flexWrap: "wrap" }}>
                {taxAmt && <span className="dim" style={{ fontSize: "var(--fs-xs)" }}>Tax ≈ ₹{taxAmt}</span>}
                {rebateAmt && <span className="dim" style={{ fontSize: "var(--fs-xs)" }}>Rebate ≈ ₹{rebateAmt}</span>}
              </div>
            )}
          </div>
        )}

        {/* Items */}
        <div style={{ borderTop: "1px solid var(--glass-stroke)", paddingTop: 12 }}>
          <div className="hstack" style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 600, flex: 1 }}>Items</div>
            <button type="button" className="btn-ghost btn-sm" onClick={() => setItems(p => [...p, EMPTY_ITEM()])}>
              <Plus size={14} /> Add Line
            </button>
          </div>

          {items.map((it, idx) => (
            <div key={it._key} className="glass-row" style={{ padding: 12, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span className="dim" style={{ fontSize: "var(--fs-xs)" }}>Line {idx + 1}</span>
                {items.length > 1 && (
                  <button type="button" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--st-alert)" }}
                    onClick={() => setItems(p => p.filter(x => x._key !== it._key))}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div className="grid-2" style={{ gap: 12 }}>
                <label className="field" style={{ gridColumn: "1/-1" }}>
                  <div className="lbl">Select from Inventory *</div>
                  <select className="input select" value={it.raw_material_id || ""}
                    onChange={e => setItem(it._key, "raw_material_id", e.target.value)} required>
                    <option value="">Choose item from stock…</option>
                    {inventory.map(inv => {
                      const name = inv.converted_name || inv.product?.name || "Product";
                      const design = inv.design?.design_code ? ` [${inv.design.design_code}]` : "";
                      const piece = inv.piece_no ? ` · Piece: ${inv.piece_no}` : "";
                      const designNo = inv.design_no ? ` · DNo: ${inv.design_no}` : "";
                      const qty = `(Stock: ${inv.quantity} ${inv.unit?.code || inv.unit?.label || ""})`;
                      return (
                        <option key={inv.id} value={inv.id}>
                          {name}{design}{piece}{designNo} — {qty}
                        </option>
                      );
                    })}
                  </select>
                </label>

                {it.raw_material_id && (
                  <div className="hstack" style={{ gridColumn: "1/-1", gap: 8, background: "var(--glass-fill)", padding: "6px 10px", borderRadius: "var(--radius-sm)", border: "1px dashed var(--glass-stroke)", flexWrap: "wrap" }}>
                    <span className="dim" style={{ fontSize: "var(--fs-xs)" }}>Stock Details:</span>
                    {it.piece_no && <span className="pill" style={{ fontSize: "11px", color: "var(--marigold-500)", borderColor: "var(--marigold-500)" }}>Piece: {it.piece_no}</span>}
                    {it.design_code && <span className="pill" style={{ fontSize: "11px" }}>Design: {it.design_code}</span>}
                    {it.design_no && <span className="pill" style={{ fontSize: "11px" }}>DNo: {it.design_no}</span>}
                    {it.available_qty != null && (
                      <span className="mono" style={{ fontSize: "var(--fs-xs)", color: it.available_qty > 0 ? "var(--st-complete)" : "var(--st-alert)", marginLeft: "auto", fontWeight: 600 }}>
                        Available: {it.available_qty} {it.unit_code}
                      </span>
                    )}
                  </div>
                )}

                <label className="field">
                  <div className="lbl">Qty *</div>
                  <input className="input num" type="number" step="any" min="0.001"
                    value={it.quantity} onChange={e => setItem(it._key, "quantity", e.target.value)} required placeholder="0.0" />
                </label>
                <label className="field">
                  <div className="lbl">Unit *</div>
                  <LookupSelect typeCode="UNIT" value={it.unit_id} onChange={v => setItem(it._key, "unit_id", v)} placeholder="Unit" />
                </label>
                <label className="field" style={{ gridColumn: "1/-1" }}>
                  <div className="lbl">Rate ₹ *</div>
                  <input className="input num" type="number" step="any" min="0"
                    value={it.rate} onChange={e => setItem(it._key, "rate", e.target.value)} required placeholder="0.00" />
                </label>
              </div>
              <div className="dim" style={{ fontSize: "var(--fs-xs)", marginTop: 6, textAlign: "right" }}>
                ₹{fmt((Number(it.quantity) || 0) * (Number(it.rate) || 0))}
              </div>
            </div>
          ))}

          <div className="hstack" style={{ justifyContent: "flex-end" }}>
            <span className="dim" style={{ fontSize: "var(--fs-sm)" }}>Gross Total:</span>
            <span className="mono" style={{ fontWeight: 700, marginLeft: 8, fontSize: "var(--fs-lg)" }}>₹{fmt(gross)}</span>
          </div>
        </div>

        <label className="field">
          <div className="lbl">Notes</div>
          <textarea className="input" rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
        </label>

        {err && <div className="pill alert" style={{ padding: "8px 12px" }}>{err}</div>}
        <button className="btn-primary" type="submit" disabled={saving} data-testid="sale-save">
          {saving ? "Saving…" : sale ? "Update Sale" : "Create Sale"}
        </button>
      </form>
    </div>
  );
}

function SaleDetail({ sale, isAdmin, onClose, onEdit, onRefresh }) {
  const confirm = useConfirm();

  const deleteIt = async () => {
    const ok = await confirm({
      title: "Delete Sale?",
      message: "Stock will be reversed. This cannot be undone.",
      okLabel: "Delete", danger: true,
    });
    if (!ok) return;
    try {
      await api.delete(`/v1/sales/${sale.id}`);
      onRefresh(); onClose();
    } catch { alert("We couldn’t delete that sale. Try again."); }
  };

  const isKaccha = (sale?.bill_type_label || "").toLowerCase().includes("kaccha");

  return (
    <div className="drawer glass-strong">
      <div className="hstack" style={{ marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <div className="mono" style={{ fontWeight: 700, fontSize: "var(--fs-lg)" }}>{sale?.sale_no}</div>
          <div className="hstack" style={{ gap: 8, marginTop: 4 }}>
            <span className={`pill ${isKaccha ? "kaccha" : "pakka"}`}>{sale?.bill_type_label}</span>
            <span className="dim" style={{ fontSize: "var(--fs-xs)" }}>{sale?.sale_date}</span>
          </div>
        </div>
        <button className="btn-ghost btn-sm" onClick={onClose}><X size={16} /></button>
      </div>

      <div className="grid-2" style={{ marginBottom: 16 }}>
        <InfoBox label="Gross ₹" value={fmt(sale?.gross_amount)} />
        {isAdmin && sale?.payable_amount != null && <InfoBox label="Payable ₹" value={fmt(sale.payable_amount)} />}
        {isAdmin && sale?.profit_amount != null && (
          <InfoBox label="Profit ₹" value={fmt(sale.profit_amount)}
            color={sale.profit_amount >= 0 ? "var(--st-complete)" : "var(--st-alert)"} />
        )}
        {isAdmin && sale?.tax_amount != null && <InfoBox label="Tax ₹" value={fmt(sale.tax_amount)} />}
        {sale?.customer_name && <InfoBox label="Customer" value={sale.customer_name} />}
        {sale?.bill_no && <InfoBox label="Bill No" value={sale.bill_no} />}
      </div>

      <div style={{ fontWeight: 600, marginBottom: 10 }}>Items ({sale?.items?.length || 0})</div>
      {sale?.items?.map((it) => (
        <div key={it.id || it.line_no} className="glass-row" style={{ padding: 12, marginBottom: 8 }}>
          <div className="hstack" style={{ justifyContent: "space-between", marginBottom: 6 }}>
            <div className="hstack" style={{ gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 600 }}>
                {it.product_name || it.product_id || `Item #${it.line_no}`}
              </span>
              {it.piece_no && (
                <span className="pill" style={{ fontSize: "11px", color: "var(--marigold-500)", borderColor: "var(--marigold-500)" }}>
                  Piece: {it.piece_no}
                </span>
              )}
            </div>
            <span className="mono" style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>
              ₹{fmt(it.amount ?? (Number(it.quantity) * Number(it.rate)))}
            </span>
          </div>
          <div className="hstack" style={{ gap: 12, flexWrap: "wrap" }}>
            {it.design_code && (
              <span className="dim" style={{ fontSize: "var(--fs-xs)" }}>
                Design: {it.design_code} {it.design_name ? `(${it.design_name})` : ""}
              </span>
            )}
            {it.design_no && (
              <span className="dim" style={{ fontSize: "var(--fs-xs)" }}>
                DNo: {it.design_no}
              </span>
            )}
            <span className="dim" style={{ fontSize: "var(--fs-xs)", marginLeft: "auto" }}>
              {it.quantity} {it.unit_label || ""} @ ₹{fmt(it.rate)}
            </span>
          </div>
        </div>
      ))}

      <div className="hstack" style={{ marginTop: 20, flexWrap: "wrap", gap: 8 }}>
        <button className="btn-ghost" onClick={onEdit} data-testid="sale-edit-btn">
          <Edit2 size={14} /> Edit
        </button>
        {isAdmin && (
          <button className="btn-danger" onClick={deleteIt} data-testid="sale-delete-btn">
            <Trash2 size={14} /> Delete
          </button>
        )}
      </div>
    </div>
  );
}

function InfoBox({ label, value, color }) {
  return (
    <div className="glass-row" style={{ padding: 12 }}>
      <div className="dim" style={{ fontSize: "var(--fs-xs)" }}>{label}</div>
      <div className="mono" style={{ fontWeight: 600, color: color || "inherit" }}>{value}</div>
    </div>
  );
}

function today() { return new Date().toISOString().slice(0, 10); }
function fmt(n) {
  if (n === undefined || n === null) return "0";
  return Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}
