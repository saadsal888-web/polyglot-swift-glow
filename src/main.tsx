import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/common/ErrorBoundary.tsx";
import "./index.css";

// Initialize RevenueCat after React is mounted (lazy import to avoid conflicts)
const initRevenueCat = async () => {
  try {
    const { initializePurchases } = await import("./services/revenuecat");
    await initializePurchases();
    console.log('[App] RevenueCat initialized');
  } catch (error) {
    console.error('[App] RevenueCat initialization failed:', error);
    // لا نرمي الخطأ - التطبيق يعمل بدون RevenueCat
  }
};

// Render first, then initialize RevenueCat
createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

// Initialize RevenueCat after a short delay to ensure React is fully loaded
setTimeout(initRevenueCat, 100);
