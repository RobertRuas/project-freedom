
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

const TV_MODE_STORAGE_KEY = "project-freedom-tv-mode";

/**
 * Detecta ambientes comuns de Smart TV para ativar modo de compatibilidade.
 * Também permite forçar/desativar o modo por query string:
 * - ?tv=1, ?tv=true, ?tv=on
 * - ?tv=0, ?tv=false, ?tv=off
 */
const applyTvModeClass = (): void => {
  const tvQueryValuesEnabled = new Set(["1", "true", "on"]);
  const tvQueryValuesDisabled = new Set(["0", "false", "off"]);

  let forcedMode: "enabled" | "disabled" | null = null;

  try {
    const url = new URL(window.location.href);
    const tvQueryRaw = (url.searchParams.get("tv") ?? "").toLowerCase();

    if (tvQueryValuesEnabled.has(tvQueryRaw)) {
      localStorage.setItem(TV_MODE_STORAGE_KEY, "enabled");
      forcedMode = "enabled";
    } else if (tvQueryValuesDisabled.has(tvQueryRaw)) {
      localStorage.setItem(TV_MODE_STORAGE_KEY, "disabled");
      forcedMode = "disabled";
    } else {
      const storedMode = localStorage.getItem(TV_MODE_STORAGE_KEY);
      if (storedMode === "enabled" || storedMode === "disabled") {
        forcedMode = storedMode;
      }
    }
  } catch {
    // Em browsers mais restritos (algumas TVs), acesso a storage pode falhar.
  }

  const tvUserAgentPattern =
    /smart-tv|smarttv|smart_tv|tizen|web0s|webos|hbbtv|netcast|viera|bravia|aftb|aftt|googletv|appletv|roku|dtv|googletv|hisense|inettvbrowser/i;

  const isTvDevice = tvUserAgentPattern.test(navigator.userAgent);
  const shouldEnableTvMode =
    forcedMode === "enabled" || (forcedMode !== "disabled" && isTvDevice);

  if (shouldEnableTvMode) {
    document.documentElement.classList.add("tv-mode");
  } else {
    document.documentElement.classList.remove("tv-mode");
  }
};

applyTvModeClass();

// Ponto de entrada da aplicação React.
// O elemento com id "root" é definido em `index.html`.
createRoot(document.getElementById("root")!).render(<App />);
  
