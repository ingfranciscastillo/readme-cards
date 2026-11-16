import { lazy, Suspense, useEffect } from "react";
import { Gallery } from "./components/gallery/Gallery";
import { useAppState, useRoute } from "./state/store";
import { useFontsVersion } from "./state/useFontsVersion";
import { useIncomingShare } from "./state/useShareLink";

// The editor is most of the code and the gallery is the landing page: load
// the editor separately, and fetch it once the browser is idle so opening a
// template stays instant.
const loadEditor = () => import("./components/editor/EditorView");
const EditorView = lazy(() => loadEditor().then((m) => ({ default: m.EditorView })));

function preloadWhenIdle() {
  if ("requestIdleCallback" in window) {
    const id = requestIdleCallback(() => void loadEditor(), { timeout: 4000 });
    return () => cancelIdleCallback(id);
  }
  const id = setTimeout(() => void loadEditor(), 2000);
  return () => clearTimeout(id);
}

export function App() {
  const store = useAppState();
  const fontsVersion = useFontsVersion();
  const [route, navigate] = useRoute();
  const share = useIncomingShare(route, store.state.configs, store.setConfig);

  useEffect(() => {
    document.title =
      route.view === "editor" ? `Editing ${route.templateId} card · Readme Cards` : "Readme Cards";
    window.scrollTo(0, 0);
  }, [route]);

  useEffect(preloadWhenIdle, []);

  if (route.view === "editor") {
    return (
      <Suspense fallback={<div className="min-h-dvh" />}>
        <EditorView
          key={route.templateId}
          templateId={route.templateId}
          config={store.getConfig(route.templateId)}
          state={store.state}
          fontsVersion={fontsVersion}
          saveError={store.saveError}
          onBack={() => navigate({ view: "gallery" })}
          setConfig={store.setConfig}
          resetConfig={store.resetConfig}
          setFilename={store.setFilename}
          setEmbedFonts={store.setEmbedFonts}
          setPreviewBackground={store.setPreviewBackground}
          shareNotice={share.notice?.templateId === route.templateId ? share.notice : null}
          onShareAccept={share.accept}
          onShareDismiss={share.dismiss}
        />
      </Suspense>
    );
  }
  return (
    <Gallery
      state={store.state}
      fontsVersion={fontsVersion}
      onOpen={(templateId) => navigate({ view: "editor", templateId })}
    />
  );
}
