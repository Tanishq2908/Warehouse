import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

/**
 * DataGrid — responsive table above md, card list below.
 *
 * columns: [{ key, label, render?, num?, sortable? }]
 * rows: array of objects
 * loading: bool
 * error: string|null
 * onRowClick: (row) => void
 * emptyMessage: string
 * keyField: string (default "id")
 * extraCard: (row) => JSX  — extra content shown only in card view
 */
export default function DataGrid({
  columns = [],
  rows = [],
  loading = false,
  error = null,
  onRowClick,
  emptyMessage = "No records found.",
  keyField = "id",
  extraCard,
  stickyFirst = false,
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  let displayRows = [...rows];
  if (sortKey) {
    displayRows.sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }

  if (error) return (
    <div className="glass" style={{ padding: 32, textAlign: "center", color: "var(--st-alert)" }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Failed to load</div>
      <div className="dim" style={{ fontSize: "var(--fs-sm)" }}>{error}</div>
    </div>
  );

  return (
    <>
      {/* ── Desktop table ─────────────────────────────────── */}
      <div className="dg-desktop" style={{ overflowX: "auto" }}>
        <table className="dg-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={col.num ? "num" : ""}
                  style={{ cursor: col.sortable ? "pointer" : "default", userSelect: "none" }}
                  onClick={() => col.sortable && toggleSort(col.key)}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key}>
                    <div className="skeleton" style={{ height: 18, borderRadius: 6, width: "80%" }} />
                  </td>
                ))}
              </tr>
            ))}
            {!loading && displayRows.length === 0 && (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: "center", padding: 48, color: "var(--text-low)" }}>
                  {emptyMessage}
                </td>
              </tr>
            )}
            {!loading && displayRows.map((row) => (
              <tr
                key={row[keyField]}
                onClick={() => onRowClick && onRowClick(row)}
                style={{ cursor: onRowClick ? "pointer" : "default" }}
                data-testid={`row-${row[keyField]}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className={col.num ? "num" : ""}>
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Mobile card list ──────────────────────────────── */}
      <div className="dg-mobile">
        {loading && Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-row" style={{ padding: 16, marginBottom: 10 }}>
            <div className="skeleton" style={{ height: 18, width: "60%", marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 14, width: "80%" }} />
          </div>
        ))}
        {!loading && displayRows.length === 0 && (
          <div style={{ textAlign: "center", padding: 48, color: "var(--text-low)" }}>
            {emptyMessage}
          </div>
        )}
        {!loading && displayRows.map((row) => (
          <div
            key={row[keyField]}
            className="glass-row"
            onClick={() => onRowClick && onRowClick(row)}
            style={{ padding: 14, marginBottom: 10, cursor: onRowClick ? "pointer" : "default" }}
            data-testid={`card-${row[keyField]}`}
          >
            {columns.filter(c => !c.hideInCard).map((col, ci) => (
              <div
                key={col.key}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  marginBottom: ci < columns.length - 1 ? 6 : 0,
                }}
              >
                {ci > 0 && (
                  <span className="dim" style={{ fontSize: "var(--fs-xs)", minWidth: 90 }}>
                    {col.label}
                  </span>
                )}
                <span
                  className={col.num ? "mono" : ""}
                  style={{
                    fontWeight: ci === 0 ? 600 : 400,
                    fontSize: ci === 0 ? "var(--fs-md)" : "var(--fs-sm)",
                    textAlign: col.num ? "right" : "left",
                    flex: 1,
                  }}
                >
                  {col.render ? col.render(row[col.key], row) : (row[col.key] ?? "—")}
                </span>
              </div>
            ))}
            {extraCard && extraCard(row)}
          </div>
        ))}
      </div>

      <style>{`
        .dg-desktop { display: none; }
        .dg-mobile  { display: block; }
        @media (min-width: 768px) {
          .dg-desktop { display: block; }
          .dg-mobile  { display: none; }
        }
      `}</style>
    </>
  );
}
