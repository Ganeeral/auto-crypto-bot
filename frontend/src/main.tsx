import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BalanceCard } from "./components/Dashboard/BalanceCard.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BalanceCard balance={"221"} />
  </StrictMode>
);
