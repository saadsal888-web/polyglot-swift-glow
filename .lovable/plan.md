

# خطة: تحويل شريط التجربة لزر تفاعلي يفتح صفحة الدفع

## الوضع الحالي

```text
┌─────────────────────────────────┐
│ 🎁 تجربة مجانية: 29:45         │  ← ثابت، لا يضغط
└─────────────────────────────────┘
```

## التصميم الجديد

```text
┌─────────────────────────────────────────┐
│  🎁 عرض لفترة محدودة!                  │
│  ⏱️ 29:45                              │  ← يتحرك + قابل للنقر
│  ✨ سنة كاملة + تحديثات مجانية ✨      │
└─────────────────────────────────────────┘
           ↓ عند الضغط
    → يفتح صفحة /subscription
```

## التغييرات المطلوبة

### `src/components/subscription/TrialTimer.tsx`

| العنصر | قبل | بعد |
|--------|-----|-----|
| قابلية النقر | لا | نعم `onClick → /subscription` |
| الحركة | ثابت | `animate={{ y: [0, -3, 0] }}` خفيف |
| المحتوى | `تجربة مجانية: 29:45` | رسائل تحفيزية متعددة |
| الـ Cursor | عادي | `cursor-pointer` |

### الرسائل التحفيزية المتناوبة

```typescript
const messages = [
  "🎁 عرض لفترة محدودة!",
  "✨ سنة كاملة بسعر خاص",
  "🚀 تحديثات وميزات قادمة",
  "🔥 لا تفوّت الفرصة!"
];
```

### تصميم الشريط الجديد

```text
عند التجربة (30 دقيقة):
┌───────────────────────────────────┐
│ 🎁 عرض لفترة محدودة! ⏱️ 25:30    │
│ سنة كاملة + تحديثات مجانية →     │
└───────────────────────────────────┘

عند انتهاء التجربة (24 ساعة عرض):
┌───────────────────────────────────┐
│ 🔥 لحق العرض الآن!               │
│ ⏱️ 23:45:30 متبقي                │
│ اشترك قبل ما ينتهي →             │
└───────────────────────────────────┘
```

### تفاصيل الحركة

```typescript
// حركة عائمة خفيفة
animate={{
  y: [0, -4, 0],
  scale: [1, 1.02, 1]
}}
transition={{
  duration: 2,
  repeat: Infinity,
  ease: "easeInOut"
}}
```

## ملخص الملفات

| الملف | التغيير |
|-------|---------|
| `src/components/subscription/TrialTimer.tsx` | تحويل لزر قابل للنقر + رسائل تحفيزية + حركة عائمة |

## الكود المقترح

```typescript
// TrialTimer.tsx الجديد
import { useNavigate } from 'react-router-dom';

export const TrialTimer: React.FC = () => {
  const navigate = useNavigate();
  const { isPremium, formattedTimeMinutes, ... } = usePremiumGate();
  
  const handleClick = () => {
    navigate('/subscription');
  };

  return (
    <motion.div
      onClick={handleClick}
      className="fixed bottom-4 left-4 z-50 cursor-pointer"
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 
                      rounded-2xl px-4 py-3 text-white shadow-xl">
        <div className="flex items-center gap-2 text-sm font-bold">
          <Gift size={16} />
          <span>🎁 عرض لفترة محدودة!</span>
          <span className="bg-white/20 px-2 py-0.5 rounded-full">
            ⏱️ {formattedTimeMinutes}
          </span>
        </div>
        <div className="text-xs opacity-90 mt-1 flex items-center gap-1">
          <span>✨ سنة كاملة + تحديثات مجانية</span>
          <ArrowLeft size={12} />
        </div>
      </div>
    </motion.div>
  );
};
```

## النتيجة المتوقعة

- الشريط يتحرك بحركة عائمة خفيفة لجذب الانتباه
- عند الضغط يفتح صفحة الاشتراك
- رسائل تحفيزية تخلق إحساس بالاستعجال
- تصميم أكبر وأوضح يشجع على الضغط

