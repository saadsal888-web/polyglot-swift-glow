import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Terms: React.FC = () => {
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
          <h1 className="font-bold text-lg">شروط الاستخدام</h1>
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
          <h2 className="font-bold text-lg mb-2 text-primary">القبول بالشروط</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            باستخدامك لتطبيق "رحلة الإتقان"، فإنك توافق على الالتزام بهذه الشروط والأحكام.
            إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام التطبيق.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-lg mb-2 text-primary">استخدام التطبيق</h2>
          <ul className="text-muted-foreground text-sm leading-relaxed space-y-2">
            <li className="flex gap-2">
              <span>•</span>
              <span>التطبيق مخصص للأغراض التعليمية فقط</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>يجب أن يكون عمرك 13 عامًا أو أكثر لاستخدام التطبيق</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>أنت مسؤول عن الحفاظ على سرية بيانات حسابك</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>يُحظر استخدام التطبيق لأي أغراض غير قانونية</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-lg mb-2 text-primary">الملكية الفكرية</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            جميع المحتويات في التطبيق، بما في ذلك النصوص والصور والتصميمات والشعارات،
            محمية بحقوق الملكية الفكرية. لا يُسمح بنسخ أو توزيع أو تعديل أي محتوى
            دون إذن كتابي مسبق.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-lg mb-2 text-primary">حساب المستخدم</h2>
          <ul className="text-muted-foreground text-sm leading-relaxed space-y-2">
            <li className="flex gap-2">
              <span>•</span>
              <span>يجب تقديم معلومات صحيحة ودقيقة عند إنشاء الحساب</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>يحق لنا تعليق أو إنهاء حسابك في حال مخالفة الشروط</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>يمكنك حذف حسابك في أي وقت من الإعدادات</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-lg mb-2 text-primary">إخلاء المسؤولية</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            التطبيق يُقدم "كما هو" دون أي ضمانات صريحة أو ضمنية. لا نضمن أن التطبيق
            سيكون خاليًا من الأخطاء أو متاحًا في جميع الأوقات. نحن غير مسؤولين عن
            أي أضرار ناتجة عن استخدام التطبيق.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-lg mb-2 text-primary">التعديلات</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إعلامك بالتغييرات الجوهرية
            عبر التطبيق. استمرارك في استخدام التطبيق يعني قبولك للشروط المعدلة.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-lg mb-2 text-primary">القانون المطبق</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            تخضع هذه الشروط وتفسر وفقًا للقوانين السارية. أي نزاعات تنشأ عن استخدام
            التطبيق سيتم حلها عبر التحكيم أو المحاكم المختصة.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-lg mb-2 text-primary">تواصل معنا</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            لأي استفسارات حول شروط الاستخدام:
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

export default Terms;
