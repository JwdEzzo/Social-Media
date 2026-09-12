import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Must run before any component calls useTranslation().
import "./i18n";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
