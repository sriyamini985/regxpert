const configuredUrl = import.meta.env.VITE_API_URL;

const hasLocalhost = (url: string) => 
  url ? (url.includes("localhost") || url.includes("127.0.0.1")) : false;

export const API_URL = (() => {
  if (!configuredUrl || configuredUrl.trim() === "") {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return "http://localhost:5001";
    }
    return `${window.location.protocol}//${window.location.hostname}:5001`;
  }

  // If it is a remote production URL, use it directly
  if (!hasLocalhost(configuredUrl)) {
    return configuredUrl;
  }

  // If configured as localhost, but accessed from a different host, resolve dynamically
  if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return `${window.location.protocol}//${window.location.hostname}:5001`;
  }

  return configuredUrl;
})();
