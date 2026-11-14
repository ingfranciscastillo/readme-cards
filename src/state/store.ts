import { useCallback, useEffect, useRef, useState } from "react";
import { getTemplate, isTemplateId, TEMPLATES } from "../templates";
import type { CardConfig, TemplateId } from "../types/card";
import { sanitizeConfig } from "./sanitize";

export type PreviewBackground = "checker" | "light" | "dark";

export interface AppState {
  configs: Partial<Record<TemplateId, CardConfig<unknown>>>;
  filenames: Partial<Record<TemplateId, string>>;
  embedFonts: boolean;
  previewBackground: PreviewBackground;
}

const STORAGE_KEY = "readme-cards:v1";

function initialState(): AppState {
  return { configs: {}, filenames: {}, embedFonts: true, previewBackground: "checker" };
}

function load(): AppState {
  const state = initialState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return state;
    const saved = JSON.parse(raw) as Partial<AppState>;
    for (const template of TEMPLATES) {
      const config = saved.configs?.[template.id];
      if (config) state.configs[template.id] = sanitizeConfig(template, config);
      const filename = saved.filenames?.[template.id];
      if (typeof filename === "string") state.filenames[template.id] = filename.slice(0, 80);
    }
    if (typeof saved.embedFonts === "boolean") state.embedFonts = saved.embedFonts;
    if (saved.previewBackground && ["checker", "light", "dark"].includes(saved.previewBackground)) {
      state.previewBackground = saved.previewBackground;
    }
  } catch {
    // Corrupt or unavailable storage: start fresh.
  }
  return state;
}

/** App-wide state persisted to localStorage (debounced) so a refresh keeps work. */
export function useAppState() {
  const [state, setState] = useState<AppState>(load);
  const [saveError, setSaveError] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        setSaveError(false);
      } catch {
        setSaveError(true);
      }
    }, 300);
    return () => window.clearTimeout(timer.current);
  }, [state]);

  const getConfig = useCallback(
    (id: TemplateId): CardConfig<unknown> => state.configs[id] ?? getTemplate(id).defaultConfig,
    [state.configs],
  );

  const setConfig = useCallback(
    (id: TemplateId, update: (config: CardConfig<unknown>) => CardConfig<unknown>) => {
      setState((prev) => ({
        ...prev,
        configs: {
          ...prev.configs,
          [id]: update(prev.configs[id] ?? structuredClone(getTemplate(id).defaultConfig)),
        },
      }));
    },
    [],
  );

  const resetConfig = useCallback((id: TemplateId) => {
    setState((prev) => {
      const configs = { ...prev.configs };
      delete configs[id];
      return { ...prev, configs };
    });
  }, []);

  const setFilename = useCallback((id: TemplateId, filename: string) => {
    setState((prev) => ({ ...prev, filenames: { ...prev.filenames, [id]: filename } }));
  }, []);

  const setEmbedFonts = useCallback((embedFonts: boolean) => {
    setState((prev) => ({ ...prev, embedFonts }));
  }, []);

  const setPreviewBackground = useCallback((previewBackground: PreviewBackground) => {
    setState((prev) => ({ ...prev, previewBackground }));
  }, []);

  return {
    state,
    saveError,
    getConfig,
    setConfig,
    resetConfig,
    setFilename,
    setEmbedFonts,
    setPreviewBackground,
  };
}

export type Route = { view: "gallery" } | { view: "editor"; templateId: TemplateId };

function parseHash(hash: string): Route {
  const match = /^#\/edit\/([\w-]+)/.exec(hash);
  if (match && isTemplateId(match[1])) return { view: "editor", templateId: match[1] };
  return { view: "gallery" };
}

/** Tiny hash router: #/ for the gallery, #/edit/<template> for the editor. */
export function useRoute(): [Route, (route: Route) => void] {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  const navigate = useCallback((next: Route) => {
    window.location.hash = next.view === "editor" ? `#/edit/${next.templateId}` : "#/";
  }, []);
  return [route, navigate];
}
