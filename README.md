# عالمنا

مشروع Next.js + Supabase Auth — تجربة يومية مشتركة بين شخصين، بهوية بصرية "احنا" (12 مكان حوالين عنصر مركزي).

## الستاك

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Supabase: Postgres + Storage + **Supabase Authentication** (إيميل/باسورد حقيقي لكل شخص)
- كل جدول محمي بـ Row Level Security — الحماية جوه قاعدة البيانات نفسها، مش بس في الكود
- دخول على مرحلتين: تسجيل دخول Supabase Auth، وبعده كلمة سر مشتركة إضافية بينكم

## الإعداد

1. `npm install`
2. اعملي مشروع Supabase جديد، فعّلي Email Auth من Authentication → Providers
3. شغّلي `supabase/schema.sql` بالكامل في SQL editor بتاعه
4. من Authentication → Users، اعملي حسابين (لمعاذ وحنونة) بإيميل وباسورد لكل واحد
5. جوه جدول `spaces` اعملي صف واحد، وجوه `space_members` اربطي الحسابين الاتنين بنفس الـ `space_id`
6. انسخي `.env.example` لـ `.env.local` واملي القيم (URL/anon key من إعدادات API، service role key لو محتاج مهام إدارية، SITE_SESSION_SECRET أي نص عشوائي، SHARED_PASSPHRASE كلمة السر المشتركة، RELATIONSHIP_START_DATE، NEXT_PUBLIC_MAPBOX_TOKEN لما تجهز خريطة أماكننا)
7. `npm run dev`

## البنية

- `app/` — الصفحات و API routes، كل قسم في فولدره
- `app/login`, `app/unlock` — بوابتي الدخول (Auth ثم الباسفريز)
- `features/hub/` — الصفحة الرئيسية الجديدة (التصميم العضوي بالـ 12 مكان)
- `features/places/` — الأقسام الشغالة فعليًا (احنا/أحلامنا/رسالة/نسمع)
- `features/access/` — نماذج الدخول
- `lib/auth.ts`, `lib/requireAccess.ts` — منطق المستخدم الحالي والحماية
- `supabase/schema.sql` — كل الجداول، RLS policies، والـ storage buckets

## حالة الأقسام الـ12

كل الـ12 قسم شغالين فعليًا دلوقتي (نسخة أولى شغالة، مش كل التفاصيل الدقيقة من كل سبك مُنفذة بعد — زي الفلاتر والتصنيفات الاختيارية في بعض الأقسام). أماكننا بتستخدم خرائط مجانية بالكامل (Leaflet + OpenStreetMap) — مفيش أي مفتاح API مطلوب.

## النشر

Vercel — نفس متغيرات `.env.local` في إعدادات المشروع هناك.
