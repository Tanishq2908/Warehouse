import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import DataGrid from "@/components/DataGrid";
import LookupSelect from "@/components/LookupSetup";
import { useConfirm } from "@/components/Confirm";
import { AlertTriangle, X, TrendingDown, ArrowRightLeft, Plus, Trash2, Hash, CheckCircle } from "lucide-react";

export default function Inventory() {
  const { isAdmin } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState("");
  const [pieceNoFilter, setPieceNoFilter] = useState("");
  const [lowStock, setLowStock] = useState(false);
  const [drawer, setDrawer] = useState(null);
  const [selected, setSelected] = useState(null);
  const [convertSuccess, setConvertSuccess] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = { q, lowStock };
      if (pieceNoFilter) params.pieceNo = pieceNoFilter;
      const { data } = await api.get("/v1/raw-materials", { params });
      setRows(data);
    } catch {
      setError("We couldn’t load inventory. Refresh and try again.");
    } finally { setLoading(false); }
  }, [q, lowStock, pieceNoFilter]);

  useEffect(() => { load(); }, [load]);

  const columns = [
    {
      key: "product", label: "Product",
      render: (v, row) => (
        <div>
          <div>{v?.name || "—"}</div>
          {row.converted_name && (
            <div className="dim" style={{ fontSize: "var(--fs-xs)" }}>↳ {row.converted_name}</div>
          )}
        </div>
      )
    },
    { key: "design", label: "Design", render: (v) => <span>{v?.design_code}{v?.name ? ` · ${v.name}` : ""}</span> },
    {
      key: "piece_no", label: "Piece No.",
      render: (v) => v ? <span className="mono" style={{ fontSize: "var(--fs-xs)", color: "var(--marigold-500)" }}>{v}</span> : <span className="dim">—</span>
    },
    {
      key: "design_no", label: "Design No.",
      render: (v) => v ? <span className="mono" style={{ fontSize: "var(--fs-xs)" }}>{v}</span> : <span className="dim">—</span>
    },
    { key: "unit", label: "Unit", render: (v) => v?.label || v?.code || "—" },
    {
      key: "quantity", label: "Qty", num: true, sortable: true,
      render: (v, row) => (
        <span style={{ color: (row.reorder_level && v <= row.reorder_level) ? "var(--st-alert)" : "inherit", fontWeight: 600 }}>
          {fmt(v)}
          {row.reorder_level && v <= row.reorder_level && (
            <AlertTriangle size={12} style={{ marginLeft: 4, verticalAlign: "middle" }} />
          )}
        </span>
      )
    },
    { key: "avg_rate", label: "Avg Rate ₹", num: true, render: (v) => fmt(v) },
    { key: "last_rate", label: "Last Rate ₹", num: true, render: (v) => v != null ? fmt(v) : "—" },
    { key: "reorder_level", label: "Reorder", num: true, render: (v) => v != null ? fmt(v) : "—" },
  ];

  return (
    <div>
      <h1 className="page-title">Inventory</h1>
      <p className="page-sub">Stock levels by piece. Tap for details.</p>

      {/* Convert success banner */}
      {convertSuccess && (
        <div className="glass" style={{
          padding: 16, marginBottom: 16, border: "1px solid var(--st-complete)",
          borderRadius: 16, background: "var(--fill-positive)"
        }}>
          <div className="hstack">
            <CheckCircle size={18} color="var(--st-complete)" style={{ marginRight: 10, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>Conversion complete!</div>
              <div className="dim" style={{ fontSize: "var(--fs-xs)" }}>
                Deducted <strong>{convertSuccess.qty_used}</strong> from source
                · Added <strong>{convertSuccess.qty_produced}</strong> as <strong>{convertSuccess.output_name}</strong>
              </div>
            </div>
            <button className="btn-ghost btn-sm" onClick={() => setConvertSuccess(null)}><X size={14} /></button>
          </div>
        </div>
      )}

      <div className="glass filter-bar" style={{ marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <input className="input" placeholder="Search product, design…" value={q}
          onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 200 }} data-testid="inv-search" />
        <input className="input mono" placeholder="Piece No. filter…" value={pieceNoFilter}
          onChange={(e) => setPieceNoFilter(e.target.value)} style={{ maxWidth: 160 }}
          data-testid="inv-pieceno-filter" />
        <label className="hstack" style={{ gap: 6, cursor: "pointer", whiteSpace: "nowrap" }}>
          <input type="checkbox" checked={lowStock} onChange={(e) => setLowStock(e.target.checked)}
            data-testid="inv-lowstock-filter" />
          <AlertTriangle size={14} color="var(--st-pending)" />
          <span style={{ fontSize: "var(--fs-sm)" }}>Low stock only</span>
        </label>
        <div className="dim" style={{ marginLeft: "auto", fontSize: "var(--fs-xs)" }}>
          {rows.length} items
        </div>
      </div>

      <div className="glass" style={{ overflow: "hidden" }}>
        <DataGrid
          columns={columns} rows={rows} loading={loading} error={error}
          onRowClick={(row) => { setSelected(row); setDrawer("view"); }}
          emptyMessage="No stock entries found. Receive goods to populate inventory." />
      </div>

      {drawer && selected && (
        <>
          <div className="drawer-backdrop" onClick={() => setDrawer(null)} />
          {drawer === "view" && (
            <InventoryDetail item={selected} isAdmin={isAdmin}
              onClose={() => setDrawer(null)}
              onAdjust={() => setDrawer("adjust")}
              onConvert={() => setDrawer("convert")} />
          )}
          {drawer === "adjust" && (
            <AdjustForm item={selected}
              onClose={() => setDrawer("view")}
              onSaved={() => { setDrawer(null); load(); }} />
          )}
          {drawer === "convert" && (
            <ConvertForm item={selected}
              onClose={() => setDrawer("view")}
              onSaved={(result) => {
                setDrawer(null);
                setConvertSuccess({
                  qty_used: result.source_used,
                  qty_produced: result.output_produced,
                  output_name: result.output_name,
                });
                load();
              }} />
          )}
        </>
      )}
    </div>
  );
}

/* ─── Inventory Detail ───────────────────────────────────────────────────── */
function InventoryDetail({ item, isAdmin, onClose, onAdjust, onConvert }) {
  const [ledger, setLedger] = useState([]);
  const [ledgerLoading, setLedgerLoading] = useState(true);

  useEffect(() => {
    api.get(`/v1/raw-materials/${item.id}/ledger`)
      .then(({ data }) => setLedger(data))
      .catch(() => {})
      .finally(() => setLedgerLoading(false));
  }, [item.id]);

  const isLow = item.reorder_level != null && item.quantity <= item.reorder_level;

  const TXN_COLORS = {
    PURCHASE_IN: "var(--st-complete)",
    CONVERSION_IN: "var(--st-complete)",
    CONVERSION_OUT: "var(--st-alert)",
    ADJUSTMENT: "var(--st-partial)",
    SALE_OUT: "var(--st-alert)",
  };

  return (
    <div className="drawer glass-strong">
      <div className="hstack" style={{ marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>
            {item.converted_name || item.product?.name}
          </div>
          <div className="dim" style={{ fontSize: "var(--fs-sm)" }}>
            {item.design?.design_code && `${item.design.design_code} · `}{item.unit?.label}
          </div>
          {item.piece_no && (
            <div style={{ marginTop: 4 }}>
              <span className="mono pill" style={{ fontSize: "10px", padding: "2px 8px", background: "var(--fill-accent)" }}>
                <Hash size={10} style={{ display: "inline", marginRight: 2 }} />{item.piece_no}
              </span>
            </div>
          )}
          {item.design_no && (
            <div className="dim" style={{ fontSize: "var(--fs-xs)", marginTop: 2 }}>
              Design No: <span className="mono">{item.design_no}</span>
            </div>
          )}
          {isLow && (
            <div className="pill alert" style={{ marginTop: 6 }}>
              <AlertTriangle size={12} /> Low Stock
            </div>
          )}
        </div>
        <button className="btn-ghost btn-sm" onClick={onClose}><X size={16} /></button>
      </div>

      <div className="grid-2" style={{ marginBottom: 16 }}>
        <StatMini label="On Hand" value={fmt(item.quantity)}
          color={isLow ? "var(--st-alert)" : "var(--st-complete)"} />
        <StatMini label="Avg Rate ₹" value={fmt(item.avg_rate)} />
        <StatMini label="Last Rate ₹" value={item.last_rate != null ? fmt(item.last_rate) : "—"} />
        <StatMini label="Reorder Level" value={item.reorder_level != null ? fmt(item.reorder_level) : "—"} />
        {item.weight != null && <StatMini label="Weight (kg)" value={fmt(item.weight)} />}
      </div>

      <div className="hstack" style={{ gap: 8, marginBottom: 16 }}>
        {isAdmin && (
          <button className="btn-ghost" onClick={onAdjust}
            style={{ flex: 1, justifyContent: "center" }}
            data-testid="adjust-btn">
            <TrendingDown size={16} /> Adjust Stock
          </button>
        )}
        <button className="btn-ghost" onClick={onConvert}
          style={{ flex: 1, justifyContent: "center", borderColor: "var(--marigold-500)", color: "var(--marigold-500)" }}
          data-testid="convert-btn">
          <ArrowRightLeft size={16} /> Convert to Product
        </button>
      </div>

      <div style={{ fontWeight: 600, marginBottom: 10 }}>Ledger (last 30)</div>
      {ledgerLoading && <div className="skeleton" style={{ height: 200 }} />}
      {!ledgerLoading && ledger.length === 0 && (
        <div className="dim" style={{ textAlign: "center", padding: 24 }}>No transactions yet.</div>
      )}
      {!ledgerLoading && ledger.slice(0, 30).map((txn) => (
        <div key={txn.id} className="glass-row" style={{ padding: 10, marginBottom: 6 }}>
          <div className="hstack" style={{ justifyContent: "space-between" }}>
            <span style={{ fontSize: "var(--fs-xs)", fontWeight: 600, color: "var(--text-mid)" }}>
              {txn.txn_type}
            </span>
            <span className="mono" style={{
              fontSize: "var(--fs-sm)",
              color: TXN_COLORS[txn.txn_type] || (txn.qty_delta >= 0 ? "var(--st-complete)" : "var(--st-alert)"),
            }}>
              {txn.qty_delta >= 0 ? "+" : ""}{fmt(txn.qty_delta)}
            </span>
          </div>
          <div className="dim" style={{ fontSize: "var(--fs-xs)" }}>
            {txn.txn_date} · {txn.note || ""}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Adjust Form ────────────────────────────────────────────────────────── */
function AdjustForm({ item, onClose, onSaved }) {
  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 3) { setErr("Reason required (min 3 chars)"); return; }
    setSaving(true); setErr("");
    try {
      await api.post(`/v1/raw-materials/${item.id}/adjust`, {
        qty_delta: Number(delta), reason: reason.trim(),
      });
      onSaved();
    } catch {
      setErr("We couldn’t adjust stock. Check the details and try again.");
    } finally { setSaving(false); }
  };

  const newQty = item.quantity + (Number(delta) || 0);

  return (
    <div className="drawer glass-strong">
      <div className="hstack" style={{ marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700 }}>Adjust Stock</div>
          <div className="dim" style={{ fontSize: "var(--fs-sm)" }}>
            {item.product?.name} {item.piece_no ? `· #${item.piece_no}` : ""}
          </div>
        </div>
        <button className="btn-ghost btn-sm" onClick={onClose}><X size={16} /></button>
      </div>

      <div className="glass-row" style={{ padding: 16, marginBottom: 16 }}>
        <div className="hstack" style={{ justifyContent: "space-between" }}>
          <span className="dim" style={{ fontSize: "var(--fs-sm)" }}>Current:</span>
          <span className="mono" style={{ fontWeight: 700 }}>{fmt(item.quantity)} {item.unit?.label || ""}</span>
        </div>
        {delta && (
          <div className="hstack" style={{ justifyContent: "space-between", marginTop: 6 }}>
            <span className="dim" style={{ fontSize: "var(--fs-sm)" }}>After adjustment:</span>
            <span className="mono" style={{ fontWeight: 700, color: newQty < 0 ? "var(--st-alert)" : "var(--st-complete)" }}>
              {fmt(newQty)} {item.unit?.label || ""}
            </span>
          </div>
        )}
      </div>

      <form onSubmit={submit} className="vstack" style={{ gap: 14 }}>
        <label className="field">
          <div className="lbl">Qty Delta (+ to add, − to remove) *</div>
          <input className="input num" type="number" step="any" value={delta}
            onChange={(e) => setDelta(e.target.value)} required data-testid="adjust-delta" />
        </label>
        <label className="field">
          <div className="lbl">Reason *</div>
          <input className="input" value={reason} onChange={(e) => setReason(e.target.value)}
            required minLength={3} data-testid="adjust-reason" />
        </label>
        {err && <div className="pill alert" style={{ padding: "8px 12px" }}>{err}</div>}
        <button className="btn-primary" type="submit" disabled={saving} data-testid="adjust-submit">
          {saving ? "Saving…" : "Apply Adjustment"}
        </button>
      </form>
    </div>
  );
}

/* ─── Convert to Product Form ────────────────────────────────────────────── */
function ConvertForm({ item, onClose, onSaved }) {
  const [qtyUsed, setQtyUsed] = useState("");
  const [unitId, setUnitId] = useState(item.unit_id || "");
  const [outputName, setOutputName] = useState("");
  const [outputDesignNo, setOutputDesignNo] = useState("");
  const [outputPieceNo, setOutputPieceNo] = useState("");
  const [qtyProduced, setQtyProduced] = useState("");
  const [outputUnitId, setOutputUnitId] = useState(item.unit_id || "");
  const [outputRate, setOutputRate] = useState("");
  const [convertDate, setConvertDate] = useState(today());
  const [convNotes, setConvNotes] = useState("");
  const [extraFields, setExtraFields] = useState([]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const addExtra = () => setExtraFields(p => [...p, { label: "", value: "" }]);
  const setExtra = (idx, k, v) => {
    setExtraFields(p => { const n = [...p]; n[idx] = { ...n[idx], [k]: v }; return n; });
  };
  const removeExtra = (idx) => setExtraFields(p => { const n = [...p]; n.splice(idx, 1); return n; });

  const remainAfter = item.quantity - (Number(qtyUsed) || 0);
  const overUsed = Number(qtyUsed) > item.quantity + 0.001;

  const submit = async (e) => {
    e.preventDefault();
    if (!outputName.trim()) { setErr("Output name is required"); return; }
    setSaving(true); setErr("");
    try {
      const { data } = await api.post("/v1/raw-materials/convert", {
        source_rm_id: item.id,
        qty_used: Number(qtyUsed),
        unit_id: unitId,
        output_name: outputName.trim(),
        output_design_no: outputDesignNo.trim() || null,
        output_piece_no: outputPieceNo.trim() || null,
        qty_produced: Number(qtyProduced),
        output_unit_id: outputUnitId,
        output_rate: outputRate ? Number(outputRate) : null,
        convert_date: convertDate,
        notes: convNotes || null,
        extra_fields: extraFields.filter(f => f.label.trim()),
      });
      onSaved({
        qty_used: Number(qtyUsed),
        qty_produced: Number(qtyProduced),
        output_name: outputName.trim(),
      });
    } catch {
      setErr("We couldn’t convert the item. Check the details and try again.");
    } finally { setSaving(false); }
  };

  return (
    <div className="drawer glass-strong">
      <div className="hstack" style={{ marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700 }}>Convert to Product</div>
          <div className="dim" style={{ fontSize: "var(--fs-sm)" }}>
            {item.product?.name}
            {item.piece_no ? <span className="mono"> · #{item.piece_no}</span> : ""}
          </div>
        </div>
        <button className="btn-ghost btn-sm" onClick={onClose}><X size={16} /></button>
      </div>

      {/* Source summary */}
      <div className="glass-row" style={{ padding: 14, marginBottom: 16, borderRadius: 12 }}>
        <div style={{ fontWeight: 600, fontSize: "var(--fs-xs)", marginBottom: 8, color: "var(--text-mid)" }}>
          SOURCE MATERIAL
        </div>
        <div className="hstack" style={{ gap: 16, flexWrap: "wrap" }}>
          <div>
            <div className="dim" style={{ fontSize: "var(--fs-xs)" }}>Product</div>
            <div style={{ fontWeight: 600 }}>{item.product?.name || "—"}</div>
          </div>
          {item.piece_no && (
            <div>
              <div className="dim" style={{ fontSize: "var(--fs-xs)" }}>Piece No.</div>
              <div className="mono" style={{ fontWeight: 600 }}>{item.piece_no}</div>
            </div>
          )}
          {item.design_no && (
            <div>
              <div className="dim" style={{ fontSize: "var(--fs-xs)" }}>Design No.</div>
              <div className="mono" style={{ fontWeight: 600 }}>{item.design_no}</div>
            </div>
          )}
          <div>
            <div className="dim" style={{ fontSize: "var(--fs-xs)" }}>Available</div>
            <div className="mono" style={{ fontWeight: 700, color: "var(--st-complete)" }}>
              {fmt(item.quantity)} {item.unit?.label || ""}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="vstack" style={{ gap: 12 }}>
        {/* Deduction section */}
        <div className="glass-row" style={{ padding: 14, borderRadius: 12 }}>
          <div style={{ fontWeight: 600, fontSize: "var(--fs-xs)", marginBottom: 10, color: "var(--st-alert)" }}>
            QUANTITY TO USE (will be deducted)
          </div>
          <div className="grid-2">
            <label className="field">
              <div className="lbl">Qty Used *</div>
              <input className="input num" type="number" step="any" min="0.001"
                value={qtyUsed} onChange={e => setQtyUsed(e.target.value)} required autoFocus
                style={{ borderColor: overUsed ? "var(--st-alert)" : undefined }} />
            </label>
            <label className="field">
              <div className="lbl">Unit *</div>
              <LookupSelect typeCode="UNIT" value={unitId} onChange={setUnitId} placeholder="Unit" />
            </label>
          </div>
          {overUsed && (
            <div className="pill alert" style={{ marginTop: 6, fontSize: "var(--fs-xs)" }}>
              <AlertTriangle size={12} /> Exceeds available stock by {fmt(Number(qtyUsed) - item.quantity)}
            </div>
          )}
          {qtyUsed && !overUsed && (
            <div className="dim" style={{ fontSize: "var(--fs-xs)", marginTop: 6 }}>
              Remaining after use: <span className="mono">{fmt(remainAfter)}</span> {item.unit?.label || ""}
            </div>
          )}
        </div>

        {/* Output section */}
        <div className="glass-row" style={{ padding: 14, borderRadius: 12 }}>
          <div style={{ fontWeight: 600, fontSize: "var(--fs-xs)", marginBottom: 10, color: "var(--st-complete)" }}>
            OUTPUT PRODUCT (will be added to inventory)
          </div>
          <div className="vstack" style={{ gap: 10 }}>
            <label className="field">
              <div className="lbl">Output Name *</div>
              <input className="input" value={outputName} onChange={e => setOutputName(e.target.value)}
                required placeholder="e.g. Finished fabric" />
            </label>
            <div className="grid-2">
              <label className="field">
                <div className="lbl">Design No.</div>
                <input className="input mono" value={outputDesignNo} onChange={e => setOutputDesignNo(e.target.value)}
                  placeholder="optional" />
              </label>
              <label className="field">
                <div className="lbl"><Hash size={11} style={{ display: "inline", marginRight: 2 }} />Piece No.</div>
                <input className="input mono" value={outputPieceNo} onChange={e => setOutputPieceNo(e.target.value)}
                  placeholder="optional — unique" />
              </label>
              <label className="field">
                <div className="lbl">Qty Produced *</div>
                <input className="input num" type="number" step="any" min="0.001"
                  value={qtyProduced} onChange={e => setQtyProduced(e.target.value)} required />
              </label>
              <label className="field">
                <div className="lbl">Output Unit *</div>
                <LookupSelect typeCode="UNIT" value={outputUnitId} onChange={setOutputUnitId} placeholder="Unit" />
              </label>
              <label className="field">
                <div className="lbl">Rate ₹ (optional)</div>
                <input className="input num" type="number" step="any" min="0"
                  value={outputRate} onChange={e => setOutputRate(e.target.value)} />
              </label>
              <label className="field">
                <div className="lbl">Conversion Date</div>
                <input className="input" type="date" value={convertDate} onChange={e => setConvertDate(e.target.value)} />
              </label>
            </div>
          </div>
        </div>

        {/* Extra fields */}
        <div className="glass-row" style={{ padding: 14, borderRadius: 12 }}>
          <div style={{ fontWeight: 600, fontSize: "var(--fs-xs)", marginBottom: 8 }}>ADDITIONAL FIELDS</div>
          {extraFields.map((ef, idx) => (
            <div key={idx} className="hstack" style={{ gap: 8, marginBottom: 8 }}>
              <input className="input" placeholder="Field name…" value={ef.label}
                onChange={e => setExtra(idx, "label", e.target.value)} style={{ flex: 1 }} />
              <input className="input" placeholder="Value…" value={ef.value}
                onChange={e => setExtra(idx, "value", e.target.value)} style={{ flex: 2 }} />
              <button type="button" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--st-alert)", padding: 6 }}
                onClick={() => removeExtra(idx)}>
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          <button type="button" className="btn-ghost btn-sm"
            style={{ width: "100%", justifyContent: "center" }}
            onClick={addExtra}>
            <Plus size={13} /> Add Field
          </button>
        </div>

        <label className="field">
          <div className="lbl">Notes</div>
          <textarea className="input" rows={2} value={convNotes} onChange={e => setConvNotes(e.target.value)} />
        </label>

        {/* Preview */}
        {qtyUsed && qtyProduced && outputName && (
          <div className="glass-row" style={{ padding: 12, background: "var(--fill-accent)", borderRadius: 12 }}>
            <div style={{ fontWeight: 600, fontSize: "var(--fs-xs)", marginBottom: 6 }}>CONVERSION PREVIEW</div>
            <div className="dim" style={{ fontSize: "var(--fs-sm)" }}>
              Use <span className="mono">{fmt(qtyUsed)}</span> {item.unit?.label || ""}
              {" "}of <strong>{item.product?.name}</strong>
              {item.piece_no ? ` (Piece #${item.piece_no})` : ""}
            </div>
            <div className="dim" style={{ fontSize: "var(--fs-sm)", marginTop: 4 }}>
              Produce <span className="mono">{fmt(qtyProduced)}</span> → <strong>{outputName}</strong>
              {outputPieceNo ? ` (Piece #${outputPieceNo})` : ""}
            </div>
          </div>
        )}

        {err && <div className="pill alert" style={{ padding: "8px 12px" }}>{err}</div>}
        <button className="btn-primary" type="submit" disabled={saving || overUsed} data-testid="convert-submit">
          {saving ? "Converting…" : "Convert & Update Inventory"}
        </button>
      </form>
    </div>
  );
}

function StatMini({ label, value, color }) {
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
  return Number(n).toLocaleString("en-IN", { maximumFractionDigits: 3 });
}
