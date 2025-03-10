import * as React from "react";
import { createRoot } from "react-dom/client";

import App from "./app";

import "./index.css";

import '../style/vscodeButton.css';

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
