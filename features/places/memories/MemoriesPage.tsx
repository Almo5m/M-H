'use client';

import { useEffect, useState } from 'react';

interface Photo {
  id: string;
  url: string;
  caption: string | null;
  created_at: string;
}

export function MemoriesPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  async function load() {
    const response = await fetch('/api/memory-photos');
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

    const response = await fetch('/api/memory-photos', { method: 'POST', body: formData });
    if (response.ok) {
      setFile(null);
      setCaption('');
      await load();
    }
    setUploading(false);
  }

  return (
    <main className="min-h-screen bg-[#F7F1E8] px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 flex items-baseline justify-between">
          <div>
            <p className="font-arDisplay text-3xl text-[#40383A]">احنا</p>
            <p className="text-[#8E6873]">❤</p>
          </div>
          <label className="cursor-pointer text-sm text-[#8E6873] underline decoration-dotted">
            + نضيف ذكرى
            <input type="file" accept="image/*" className="hidden" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
          </label>
        </div>

        {photos.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <svg viewBox="0 0 60 40" className="h-16 w-24 text-[#B99AA1]" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="4" y="6" width="30" height="24" rx="2" transform="rotate(-5 19 18)" />
              <rect x="20" y="10" width="30" height="24" rx="2" transform="rotate(4 35 22)" />
            </svg>
            <p className="text-[#40383A]">لسه مفيش صور هنا.</p>
            <p className="text-sm text-[#8B8182]">أول صورة ممكن تبدأ الحكاية.</p>
          </div>
        ) : (
          <div className="relative flex flex-wrap justify-center gap-6">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className="w-40 rounded-sm bg-white p-2 pb-4 shadow-md transition-transform hover:-translate-y-1"
                style={{ transform: `rotate(${(index % 5) - 2}deg)` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt={photo.caption ?? ''} className="h-40 w-full object-cover" />
                <div className="mt-2 text-center">
                  <p className="text-[10px] text-[#8B8182]">{new Date(photo.created_at).toLocaleDateString('ar-EG')}</p>
                  {photo.caption && <p className="mt-1 text-xs text-[#40383A]">{photo.caption}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {file && (
          <form onSubmit={handleUpload} className="mx-auto mt-10 max-w-sm space-y-3 rounded-2xl border border-[#8E6873]/20 bg-white p-6">
            <p className="text-center text-sm text-[#40383A]">نحط دي فين؟</p>
            <input
              type="text"
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              placeholder="احكيلي عنها... (اختياري)"
              className="w-full rounded-lg border border-[#8E6873]/30 bg-[#F7F1E8] px-3 py-2 text-sm outline-none"
            />
            <button type="submit" disabled={uploading} className="w-full rounded-lg bg-[#8E6873] py-2 text-sm text-white disabled:opacity-40">
              {uploading ? '...' : 'نحطها'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
