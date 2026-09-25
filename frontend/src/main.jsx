import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import { Provider } from "react-redux";
import store from "./Utils/store";

// main.jsx (Project 1)
const params = new URLSearchParams(window.location.search);

if (params.get("logout") === "1") {
  localStorage.removeItem("token");
  localStorage.removeItem("adminToken");
  sessionStorage.clear();

  // Clean the URL so a refresh doesn't re-trigger
  window.history.replaceState({}, "", window.location.pathname);
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <App />
      </Provider>
    </HelmetProvider>
  </React.StrictMode>,
);
