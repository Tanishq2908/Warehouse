import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import LookupSelect from "@/components/LookupSetup";
import {
  ArrowRight, Plus, Trash2, CheckCircle, AlertTriangle, Search,
  Repeat2, Package, Hash, FileText, ChevronDown, ChevronUp, Clock,
  X, Layers, Zap,
} from "lucide-react";

/* ─── helpers ─── */
function fmt(n) {
  if (n === undefined || n === null) return "0";
  return Number(n).toLocaleString("en-IN", { maximumFractionDigits: 3 });
}
function today() { return new Date().toISOString().slice(0, 10); }

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════════ */
export default function Convert() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [histLoading, setHistLoading] = useState(false);
  const [successResult, setSuccessResult] = useState(null);

  const loadHistory = useCallback(async () => {
    setHistLoading(true);
    try {
      const { data } = await api.get("/v1/conversions");
      setHistory(data);
    } catch { setHistory([]); }
    finally { setHistLoading(false); }
  }, []);

  const handleSuccess = (result) => {
    setDrawerOpen(false);
    setSuccessResult(result);
    loadHistory();
  };

  useEffect(() => { loadHistory(); }, [loadHistory]);

  return (
    <div>
      {/* ── Page header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 4 }}>Convert to Product</h1>
          <p className="page-sub">Convert raw materials into new inventory items.</p>
        </div>
        <button className="btn-primary" onClick={() => { setSuccessResult(null); setDrawerOpen(true); }}
          data-testid="convert-new-btn">
          <Repeat2 size={16} /> New Conversion
        </button>
      </div>

      {/* ── Success banner ── */}
      {successResult && (
        <div className="glass" style={{
          padding: 20, marginBottom: 20,
          border: "1px solid var(--st-complete)",
          background: "var(--fill-positive)",
          borderRadius: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "var(--fill-positive)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <CheckCircle size={20} color="var(--st-complete)" />
            </div>
            <div>
              <div style={{ fontWeight: 700 }}>Conversion Recorded</div>
              <div className="dim" style={{ fontSize: "var(--fs-xs)" }}>Ref: <span className="mono">{successResult.conversion_ref?.slice(0,8)}…</span></div>
            </div>
            <button className="btn-ghost btn-sm" style={{ marginLeft: "auto" }} onClick={() => setSuccessResult(null)}>
              <X size={14} />
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "center" }}>
            <RMCard label="Source (deducted)" rm={successResult.source} accent="var(--st-alert)" />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <ArrowRight size={22} color="var(--marigold-500)" />
            </div>
            <RMCard label="Output (added)" rm={successResult.output} accent="var(--st-complete)" />
          </div>
        </div>
      )}

      {/* ── Explainer cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 28 }}>
        <FeatureCard icon={Layers} color="var(--indigo-400)"
          title="Pick a source item"
          desc="Search your inventory by product name or piece number." />
        <FeatureCard icon={Zap} color="var(--marigold-500)"
          title="Define the output"
          desc="Name the new product, assign piece & design numbers, set quantity produced." />
        <FeatureCard icon={CheckCircle} color="var(--st-complete)"
          title="Inventory auto-updates"
          desc="Source is deducted and output is credited instantly with a full audit trail." />
      </div>

      {/* ── History ── */}
      <div className="glass" style={{ padding: 0, overflow: "hidden" }}>
        <button
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10,
            padding: "16px 20px", background: "none", border: "none", cursor: "pointer",
            color: "var(--text-hi)", font: "inherit", fontWeight: 600, fontSize: "var(--fs-md)",
            borderBottom: historyOpen ? "1px solid var(--glass-stroke)" : "none",
          }}
          onClick={() => { setHistoryOpen(o => !o); if (!historyOpen) loadHistory(); }}>
          <Clock size={18} color="var(--marigold-500)" />
          Conversion History
          <span className="pill" style={{ marginLeft: 6, fontSize: 11 }}>{history.length}</span>
          <span style={{ marginLeft: "auto" }}>
            {historyOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </button>

        {historyOpen && (
          <div style={{ padding: 16 }}>
            {histLoading && (
              <div className="vstack" style={{ gap: 8 }}>
                {[1,2,3].map(i => (
                  <div key={i} className="glass-row" style={{ padding: 14 }}>
                    <div className="skeleton" style={{ height: 16, width: "60%", marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 12, width: "40%" }} />
                  </div>
                ))}
              </div>
            )}
            {!histLoading && history.length === 0 && (
              <div className="dim" style={{ padding: "24px 0", textAlign: "center" }}>
                No conversions recorded yet.
              </div>
            )}
            {!histLoading && history.map((c, i) => (
              <div key={c.id || i} className="glass-row" style={{ padding: "12px 16px", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{c.output_name}</div>
                    <div className="dim" style={{ fontSize: "var(--fs-xs)", marginTop: 2 }}>
                      {fmt(c.qty_used)} used → {fmt(c.qty_produced)} produced
                    </div>
                  </div>
                  {c.output_piece_no && (
                    <span className="mono pill" style={{ fontSize: 11 }}>#{c.output_piece_no}</span>
                  )}
                  {c.output_design_no && (
                    <span className="dim" style={{ fontSize: "var(--fs-xs)" }}>DSG: {c.output_design_no}</span>
                  )}
                  <span className="dim" style={{ fontSize: "var(--fs-xs)", whiteSpace: "nowrap" }}>
                    {c.created_at ? new Date(c.created_at).toLocaleDateString("en-IN") : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Drawer ── */}
      {drawerOpen && (
        <>
          <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)} />
          <ConvertForm
            onClose={() => setDrawerOpen(false)}
            onSuccess={handleSuccess} />
        </>
      )}
    </div>
  );
}

/* ─── Feature explainer card ─── */
function FeatureCard({ icon: Icon, color, title, desc }) {
  return (
    <div className="glass-row" style={{ padding: "18px 20px" }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12, marginBottom: 12,
        background: `color-mix(in srgb, ${color} 12%, transparent)`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={20} color={color} />
      </div>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{title}</div>
      <div className="dim" style={{ fontSize: "var(--fs-xs)", lineHeight: 1.5 }}>{desc}</div>
    </div>
  );
}

/* ─── Mini inventory card for success summary ─── */
function RMCard({ label, rm, accent }) {
  if (!rm) return null;
  return (
    <div style={{
      padding: "14px 16px", borderRadius: 12,
      border: `1px solid ${accent}22`,
      background: `color-mix(in srgb, ${accent} 6%, transparent)`,
    }}>
      <div className="dim" style={{ fontSize: "var(--fs-xs)", marginBottom: 6 }}>{label}</div>
      <div style={{ fontWeight: 700 }}>{rm.converted_name || rm.product?.name || "—"}</div>
      {rm.piece_no && <div className="mono dim" style={{ fontSize: "var(--fs-xs)" }}>#{rm.piece_no}</div>}
      <div style={{ marginTop: 8 }}>
        <span className="mono" style={{ fontWeight: 700, color: accent }}>{fmt(rm.quantity)}</span>
        <span className="dim" style={{ fontSize: "var(--fs-xs)", marginLeft: 4 }}>{rm.unit?.label || ""}</span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CONVERT FORM (drawer)
   ════════════════════════════════════════════════════════════════ */
function ConvertForm({ onClose, onSuccess }) {
  /* Source */
  const [sourceSearch, setSourceSearch] = useState("");
  const [sourceResults, setSourceResults] = useState([]);
  const [sourceLoading, setSourceLoading] = useState(false);
  const [source, setSource] = useState(null);

  /* Conversion fields */
  const [qtyUsed, setQtyUsed] = useState("");
  const [unitId, setUnitId] = useState("");
  const [convertDate, setConvertDate] = useState(today());
  const [notes, setNotes] = useState("");

  /* Output */
  const [outputName, setOutputName] = useState("");
  const [outputDesignNo, setOutputDesignNo] = useState("");
  const [outputPieceNo, setOutputPieceNo] = useState("");
  const [qtyProduced, setQtyProduced] = useState("");
  const [outputUnitId, setOutputUnitId] = useState("");
  const [outputRate, setOutputRate] = useState("");
  const [extraFields, setExtraFields] = useState([]);

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  /* Search inventory */
  useEffect(() => {
    if (!sourceSearch.trim()) { setSourceResults([]); return; }
    const timer = setTimeout(async () => {
      setSourceLoading(true);
      try {
        const { data } = await api.get("/v1/raw-materials", { params: { q: sourceSearch, limit: 20 } });
        setSourceResults(data);
      } catch { setSourceResults([]); }
      finally { setSourceLoading(false); }
    }, 350);
    return () => clearTimeout(timer);
  }, [sourceSearch]);

  const selectSource = (rm) => {
    setSource(rm);
    setUnitId(rm.unit?.id || "");
    setSourceSearch("");
    setSourceResults([]);
  };

  /* Extra fields helpers */
  const addExtra = () => setExtraFields(p => [...p, { label: "", value: "" }]);
  const setExtra = (i, k, v) => setExtraFields(p => { const n = [...p]; n[i] = { ...n[i], [k]: v }; return n; });
  const removeExtra = (i) => setExtraFields(p => { const n = [...p]; n.splice(i, 1); return n; });

  /* Validation */
  const insufficient = source && qtyUsed && Number(qtyUsed) > (source.quantity || 0);

  const submit = async (e) => {
    e.preventDefault(); setErr(""); setSaving(true);
    try {
      const { data } = await api.post("/v1/raw-materials/convert", {
        source_rm_id: source.id,
        qty_used: Number(qtyUsed),
        unit_id: unitId,
        output_name: outputName.trim(),
        output_design_no: outputDesignNo.trim() || null,
        output_piece_no: outputPieceNo.trim() || null,
        qty_produced: Number(qtyProduced),
        output_unit_id: outputUnitId,
        output_rate: outputRate ? Number(outputRate) : null,
        convert_date: convertDate,
        notes: notes.trim() || null,
        extra_fields: extraFields.filter(f => f.label.trim()),
      });
      onSuccess(data);
    } catch {
      setErr("We couldn’t convert the item. Check the details and try again.");
    } finally { setSaving(false); }
  };

  return (
    <div className="drawer glass-strong" style={{ overflowY: "auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 24 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 13, flexShrink: 0,
          background: "linear-gradient(135deg, var(--marigold-500), var(--indigo-400))",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Repeat2 size={22} color="var(--color-text)" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: "var(--fs-lg)" }}>New Conversion</div>
          <div className="dim" style={{ fontSize: "var(--fs-xs)" }}>Convert inventory to a new product</div>
        </div>
        <button className="btn-ghost btn-sm" onClick={onClose}><X size={16} /></button>
      </div>

      <form onSubmit={submit} className="vstack" style={{ gap: 16 }}>

        {/* ── SECTION 1: Source ── */}
        <Section
          label="1 · Source Material"
          accent="var(--st-alert)"
          icon={<Package size={15} color="var(--st-alert)" />}>

          {!source ? (
            <div>
              <div style={{ position: "relative" }}>
                <Search size={15} style={{
                  position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
                  color: "var(--text-mid)", pointerEvents: "none",
                }} />
                <input
                  className="input"
                  style={{ paddingLeft: 38 }}
                  placeholder="Search by product name or piece no…"
                  value={sourceSearch}
                  onChange={e => setSourceSearch(e.target.value)}
                  autoFocus />
              </div>
              {sourceLoading && <div className="dim" style={{ fontSize: "var(--fs-xs)", marginTop: 8, textAlign: "center" }}>Searching…</div>}
              {sourceResults.length > 0 && (
                <div style={{ marginTop: 8, maxHeight: 240, overflowY: "auto" }}>
                  {sourceResults.map(rm => (
                    <button key={rm.id} type="button"
                      className="glass-row"
                      style={{
                        width: "100%", padding: "10px 14px", marginBottom: 6,
                        display: "flex", alignItems: "center", gap: 10,
                        cursor: "pointer", border: "none", background: "var(--glass-fill)",
                        borderRadius: 12, color: "var(--text-hi)", fontFamily: "inherit",
                        textAlign: "left",
                      }}
                      onClick={() => selectSource(rm)}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>
                          {rm.converted_name || rm.product?.name || "—"}
                        </div>
                        <div className="dim" style={{ fontSize: "var(--fs-xs)" }}>
                          {rm.design?.design_code && `DSG: ${rm.design.design_code} · `}
                          {rm.piece_no && `#${rm.piece_no} · `}
                          {rm.unit?.label}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="mono" style={{ fontWeight: 700, color: rm.quantity > 0 ? "var(--st-complete)" : "var(--st-alert)" }}>
                          {fmt(rm.quantity)}
                        </div>
                        <div className="dim" style={{ fontSize: "var(--fs-xs)" }}>in stock</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              {/* Selected source card */}
              <div style={{
                padding: "14px 16px", borderRadius: 13,
                border: "1px solid var(--marigold-500)33",
                background: "var(--fill-accent)",
                marginBottom: 14,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{source.converted_name || source.product?.name}</div>
                    <div className="dim" style={{ fontSize: "var(--fs-xs)", marginTop: 2 }}>
                      {source.design?.design_code && `${source.design.design_code} · `}
                      {source.piece_no ? `Piece #${source.piece_no}` : "No piece no."}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="mono" style={{ fontWeight: 700, fontSize: "var(--fs-lg)" }}>{fmt(source.quantity)}</div>
                    <div className="dim" style={{ fontSize: "var(--fs-xs)" }}>{source.unit?.label} in stock</div>
                  </div>
                  <button type="button" className="btn-ghost btn-sm" style={{ color: "var(--text-mid)" }}
                    onClick={() => setSource(null)}>
                    <X size={14} />
                  </button>
                </div>
                {/* Stock bar */}
                <div style={{ marginTop: 10, height: 4, background: "var(--glass-stroke)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 4,
                    background: "var(--marigold-500)",
                    width: source.quantity > 0 ? "100%" : "0%",
                    transition: "width .4s ease",
                  }} />
                </div>
              </div>

              <div className="grid-2" style={{ gap: 12 }}>
                <label className="field">
                  <div className="lbl">Qty Used *</div>
                  <input className={`input num${insufficient ? " input-error" : ""}`}
                    type="number" step="any" min="0.001" required
                    value={qtyUsed} onChange={e => setQtyUsed(e.target.value)}
                    placeholder={`Max: ${fmt(source.quantity)}`} />
                  {insufficient && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, color: "var(--st-alert)", fontSize: "var(--fs-xs)" }}>
                      <AlertTriangle size={12} /> Exceeds stock ({fmt(source.quantity)} available)
                    </div>
                  )}
                </label>
                <label className="field">
                  <div className="lbl">Unit *</div>
                  <LookupSelect typeCode="UNIT" value={unitId} onChange={setUnitId} placeholder="Unit" />
                </label>
              </div>
            </div>
          )}
        </Section>

        {/* ── SECTION 2: Output ── */}
        <Section
          label="2 · Output Product"
          accent="var(--st-complete)"
          icon={<Repeat2 size={15} color="var(--st-complete)" />}>

          <div className="grid-2" style={{ gap: 12 }}>
            <label className="field" style={{ gridColumn: "1/-1" }}>
              <div className="lbl">Product Name *</div>
              <input className="input" required value={outputName}
                onChange={e => setOutputName(e.target.value)}
                placeholder="e.g. Finished Fabric — Blue" />
            </label>
            <label className="field">
              <div className="lbl"><Hash size={11} style={{ display: "inline", marginRight: 3 }} /> Piece No.</div>
              <input className="input mono" value={outputPieceNo}
                onChange={e => setOutputPieceNo(e.target.value)}
                placeholder="e.g. PC-201" />
            </label>
            <label className="field">
              <div className="lbl">Design No.</div>
              <input className="input mono" value={outputDesignNo}
                onChange={e => setOutputDesignNo(e.target.value)}
                placeholder="e.g. DSG-42" />
            </label>
            <label className="field">
              <div className="lbl">Qty Produced *</div>
              <input className="input num" type="number" step="any" min="0.001" required
                value={qtyProduced} onChange={e => setQtyProduced(e.target.value)} />
            </label>
            <label className="field">
              <div className="lbl">Output Unit *</div>
              <LookupSelect typeCode="UNIT" value={outputUnitId} onChange={setOutputUnitId} placeholder="Unit" required />
            </label>
            <label className="field">
              <div className="lbl">Output Rate ₹</div>
              <input className="input num" type="number" step="any" min="0"
                value={outputRate} onChange={e => setOutputRate(e.target.value)}
                placeholder="optional" />
            </label>
          </div>
        </Section>

        {/* ── SECTION 3: Notes + Date ── */}
        <Section
          label="3 · Details"
          accent="var(--indigo-400)"
          icon={<FileText size={15} color="var(--indigo-400)" />}>
          <div className="grid-2" style={{ gap: 12 }}>
            <label className="field">
              <div className="lbl">Conversion Date *</div>
              <input className="input" type="date" required value={convertDate}
                onChange={e => setConvertDate(e.target.value)} />
            </label>
          </div>
          <label className="field" style={{ marginTop: 12 }}>
            <div className="lbl">Notes</div>
            <textarea className="input" rows={2} value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Reason, batch info, etc." />
          </label>
        </Section>

        {/* ── SECTION 4: Extra Fields ── */}
        <div className="glass-row" style={{ padding: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>Extra Fields</div>
            <button type="button" className="btn-ghost btn-sm" onClick={addExtra}>
              <Plus size={13} /> Add Field
            </button>
          </div>
          {extraFields.length === 0 && (
            <div className="dim" style={{ fontSize: "var(--fs-xs)", textAlign: "center", padding: "8px 0" }}>
              Add custom metadata like batch no., loom no., etc.
            </div>
          )}
          {extraFields.map((ef, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input className="input" placeholder="Field name…" value={ef.label}
                onChange={e => setExtra(i, "label", e.target.value)} style={{ flex: 1 }} />
              <input className="input" placeholder="Value…" value={ef.value}
                onChange={e => setExtra(i, "value", e.target.value)} style={{ flex: 2 }} />
              <button type="button" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--st-alert)", padding: 6 }}
                onClick={() => removeExtra(i)}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>

        {/* ── Summary panel ── */}
        {source && qtyUsed && outputName && qtyProduced && (
          <div style={{
            padding: "16px 18px", borderRadius: 14,
            background: "var(--fill-accent)",
            border: "1px solid var(--glass-stroke)",
          }}>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>Conversion Summary</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "center" }}>
              <div style={{ textAlign: "center" }}>
                <div className="dim" style={{ fontSize: "var(--fs-xs)", marginBottom: 4 }}>Source deducted</div>
                <div className="mono" style={{ fontWeight: 700, fontSize: "var(--fs-lg)", color: "var(--st-alert)" }}>
                  −{fmt(qtyUsed)}
                </div>
                <div className="dim" style={{ fontSize: "var(--fs-xs)" }}>{source.unit?.label}</div>
              </div>
              <ArrowRight size={20} color="var(--marigold-500)" />
              <div style={{ textAlign: "center" }}>
                <div className="dim" style={{ fontSize: "var(--fs-xs)", marginBottom: 4 }}>Output produced</div>
                <div className="mono" style={{ fontWeight: 700, fontSize: "var(--fs-lg)", color: "var(--st-complete)" }}>
                  +{fmt(qtyProduced)}
                </div>
                <div className="dim" style={{ fontSize: "var(--fs-xs)" }}>{outputName}</div>
              </div>
            </div>
          </div>
        )}

        {err && <div className="pill alert" style={{ padding: "10px 14px" }}><AlertTriangle size={13} /> {err}</div>}

        <button className="btn-primary" type="submit" disabled={saving || !source || insufficient}
          style={{ width: "100%", justifyContent: "center" }}>
          {saving ? "Processing…" : <><Repeat2 size={16} /> Post Conversion</>}
        </button>
      </form>
    </div>
  );
}

/* ─── Section wrapper ─── */
function Section({ label, accent, icon, children }) {
  return (
    <div style={{
      borderRadius: 14,
      border: "1px solid var(--glass-stroke)",
      background: "var(--glass-fill)",
      overflow: "hidden",
    }}>
      <div style={{
        padding: "10px 16px",
        borderLeft: `3px solid ${accent}`,
        borderBottom: "1px solid var(--glass-stroke)",
        display: "flex", alignItems: "center", gap: 8,
        background: `color-mix(in srgb, ${accent} 5%, transparent)`,
      }}>
        {icon}
        <span style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{label}</span>
      </div>
      <div style={{ padding: 16 }}>{children}</div>
    </div>
  );
}
