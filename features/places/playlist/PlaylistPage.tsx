'use client';

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

    const formData = new FormData();
    formData.append('song', file);
    formData.append('title', title.trim());

    const response = await fetch('/api/playlist-songs', { method: 'POST', body: formData });
    if (response.ok) {
      setFile(null);
      setTitle('');
      load();
    }
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
    <main className="min-h-screen bg-[#F7F1E8] px-6 py-16">
      <div className="mx-auto max-w-xl">
        <p className="font-arDisplay text-3xl text-[#40383A]">نسمع</p>
        <p className="mb-10 text-[#8E6873]">كل أغنية ليها حكاية.</p>

        <audio ref={audioRef} onEnded={() => setPlayingId(null)} />

        {songs.length === 0 ? (
          <p className="py-16 text-center text-[#8B8182]">لسه مفيش حاجة نسمعها.</p>
        ) : (
          <ul className="space-y-2">
            {songs.map((song) => (
              <li key={song.id}>
                <button onClick={() => togglePlay(song)} className="flex w-full items-center justify-between rounded-xl border border-[#8E6873]/15 bg-white px-4 py-3 text-right">
                  <span className="text-[#8E6873]">{playingId === song.id ? '⏸' : '▶'}</span>
                  <span className="flex-1 px-3 text-[#40383A]">{song.title}{song.artist ? ` — ${song.artist}` : ''}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleUpload} className="mt-8 space-y-3 rounded-2xl border border-[#8E6873]/20 bg-white p-6">
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="اسم الأغنية"
            className="w-full rounded-lg border border-[#8E6873]/20 bg-[#F7F1E8] px-3 py-2 text-sm outline-none"
          />
          <input type="file" accept="audio/*" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="w-full text-sm" />
          <button type="submit" disabled={!file || !title.trim()} className="w-full rounded-lg bg-[#8E6873] py-2 text-sm text-white disabled:opacity-40">
            + نضيف أغنية
          </button>
        </form>
      </div>
    </main>
  );
}
