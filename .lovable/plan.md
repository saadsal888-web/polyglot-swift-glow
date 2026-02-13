

# تحويل التطبيق لاستخدام بيانات المنهج الحقيقية

## الوضع الحالي

التطبيق يقرأ من جداول `units` و `words` القديمة، لكن البيانات الحقيقية موجودة في جداول `curriculum_*`:

| الجدول | العدد |
|---|---|
| curriculum_modules | 66 وحدة (كلها a1) |
| curriculum_lessons | 264 درس (4 دروس لكل وحدة) |
| curriculum_vocab | 2,016 كلمة |
| curriculum_drills | 1,251 تمرين |
| curriculum_phrases | 1,015 عبارة |

## التغييرات المطلوبة

### 1. تعديل LessonsHub.tsx - الخريطة تقرأ من curriculum_modules

- استبدال استعلام `units` باستعلام `curriculum_modules`
- الترتيب حسب `stage_number` بدل `unit_number`
- عرض `title_ar` و `title_en` من البيانات الحقيقية
- عرض `icon` و `description_text` من الداتا
- تعديل المقارنة: `level_band` بدل `difficulty` (القيم بحروف صغيرة `a1` مو `A1`)
- كل module عنده 4 دروس (حسب curriculum_lessons)

### 2. تعديل Lesson.tsx - الدروس تقرأ من curriculum_lessons + curriculum_vocab + curriculum_drills

- بدل جلب `unit` من جدول `units`، نجلب الـ module من `curriculum_modules`
- بدل جلب كلمات عشوائية من `words`، نجلب vocab و drills محددة من:
  - `curriculum_vocab` حسب `lesson_id`
  - `curriculum_drills` حسب `lesson_id`
  - `curriculum_phrases` حسب `lesson_id`
- بناء التمارين من الداتا الحقيقية (الـ drills جاهزة بخياراتها والإجابة الصحيحة)
- تغيير الـ routing: بدل `/lesson/:unitId/:lessonNumber` نستخدم `/lesson/:moduleId/:lessonNumber`

### 3. تعديل App.tsx - تحديث المسار

- تغيير مسمى الـ route parameter من `unitId` الى `moduleId`

### 4. تحديث صفحة Index.tsx

- تحديث بطاقة "رحلتك التعليمية" لتقرأ من `curriculum_modules` بدل `units`

---

## التفاصيل التقنية

### هيكل البيانات الجديد

```text
curriculum_modules (id: text, stage_number, title_ar, title_en, level_band, icon, description_text)
    |
    +-- curriculum_lessons (id: text, module_id -> modules.id, title_ar, title_en, sort_order)
            |
            +-- curriculum_vocab (lesson_id -> lessons.id, word, translation, example)
            +-- curriculum_drills (lesson_id -> lessons.id, question, options: jsonb, correct_index)
            +-- curriculum_phrases (lesson_id -> lessons.id, phrase, translation, context_text)
```

### التمارين في Lesson.tsx

الـ drills جاهزة من الداتا بصيغة:
- `question`: نص السؤال
- `options`: مصفوفة JSON فيها 4 خيارات
- `correct_index`: رقم الإجابة الصحيحة (0-3)

بالإضافة نولّد تمارين ترجمة من `curriculum_vocab`:
- ترجم الكلمة (EN -> AR)
- ترجم الكلمة (AR -> EN)
- أكمل الجملة (من example)

### الملفات المتأثرة

| الملف | التغيير |
|---|---|
| `src/pages/LessonsHub.tsx` | استبدال `units` بـ `curriculum_modules` |
| `src/pages/Lesson.tsx` | استبدال `units`+`words` بـ `curriculum_lessons`+`curriculum_vocab`+`curriculum_drills` |
| `src/pages/Index.tsx` | تحديث الإحصائيات لتقرأ من المنهج الجديد |
| `src/App.tsx` | تحديث parameter name في المسار |

