export type Partner = 'moaz' | 'hanona';

export function otherPartner(who: Partner): Partner {
  return who === 'moaz' ? 'hanona' : 'moaz';
}

export interface QuestionExchange {
  id: string;
  asked_by: Partner;
  question_text: string;
  answer_text: string | null;
  answered_at: string | null;
  created_at: string;
}

export interface ArchiveEntry {
  id: string;
  author: Partner;
  content: string;
  photo_path: string | null;
  photo_url?: string | null;
  created_at: string;
}

export interface LockedMessage {
  id: string;
  written_by: Partner;
  recipient: Partner;
  content: string;
  unlock_at: string;
  seen_unlocked_at: string | null;
  created_at: string;
}

export interface MemoryPhoto {
  id: string;
  uploaded_by: Partner;
  storage_path: string;
  caption: string | null;
  created_at: string;
}

export interface PlaylistSong {
  id: string;
  uploaded_by: Partner;
  title: string;
  storage_path: string;
  created_at: string;
}

export interface SharedDream {
  id: string;
  added_by: Partner;
  content: string;
  achieved: boolean;
  achieved_at: string | null;
  created_at: string;
}
