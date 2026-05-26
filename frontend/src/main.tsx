import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { isStaticApi } from "@/lib/api";
import { preloadStaticData } from "@/lib/static-api";
import "./index.css";

if (isStaticApi) {
  preloadStaticData();
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
