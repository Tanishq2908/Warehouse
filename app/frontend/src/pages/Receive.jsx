/**
 * Receive.jsx — Goods Receipt Note (GRN) creation
 *
 * Design principles (GRN Agent model):
 *  - ONE order line → MANY receipt lines (one per piece/lot/roll)
 *  - Piece No is optional — when omitted, keyed by (product, design, unit)
 *  - Shows qty_received / remaining on order cards with running balance
 *  - Bill scan via Groq OCR auto-fills multiple product lines
 *  - Clear reconciliation: Ordered / Previously Received / This GRN / Open Balance
 *  - Live Validation Log panel mirrors backend step-by-step audit
 */
import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import {
  X, CheckCircle, AlertTriangle, Plus, Trash2, Package,
  Hash, Copy, ChevronUp, ChevronDown, ClipboardList, Activity,
  ShieldCheck, ShieldAlert,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────── */
export default function Receive() {
  const [pendingGroups, setPendingGroups] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [activeId,  setActiveId] = useState(null); // order_id of expanded form
  const [success,   setSuccess]  = useState(null); // last saved receipt

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/v1/purchase-orders/pending-lines");
      // group flat lines by order_id
      const map = {};
      (data || []).forEach((line) => {
        if (!map[line.order_id]) {
          map[line.order_id] = {
            order_id:      line.order_id,
            order_no:      line.order_no      || "",
            provider_id:   line.provider_id   || "",
            provider_name: line.provider_name || "",
            lines: [],
          };
        }
        map[line.order_id].lines.push(line);
      });
      setPendingGroups(Object.values(map));
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSaved = (receipt) => {
    setActiveId(null);
    setSuccess(receipt);
    load();
  };

  return (
    <div style={{ maxWidth: 980, margin: "0 auto" }}>

      {/* Page heading */}
      <div style={{ marginBottom: 20 }}>
        <h1 className="page-title" style={{ marginBottom: 4 }}>Receive Goods</h1>
        <p className="page-sub">Post GRN against purchase orders.</p>
      </div>

      {/* Success banner */}
      {success && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "12px 16px", marginBottom: 16, borderRadius: 12,
          background: "var(--fill-positive)", border: "1px solid var(--st-complete)",
        }}>
          <CheckCircle size={18} color="var(--st-complete)" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <strong>GRN {success.receipt_no} posted</strong>
            <span className="dim" style={{ fontSize: "var(--fs-xs)", marginLeft: 10 }}>
              {success.totals?.total_items ?? 0} lines · {success.totals?.total_pieces ?? 0} pieces
            </span>
          </div>
          <button className="btn-ghost btn-sm" onClick={() => setSuccess(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Skeletons */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="glass" style={{ padding: 18 }}>
              <div className="skeleton" style={{ height: 16, width: "32%", marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 12, width: "50%" }} />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && pendingGroups.length === 0 && (
        <div className="glass" style={{ padding: 60, textAlign: "center" }}>
          <CheckCircle size={40} color="var(--st-complete)" style={{ margin: "0 auto 12px" }} />
          <div style={{ fontWeight: 700, fontSize: "var(--fs-lg)" }}>All orders received!</div>
          <div className="dim" style={{ marginTop: 4 }}>No pending purchase order lines.</div>
        </div>
      )}

      {/* Order cards */}
      {!loading && pendingGroups.map((grp) => {
        const totalOrdered  = grp.lines.reduce((s, l) => s + (l.qty_ordered  || 0), 0);
        const totalReceived = grp.lines.reduce((s, l) => s + (l.qty_received || 0), 0);
        const totalRemaining = Math.max(0, totalOrdered - totalReceived);
        const pct = totalOrdered > 0 ? Math.min(100, (totalReceived / totalOrdered) * 100) : 0;
        const isOpen = activeId === grp.order_id;
        const poStatus = totalRemaining <= 0.001
          ? { label: "Fully Received", color: "var(--st-complete)", bg: "var(--fill-positive)" }
          : totalReceived > 0.001
          ? { label: "Partially Received", color: "var(--st-partial)", bg: "var(--fill-accent)" }
          : { label: "Pending", color: "var(--text-mid)", bg: "var(--glass-fill)" };

        return (
          <div key={grp.order_id} style={{ marginBottom: 12 }}>

            {/* Card header */}
            <div
              className="glass"
              style={{
                padding: "14px 16px",
                borderRadius: isOpen ? "14px 14px 0 0" : 14,
                borderBottom: isOpen ? "none" : undefined,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* Fill bar */}
                <div style={{
                  width: 4, height: 44, borderRadius: 4,
                  background: "var(--glass-stroke)", position: "relative", flexShrink: 0,
                }}>
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    height: `${pct}%`, borderRadius: 4,
                    background: pct >= 100 ? "var(--st-complete)" : "var(--st-partial)",
                    transition: "height .35s ease",
                  }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontWeight: 700, fontSize: "var(--fs-sm)",
                  }}>
                    {grp.order_no}
                  </div>
                  {grp.provider_name && (
                    <div className="dim" style={{ fontSize: "var(--fs-xs)", marginTop: 2 }}>
                      {grp.provider_name}
                    </div>
                  )}
                </div>

                {/* Received qty badge + running balance */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    background: poStatus.bg, color: poStatus.color,
                    borderRadius: 8, padding: "3px 10px",
                    fontSize: "var(--fs-xs)", fontWeight: 700,
                  }}>
                    <CheckCircle size={11} /> {poStatus.label}
                  </div>
                  {/* Running balance */}
                  <div style={{
                    display: "flex", gap: 6, marginTop: 4, justifyContent: "flex-end",
                    fontSize: 11, fontFamily: "IBM Plex Mono, monospace",
                  }}>
                    <span style={{ color: "var(--text-low)" }}>Ord <strong style={{ color: "var(--text-mid)" }}>{fmt(totalOrdered)}</strong></span>
                    <span style={{ color: "var(--text-low)" }}>|</span>
                    <span style={{ color: "var(--text-low)" }}>Rcvd <strong style={{ color: "var(--st-complete)" }}>{fmt(totalReceived)}</strong></span>
                    <span style={{ color: "var(--text-low)" }}>|</span>
                    <span style={{ color: "var(--text-low)" }}>Rem <strong style={{ color: totalRemaining > 0 ? "var(--st-partial)" : "var(--st-complete)" }}>{fmt(totalRemaining)}</strong></span>
                  </div>
                  <div className="dim" style={{ fontSize: 11, marginTop: 2 }}>
                    {grp.lines.length} line{grp.lines.length !== 1 ? "s" : ""}
                  </div>
                </div>

                <button
                  className="btn-primary"
                  onClick={() => setActiveId(isOpen ? null : grp.order_id)}
                  style={{ gap: 6, flexShrink: 0 }}
                >
                  {isOpen ? <ChevronUp size={14} /> : <Package size={14} />}
                  {isOpen ? "Close" : "Receive"}
                </button>
              </div>

              {/* Line summary rows */}
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 3 }}>
                {grp.lines.map((l) => (
                  <div key={l.id} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "4px 10px", borderRadius: 6,
                    background: "var(--glass-fill)", fontSize: "var(--fs-xs)",
                  }}>
                    <span style={{ fontWeight: 600, flex: 1, minWidth: 0 }} className="truncate">
                      {l.product_name || `Line ${l.line_no}`}
                    </span>
                    <span style={{
                      fontFamily: "IBM Plex Mono, monospace", marginLeft: 12,
                      color: "var(--st-complete)",
                    }}>
                      ✓ {fmt(l.qty_received || 0)}
                    </span>
                    <span className="dim" style={{ fontFamily: "IBM Plex Mono, monospace", marginLeft: 6 }}>
                      / {fmt(l.qty_ordered)} {l.unit_label || ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expanded GRN form */}
            {isOpen && (
              <div style={{
                border: "1px solid var(--glass-stroke)",
                borderTop: "none",
                borderRadius: "0 0 14px 14px",
                background: "var(--glass-fill)",
                backdropFilter: "blur(20px) saturate(140%)",
                WebkitBackdropFilter: "blur(20px) saturate(140%)",
              }}>
                <GRNForm
                  group={grp}
                  onClose={() => setActiveId(null)}
                  onSaved={handleSaved}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   GRN FORM
───────────────────────────────────────────────────────── */
function GRNForm({ group, onClose, onSaved }) {
  /* Header fields */
  const [receiveDate, setReceiveDate] = useState(todayStr());
  const [billNo,      setBillNo]      = useState("");
  const [billDate,    setBillDate]    = useState("");
  const [billAmount,  setBillAmount]  = useState("");
  const [notes,       setNotes]       = useState("");
  const [markFull,    setMarkFull]    = useState(false);

  /* Catalog */
  const [products,   setProducts]   = useState([]);
  const [designsMap, setDesignsMap] = useState({}); // { productId: [design,...] }

  /* Receipt lines per order line
     Structure: [{ ...orderLine, receipts: [RL,...] }]
     RL = { _k, piece_no, qty, rate, unit_id, product_id, design_id, design_no, weight }
  */
  const [lines, setLines] = useState(() =>
    group.lines.map((ol) => ({
      ...ol,
      receipts: [makeRL(ol)],
    }))
  );
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState("");

  /* Load products once */
  useEffect(() => {
    api.get("/v1/products").then(({ data }) => setProducts(data || [])).catch(() => {});
  }, []);

  function makeRL(ol, inherit = null) {
    return {
      _k:        crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      piece_no:  "",
      qty:       inherit ? "" : String(ol.qty_pending ?? ol.qty_ordered ?? ""),
      rate:      String(inherit?.rate ?? ol.rate ?? ""),
      unit_id:   inherit?.unit_id   ?? ol.unit_id   ?? "",
      product_id:inherit?.product_id ?? ol.product_id ?? "",
      design_id: inherit?.design_id ?? ol.design_id ?? "",
      design_no: inherit?.design_no ?? "",
      weight:    "",
    };
  }

  const loadDesigns = async (productId) => {
    if (!productId || designsMap[productId]) return;
    try {
      const { data } = await api.get("/v1/designs", { params: { productId } });
      setDesignsMap(p => ({ ...p, [productId]: data || [] }));
    } catch {}
  };

  const setRLField = (lineId, rk, field, val) =>
    setLines(prev => prev.map(l =>
      l.id !== lineId ? l : {
        ...l,
        receipts: l.receipts.map(r => r._k === rk ? { ...r, [field]: val } : r),
      }
    ));

  const addRL = (lineId) =>
    setLines(prev => prev.map(l => {
      if (l.id !== lineId) return l;
      const last = l.receipts[l.receipts.length - 1];
      return { ...l, receipts: [...l.receipts, makeRL(l, last)] };
    }));

  const removeRL = (lineId, rk) =>
    setLines(prev => prev.map(l => {
      if (l.id !== lineId || l.receipts.length <= 1) return l;
      return { ...l, receipts: l.receipts.filter(r => r._k !== rk) };
    }));

  /* Reconciliation helpers */
  const thisQty  = (l) => l.receipts.reduce((s, r) => s + (parseFloat(r.qty)  || 0), 0);
  const openBal  = (l) => Math.max(0, (l.qty_pending || 0) - thisQty(l));
  const isOver   = (l) => thisQty(l) > (l.qty_pending || 0) + 0.001;

  /* ── Submit ── */
  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    /* Validate qty > 0 on all lines; piece_no is optional */
    for (const l of lines) {
      for (const r of l.receipts) {
        if (!(parseFloat(r.qty) > 0)) {
          setErr(`Qty for a receipt line on "${l.product_name || `PO Line ${l.line_no}`}" must be > 0.`);
          return;
        }
      }
    }

    /* Warn (but don't block) on duplicate piece_no within the same submission */
    const seen = new Set();
    for (const l of lines) {
      for (const r of l.receipts) {
        const pn = (r.piece_no || "").trim();
        if (pn) {
          if (seen.has(pn)) {
            setErr(`Duplicate Piece No: "${pn}" — each must be unique within this GRN.`);
            return;
          }
          seen.add(pn);
        }
      }
    }

    setSaving(true);
    try {
      const items = lines.flatMap(l =>
        l.receipts.map(r => ({
          order_item_id: l.id,
          qty_received:  parseFloat(r.qty),
          // Always send the order's unit_id to avoid conversion errors
          unit_id:       l.unit_id,
          rate:          parseFloat(r.rate) || 0,
          product_id:    r.product_id && r.product_id !== l.product_id ? r.product_id : null,
          design_id:     r.design_id  && r.design_id  !== l.design_id  ? r.design_id  : null,
          piece_no:      (r.piece_no || "").trim() || null,
          design_no:     (r.design_no || "").trim() || null,
          weight:        r.weight ? parseFloat(r.weight) : null,
          custom_fields: {},
        }))
      );

      const { data } = await api.post("/v1/goods-receipts", {
        order_id:            group.order_id,
        receive_date:        receiveDate,
        bill_no:             billNo    || null,
        bill_date:           billDate  || null,
        bill_amount:         billAmount ? parseFloat(billAmount) : null,
        notes:               notes     || null,
        custom_fields:       {},
        mark_fully_received: markFull,
        items,
      });
      onSaved(data);
    } catch {
      setErr("We couldn’t post this receipt. Check the entries and try again.");
    } finally { setSaving(false); }

  };

  /* Summary */
  const allRL     = lines.flatMap(l => l.receipts);
  const grandQty  = allRL.reduce((s, r) => s + (parseFloat(r.qty) || 0), 0);
  const grandPcs  = allRL.filter(r => (r.piece_no || "").trim()).length;

  /* Live validation log entries */
  const validationLog = lines.flatMap((l, li) => {
    const prevRcv = l.qty_received || 0;
    let runningTotal = 0;
    return l.receipts.map((r, ri) => {
      const thisQtyVal = parseFloat(r.qty) || 0;
      runningTotal += thisQtyVal;
      const cumulative = prevRcv + runningTotal;
      const remaining  = Math.max(0, l.qty_ordered - cumulative);
      const isOver     = cumulative > l.qty_ordered + 0.001;
      const isFinal    = remaining <= 0.001 && !isOver;
      return {
        key: `${l.id}-${ri}`,
        step: ri + 1,
        lineName: l.product_name || `PO Line ${l.line_no}`,
        productCode: r.product_id || l.product_id || "—",
        orderedQty: l.qty_ordered,
        prevReceived: prevRcv,
        thisQty: thisQtyVal,
        cumulative: round3(cumulative),
        remaining: round3(remaining),
        status: isOver ? "❌ OVER-RECEIPT" : isFinal ? "✅ FULLY RECEIVED" : "🔄 PARTIALLY RECEIVED",
        isOver,
        isFinal,
      };
    });
  });

  return (
    <div style={{ padding: "16px 18px 22px" }}>

      <form onSubmit={submit}>

        {/* ── GRN header fields ── */}
        <div className="glass-row" style={{ padding: 14, borderRadius: 12, marginBottom: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <label className="field">
              <div className="lbl">Date *</div>
              <input className="input" type="date" value={receiveDate}
                onChange={e => setReceiveDate(e.target.value)} required />
            </label>
            <label className="field">
              <div className="lbl">Invoice No.</div>
              <input className="input" value={billNo}
                onChange={e => setBillNo(e.target.value)} placeholder="INV-001" />
            </label>
            <label className="field">
              <div className="lbl">Invoice Date</div>
              <input className="input" type="date" value={billDate}
                onChange={e => setBillDate(e.target.value)} />
            </label>
            <label className="field">
              <div className="lbl">Amount ₹</div>
              <input className="input num" type="number" step="any" min="0"
                value={billAmount} onChange={e => setBillAmount(e.target.value)} />
            </label>
          </div>
        </div>

        {/* ── Per-order-line receipt entries ── */}
        {lines.map((l) => {
          const tq  = thisQty(l);
          const ob  = openBal(l);
          const ov  = isOver(l);

          return (
            <div key={l.id} style={{
              marginBottom: 14,
              border: "1px solid var(--glass-stroke)", borderRadius: 12, overflow: "hidden",
            }}>
              {/* Line header */}
              <div style={{
                padding: "9px 14px", background: "var(--glass-fill)",
                borderBottom: "1px solid var(--glass-stroke)",
                display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>
                    {l.product_name || `PO Line ${l.line_no}`}
                  </span>
                  {l.design_code && (
                    <span className="dim" style={{ fontSize: "var(--fs-xs)", marginLeft: 6 }}>
                      Design: {l.design_code}
                    </span>
                  )}
                </div>

                {/* Reconciliation chips */}
                <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap" }}>
                  <Chip label={`Ord ${fmt(l.qty_ordered)}`} color="var(--text-mid)" bg="var(--glass-fill)" />
                  <Chip label={`Rcvd ${fmt(l.qty_received || 0)}`} color="var(--st-complete)" bg="var(--fill-positive)" />
                  {tq > 0 && (
                    <Chip
                      label={ov ? `⚠ Over by ${fmt(tq - (l.qty_pending || 0))}` : `+${fmt(tq)} this GRN`}
                      color={ov ? "var(--st-alert)" : "var(--indigo-400)"}
                      bg={ov ? "var(--fill-danger)" : "var(--fill-info)"}
                    />
                  )}
                </div>
              </div>

              {/* Receipt splits */}
              <div style={{ padding: "10px 14px" }}>
                {l.receipts.map((r, ri) => (
                  <RLRow
                    key={r._k}
                    r={r} ri={ri} l={l}
                    products={products}
                    designsMap={designsMap}
                    loadDesigns={loadDesigns}
                    onChange={(f, v) => setRLField(l.id, r._k, f, v)}
                    onRemove={() => removeRL(l.id, r._k)}
                    canRemove={l.receipts.length > 1}
                  />
                ))}

                {/* Add split */}
                <button type="button" onClick={() => addRL(l.id)} style={{
                  width: "100%", marginTop: 6,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "7px 0", border: "1px dashed var(--glass-stroke)",
                  borderRadius: 8, background: "none", cursor: "pointer",
                  color: "var(--marigold-500)", fontSize: "var(--fs-xs)", fontWeight: 600,
                }}>
                  <Copy size={12} /> Add Split
                </button>

                {/* Open balance */}
                <div style={{
                  marginTop: 7, textAlign: "right",
                  fontSize: "var(--fs-xs)", color: "var(--text-low)",
                }}>
                  Open Balance:{" "}
                  <span style={{
                    fontFamily: "IBM Plex Mono, monospace", fontWeight: 700,
                    color: ob > 0 ? "var(--st-partial)" : "var(--st-complete)",
                  }}>
                    {fmt(ob)} {l.unit_label || ""}
                  </span>
                  {l.receipts.length > 1 && (
                    <span style={{ marginLeft: 10, color: "var(--text-low)" }}>
                      · {l.receipts.length} splits
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* ── Options ── */}
        <div className="glass-row" style={{ padding: 14, borderRadius: 12, marginBottom: 14 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 10 }}>
            <input type="checkbox" checked={markFull} onChange={e => setMarkFull(e.target.checked)} />
            <span style={{ fontSize: "var(--fs-sm)", fontWeight: 500 }}>
              Mark as Fully Received
            </span>
          </label>
          <label className="field">
            <div className="lbl">Notes</div>
            <textarea className="input" rows={2} value={notes}
              onChange={e => setNotes(e.target.value)} placeholder="Notes…" />
          </label>
        </div>

        {/* ── GRN summary bar ── */}
        <div style={{
          display: "flex", justifyContent: "space-around", textAlign: "center",
          padding: "12px 16px", borderRadius: 12, marginBottom: 14,
          background: "var(--fill-accent)", border: "1px solid var(--stroke-accent)",
        }}>
          {[
            { val: fmt(grandQty), label: "qty" },
            { val: grandPcs, label: "pieces", accent: true },
            { val: allRL.length, label: "lines" },
          ].map(({ val, label, accent }) => (
            <div key={label}>
              <div style={{
                fontFamily: "IBM Plex Mono, monospace", fontWeight: 700,
                fontSize: "var(--fs-lg)",
                color: accent ? "var(--marigold-500)" : "var(--text-hi)",
              }}>
                {val}
              </div>
              <div className="dim" style={{ fontSize: "var(--fs-xs)" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* ── Live Validation Log ── */}
        <ValidationLog entries={validationLog} />

        {/* Error */}
        {err && (
          <div style={{
            padding: "12px 14px", borderRadius: 10, marginBottom: 12,
            background: "var(--fill-danger)", border: "1px solid var(--stroke-danger)",
            color: "var(--st-alert)", fontSize: "var(--fs-sm)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <ShieldAlert size={16} style={{ flexShrink: 0 }} />
              <strong>Validation Failed</strong>
            </div>
            {/* Split multi-sentence error into readable lines */}
            {err.split(" | ").map((line, i) => (
              <div key={i} style={{
                padding: "3px 0",
                paddingLeft: i > 0 ? 24 : 0,
                color: i === 0 ? "var(--st-alert)" : "var(--text-mid)",
                fontSize: i === 0 ? "var(--fs-sm)" : "var(--fs-xs)",
              }}>
                {i > 0 && <span style={{ marginRight: 4, opacity: 0.5 }}>→</span>}
                {line}
              </div>
            ))}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" type="submit" disabled={saving}
            style={{ flex: 1, justifyContent: "center" }}>
            <ClipboardList size={15} />
            {saving ? "Posting GRN…" : "Post Goods Receipt (GRN)"}
          </button>
        </div>
      </form>

      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   RECEIPT LINE ROW  (one piece / split)
───────────────────────────────────────────────────────── */
function RLRow({ r, ri, l, products, designsMap, loadDesigns, onChange, onRemove, canRemove }) {
  const hasPiece = (r.piece_no || "").trim().length > 0;

  return (
    <div style={{
      marginBottom: 10, padding: 12, borderRadius: 10,
      border: `1px ${hasPiece ? "solid" : "dashed"} ${hasPiece ? "rgba(245,165,36,.35)" : "var(--glass-stroke)"}`,
      background: hasPiece ? "rgba(245,165,36,.04)" : "transparent",
      transition: "background .2s, border-color .2s",
    }}>
      {/* Row label */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
        <span style={{
          fontSize: 11, fontWeight: 700,
          background: "rgba(245,165,36,.14)", color: "var(--marigold-500)",
          borderRadius: 5, padding: "2px 8px",
        }}>
          Split {ri + 1}{hasPiece ? ` — ${r.piece_no.trim()}` : ""}
        </span>
        {canRemove && (
          <button type="button" onClick={onRemove} style={{
            marginLeft: "auto", background: "none", border: "none",
            cursor: "pointer", color: "var(--st-alert)", padding: 2, display: "flex",
          }}>
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* Piece No — gold box, required */}
      <div style={{
        marginBottom: 10, padding: "7px 12px", borderRadius: 8,
        border: `1.5px solid ${hasPiece ? "var(--marigold-500)" : "rgba(245,165,36,.3)"}`,
        background: "rgba(245,165,36,.06)",
      }}>
        <div style={{ fontSize: 10, color: "var(--marigold-500)", fontWeight: 700, marginBottom: 3 }}>
          <Hash size={9} style={{ display: "inline", marginRight: 2 }} />
          PIECE / LOT / ROLL NO.
          <span style={{ fontWeight: 400, opacity: .65, marginLeft: 8, textTransform: "none" }}>
            optional · unique inventory key
          </span>
        </div>
        <input
          value={r.piece_no}
          onChange={e => onChange("piece_no", e.target.value)}
          placeholder="e.g. PC-001 · LOT-42 · ROLL-7 (optional)"
          style={{
            width: "100%", border: "none", outline: "none",
            background: "transparent",
            fontFamily: "IBM Plex Mono, monospace",
            fontWeight: 700, fontSize: "var(--fs-md)",
            color: "var(--text-hi)",
          }}
        />
      </div>

      {/* Fields 2-col grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>

        <label className="field">
          <div className="lbl">Product *</div>
          <select className="input select" value={r.product_id || ""}
            onChange={e => {
              onChange("product_id", e.target.value);
              onChange("design_id", "");
              if (e.target.value) loadDesigns(e.target.value);
            }} required>
            <option value="">Select…</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>

        <label className="field">
          <div className="lbl">Design</div>
          <select className="input select" value={r.design_id || ""}
            onChange={e => onChange("design_id", e.target.value)}>
            <option value="">None</option>
            {(designsMap[r.product_id] || []).map(d =>
              <option key={d.id} value={d.id}>{d.design_code} — {d.name}</option>
            )}
          </select>
        </label>

        <label className="field">
          <div className="lbl">Qty Received *</div>
          <input className="input num" type="number" step="any" min="0.001"
            value={r.qty} onChange={e => onChange("qty", e.target.value)} required />
        </label>

        <label className="field">
          <div className="lbl">Rate ₹ *</div>
          <input className="input num" type="number" step="any" min="0"
            value={r.rate} onChange={e => onChange("rate", e.target.value)} required />
        </label>

        <label className="field">
          <div className="lbl">Unit <span style={{ fontWeight: 400, opacity: .55 }}>(from order)</span></div>
          <div className="input" style={{
            background: "var(--glass-fill)", color: "var(--text-mid)",
            cursor: "default", userSelect: "none",
          }}>
            {l.unit_label || "—"}
          </div>
        </label>

        <label className="field">
          <div className="lbl">Design No.</div>
          <input className="input" value={r.design_no || ""}
            onChange={e => onChange("design_no", e.target.value)} placeholder="optional" />
        </label>

        <label className="field" style={{ gridColumn: "1 / -1" }}>
          <div className="lbl">
            Weight (kg)
            <span style={{ fontWeight: 400, opacity: .55, marginLeft: 6 }}>optional</span>
          </div>
          <input className="input num" type="number" step="any" min="0"
            value={r.weight || ""} onChange={e => onChange("weight", e.target.value)} />
        </label>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   VALIDATION LOG PANEL
   Mirrors the backend _log_grn_step() validation in real time.
───────────────────────────────────────────────────────── */
function ValidationLog({ entries }) {
  const [open, setOpen] = useState(false);
  if (!entries || entries.length === 0) return null;

  const hasOver = entries.some(e => e.isOver);
  const allFinal = entries.every(e => e.isFinal);

  return (
    <div style={{
      marginBottom: 14, borderRadius: 12, overflow: "hidden",
      border: `1px solid ${hasOver ? "rgba(251,113,133,.35)" : allFinal ? "rgba(52,211,153,.3)" : "rgba(99,102,241,.25)"}`,
      background: hasOver ? "rgba(251,113,133,.04)" : allFinal ? "rgba(52,211,153,.04)" : "rgba(99,102,241,.04)",
    }}>
      {/* Header toggle */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 8,
          padding: "10px 14px", background: "none", border: "none", cursor: "pointer",
          borderBottom: open ? "1px solid rgba(99,102,241,.15)" : "none",
        }}
      >
        <Activity size={14} color={hasOver ? "var(--st-alert)" : allFinal ? "var(--st-complete)" : "#818cf8"} />
        <span style={{
          fontWeight: 700, fontSize: "var(--fs-xs)",
          color: hasOver ? "var(--st-alert)" : allFinal ? "var(--st-complete)" : "#818cf8",
        }}>
          GRN Validation Log
        </span>
        <span style={{
          marginLeft: 4, fontSize: "var(--fs-xs)", fontWeight: 400, color: "var(--text-low)"
        }}>
          — {entries.length} step{entries.length !== 1 ? "s" : ""} ·{" "}
          {hasOver ? "⚠ over-receipt detected" : allFinal ? "ready to post" : "partial receipt"}
        </span>
        <span style={{ marginLeft: "auto", color: "var(--text-low)" }}>
          {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </span>
      </button>

      {/* Log entries */}
      {open && (
        <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
          {entries.map((e) => (
            <div key={e.key} style={{
              padding: "9px 12px", borderRadius: 8,
              background: e.isOver
                ? "rgba(251,113,133,.08)"
                : e.isFinal
                ? "rgba(52,211,153,.06)"
                : "rgba(99,102,241,.06)",
              border: `1px solid ${
                e.isOver ? "rgba(251,113,133,.2)" :
                e.isFinal ? "rgba(52,211,153,.2)" :
                "rgba(99,102,241,.15)"
              }`,
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: 11,
            }}>
              <div style={{
                fontWeight: 700,
                color: e.isOver ? "var(--st-alert)" : e.isFinal ? "var(--st-complete)" : "#818cf8",
                marginBottom: 5,
              }}>
                STEP {e.step} — {e.lineName}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 12px", color: "var(--text-mid)" }}>
                <LogRow label="Ordered Qty"         value={fmt(e.orderedQty)} />
                <LogRow label="Previously Received" value={fmt(e.prevReceived)} />
                <LogRow label="This Receipt"        value={fmt(e.thisQty)} />
                <LogRow label="Cumulative Total"    value={fmt(e.cumulative)} />
                <LogRow label="Remaining After"     value={fmt(e.remaining)}
                  accent={e.remaining > 0 ? "var(--st-partial)" : "var(--st-complete)"} />
                <LogRow label="Status"              value={e.status}
                  accent={e.isOver ? "var(--st-alert)" : e.isFinal ? "var(--st-complete)" : "#818cf8"} />
              </div>
              {e.isOver && (
                <div style={{
                  marginTop: 6, padding: "4px 8px", borderRadius: 5,
                  background: "rgba(251,113,133,.12)", color: "var(--st-alert)",
                  fontSize: 10, fontWeight: 700,
                }}>
                  *** VALIDATION RULE FAILED ***
                  Rule: previously_received + current_receipt_qty &lt;= ordered_qty
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LogRow({ label, value, accent }) {
  return (
    <>
      <span style={{ color: "var(--text-low)", fontSize: 10 }}>{label}</span>
      <span style={{ fontWeight: 600, color: accent || "var(--text-hi)" }}>{value}</span>
    </>
  );
}

/* ─────────────────────────────────────────────────────────
   Micro components
───────────────────────────────────────────────────────── */
function Chip({ label, color, bg }) {
  return (
    <span style={{
      fontSize: 11, fontFamily: "IBM Plex Mono, monospace",
      color, background: bg, borderRadius: 6, padding: "2px 8px",
    }}>
      {label}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────── */
function todayStr() { return new Date().toISOString().slice(0, 10); }
function fmt(n) {
  const v = Number(n);
  if (!isFinite(v)) return "0";
  return v.toLocaleString("en-IN", { maximumFractionDigits: 3 });
}
function round3(n) { return Math.round(Number(n) * 1000) / 1000; }
