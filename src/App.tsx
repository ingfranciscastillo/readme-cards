import { useEffect } from "react";
import { EditorView } from "./components/editor/EditorView";
import { Gallery } from "./components/gallery/Gallery";
import { useAppState, useRoute } from "./state/store";
import { useFontsVersion } from "./state/useFontsVersion";

export function App() {
  const store = useAppState();
  const fontsVersion = useFontsVersion();
  const [route, navigate] = useRoute();

  useEffect(() => {
    document.title =
      route.view === "editor" ? `Editing ${route.templateId} card · Readme Cards` : "Readme Cards";
    window.scrollTo(0, 0);
  }, [route]);

  if (route.view === "editor") {
    return (
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
      />
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
