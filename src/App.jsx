javascript
import React, { useMemo, useState } from "react";

const starterScenes = [
  {
    id: 101,
    title: "Unexpected Discovery",
    caption: "A young creator finds a magical tablet that can turn ideas into comic scenes.",
    dialogue: "So this is how stories become real?",
    duration: 4,
    imagePrompt: "cinematic comic panel, magical tablet, vibrant colors",
    generatedImageUrl: "",
  },
  {
    id: 102,
    title: "First Creation",
    caption: "The first comic hero appears with energy and color.",
    dialogue: "Give me a mission. I was made for action.",
    duration: 5,
    imagePrompt: "comic hero appearing from glowing screen, action style",
    generatedImageUrl: "",
  },
  {
    id: 103,
    title: "Victory Panel",
    caption: "The comic turns into a stylish short video ending.",
    dialogue: "Story complete. Roll the next episode.",
    duration: 4,
    imagePrompt: "victory comic panel, dynamic ending, polished art",
    generatedImageUrl: "",
  },
];

export default function App() {
  const [backendUrl, setBackendUrl] = useState("");
  const [backendStatus, setBackendStatus] = useState("Not connected");
  const [projectName, setProjectName] = useState("Comic Creator Pro Project");
  const [theme, setTheme] = useState("Cinematic Pop");
  const [voiceStyle, setVoiceStyle] = useState("Narrator");
  const [musicTrack, setMusicTrack] = useState("Heroic Pulse");
  const [scenes, setScenes] = useState(starterScenes);
  const [selectedId, setSelectedId] = useState(starterScenes[0].id);
  const [notice, setNotice] = useState("");
  const [loadingId, setLoadingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const selectedScene = useMemo(
    () => scenes.find((scene) => scene.id === selectedId) || scenes[0],
    [scenes, selectedId]
  );

  const safeBase = backendUrl.trim().replace(/\/$/, "");

  function flash(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2500);
  }

  async function testConnection() {
    if (!safeBase) {
      flash("Paste backend URL first");
      return;
    }
    try {
      setBackendStatus("Checking...");
      const res = await fetch(`${safeBase}/api/health`);
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Connection failed");
      setBackendStatus(data.hasApiKey ? "Connected" : "Connected, but API key missing");
      flash("Backend connection successful");
    } catch (error) {
      setBackendStatus("Connection failed");
      flash(error.message || "Could not connect");
    }
  }

  async function generateArt(sceneId) {
    if (!safeBase) {
      flash("Paste backend URL first");
      return;
    }
    const scene = scenes.find((item) => item.id === sceneId);
    if (!scene) return;

    try {
      setLoadingId(sceneId);
      const res = await fetch(`${safeBase}/api/generate-scene-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName,
          theme,
          sceneId: String(scene.id),
          sceneTitle: scene.title,
          caption: scene.caption,
          dialogue: scene.dialogue,
          style: voiceStyle,
          size: "1024x1024",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Generation failed");

      setScenes((prev) =>
        prev.map((item) =>
          item.id === sceneId
            ? {
                ...item,
                generatedImageUrl: `${safeBase}${data.imageUrl}`,
                imagePrompt: data.promptUsed || item.imagePrompt,
              }
            : item
        )
      );
      flash("Scene image generated");
    } catch (error) {
      flash(error.message || "Could not generate image");
    } finally {
      setLoadingId(null);
    }
  }

  async function saveToBackend() {
    if (!safeBase) {
      flash("Paste backend URL first");
      return;
    }
    try {
      setSaving(true);
      const res = await fetch(`${safeBase}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: `project-${projectName.toLowerCase().replace(/\s+/g, "-")}`,
          name: projectName,
          theme,
          voiceStyle,
          musicTrack,
          scenes,
          createdAt: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Save failed");
      flash("Project saved to backend");
    } catch (error) {
      flash(error.message || "Could not save project");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        <div className="bg-black text-white rounded-3xl p-6 md:p-10">
          <div className="text-sm uppercase tracking-[0.2em] text-zinc-300">Comic Creator Pro</div>
          <h1 className="text-3xl md:text-5xl font-bold mt-3">Frontend App</h1>
          <p className="text-zinc-300 mt-3">Paste your backend URL, test connection, generate art, and save projects.</p>
        </div>

        <div className="bg-white rounded-3xl shadow p-5 space-y-4">
          <h2 className="text-2xl font-bold">Backend Connection</h2>
          <div>
            <label className="block text-sm font-semibold mb-2">Backend URL</label>
            <input
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              placeholder="https://comic-creator-pro-backend-app.onrender.com"
              className="w-full rounded-2xl border border-zinc-300 px-4 py-3"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={testConnection} className="rounded-2xl bg-black text-white px-5 py-3">Test Connection</button>
            <div className="rounded-2xl bg-zinc-100 px-4 py-3 text-sm">Status: {backendStatus}</div>
          </div>
        </div>

        {notice ? <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-emerald-700">{notice}</div> : null}

        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          <div className="bg-white rounded-3xl shadow p-5 space-y-4">
            <h2 className="text-2xl font-bold">Scenes</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {scenes.map((scene) => (
                <button
                  key={scene.id}
                  onClick={() => setSelectedId(scene.id)}
                  className={`rounded-3xl border overflow-hidden text-left ${selectedId === scene.id ? "border-black" : "border-zinc-200"}`}
                >
                  <div className="h-40 bg-zinc-200 relative">
                    {scene.generatedImageUrl ? (
                      <img src={scene.generatedImageUrl} alt={scene.title} className="absolute inset-0 w-full h-full object-cover" />
                    ) : null}
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute bottom-3 left-3 bg-white/90 rounded-full px-3 py-1 text-sm font-semibold">{scene.title}</div>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="font-semibold">{scene.dialogue}</div>
                    <div className="text-sm text-zinc-500">{scene.caption}</div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        generateArt(scene.id);
                      }}
                      className="rounded-2xl border border-zinc-300 px-4 py-2 text-sm"
                    >
                      {loadingId === scene.id ? "Generating..." : "Generate Art"}
                    </button>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow p-5 space-y-4">
            <h2 className="text-2xl font-bold">Project</h2>
            <div>
              <label className="block text-sm font-semibold mb-2">Project Name</label>
              <input value={projectName} onChange={(e) => setProjectName(e.target.value)} className="w-full rounded-2xl border border-zinc-300 px-4 py-3" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Theme</label>
              <input value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full rounded-2xl border border-zinc-300 px-4 py-3" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Voice Style</label>
              <input value={voiceStyle} onChange={(e) => setVoiceStyle(e.target.value)} className="w-full rounded-2xl border border-zinc-300 px-4 py-3" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Music Track</label>
              <input value={musicTrack} onChange={(e) => setMusicTrack(e.target.value)} className="w-full rounded-2xl border border-zinc-300 px-4 py-3" />
            </div>
            <div className="rounded-3xl border border-zinc-200 overflow-hidden">
              <div className="h-56 bg-zinc-100 relative">
                {selectedScene?.generatedImageUrl ? (
                  <img src={selectedScene.generatedImageUrl} alt={selectedScene.title} className="absolute inset-0 w-full h-full object-cover" />
                ) : null}
                <div className="absolute bottom-3 left-3 bg-white/90 rounded-full px-3 py-1 text-sm font-semibold">{selectedScene?.title}</div>
              </div>
              <div className="p-4 space-y-2">
                <div className="text-sm text-zinc-500">Image prompt</div>
                <textarea
                  value={selectedScene?.imagePrompt || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setScenes((prev) => prev.map((item) => item.id === selectedId ? { ...item, imagePrompt: value } : item));
                  }}
                  className="w-full rounded-2xl border border-zinc-300 px-4 py-3 min-h-[110px]"
                />
              </div>
            </div>
            <button onClick={saveToBackend} disabled={saving} className="w-full rounded-2xl bg-black text-white px-5 py-3">
              {saving ? "Saving..." : "Save to Backend"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
