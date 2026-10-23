import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import LookupSelect from "./LookupSetup";

/**
 * DynamicForm — renders inputs based on custom_field_def rows for `entityType`.
 * value: {[field_key]: value}, onChange(newValues)
 */
export default function DynamicForm({ entityType, value, onChange, testidPrefix = "cf" }) {
  const [defs, setDefs] = useState([]);
  useEffect(() => {
    let cancelled = false;
    api.get(`/v1/meta/fields/${entityType}`).then(({ data }) => {
      if (!cancelled) setDefs(data);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [entityType]);

  if (defs.length === 0) return null;

  const setField = (k, v) => onChange({ ...(value || {}), [k]: v });

  return (
    <div className="vstack" style={{ gap: 12 }}>
      {defs.map((d) => (
        <label className="field" key={d.field_key}>
          <div className="lbl">
            {d.label}{d.is_required ? <span style={{ color: "var(--st-alert)" }}> *</span> : null}
          </div>
          {renderInput(d, value?.[d.field_key], (v) => setField(d.field_key, v),
            `${testidPrefix}-${d.field_key}`)}
        </label>
      ))}
    </div>
  );
}

function renderInput(d, v, onChange, testid) {
  switch (d.data_type) {
    case "TEXT":
      return <input className="input" data-testid={testid} value={v ?? ""}
                     onChange={(e) => onChange(e.target.value)} />;
    case "MULTILINE":
      return <textarea className="input" rows={3} data-testid={testid} value={v ?? ""}
                        onChange={(e) => onChange(e.target.value)} />;
    case "NUMBER":
    case "INTEGER":
      return <input className="input num" data-testid={testid} type="number" value={v ?? ""}
                     step={d.data_type === "NUMBER" ? "any" : "1"}
                     onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))} />;
    case "DATE":
      return <input className="input" data-testid={testid} type="date" value={v ?? ""}
                     onChange={(e) => onChange(e.target.value)} />;
    case "DATETIME":
      return <input className="input" data-testid={testid} type="datetime-local" value={v ?? ""}
                     onChange={(e) => onChange(e.target.value)} />;
    case "BOOLEAN":
      return (
        <label className="hstack" style={{ gap: 8 }}>
          <input type="checkbox" data-testid={testid} checked={!!v}
                 onChange={(e) => onChange(e.target.checked)} />
          <span className="muted">Yes / No</span>
        </label>
      );
    case "LOOKUP":
      // Need the lookup type CODE — we don't have it directly, but backend stores lookup_type_id.
      // Cache the type code lookup on first render.
      return <LookupTypeAsSelect id={d.lookup_type_id} value={v} onChange={onChange}
                                 testid={testid} />;
    default:
      return <input className="input" data-testid={testid} value={v ?? ""}
                     onChange={(e) => onChange(e.target.value)} />;
  }
}

function LookupTypeAsSelect({ id, value, onChange, testid }) {
  const [code, setCode] = useState(null);
  useEffect(() => {
    api.get("/v1/lookup-types").then(({ data }) => {
      const t = data.find((x) => x.id === id);
      if (t) setCode(t.code);
    }).catch(() => {});
  }, [id]);
  if (!code) return <div className="skeleton" style={{ height: 44 }} />;
  return <LookupSelect typeCode={code} value={value} onChange={onChange} testid={testid} />;
}
