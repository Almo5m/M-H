'use client';

import { useEffect, useMemo, useState } from 'react';

interface Habit {
  id: string;
  title: string;
  assigned_to: string | null;
  recurrence_type: 'daily' | 'weekly_days' | 'once';
}
interface Log {
  habit_id: string;
  user_id: string;
  status: 'اتعملت' | 'اتأجلت';
}
interface Person {
  id: string;
  displayName: string;
}

const WEEKDAYS = ['أحد', 'إتنين', 'تلات', 'أربع', 'خميس', 'جمعة', 'سبت'];

function toDateStr(date: Date) {
  return date.toISOString().slice(0, 10);
}

function statusFor(logs: Log[], habitId: string, userId: string): Log['status'] | null {
  return logs.find((log) => log.habit_id === habitId && log.user_id === userId)?.status ?? null;
}

export function TodayPage() {
  const [cursor, setCursor] = useState(() => new Date());
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [me, setMe] = useState<Person | null>(null);
  const [other, setOther] = useState<Person | null>(null);
  const [showForm, setShowForm] = useState(false);

  // add-form state
  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState<'me' | 'other' | 'both'>('both');
  const [recurrenceType, setRecurrenceType] = useState<'daily' | 'weekly_days' | 'once'>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [onceDate, setOnceDate] = useState('');

  const dateStr = useMemo(() => toDateStr(cursor), [cursor]);

  async function load() {
    const response = await fetch(`/api/habits?date=${dateStr}`);
    const data = await response.json();
    setHabits(data.habits ?? []);
    setLogs(data.logs ?? []);
    setMe(data.me ?? null);
    setOther(data.other ?? null);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateStr]);

  async function cycleStatus(habitId: string, current: Log['status'] | null) {
    const next = current === null ? 'اتعملت' : current === 'اتعملت' ? 'اتأجلت' : null;
    await fetch('/api/habits/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ habitId, date: dateStr, status: next }),
    });
    load();
  }

  async function addHabit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title.trim(),
        assignedTo,
        recurrenceType,
        recurrenceDays: selectedDays,
        onceDate: onceDate || undefined,
      }),
    });
    setTitle('');
    setSelectedDays([]);
    setOnceDate('');
    setShowForm(false);
    load();
  }

  async function removeHabit(id: string) {
    await fetch(`/api/habits/${id}`, { method: 'DELETE' });
    load();
  }

  const doneCount = habits.filter((habit) => {
    if (habit.assigned_to) return statusFor(logs, habit.id, habit.assigned_to) === 'اتعملت';
    return statusFor(logs, habit.id, me?.id ?? '') === 'اتعملت' && statusFor(logs, habit.id, other?.id ?? '') === 'اتعملت';
  }).length;

  return (
    <main className="min-h-screen bg-[#F7F1E8] px-6 py-16">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 flex items-baseline justify-between">
          <div>
            <p className="font-arDisplay text-3xl text-[#40383A]">يومنا</p>
            <p className="text-[#8E6873]">حاجات صغيرة بنعملها سوا.</p>
          </div>
          <button onClick={() => setShowForm((value) => !value)} className="text-sm text-[#8E6873] underline decoration-dotted">
            + نضيف عادة
          </button>
        </div>

        <div className="mb-8 flex items-center justify-center gap-4">
          <button
            onClick={() => setCursor((date) => new Date(date.getTime() - 86400000))}
            aria-label="اليوم السابق"
            className="text-[#8E6873]"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M12 4 L6 10 L12 16" />
            </svg>
          </button>
          <p className="text-[#40383A]">
            {cursor.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <button
            onClick={() => setCursor((date) => new Date(date.getTime() + 86400000))}
            aria-label="اليوم التالي"
            className="text-[#8E6873]"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M8 4 L14 10 L8 16" />
            </svg>
          </button>
        </div>

        {showForm && (
          <form onSubmit={addHabit} className="mb-8 space-y-3 rounded-2xl border border-[#8E6873]/20 bg-white p-6">
            <p className="text-sm text-[#40383A]">نعمل إيه؟</p>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-lg border border-[#8E6873]/20 bg-[#F7F1E8] px-3 py-2 text-sm outline-none"
              required
            />

            <div className="flex gap-2 text-xs">
              {(['me', 'other', 'both'] as const).map((value) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setAssignedTo(value)}
                  className={`rounded-full px-3 py-1 ${assignedTo === value ? 'bg-[#8E6873] text-white' : 'bg-[#F7F1E8] text-[#40383A]'}`}
                >
                  {value === 'me' ? 'أنا' : value === 'other' ? 'الطرف التاني' : 'إحنا الاتنين'}
                </button>
              ))}
            </div>

            <div className="flex gap-2 text-xs">
              {(['daily', 'weekly_days', 'once'] as const).map((value) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setRecurrenceType(value)}
                  className={`rounded-full px-3 py-1 ${recurrenceType === value ? 'bg-[#8E6873] text-white' : 'bg-[#F7F1E8] text-[#40383A]'}`}
                >
                  {value === 'daily' ? 'كل يوم' : value === 'weekly_days' ? 'أيام معينة' : 'مرة واحدة'}
                </button>
              ))}
            </div>

            {recurrenceType === 'weekly_days' && (
              <div className="flex flex-wrap gap-2 text-xs">
                {WEEKDAYS.map((label, index) => (
                  <button
                    type="button"
                    key={label}
                    onClick={() =>
                      setSelectedDays((days) => (days.includes(index) ? days.filter((day) => day !== index) : [...days, index]))
                    }
                    className={`rounded-full px-2 py-1 ${selectedDays.includes(index) ? 'bg-[#C7A96B] text-white' : 'bg-[#F7F1E8] text-[#40383A]'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {recurrenceType === 'once' && (
              <input
                type="date"
                value={onceDate}
                onChange={(event) => setOnceDate(event.target.value)}
                className="w-full rounded-lg border border-[#8E6873]/20 bg-[#F7F1E8] px-3 py-2 text-sm outline-none"
                required
              />
            )}

            <button type="submit" className="w-full rounded-lg bg-[#8E6873] py-2 text-sm text-white">
              نضيفها
            </button>
          </form>
        )}

        {habits.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[#40383A]">لسه مفيش حاجة لنهارده.</p>
            <p className="mt-1 text-sm text-[#8B8182]">نبدأ بحاجة صغيرة؟</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {habits.map((habit) => {
              const isShared = !habit.assigned_to;
              const myStatus = statusFor(logs, habit.id, me?.id ?? '');
              const otherStatus = other ? statusFor(logs, habit.id, other.id) : null;
              const isMine = isShared || habit.assigned_to === me?.id;

              return (
                <li key={habit.id} className="group flex items-center justify-between rounded-xl border border-[#8E6873]/15 bg-white px-4 py-3">
                  <span className="text-[#40383A]">{habit.title}</span>
                  <div className="flex items-center gap-3 text-xs">
                    {isShared ? (
                      <>
                        <StatusDot label="أنا" status={myStatus} onClick={() => cycleStatus(habit.id, myStatus)} />
                        {other && <StatusDot label={other.displayName} status={otherStatus} onClick={undefined} />}
                      </>
                    ) : (
                      <StatusDot
                        label={isMine ? 'أنا' : (other?.displayName ?? 'الطرف التاني')}
                        status={isMine ? myStatus : otherStatus}
                        onClick={isMine ? () => cycleStatus(habit.id, myStatus) : undefined}
                      />
                    )}
                    <button
                      onClick={() => removeHabit(habit.id)}
                      className="text-[#8B8182] opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label="نشيل العادة دي"
                    >
                      ×
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {habits.length > 0 && (
          <p className="mt-6 text-center text-sm text-[#8B8182]">
            {doneCount === habits.length ? 'كده يومنا خلص.' : `${doneCount} حاجات اتعملت`}
          </p>
        )}
      </div>
    </main>
  );
}

function StatusDot({
  label,
  status,
  onClick,
}: {
  label: string;
  status: 'اتعملت' | 'اتأجلت' | null;
  onClick: (() => void) | undefined;
}) {
  const symbol = status === 'اتعملت' ? '✓' : status === 'اتأجلت' ? '…' : '○';
  const content = (
    <span className="flex items-center gap-1 text-[#40383A]">
      <span className={status === 'اتعملت' ? 'text-[#8E6873]' : 'text-[#8B8182]'}>{symbol}</span>
      <span className="text-[10px] text-[#8B8182]">{label}</span>
    </span>
  );

  if (!onClick) return content;
  return (
    <button onClick={onClick} className="rounded-full px-1 py-0.5 transition hover:bg-[#F7F1E8]">
      {content}
    </button>
  );
}
