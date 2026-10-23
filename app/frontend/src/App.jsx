import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import Shell from "@/components/Shell";
import { ConfirmProvider } from "@/components/Confirm";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Orders from "@/pages/Orders";
import Receive from "@/pages/Receive";
import Inventory from "@/pages/Inventory";
import Sales from "@/pages/Sales";
import MasterData from "@/pages/MasterData";
import Settings from "@/pages/Settings";
import Convert from "@/pages/Convert";
import { useEffect } from "react";

function Guard({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Shell>{children}</Shell>;
}

export default function App() {
  const { user } = useAuth();

  useEffect(() => {
    const cores = navigator.hardwareConcurrency || 4;
    if (cores <= 4) document.documentElement.setAttribute("data-lite", "true");
    document.documentElement.setAttribute("data-theme", "light");
  }, []);

  return (
    <ConfirmProvider>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/" element={<Guard><Dashboard /></Guard>} />
        <Route path="/orders" element={<Guard><Orders /></Guard>} />
        <Route path="/orders/new" element={<Guard><Orders openNew /></Guard>} />
        <Route path="/receive" element={<Guard><Receive /></Guard>} />
        <Route path="/inventory" element={<Guard><Inventory /></Guard>} />
        <Route path="/sales" element={<Guard><Sales /></Guard>} />
        <Route path="/sales/new" element={<Guard><Sales openNew /></Guard>} />
        <Route path="/master" element={<Guard><MasterData /></Guard>} />
        <Route path="/settings" element={<Guard><Settings /></Guard>} />
        <Route path="/convert" element={<Guard><Convert /></Guard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ConfirmProvider>
  );
}
