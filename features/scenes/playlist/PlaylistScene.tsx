'use client';

import { useEffect, useRef, useState } from 'react';
import type { PlaylistSong } from '@/lib/types';

type SongWithUrl = PlaylistSong & { url: string };

export function PlaylistScene() {
  const [songs, setSongs] = useState<SongWithUrl[]>([]);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  async function load() {
    const response = await fetch('/api/songs');
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

    const formData = new FormData();
    formData.append('song', file);
    formData.append('title', title.trim());

    const response = await fetch('/api/songs', { method: 'POST', body: formData });
    if (response.ok) {
      setFile(null);
      setTitle('');
      await load();
    }
    setUploading(false);
  }

  function togglePlay(song: SongWithUrl) {
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
    <section className="flex min-h-screen flex-col items-center gap-8 bg-cream px-6 py-16">
      <h2 className="font-arDisplay text-2xl text-ink">بلايليستنا</h2>

      <audio ref={audioRef} onEnded={() => setPlayingId(null)} />

      <ul className="w-full max-w-md space-y-2">
        {songs.map((song) => (
          <li key={song.id}>
            <button
              onClick={() => togglePlay(song)}
              className="flex w-full items-center justify-between rounded-xl bg-warmWhite px-4 py-3 text-right"
            >
              <span>{playingId === song.id ? '⏸' : '▶'}</span>
              <span className="text-ink">{song.title}</span>
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleUpload} className="w-full max-w-xs space-y-3">
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="اسم الأغنية"
          className="w-full rounded-xl border border-rose/40 bg-warmWhite px-4 py-2 outline-none"
        />
        <input type="file" accept="audio/*" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="w-full text-sm" />
        <button type="submit" disabled={!file || !title.trim() || uploading} className="w-full rounded-xl bg-roseDeep py-2 text-warmWhite disabled:opacity-40">
          {uploading ? 'برفع...' : 'ضيفي أغنية'}
        </button>
      </form>
    </section>
  );
}
