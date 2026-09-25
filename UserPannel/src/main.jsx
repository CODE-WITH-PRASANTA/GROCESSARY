import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

const params = new URLSearchParams(window.location.search);

if (params.get("logout") === "1") {
  localStorage.removeItem("token");
  localStorage.removeItem("adminToken");
  sessionStorage.clear();

  // Clean the URL so a refresh doesn't re-trigger
  window.history.replaceState({}, "", window.location.pathname);
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
