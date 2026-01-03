import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -mr-2 text-foreground"
          >
            <ChevronRight size={24} />
          </button>
          <h1 className="font-bold text-lg">سياسة الخصوصية</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 space-y-6 pb-8"
      >
        <section>
          <h2 className="font-bold text-lg mb-2 text-primary">مقدمة</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            نحن في تطبيق "رحلة الإتقان" نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية.
            توضح هذه السياسة كيفية جمع واستخدام وحماية معلوماتك.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-lg mb-2 text-primary">البيانات التي نجمعها</h2>
          <ul className="text-muted-foreground text-sm leading-relaxed space-y-2">
            <li className="flex gap-2">
              <span>•</span>
              <span><strong>معلومات الحساب:</strong> البريد الإلكتروني، الاسم (اختياري)</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span><strong>بيانات التعلم:</strong> تقدمك في الدروس، الكلمات المتقنة، نتائج الاختبارات</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span><strong>بيانات الاستخدام:</strong> مدة الجلسات، اللغات المختارة</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-lg mb-2 text-primary">كيف نستخدم بياناتك</h2>
          <ul className="text-muted-foreground text-sm leading-relaxed space-y-2">
            <li className="flex gap-2">
              <span>•</span>
              <span>تخصيص تجربة التعلم بناءً على مستواك</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>حفظ تقدمك ومزامنته بين الأجهزة</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>تحسين التطبيق وإصلاح المشاكل</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>إرسال إشعارات مهمة (يمكنك إلغاءها)</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-lg mb-2 text-primary">حماية البيانات</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            نستخدم تقنيات تشفير متقدمة لحماية بياناتك. يتم تخزين البيانات على خوادم آمنة
            ولا نشاركها مع أطراف ثالثة إلا عند الضرورة القانونية.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-lg mb-2 text-primary">حقوقك</h2>
          <ul className="text-muted-foreground text-sm leading-relaxed space-y-2">
            <li className="flex gap-2">
              <span>•</span>
              <span><strong>الوصول:</strong> يمكنك طلب نسخة من بياناتك</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span><strong>التصحيح:</strong> يمكنك تحديث معلوماتك الشخصية</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span><strong>الحذف:</strong> يمكنك حذف حسابك وجميع بياناتك من الإعدادات</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-lg mb-2 text-primary">ملفات تعريف الارتباط</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            نستخدم ملفات تعريف الارتباط لتحسين تجربتك وحفظ تفضيلاتك.
            يمكنك التحكم في هذه الإعدادات من متصفحك.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-lg mb-2 text-primary">التحديثات</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            قد نقوم بتحديث هذه السياسة من وقت لآخر. سنُعلمك بأي تغييرات جوهرية
            عبر التطبيق أو البريد الإلكتروني.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-lg mb-2 text-primary">تواصل معنا</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            لأي استفسارات حول الخصوصية، تواصل معنا عبر:
            <br />
            <span className="text-primary">support@mastery-journey.app</span>
          </p>
        </section>

        <p className="text-xs text-muted-foreground text-center pt-4">
          آخر تحديث: يناير 2026
        </p>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicy;
