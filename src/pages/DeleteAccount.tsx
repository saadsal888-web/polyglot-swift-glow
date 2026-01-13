import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, AlertTriangle, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const DeleteAccount: React.FC = () => {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('يجب تسجيل الدخول أولاً');
        navigate('/');
        return;
      }

      const userId = user.id;

      // Delete user data from existing tables
      await supabase.from('user_word_progress').delete().eq('user_id', userId);
      await supabase.from('user_phrase_progress').delete().eq('user_id', userId);
      await supabase.from('user_exercise_progress').delete().eq('user_id', userId);
      await supabase.from('user_assessment_results').delete().eq('user_id', userId);
      await supabase.from('user_progress').delete().eq('user_id', userId);
      await supabase.from('profiles').delete().eq('id', userId);

      // Sign out
      await supabase.auth.signOut();

      toast.success('تم حذف حسابك بنجاح');
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('حدث خطأ أثناء حذف الحساب');
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

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
          <h1 className="font-bold text-lg text-destructive">حذف الحساب</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 space-y-6"
      >
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex gap-3">
          <AlertTriangle className="text-destructive shrink-0 mt-0.5" size={24} />
          <div>
            <h2 className="font-bold text-destructive mb-1">تحذير مهم</h2>
            <p className="text-sm text-muted-foreground">
              حذف حسابك عملية نهائية ولا يمكن التراجع عنها. سيتم حذف جميع بياناتك بشكل دائم.
            </p>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 space-y-4">
          <h3 className="font-bold">ماذا سيحدث عند حذف حسابك؟</h3>
          <ul className="text-sm text-muted-foreground space-y-3">
            <li className="flex gap-2">
              <span className="text-destructive">•</span>
              <span>حذف جميع تقدمك في التعلم والكلمات المتقنة</span>
            </li>
            <li className="flex gap-2">
              <span className="text-destructive">•</span>
              <span>حذف سجل الجلسات والنشاطات</span>
            </li>
            <li className="flex gap-2">
              <span className="text-destructive">•</span>
              <span>حذف ملفك الشخصي ومعلومات حسابك</span>
            </li>
            <li className="flex gap-2">
              <span className="text-destructive">•</span>
              <span>لن تتمكن من استعادة أي من هذه البيانات</span>
            </li>
          </ul>
        </div>

        <Button
          variant="destructive"
          className="w-full"
          onClick={() => setShowConfirm(true)}
        >
          <Trash2 size={18} className="ml-2" />
          حذف حسابي نهائياً
        </Button>
      </motion.div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء نهائي ولا يمكن التراجع عنه. سيتم حذف جميع بياناتك بشكل دائم.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel disabled={isDeleting}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'جاري الحذف...' : 'نعم، احذف حسابي'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DeleteAccount;
