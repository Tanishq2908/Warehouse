import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import App from "@/App";
import "@/index.css";
import "@/globals.css";
createRoot(document.getElementById("root")).render(<React.StrictMode><HashRouter><AuthProvider><App/></AuthProvider></HashRouter></React.StrictMode>);
