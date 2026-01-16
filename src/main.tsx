import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializePurchases } from "./services/revenuecat";

// Initialize RevenueCat before rendering
initializePurchases().then(() => {
  console.log('[App] RevenueCat initialized');
}).catch((error) => {
  console.error('[App] RevenueCat initialization failed:', error);
});

createRoot(document.getElementById("root")!).render(<App />);
