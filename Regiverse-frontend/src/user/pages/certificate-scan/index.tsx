import React from "react";
import ReactDOM from "react-dom/client";
import CertificateScan from "./CertificateScan";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <CertificateScan />
  </React.StrictMode>
);

export { default } from "./CertificateScan";