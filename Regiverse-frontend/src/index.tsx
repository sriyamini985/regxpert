import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/tailwind.css";
import "./styles/index.css";

// Global Fetch Interceptor to automatically append JWT token
const { fetch: originalFetch } = window;
window.fetch = async (input, init) => {
  const token = localStorage.getItem("token");
  let urlStr = "";
  if (typeof input === "string") {
    urlStr = input;
  } else if (input instanceof URL) {
    urlStr = input.href;
  } else if (input && typeof input === "object" && "url" in input) {
    urlStr = (input as any).url;
  }

  if (token && urlStr.includes("/api/")) {
    if (input instanceof Request) {
      try {
        input.headers.set("Authorization", `Bearer ${token}`);
      } catch (e) {
        const newHeaders = new Headers(input.headers);
        newHeaders.set("Authorization", `Bearer ${token}`);
        input = new Request(input, { headers: newHeaders });
      }
    } else {
      init = init || {};
      const headers = new Headers(init.headers);
      if (!headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      init.headers = headers;
    }
  }
  return originalFetch(input, init);
};

const container = document.getElementById("root");

if (!container) throw new Error("Root element not found");

ReactDOM.createRoot(container).render(<App />);