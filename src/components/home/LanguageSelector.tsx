import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { languages } from '@/data/mockData';
import { Language } from '@/types';

interface LanguageSelectorProps {
  selectedLanguage: Language;
  onSelect: (language: Language) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = languages.find((l) => l.id === selectedLanguage);

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 bg-card rounded-full px-2.5 py-1.5 card-shadow"
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-base">{selected?.flag}</span>
        <ChevronDown
          size={14}
          className={`text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full mt-1 right-0 bg-card rounded-xl card-shadow-lg overflow-hidden z-50 min-w-[140px]"
            >
              {languages.map((language) => (
                <button
                  key={language.id}
                  onClick={() => {
                    onSelect(language.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 transition-colors text-sm ${
                    language.id === selectedLanguage
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-secondary'
                  }`}
                >
                  <span className="text-lg">{language.flag}</span>
                  <span className="font-medium">{language.nameAr}</span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
