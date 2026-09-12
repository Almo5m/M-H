'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const PlacesMap = dynamic(() => import('./PlacesMap').then((module) => module.PlacesMap), { ssr: false });

interface SavedPlace {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  description: string | null;
  photo_url: string | null;
  visited: boolean;
  visited_at: string | null;
}

export function PlacesPage() {
  const [places, setPlaces] = useState<SavedPlace[]>([]);
  const [picking, setPicking] = useState(false);
  const [pickedCoords, setPickedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [visited, setVisited] = useState(false);

  async function load() {
    const response = await fetch('/api/saved-places');
    const data = await response.json();
    setPlaces(data.places ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim() || !pickedCoords) return;

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('latitude', String(pickedCoords.lat));
    formData.append('longitude', String(pickedCoords.lng));
    formData.append('description', description);
    formData.append('visited', String(visited));
    if (photo) formData.append('photo', photo);

    const response = await fetch('/api/saved-places', { method: 'POST', body: formData });
    if (response.ok) {
      setTitle('');
      setDescription('');
      setPhoto(null);
      setVisited(false);
      setPickedCoords(null);
      setPicking(false);
      load();
    }
  }

  async function toggleVisited(place: SavedPlace) {
    await fetch(`/api/saved-places/${place.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visited: !place.visited }),
    });
    load();
  }

  async function removePlace(id: string) {
    await fetch(`/api/saved-places/${id}`, { method: 'DELETE' });
    setSelectedId(null);
    load();
  }

  const selectedPlace = places.find((place) => place.id === selectedId);

  return (
    <main className="min-h-screen bg-[#F7F1E8] px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-baseline justify-between">
          <div>
            <p className="font-arDisplay text-3xl text-[#40383A]">أماكننا</p>
            <p className="text-[#8E6873]">كل مكان له حكاية.</p>
          </div>
          <button
            onClick={() => {
              setPicking((value) => !value);
              setPickedCoords(null);
            }}
            className="text-sm text-[#8E6873] underline decoration-dotted"
          >
            {picking ? 'إلغاء' : '+ نضيف مكان'}
          </button>
        </div>

        {picking && !pickedCoords && (
          <p className="mb-3 text-center text-sm text-[#8B8182]">دوسي على أي نقطة في الخريطة تحددي المكان.</p>
        )}

        <PlacesMap
          places={places}
          picking={picking}
          onPick={(lat, lng) => setPickedCoords({ lat, lng })}
          onSelect={setSelectedId}
        />

        {pickedCoords && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-3 rounded-2xl border border-[#8E6873]/20 bg-white p-6">
            <p className="text-sm text-[#40383A]">المكان ده إيه؟</p>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="اسم المكان"
              className="w-full rounded-lg border border-[#8E6873]/20 bg-[#F7F1E8] px-3 py-2 text-sm outline-none"
              required
            />
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="هنا حصل... (اختياري)"
              className="w-full rounded-lg border border-[#8E6873]/20 bg-[#F7F1E8] px-3 py-2 text-sm outline-none"
              rows={2}
            />
            <input type="file" accept="image/*" onChange={(event) => setPhoto(event.target.files?.[0] ?? null)} className="text-sm" />
            <label className="flex items-center gap-2 text-sm text-[#40383A]">
              <input type="checkbox" checked={visited} onChange={(event) => setVisited(event.target.checked)} />
              وصلنا هنا بالفعل
            </label>
            <button type="submit" className="w-full rounded-lg bg-[#8E6873] py-2 text-sm text-white">
              نحفظ المكان
            </button>
          </form>
        )}

        {selectedPlace && (
          <div className="mt-6 rounded-2xl border border-[#8E6873]/20 bg-white p-6">
            <p className="font-arDisplay text-lg text-[#40383A]">{selectedPlace.title}</p>
            {selectedPlace.description && <p className="mt-1 text-sm text-[#8B8182]">{selectedPlace.description}</p>}
            {selectedPlace.photo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selectedPlace.photo_url} alt="" className="mt-3 max-h-56 rounded" />
            )}
            <div className="mt-4 flex items-center justify-between text-sm">
              <button onClick={() => toggleVisited(selectedPlace)} className="text-[#8E6873] underline decoration-dotted">
                {selectedPlace.visited ? '✓ وصلنا هنا' : 'نحدد إننا وصلنا؟'}
              </button>
              <button onClick={() => removePlace(selectedPlace.id)} className="text-[#8B8182]">
                حذف
              </button>
            </div>
          </div>
        )}

        {places.length === 0 && (
          <p className="mt-8 text-center text-sm text-[#8B8182]">لسه مفيش مكان هنا. يمكن أول مكان يبقى له حكاية.</p>
        )}
      </div>
    </main>
  );
}
