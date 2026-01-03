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
        className="flex items-center gap-2 bg-card rounded-full px-3 py-2 card-shadow"
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-xl">{selected?.flag}</span>
        <ChevronDown
          size={16}
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
              className="absolute top-full mt-2 right-0 bg-card rounded-2xl card-shadow-lg overflow-hidden z-50 min-w-[180px]"
            >
              {languages.map((language) => (
                <button
                  key={language.id}
                  onClick={() => {
                    onSelect(language.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                    language.id === selectedLanguage
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-secondary'
                  }`}
                >
                  <span className="text-2xl">{language.flag}</span>
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
