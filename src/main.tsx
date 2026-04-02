import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setBaseUrl } from "@workspace/api-client-react";

// Set the API base URL to the deployed backend
setBaseUrl(import.meta.env.VITE_API_BASE_URL || "https://fayrooz-clinc-wep-back-ffc2.vercel.app/");

createRoot(document.getElementById("root")!).render(<App />);
