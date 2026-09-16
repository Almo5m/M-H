'use client';

import { BackToHub } from '@/features/hub/BackToHub';

import { useEffect, useState } from 'react';

interface Note {
  id: string;
  created_by: string;
  recipient_id: string;
  content: string;
  mood_tag: string | null;
  read_at: string | null;
  reply_type: string | null;
  created_at: string;
}

const MOOD_TAGS = ['محتاج أقول حاجة', 'حاجة مضايقاني', 'حاجة بحبها', 'حاجة نفسي تتغير'];
const REPLIES = ['فهمتك', 'خلينا نتكلم', 'محتاج أفكر'] as const;

export function HonestyPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [myId, setMyId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [content, setContent] = useState('');
  const [moodTag, setMoodTag] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  async function load() {
    const response = await fetch('/api/honesty-notes');
    const data = await response.json();
    setNotes(data.notes ?? []);
    setMyId(data.myId ?? null);
  }

  useEffect(() => {
    load();
  }, []);

  async function send() {
    await fetch('/api/honesty-notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: content.trim(), moodTag }),
    });
    setContent('');
    setMoodTag(null);
    setConfirming(false);
    setShowForm(false);
    load();
  }

  async function openNote(note: Note) {
    setOpenId(note.id);
    if (note.recipient_id === myId && !note.read_at) {
      await fetch('/api/honesty-notes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: note.id, action: 'read' }),
      });
      load();
    }
  }

  async function reply(id: string, replyType: string) {
    await fetch('/api/honesty-notes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'reply', replyType }),
    });
    load();
  }

  const openNoteData = notes.find((note) => note.id === openId);

  return (
    <main className="page-fade-in min-h-screen bg-[#F7F1E8] px-6 py-16">
      <BackToHub />
      <div className="mx-auto max-w-xl">
        <p className="font-arDisplay text-3xl text-[#40383A]">بصراحة</p>
        <p className="mb-2 text-[#8E6873]">في كلام محتاج يتقال بهدوء.</p>
        <p className="mb-8 text-sm text-[#8B8182]">هنا مفيش صح وغلط... في كلام محتاج يتسمع.</p>

        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-ghost mb-8">
            + أقول حاجة
          </button>
        )}

        {showForm && !confirming && (
          <div className="mb-10 space-y-3 soft-panel p-6">
            <p className="text-sm text-[#40383A]">قول اللي نفسك تقوله</p>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="اكتب براحتك..."
              className="field-input"
              rows={4}
            />
            <div className="flex flex-wrap gap-2 text-xs">
              {MOOD_TAGS.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => setMoodTag((current) => (current === tag ? null : tag))}
                  className={`rounded-full px-3 py-1 ${moodTag === tag ? 'bg-[#8E6873] text-white' : 'bg-[#F7F1E8] text-[#40383A]'}`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <button
              onClick={() => content.trim() && setConfirming(true)}
              className="w-full rounded-lg bg-[#8E6873] py-2 text-sm text-white"
            >
              أبعتها
            </button>
          </div>
        )}

        {confirming && (
          <div className="mb-10 space-y-4 soft-panel p-6 text-center">
            <p className="text-sm text-[#40383A]">اقراها مرة أخيرة... هل دي فعلًا الطريقة اللي عايز توصل بيها كلامك؟</p>
            <p className="rounded-lg bg-[#F7F1E8] p-3 text-sm text-[#40383A]">{content}</p>
            <div className="flex gap-2">
              <button onClick={send} className="btn-primary flex-1">
                أبعتها
              </button>
              <button onClick={() => setConfirming(false)} className="btn-ghost flex-1">
                أرجع أعدل
              </button>
            </div>
          </div>
        )}

        {openNoteData ? (
          <div className="soft-panel p-6">
            <button onClick={() => setOpenId(null)} className="mb-4 text-xs text-[#8B8182]">
              ← رجوع
            </button>
            <p className="text-xs text-[#8B8182]">{openNoteData.created_by === myId ? 'أنا كتبتها' : 'من الطرف التاني'}</p>
            <p className="mb-4 text-xs text-[#8B8182]">{new Date(openNoteData.created_at).toLocaleDateString('ar-EG')}</p>
            <p className="text-[#40383A]">{openNoteData.content}</p>

            {openNoteData.recipient_id === myId && (
              <div className="mt-6 flex flex-wrap gap-2">
                {REPLIES.map((option) => (
                  <button
                    key={option}
                    onClick={() => reply(openNoteData.id, option)}
                    className={`rounded-full px-3 py-1 text-xs ${
                      openNoteData.reply_type === option ? 'bg-[#8E6873] text-white' : 'bg-[#F7F1E8] text-[#40383A]'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
            {openNoteData.reply_type && openNoteData.created_by === myId && (
              <p className="mt-4 text-sm text-[#8E6873]">الرد: {openNoteData.reply_type}</p>
            )}
          </div>
        ) : notes.length === 0 ? (
          <p className="py-16 text-center text-[#8B8182]">مفيش كلام مستني يتقال. بس المكان مفتوح لو في حاجة جواك.</p>
        ) : (
          <ul className="space-y-2">
            {notes.map((note) => {
              const isUnread = note.recipient_id === myId && !note.read_at;
              return (
                <li key={note.id} className="list-item-enter">
                  <button onClick={() => openNote(note)} className="w-full soft-card px-4 py-3 text-right">
                    <p className="text-xs text-[#8B8182]">{note.created_by === myId ? 'أنا كتبتها' : 'من الطرف التاني'}</p>
                    <p className={`text-sm ${isUnread ? 'font-semibold text-[#40383A]' : 'text-[#8B8182]'}`}>
                      {isUnread ? 'لسه ما اتقريتش' : note.content.slice(0, 30) + '…'}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
