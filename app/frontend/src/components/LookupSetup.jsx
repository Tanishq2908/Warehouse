import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

/**
 * <LookupSelect typeCode="UNIT" value={id} onChange={setId} placeholder="Unit" allowCreate />
 */
export default function LookupSelect({
  typeCode, value, onChange, placeholder = "Select…", allowCreate = true,
  filter, testid, disabled,
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const ref = useRef();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get(`/v1/lookups/${typeCode}/values`, { params: { q } });
        if (!cancelled) setItems(filter ? data.filter(filter) : data);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [typeCode, q, filter]);

  // resolve selected item's label
  useEffect(() => {
    if (!value) { setSelected(null); return; }
    const found = items.find((x) => x.id === value);
    if (found) setSelected(found);
    else if (value) {
      api.get(`/v1/lookups/${typeCode}/values`, { params: { activeOnly: false } })
        .then(({ data }) => setSelected(data.find((x) => x.id === value) || null))
        .catch(() => {});
    }
  }, [value, items, typeCode]);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const create = async () => {
    if (!q.trim()) return;
    const { data } = await api.post(`/v1/lookups/${typeCode}/values`, { label: q.trim() });
    onChange(data.id);
    setOpen(false);
    setQ("");
    setSelected(data);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button" disabled={disabled}
        data-testid={testid}
        className="input" style={{ textAlign: "left", cursor: disabled ? "not-allowed" : "pointer" }}
        onClick={() => setOpen((o) => !o)}
      >
        {selected ? selected.label : <span className="muted">{placeholder}</span>}
      </button>
      {open && (
        <div className="glass-strong" style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 20,
          padding: 8, maxHeight: 320, overflowY: "auto", borderRadius: 14,
        }}>
          <input
            autoFocus
            className="input"
            placeholder="Search…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ marginBottom: 6 }}
          />
          {items.length === 0 && !q && (
            <div className="dim" style={{ padding: 12 }}>No values yet</div>
          )}
          {items.map((it) => (
            <div
              key={it.id}
              data-testid={testid ? `${testid}-option-${it.code}` : undefined}
              onClick={() => { onChange(it.id); setOpen(false); }}
              style={{
                padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                background: it.id === value ? "var(--glass-fill-strong)" : "transparent",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--glass-fill)"}
              onMouseLeave={(e) => e.currentTarget.style.background = it.id === value ? "var(--glass-fill-strong)" : "transparent"}
            >
              <div>{it.label}</div>
              <div className="dim" style={{ fontSize: "var(--fs-xs)" }}>{it.code}</div>
            </div>
          ))}
          {allowCreate && q.trim() && !items.some((i) => i.label.toLowerCase() === q.trim().toLowerCase()) && (
            <div
              onClick={create}
              data-testid={testid ? `${testid}-add-new` : undefined}
              style={{
                padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                color: "var(--marigold-500)", borderTop: "1px solid var(--glass-stroke)",
                fontWeight: 600,
              }}
            >
              + Add “{q.trim()}”
            </div>
          )}
        </div>
      )}
    </div>
  );
}
