import React, { useEffect, useMemo, useState } from "react";
import SectionHeader from "../components/SectionHeader";
import MoodSelector from "../components/MoodSelector";
import { createEntry, getSuggestions, uploadImage } from "../services/entryService";
import ImageCropperModal from "../components/ImageCropperModal";
import { fetchWorkspaces } from "../services/workspaceService";
import { compressImage } from "../utils/compressImage";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition || null;

export default function AddEntryPage() {
  const [form, setForm] = useState({
    title: "",
    content: "",
    mood: null,
    moodScore: 5,
    tags: "",
    location: "",
    imageUrl: "",
    shareWorkspace: false,
    workspaceId: "",
  });
  const [suggestions, setSuggestions] = useState(null);
  const [listening, setListening] = useState(false);
  const [rawImage, setRawImage] = useState("");
  const [croppedPreview, setCroppedPreview] = useState("");
  const [workspaces, setWorkspaces] = useState([]);

  useEffect(() => {
    return () => {
      if (rawImage) URL.revokeObjectURL(rawImage);
      if (croppedPreview) URL.revokeObjectURL(croppedPreview);
    };
  }, [rawImage, croppedPreview]);

  useEffect(() => {
    fetchWorkspaces().then((data) => {
      setWorkspaces(data || []);
      if (data?.length) {
        setForm((prev) => ({ ...prev, workspaceId: data[0].id }));
      }
    });
  }, []);

  const recognizer = useMemo(() => {
    if (!SpeechRecognition) return null;
    const instance = new SpeechRecognition();
    instance.continuous = true;
    instance.interimResults = true;
    instance.lang = "en-US";
    return instance;
  }, []);

  const handleVoice = () => {
    if (!recognizer) return;
    if (listening) {
      recognizer.stop();
      setListening(false);
      return;
    }
    recognizer.start();
    setListening(true);
    recognizer.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ");
      setForm((prev) => ({ ...prev, content: transcript }));
    };
  };

  const handleSuggest = async () => {
    const data = await getSuggestions({ content: form.content });
    setSuggestions(data);
    const moodMap = {
      mood_calm: { id: "mood_calm", emoji: "😌", label: "Calm" },
      mood_happy: { id: "mood_happy", emoji: "😊", label: "Happy" },
      mood_focus: { id: "mood_focus", emoji: "🎯", label: "Focused" },
      mood_tired: { id: "mood_tired", emoji: "😴", label: "Tired" },
      mood_stress: { id: "mood_stress", emoji: "😵‍💫", label: "Stressed" },
    };
    setForm((prev) => ({
      ...prev,
      title: data.title,
      moodScore: data.moodScore,
      tags: data.tags.join(", "),
      mood: moodMap[data.moodId] || prev.mood,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      title: form.title,
      content: form.content,
      mood_id: form.mood?.id,
      mood_score: form.moodScore,
      summary: suggestions?.title ? suggestions.title : form.content.slice(0, 120),
      location: form.location,
      workspace_id: form.shareWorkspace ? form.workspaceId : null,
      is_shared: form.shareWorkspace ? 1 : 0,
      image_url: form.imageUrl,
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .map((label) => ({ label })),
    };
    await createEntry(payload);
    setForm({
      title: "",
      content: "",
      mood: null,
      moodScore: 5,
      tags: "",
      location: "",
      imageUrl: "",
      shareWorkspace: false,
      workspaceId: workspaces[0]?.id || "",
    });
    setSuggestions(null);
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="New Memory" subtitle="Craft a beautiful entry with AI support." />
      <form onSubmit={handleSubmit} className="card glass space-y-5 p-6">
        <input
          type="text"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm focus:outline-none"
        />
        <textarea
          rows="6"
          placeholder="Write your story..."
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          className="w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm focus:outline-none"
        />
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleVoice}
            className="rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm"
          >
            {listening ? "Stop voice" : "Voice to text"}
          </button>
          <button
            type="button"
            onClick={handleSuggest}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white"
          >
            AI Suggest
          </button>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-slate-600">Mood</p>
          <MoodSelector value={form.mood} onChange={(mood) => setForm({ ...form, mood })} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            className="w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm focus:outline-none"
          />
          <input
            type="text"
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm focus:outline-none"
          />
        </div>
        {workspaces.length > 0 && (
          <div className="rounded-2xl border border-white/60 bg-white/70 p-4 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-700">Share to workspace</p>
                <p className="text-xs text-slate-500">Include this memory in a shared space.</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({ ...prev, shareWorkspace: !prev.shareWorkspace }))
                }
                className={`rounded-full px-3 py-1 text-xs ${
                  form.shareWorkspace ? "bg-slate-900 text-white" : "bg-white/70"
                }`}
              >
                {form.shareWorkspace ? "Shared" : "Private"}
              </button>
            </div>
            {form.shareWorkspace && (
              <select
                value={form.workspaceId}
                onChange={(e) => setForm({ ...form, workspaceId: e.target.value })}
                className="mt-3 w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 text-sm"
              >
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
        <div className="rounded-2xl border border-white/60 bg-white/70 p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-700">Add photo</p>
          <input
            type="file"
            accept="image/*"
            className="mt-2 w-full"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              const preview = URL.createObjectURL(file);
              setRawImage(preview);
            }}
          />
          {croppedPreview && (
            <img
              src={croppedPreview}
              alt="Preview"
              className="mt-3 h-32 w-full rounded-2xl object-cover"
            />
          )}
        </div>
        {suggestions && (
          <div className="rounded-2xl border border-white/60 bg-white/60 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-700">AI Suggestions</p>
            <p className="mt-2">Suggested title: {suggestions.title}</p>
            <p>Suggested mood score: {suggestions.moodScore}/10</p>
            <p>Tags: {suggestions.tags.join(", ")}</p>
          </div>
        )}
        <button
          type="submit"
          className="w-full rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-500 py-3 text-sm font-semibold text-white"
        >
          Save memory
        </button>
      </form>
      {rawImage && (
        <ImageCropperModal
          imageSrc={rawImage}
          onClose={() => setRawImage("")}
          onCropComplete={async (blob) => {
            if (!blob) return;
            const compressed = await compressImage(blob);
            const file = new File([compressed], "lifelens-crop.jpg", { type: "image/jpeg" });
            const uploaded = await uploadImage(file);
            const preview = URL.createObjectURL(compressed);
            setCroppedPreview(preview);
            setForm((prev) => ({ ...prev, imageUrl: uploaded.url }));
            setRawImage("");
          }}
        />
      )}
    </div>
  );
}
