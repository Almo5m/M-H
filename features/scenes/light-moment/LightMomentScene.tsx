'use client';

import { useEffect, useState } from 'react';
import type { QuestionExchange } from '@/lib/types';
import { SurpriseEffect, type SurpriseKind } from '@/features/effects/SurpriseEffect';
import { GatheringHearts } from '@/features/effects/GatheringHearts';

const SURPRISE_BANK: SurpriseKind[] = ['stars', 'lanterns', 'flash-message', 'color-wash', 'chime'];
const SURPRISE_EVERY_N_VISITS = 3;

export function LightMomentScene() {
  const [otherOnline, setOtherOnline] = useState(false);
  const [pendingForMe, setPendingForMe] = useState<QuestionExchange | null>(null);
  const [lastAnswerToMe, setLastAnswerToMe] = useState<QuestionExchange | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [nextQuestionText, setNextQuestionText] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [surprise, setSurprise] = useState<SurpriseKind | null>(null);

  useEffect(() => {
    fetch('/api/visits', { method: 'POST' })
      .then((response) => response.json())
      .then((data) => {
        const visitCount: number = data.visitCount ?? 0;
        if (visitCount > 0 && visitCount % SURPRISE_EVERY_N_VISITS === 0) {
          const bankIndex = Math.floor(visitCount / SURPRISE_EVERY_N_VISITS) % SURPRISE_BANK.length;
          setSurprise(SURPRISE_BANK[bankIndex]);
        }
      });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function heartbeat() {
      const response = await fetch('/api/presence', { method: 'POST' });
      const data = await response.json();
      if (!cancelled) setOtherOnline(Boolean(data.otherOnline));
    }

    heartbeat();
    const interval = setInterval(heartbeat, 15_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    fetch('/api/questions')
      .then((response) => response.json())
      .then((data) => {
        setPendingForMe(data.pendingForMe);
        setLastAnswerToMe(data.lastAnswerToMe);
      });
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!pendingForMe) return;
    setSending(true);

    const response = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionId: pendingForMe.id,
        answerText,
        nextQuestionText,
      }),
    });

    if (response.ok) {
      setSent(true);
      setPendingForMe(null);
    }
    setSending(false);
  }

  return (
    <section
      id="light-moment"
      data-blocking="true"
      className="relative flex min-h-screen flex-col items-center justify-center gap-8 bg-deep px-6 py-16 text-center text-warmWhite"
    >
      {surprise && <SurpriseEffect kind={surprise} />}
      {otherOnline && <GatheringHearts />}

      {lastAnswerToMe && (
        <div className="w-full max-w-md rounded-2xl bg-deep2 p-6 text-right">
          <p className="mb-2 text-sm text-inkSoft">سؤالك:</p>
          <p className="mb-4 text-warmWhite">{lastAnswerToMe.question_text}</p>
          <p className="mb-2 text-sm text-inkSoft">الرد:</p>
          <p className="text-goldSoft">{lastAnswerToMe.answer_text}</p>
        </div>
      )}

      {pendingForMe && !sent && (
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 text-right">
          <p className="font-arDisplay text-2xl text-goldSoft">{pendingForMe.question_text}</p>

          <textarea
            value={answerText}
            onChange={(event) => setAnswerText(event.target.value)}
            placeholder="ردك..."
            className="w-full rounded-xl bg-deep2 p-4 text-warmWhite outline-none"
            rows={3}
            required
          />

          <p className="text-sm text-inkSoft">واكتبلها/اكتبله سؤال جديد:</p>
          <textarea
            value={nextQuestionText}
            onChange={(event) => setNextQuestionText(event.target.value)}
            placeholder="سؤالك..."
            className="w-full rounded-xl bg-deep2 p-4 text-warmWhite outline-none"
            rows={2}
            required
          />

          <button
            type="submit"
            disabled={sending}
            className="w-full rounded-xl bg-roseDeep py-3 text-warmWhite disabled:opacity-40"
          >
            ابعت
          </button>
        </form>
      )}

      {sent && <p className="text-goldSoft">وصل ❤️ مستنيين ردها/رده المرة الجاية.</p>}

      {!pendingForMe && !sent && !lastAnswerToMe && (
        <p className="text-inkSoft">مفيش سؤال جديد دلوقتي، هيجيلك واحد قريب.</p>
      )}
    </section>
  );
}
