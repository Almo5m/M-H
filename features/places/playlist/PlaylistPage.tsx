'use client';

import { BackToHub } from '@/features/hub/BackToHub';
import { FileUploadField } from '@/components/ui/FileUploadField';

import { useEffect, useRef, useState } from 'react';

interface Song {
  id: string;
  title: string;
  artist: string | null;
  url: string;
}

export function PlaylistPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  async function load() {
    const response = await fetch('/api/playlist-songs');
    const data = await response.json();
    setSongs(data.songs ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpload(event: React.FormEvent) {
    event.preventDefault();
    if (!file || !title.trim()) return;
    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('song', file);
    formData.append('title', title.trim());

    let response: Response;
    try {
      response = await fetch('/api/playlist-songs', { method: 'POST', body: formData });
    } catch {
      setUploadError('مفيش اتصال بالسيرفر. جرب تاني.');
      setUploading(false);
      return;
    }

    const rawText = await response.text();
    let data: any = {};
    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch {
      setUploadError(`خطأ (${response.status}): ${rawText.slice(0, 200)}`);
      setUploading(false);
      return;
    }

    if (response.ok) {
      setFile(null);
      setTitle('');
      await load();
    } else {
      setUploadError(data.error ? `${data.error}` : `خطأ (${response.status}) بلا تفاصيل.`);
    }
    setUploading(false);
  }

  function togglePlay(song: Song) {
    if (playingId === song.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    if (audioRef.current) {
      audioRef.current.src = song.url;
      audioRef.current.play();
    }
    setPlayingId(song.id);
  }

  return (
    <main className="page-fade-in min-h-screen bg-[#F7F1E8] px-6 py-16">
      <BackToHub />
      <div className="mx-auto max-w-xl">
        <p className="font-arDisplay text-3xl text-[#40383A]">نسمع</p>
        <p className="mb-10 text-[#8E6873]">كل أغنية ليها حكاية.</p>

        <audio ref={audioRef} onEnded={() => setPlayingId(null)} />

        {songs.length === 0 ? (
          <p className="py-16 text-center text-[#8B8182]">لسه مفيش حاجة نسمعها.</p>
        ) : (
          <ul className="space-y-2">
            {songs.map((song) => (
              <li key={song.id} className="list-item-enter">
                <button onClick={() => togglePlay(song)} className="flex w-full items-center justify-between soft-card px-4 py-3 text-right">
                  <span className="text-[#8E6873]">{playingId === song.id ? '⏸' : '▶'}</span>
                  <span className="flex-1 px-3 text-[#40383A]">{song.title}{song.artist ? ` — ${song.artist}` : ''}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleUpload} className="mt-8 space-y-3 soft-panel p-6">
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="اسم الأغنية"
            className="field-input"
          />
          <FileUploadField label="اختار ملف الأغنية" accept="audio/*" file={file} onChange={setFile} />
          {uploadError && <p className="text-sm text-[#8E6873]">{uploadError}</p>}
          <button type="submit" disabled={!file || !title.trim() || uploading} className="btn-primary w-full">
            {uploading ? '...' : '+ نضيف أغنية'}
          </button>
        </form>
      </div>
    </main>
  );
}
