# عالمنا

مشروع Next.js + Supabase — تجربة سينمائية بالسكرول مشتركة بين شخصين، بدل الملف الواحد القديم.

## الستاك

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres + Storage) — يتصفح من السيرفر فقط، عن طريق الـ service role key. المتصفح مايكلمش Supabase مباشرة أبدًا.
- قفل دخول بباسورد مشترك + اختيار هوية (معاذ / حنونة) بيتخزن في كوكي موقّع.

## الإعداد

1. `npm install`
2. اعملي مشروع Supabase جديد، وشغّلي `supabase/schema.sql` في الـ SQL editor بتاعه (ده بيعمل الجداول والـ buckets).
3. انسخي `.env.example` لـ `.env.local` واملي:
   - `NEXT_PUBLIC_SUPABASE_URL` و `SUPABASE_SERVICE_ROLE_KEY` من إعدادات المشروع في Supabase
   - `SITE_PASSWORD` — الباسورد المشترك بينكم
   - `SITE_SESSION_SECRET` — أي نص عشوائي طويل، بيستخدم لتوقيع كوكي الجلسة
4. `npm run dev`

## البنية

- `app/` — الصفحات و API routes
- `features/scenes/` — كل مشهد في فولدر خاص بيه
- `features/access/` — بوابة الدخول
- `lib/` — Supabase client، الجلسة، الأنواع المشتركة
- `supabase/schema.sql` — كل جداول وباكتات القاعدة

## النشر

Vercel هو الأنسب مع Next.js — اربطي الريبو، وحطي نفس متغيرات `.env.local` في إعدادات المشروع هناك.

## License

هذا المشروع خاص بمعاذ (AlMo)، كل الحقوق محفوظة. راجعي ملف LICENSE.
