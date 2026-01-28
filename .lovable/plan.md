
# خطة: توحيد نظام الجمل مع نظام الكلمات

## الوضع الحالي

| الميزة | الكلمات (Words) | الجمل (Phrases) الحالية |
|--------|----------------|------------------------|
| كشف حرف بحرف | ✅ موجود | ❌ غير موجود |
| زر صوت ElevenLabs | ✅ موجود | ❌ غير موجود |
| تخطي دائم (Skip) | ✅ موجود | ❌ غير موجود |
| قسم صعب + تدريب | ✅ موجود | ❌ غير موجود |
| تصميم iOS | ✅ محدث | ❌ قديم |

## التغييرات المطلوبة

### 1. صفحة تعلم الجمل الجديدة (`LearnPhrases.tsx`)

**قبل:**
```
- عرض الجملة كاملة
- زر "اضغط لعرض الترجمة"
- تصميم بسيط
```

**بعد:**
```
┌─────────────────────────────────────────────────┐
│  [خروج]              3/25              [+صعب]   │
├─────────────────────────────────────────────────┤
│                                                 │
│           "How are you doing today?"            │  ← النطق
│                                                 │
│                    🔊                           │  ← زر صوت كبير
│                (اضغط للاستماع)                  │
│                                                 │
│       H • o • w   a • • •   • • •              │  ← كشف كلمة كلمة
│         ═══   ═   ═══════   ═════              │
│                                                 │
│              كيف حالك اليوم؟                    │  ← الترجمة العربية
│                                                 │
│         "اضغط الشاشة لكشف الكلمة التالية 👆"    │
│                                                 │
├─────────────────────────────────────────────────┤
│  [التالي]       [تخطي دائم]        [إعادة]     │
└─────────────────────────────────────────────────┘
```

**المميزات الجديدة:**
- **كشف كلمة بكلمة**: بدل حرف حرف، نكشف كلمة كلمة (لأن الجمل طويلة)
- **زر صوت ElevenLabs**: نفس نظام الكلمات
- **تخطي دائم**: يحفظ في `user_phrase_progress` مع `is_deleted: true`
- **إضافة للصعب**: يحفظ في `user_phrase_progress` مع `is_difficult: true`

### 2. Hook للجمل المتخطاة (`useSkippedPhrases.ts`)

إنشاء hook جديد مشابه لـ `useSkippedWords`:

```typescript
// نفس المنطق تماماً لكن مع جدول user_phrase_progress
export const useSkippedPhrases = () => {
  // تحميل الجمل المتخطاة من localStorage + Supabase
  // دالة skipPhrase لحفظ الجملة كمحذوفة
  // دالة isSkipped للتحقق
  return { skippedIds, skipPhrase, isSkipped, ... };
};
```

### 3. صفحة الجمل الصعبة الجديدة (`DifficultPhrases.tsx`)

**مشابهة لـ DifficultWords:**

```
┌─────────────────────────────────────────────────┐
│  ⚠️ الجمل الصعبة              15 جملة   [←]    │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  🔊  "How are you doing today?"         │   │
│  │      كيف حالك اليوم؟                   │   │  ← اضغط للتدريب
│  │      /haʊ ɑːr juː ˈduːɪŋ/              │   │
│  │                مستوى 2/5 • تدربت 3 مرات│   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  🔊  "Nice to meet you"                 │   │
│  │      تشرفت بمعرفتك                     │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

**عند الضغط على جملة:**
- يظهر `PhraseRepetitionOverlay` (مشابه لـ WordRepetitionOverlay)
- تكرار لا نهائي مع صوت

### 4. Overlay تكرار الجمل (`PhraseRepetitionOverlay.tsx`)

**مشابه لـ WordRepetitionOverlay لكن للجمل:**

```
┌─────────────────────────────────────────────────┐
│  [×]                    1/15              ● ● ○ │
├─────────────────────────────────────────────────┤
│                                                 │
│    How are you   How are you   How are you     │  ← خلفية شبكة
│    كيف حالك       كيف حالك       كيف حالك      │
│                                                 │
│         ┌─────────────────────────┐            │
│         │                         │            │
│         │   How are you today?    │ ← بطاقة عائمة
│         │                         │
│         │     كيف حالك اليوم؟     │
│         │                         │
│         │       🔊 استمع          │
│         └─────────────────────────┘            │
│                                                 │
│                                                 │
├─────────────────────────────────────────────────┤
│              [    إيقاف    ]                   │
└─────────────────────────────────────────────────┘
```

### 5. إضافة رابط في المكتبة للجمل الصعبة

**تحديث `LibrarySection.tsx`:**

```typescript
// إضافة بطاقة "الجمل الصعبة"
<LibraryItem
  icon={<MessageCircle size={18} className="text-warning" />}
  label="جمل صعبة"
  count={difficultPhrasesCount}
  onClick={() => navigate('/difficult-phrases')}
/>
```

### 6. إضافة المسار الجديد

**تحديث `App.tsx`:**

```typescript
import DifficultPhrases from "./pages/DifficultPhrases";

// إضافة المسار
<Route path="/difficult-phrases" element={<ProtectedRoute><DifficultPhrases /></ProtectedRoute>} />
```

## ملخص الملفات

| الملف | الحالة | الوصف |
|-------|--------|-------|
| `src/pages/LearnPhrases.tsx` | تعديل جذري | نظام كشف كلمة بكلمة + صوت + تخطي دائم |
| `src/hooks/useSkippedPhrases.ts` | جديد | إدارة الجمل المتخطاة |
| `src/pages/DifficultPhrases.tsx` | جديد | صفحة الجمل الصعبة مع التدريب |
| `src/components/exercise/PhraseRepetitionOverlay.tsx` | جديد | overlay التكرار للجمل |
| `src/hooks/usePhrases.ts` | تعديل | إضافة `useDifficultPhrases` hook |
| `src/components/home/LibrarySection.tsx` | تعديل | إضافة بطاقة الجمل الصعبة |
| `src/App.tsx` | تعديل | إضافة مسار `/difficult-phrases` |

## التفاصيل التقنية

### كشف كلمة بكلمة (Word-by-Word Reveal)

```typescript
// بدلاً من letters للكلمات
const words = currentPhrase?.phrase_en?.split(' ') || [];

// كل ضغطة تكشف كلمة
const handleTap = () => {
  if (revealedCount < words.length) {
    speakWord(words[revealedCount]); // نطق الكلمة المكشوفة
    setRevealedCount(prev => prev + 1);
  }
};

// عرض الكلمات
{words.map((word, index) => (
  <span className={index < revealedCount ? 'text-primary' : 'text-gray-300'}>
    {index < revealedCount ? word : '•••'}
  </span>
))}
```

### صوت ElevenLabs للجمل

```typescript
// نفس الكود المستخدم في WordsPractice
const speakPhraseWithElevenLabs = async (phrase: string) => {
  const response = await fetch(
    `https://wiyetipqsuzhretlmfio.supabase.co/functions/v1/elevenlabs-tts`,
    {
      method: "POST",
      headers: { ... },
      body: JSON.stringify({ text: phrase }),
    }
  );
  // تشغيل الصوت
};
```

### Hook الجمل الصعبة

```typescript
export const useDifficultPhrases = () => {
  return useQuery({
    queryKey: ['difficult-phrases'],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_phrase_progress')
        .select(`
          phrase_id,
          times_practiced,
          mastery_level,
          is_difficult,
          phrases!inner(id, phrase_en, phrase_ar, pronunciation, audio_url)
        `)
        .eq('user_id', user.id)
        .eq('is_difficult', true);
      return data;
    },
  });
};
```

## إضافة عمود `is_difficult` للجمل

الجدول `user_phrase_progress` **لا يحتوي** على عمود `is_difficult` حالياً.

**مطلوب migration:**
```sql
ALTER TABLE user_phrase_progress 
ADD COLUMN is_difficult BOOLEAN DEFAULT false;
```

## سلوك التطبيق الجديد

```text
المستخدم يدخل "تعلم الجمل A1":
├── يرى الجملة الإنجليزية + الترجمة العربية
├── يضغط الشاشة ← تظهر كلمة تلو الأخرى مع صوت
├── عند اكتمال الجملة ← يسمع الجملة كاملة بـ ElevenLabs
│
├── [التالي] ← ينتقل للجملة التالية
├── [تخطي] ← الجملة لا ترجع أبداً (is_deleted = true)
├── [+] ← إضافة للجمل الصعبة (is_difficult = true)
│
└── في المكتبة:
    ├── يرى "الجمل الصعبة: 15"
    └── يضغط ← صفحة الجمل الصعبة مع تدريب
```
