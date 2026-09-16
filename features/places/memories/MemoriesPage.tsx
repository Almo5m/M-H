'use client';

import { BackToHub } from '@/features/hub/BackToHub';

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
    <main className="page-fade-in min-h-screen bg-[#F7F1E8] px-6 py-16">
      <BackToHub />
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 flex items-baseline justify-between">
          <div>
            <p className="font-arDisplay text-3xl text-[#40383A]">احنا</p>
            <p className="text-[#8E6873]">❤</p>
          </div>
          <label className="btn-ghost cursor-pointer">
            + نضيف ذكرى
            <input type="file" accept="image/*" className="hidden" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
          </label>
        </div>

        {photos.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <svg viewBox="0 0 60 40" className="h-16 w-24">
              <rect x="4" y="6" width="30" height="24" rx="3" transform="rotate(-5 19 18)" fill="#B99AA1" opacity="0.5" />
              <rect x="20" y="10" width="30" height="24" rx="3" transform="rotate(4 35 22)" fill="#8E6873" opacity="0.6" />
            </svg>
            <p className="text-[#40383A]">لسه مفيش صور هنا.</p>
            <p className="text-sm text-[#8B8182]">أول صورة ممكن تبدأ الحكاية.</p>
          </div>
        ) : (
          <div className="relative flex flex-wrap justify-center gap-6">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className="list-item-enter w-40 rounded-sm bg-white p-2 pb-4 shadow-[0_4px_20px_rgba(142,104,115,0.12)] transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-[0_8px_28px_rgba(142,104,115,0.2)]"
                style={{ transform: `rotate(${(index % 5) - 2}deg)`, animationDelay: `${index * 60}ms` }}
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
          <form onSubmit={handleUpload} className="mx-auto mt-10 max-w-sm space-y-3 soft-panel p-6">
            <p className="text-center text-sm text-[#40383A]">نحط دي فين؟</p>
            <input
              type="text"
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              placeholder="احكيلي عنها... (اختياري)"
              className="field-input"
            />
            <button type="submit" disabled={uploading} className="btn-primary w-full">
              {uploading ? '...' : 'نحطها'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
