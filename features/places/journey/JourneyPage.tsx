'use client';

import { useEffect, useMemo, useState } from 'react';

interface Chapter {
  id: string;
  chapter_date: string;
  title: string;
  description: string | null;
  photo_url: string | null;
}

export function JourneyPage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [chapterDate, setChapterDate] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [lightbox, setLightbox] = useState<Chapter | null>(null);

  async function load() {
    const response = await fetch('/api/journey-chapters');
    const data = await response.json();
    setChapters(data.chapters ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  const years = useMemo(
    () => Array.from(new Set(chapters.map((chapter) => chapter.chapter_date.slice(0, 4)))),
    [chapters],
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!chapterDate || !title.trim()) return;

    const formData = new FormData();
    formData.append('chapterDate', chapterDate);
    formData.append('title', title.trim());
    formData.append('description', description);
    if (photo) formData.append('photo', photo);

    const response = await fetch('/api/journey-chapters', { method: 'POST', body: formData });
    if (response.ok) {
      setChapterDate('');
      setTitle('');
      setDescription('');
      setPhoto(null);
      setShowForm(false);
      load();
    }
  }

  async function removeChapter(id: string) {
    await fetch(`/api/journey-chapters/${id}`, { method: 'DELETE' });
    load();
  }

  function jumpToYear(year: string) {
    document.getElementById(`year-${year}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <main className="min-h-screen bg-[#F7F1E8] px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-baseline justify-between">
          <div>
            <p className="font-arDisplay text-3xl text-[#40383A]">رحلتنا</p>
            <p className="text-[#8E6873]">لسه الحكاية في أولها.</p>
          </div>
          <button onClick={() => setShowForm((value) => !value)} className="text-sm text-[#8E6873] underline decoration-dotted">
            + نضيف فصل
          </button>
        </div>

        {years.length > 1 && (
          <div className="mb-8 flex justify-center gap-3 text-xs text-[#8B8182]">
            {years.map((year) => (
              <button key={year} onClick={() => jumpToYear(year)} className="hover:text-[#8E6873]">
                {year}
              </button>
            ))}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-10 space-y-3 rounded-2xl border border-[#8E6873]/20 bg-white p-6">
            <p className="text-sm text-[#40383A]">إيه اللي حصل؟</p>
            <input
              type="date"
              value={chapterDate}
              onChange={(event) => setChapterDate(event.target.value)}
              className="w-full rounded-lg border border-[#8E6873]/20 bg-[#F7F1E8] px-3 py-2 text-sm outline-none"
              required
            />
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="عنوان المحطة"
              className="w-full rounded-lg border border-[#8E6873]/20 bg-[#F7F1E8] px-3 py-2 text-sm outline-none"
              required
            />
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="احكي اللي حصل..."
              className="w-full rounded-lg border border-[#8E6873]/20 bg-[#F7F1E8] px-3 py-2 text-sm outline-none"
              rows={2}
            />
            <input type="file" accept="image/*" onChange={(event) => setPhoto(event.target.files?.[0] ?? null)} className="text-sm" />
            <button type="submit" className="w-full rounded-lg bg-[#8E6873] py-2 text-sm text-white">
              نضيفها للرحلة
            </button>
          </form>
        )}

        {chapters.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-[#40383A]">الحكاية لسه مستنية أول فصل.</p>
            <p className="mt-1 text-sm text-[#8B8182]">نبدأ منين؟</p>
          </div>
        ) : (
          <div className="relative">
            <svg className="absolute right-1/2 top-0 h-full w-6 -translate-x-1/2 opacity-40 sm:right-6 sm:translate-x-0" preserveAspectRatio="none" viewBox="0 0 10 1000">
              <path d={`M5 0 C7 200, 3 400, 5 600 S 3 900, 5 1000`} stroke="#8E6873" strokeWidth="1" fill="none" />
            </svg>

            <p className="mb-8 text-center text-xs text-[#8B8182]">وهنا بدأت الحكاية...</p>

            <ul className="space-y-10">
              {chapters.map((chapter, index) => {
                const year = chapter.chapter_date.slice(0, 4);
                const isFirstOfYear = chapters.findIndex((chapter2) => chapter2.chapter_date.slice(0, 4) === year) === index;
                const alignRight = index % 2 === 0;

                return (
                  <li key={chapter.id} id={isFirstOfYear ? `year-${year}` : undefined} className="relative">
                    <div className={`group flex flex-col sm:flex-row ${alignRight ? '' : 'sm:flex-row-reverse'} sm:items-start sm:gap-8`}>
                      <div className="sm:w-1/2">
                        <p className="text-xs text-[#8B8182]">
                          {new Date(chapter.chapter_date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <p className="font-arDisplay text-lg text-[#40383A]">{chapter.title}</p>
                        {chapter.description && <p className="mt-1 text-sm text-[#8B8182]">{chapter.description}</p>}
                        {chapter.photo_url && (
                          <button onClick={() => setLightbox(chapter)} className="mt-3 inline-block">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={chapter.photo_url}
                              alt={chapter.title}
                              className="w-32 rounded-sm shadow"
                              style={{ transform: `rotate(${alignRight ? -2 : 2}deg)` }}
                            />
                          </button>
                        )}
                        <button
                          onClick={() => removeChapter(chapter.id)}
                          className="mt-2 block text-[10px] text-[#8B8182] opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          نشيل الفصل ده؟
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <p className="mt-10 text-center text-xs text-[#8B8182]">ولسه مكملين...</p>
          </div>
        )}

        {lightbox && (
          <div
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightbox.photo_url ?? ''} alt={lightbox.title} className="max-h-[80vh] max-w-full rounded" />
          </div>
        )}
      </div>
    </main>
  );
}
