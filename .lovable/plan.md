

# خطة: إصلاح العد التنازلي ليبدأ من 30 دقيقة

## المشكلة

القيمة المحفوظة في `localStorage` قديمة (~82000 ثانية) من النظام السابق (24 ساعة).

```text
الحالي: 1366:52 (82000 ثانية)
المطلوب: 29:59 (1800 ثانية)
```

## السبب

```typescript
// السطر 76-84 في usePremiumGate.ts
if (stored !== null) {
  const storedTime = parseInt(stored, 10);
  // ❌ لا يتحقق إذا الوقت أكبر من TRIAL_DURATION الجديد
  setTimeLeft(storedTime); // يضع 82000 بدل 1800
}
```

## الحل

إضافة تحقق: إذا الوقت المحفوظ أكبر من `TRIAL_DURATION` → إعادة تعيين للقيمة الصحيحة:

```typescript
if (stored !== null) {
  const storedTime = parseInt(stored, 10);
  
  // ✅ إذا الوقت المحفوظ أكبر من المدة الجديدة، أعد التعيين
  if (storedTime > TRIAL_DURATION) {
    localStorage.setItem(STORAGE_KEY, String(TRIAL_DURATION));
    setTimeLeft(TRIAL_DURATION);
  } else if (storedTime <= 0) {
    setTimeLeft(0);
    setIsTimeUp(true);
  } else {
    setTimeLeft(storedTime);
  }
}
```

## التغيير المطلوب

| الملف | التغيير |
|-------|---------|
| `src/hooks/usePremiumGate.ts` | إضافة تحقق من أن الوقت المحفوظ ≤ 1800 ثانية |

## النتيجة

```text
قبل: ⏱️ 1366:52
بعد: ⏱️ 29:59
```

المستخدمين القدامى سيُعاد ضبط تجربتهم تلقائياً لـ 30 دقيقة.

