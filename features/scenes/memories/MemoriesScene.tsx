'use client';

import { useEffect, useState } from 'react';
import type { MemoryPhoto } from '@/lib/types';

type PhotoWithUrl = MemoryPhoto & { url: string };

export function MemoriesScene() {
  const [photos, setPhotos] = useState<PhotoWithUrl[]>([]);
  const [index, setIndex] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  async function load() {
    const response = await fetch('/api/photos');
    const data = await response.json();
    setPhotos(data.photos ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpload(event: React.FormEvent) {
    event.preventDefault();
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('photo', file);
    formData.append('caption', caption);

    const response = await fetch('/api/photos', { method: 'POST', body: formData });
    if (response.ok) {
      setFile(null);
      setCaption('');
      await load();
    }
    setUploading(false);
  }

  const current = photos[index];

  return (
    <section id="memories" data-blocking="true" className="flex min-h-screen flex-col items-center justify-center gap-6 bg-warmWhite px-6 py-16 text-center">
      <h2 className="font-arDisplay text-2xl text-ink">لحظات لينا</h2>

      {current ? (
        <button
          onClick={() => setIndex((current) => (current + 1) % photos.length)}
          className="relative h-80 w-64 overflow-hidden rounded-2xl shadow-lg"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current.url} alt={current.caption ?? ''} className="h-full w-full object-cover" />
          {current.caption && (
            <span className="absolute bottom-0 w-full bg-deep/60 py-2 text-sm text-warmWhite">
              {current.caption}
            </span>
          )}
        </button>
      ) : (
        <p className="text-inkSoft">لسة مفيش صور، ارفعوا أول صورة سوا.</p>
      )}

      <form onSubmit={handleUpload} className="w-full max-w-xs space-y-3">
        <input
          type="file"
          accept="image/*"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="w-full text-sm"
        />
        <input
          type="text"
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          placeholder="تعليق (اختياري)"
          className="w-full rounded-xl border border-rose/40 bg-cream px-4 py-2 text-center outline-none"
        />
        <button
          type="submit"
          disabled={!file || uploading}
          className="w-full rounded-xl bg-roseDeep py-2 text-warmWhite disabled:opacity-40"
        >
          {uploading ? 'بترفع...' : 'ارفعي صورة'}
        </button>
      </form>
    </section>
  );
}
