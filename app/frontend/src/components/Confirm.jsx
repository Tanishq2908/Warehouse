import { createContext, useCallback, useContext, useState } from "react";

const ConfirmCtx = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);

  const confirm = useCallback((opts) => {
    return new Promise((resolve) => {
      setState({ ...opts, resolve });
    });
  }, []);

  const handleOk = () => { state?.resolve(true); setState(null); };
  const handleCancel = () => { state?.resolve(false); setState(null); };

  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      {state && (
        <div className="confirm-dialog" onClick={handleCancel}>
          <div className="glass-strong confirm-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: 700, fontSize: "var(--fs-lg)", marginBottom: 8 }}>
              {state.title || "Confirm"}
            </div>
            <div className="muted" style={{ fontSize: "var(--fs-sm)", marginBottom: 20 }}>
              {state.message || "Are you sure?"}
            </div>
            {state.detail && (
              <div className="glass-row" style={{ padding: 12, marginBottom: 16, fontSize: "var(--fs-sm)" }}>
                {state.detail}
              </div>
            )}
            <div className="hstack" style={{ justifyContent: "flex-end", gap: 10 }}>
              <button className="btn-ghost" onClick={handleCancel} data-testid="confirm-cancel">Cancel</button>
              <button
                className={state.danger ? "btn-danger" : "btn-primary"}
                onClick={handleOk}
                data-testid="confirm-ok"
                style={{ minWidth: 100 }}
              >
                {state.okLabel || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmCtx.Provider>
  );
}

export function useConfirm() {
  const fn = useContext(ConfirmCtx);
  if (!fn) throw new Error("useConfirm must be inside ConfirmProvider");
  return fn;
}
