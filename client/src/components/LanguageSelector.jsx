import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  return (
    <div className="relative inline-block text-left">
      <select 
        value={i18n.language} 
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        className="bg-slate-800 text-slate-100 border border-slate-700 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer"
      >
        <option value="en">English</option>
        <option value="hi">हिंदी</option>
        <option value="gu">ગુજરાતી</option>
      </select>
    </div>
  );
};

export default LanguageSelector;
