

# خطة: طلب الأسعار تلقائياً من تطبيق Android

## المشكلة
- الكود جاهز لاستقبال الأسعار عبر `window.setSubscriptionPrices()`
- لكن تطبيق Android لا يُرسل الأسعار تلقائياً

## الحل من طرفين

### الطرف 1: تعديل في Lovable (الويب)
إضافة دالة `requestPrices()` في الـ Bridge لطلب الأسعار من Android

**ملف:** `src/contexts/SubscriptionContext.tsx`
- إضافة `requestPrices` في interface الـ AndroidApp
- استدعاء `window.AndroidApp.requestPrices()` عند تهيئة الاشتراك

**ملف:** `index.html`
- لا تغيير مطلوب

### الطرف 2: تعديل في Android Studio (يجب عليك تنفيذه)
في كود Android الأصلي، أضف:

```kotlin
// في WebAppInterface.kt
@JavascriptInterface
fun requestPrices() {
    Purchases.sharedInstance.getOfferingsWith(
        onError = { /* handle error */ },
        onSuccess = { offerings ->
            offerings.current?.availablePackages?.forEach { pkg ->
                val priceString = pkg.product.price.formatted
                val productId = pkg.product.identifier
                
                when (pkg.packageType) {
                    PackageType.ANNUAL -> {
                        activity.runOnUiThread {
                            webView.evaluateJavascript(
                                """window.setSubscriptionPrices({ 
                                    yearly: '$priceString', 
                                    yearlyProductId: '$productId' 
                                })""",
                                null
                            )
                        }
                    }
                    // أضف MONTHLY إذا أردت
                }
            }
        }
    )
}
```

## التغييرات التقنية في Lovable

### 1. تحديث AndroidApp interface
```typescript
// src/contexts/SubscriptionContext.tsx
AndroidApp?: {
  subscribe: (productId?: string) => void;
  restorePurchases: () => void;
  requestPaywall: () => void;
  requestPrices: () => void;  // ← جديد
  logIn: (appUserID: string) => void;
  logOut: () => void;
};
```

### 2. طلب الأسعار عند وجود AndroidApp
```typescript
// في initSubscription
if (hasAndroidApp) {
  // ... الكود الموجود ...
  
  // طلب الأسعار من Android
  if (window.AndroidApp?.requestPrices) {
    window.AndroidApp.requestPrices();
  }
}
```

### 3. إضافة حالة تحميل للأسعار
عرض "جاري التحميل..." بدلاً من سعر افتراضي خاطئ

## الملفات المطلوب تعديلها

| الملف | التغيير |
|-------|---------|
| `src/contexts/SubscriptionContext.tsx` | إضافة `requestPrices` في interface وطلبها عند التهيئة |
| `src/components/subscription/TimeUpOverlay.tsx` | عرض حالة تحميل إذا لم تصل الأسعار بعد |

## ملاحظة مهمة
**يجب عليك إضافة دالة `requestPrices()` في كود Android Studio** وإلا لن تعمل هذه الخطة!

