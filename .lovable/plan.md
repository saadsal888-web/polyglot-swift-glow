

# حل مشكلة "جاري تحميل الأسعار..."

## المشكلة
الشاشة تظهر "جاري تحميل الأسعار..." لأن تطبيق Android لا يُرسل الأسعار لصفحة الويب.

## كيف يعمل النظام؟

```text
┌─────────────────────────────────────────────────────────────┐
│                      تطبيق Android                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  RevenueCat SDK ← يجلب الأسعار من Google Play      │   │
│  └─────────────────┬───────────────────────────────────┘   │
│                    │                                        │
│                    ▼                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  WebAppInterface.kt                                  │   │
│  │  @JavascriptInterface                                │   │
│  │  fun requestPrices() ← الويب يطلب الأسعار           │   │
│  │      ↓                                               │   │
│  │  webView.evaluateJavascript(                         │   │
│  │    "window.setSubscriptionPrices({yearly: '60 SAR'})"│   │
│  │  )                                                   │   │
│  └─────────────────┬───────────────────────────────────┘   │
│                    │                                        │
│                    ▼                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  WebView (صفحة الويب من Lovable)                    │   │
│  │  window.setSubscriptionPrices() ← تستقبل الأسعار    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## الحل: أضف هذا الكود في Android Studio

### الملف: `WebAppInterface.kt` (أو اسم ملف الـ Bridge عندك)

```kotlin
import com.revenuecat.purchases.Purchases
import com.revenuecat.purchases.getOfferingsWith
import com.revenuecat.purchases.models.Package
import com.revenuecat.purchases.PackageType

class WebAppInterface(
    private val activity: Activity,
    private val webView: WebView
) {
    
    // ... الدوال الموجودة عندك ...

    @JavascriptInterface
    fun requestPrices() {
        // جلب الأسعار من RevenueCat
        Purchases.sharedInstance.getOfferingsWith(
            onError = { error ->
                // في حالة الخطأ - أرسل سعر افتراضي
                activity.runOnUiThread {
                    webView.evaluateJavascript(
                        """
                        window.setSubscriptionPrices({
                            yearly: '60 SAR',
                            yearlyProductId: 'yearly_subscription'
                        });
                        """.trimIndent(),
                        null
                    )
                }
            },
            onSuccess = { offerings ->
                // البحث عن الباقة السنوية
                val currentOffering = offerings.current
                val annualPackage = currentOffering?.availablePackages?.find { 
                    it.packageType == PackageType.ANNUAL 
                }
                
                if (annualPackage != null) {
                    val priceString = annualPackage.product.price.formatted
                    val productId = annualPackage.product.id
                    
                    activity.runOnUiThread {
                        webView.evaluateJavascript(
                            """
                            window.setSubscriptionPrices({
                                yearly: '$priceString',
                                yearlyProductId: '$productId'
                            });
                            """.trimIndent(),
                            null
                        )
                    }
                }
            }
        )
    }
}
```

---

## شرح الكود خطوة بخطوة

| الخطوة | الشرح |
|--------|-------|
| 1 | صفحة الويب تنادي `window.AndroidApp.requestPrices()` |
| 2 | Android يستقبل الطلب في دالة `requestPrices()` |
| 3 | Android يجلب الأسعار من RevenueCat |
| 4 | RevenueCat يُرجع السعر بعملة المستخدم (SAR, USD, EGP...) |
| 5 | Android يُرسل السعر للويب عبر `window.setSubscriptionPrices()` |
| 6 | صفحة الويب تعرض السعر الحقيقي |

---

## تأكد من وجود هذه الأشياء في Android Studio

### 1. إضافة `requestPrices` في الـ Bridge
```kotlin
webView.addJavascriptInterface(
    WebAppInterface(this, webView), 
    "AndroidApp"  // ← هذا الاسم يجب أن يطابق window.AndroidApp
)
```

### 2. تهيئة RevenueCat في `onCreate`
```kotlin
Purchases.configure(
    PurchasesConfiguration.Builder(this, "goog_bMFmFxxiCJjnoSGibgsriBPqFkQ")
        .build()
)
```

---

## اختبار سريع

بعد إضافة الكود، افتح التطبيق وشاهد الـ Logcat:
```
[Subscription] Requesting prices from Android...
[Subscription] Prices updated via bridge: {yearly: "60.00 SAR", ...}
```

إذا ظهرت هذه الرسائل = الأسعار تُجلب بنجاح! ✅

---

## ملخص

| المكان | الحالة |
|--------|--------|
| كود Lovable (الويب) | ✅ جاهز - لا يحتاج تعديل |
| كود Android Studio | ❌ يحتاج إضافة دالة `requestPrices()` |

**المطلوب منك:** انسخ كود Kotlin أعلاه وأضفه في مشروع Android Studio الخاص بك.

