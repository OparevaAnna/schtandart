import type { AppLanguage } from '../types/filter.types';

interface ILanguageSwitchProps {
  language: AppLanguage;
  onToggle: () => void;
}

const LanguageSwitch = ({ language, onToggle }: ILanguageSwitchProps) => {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors"
      aria-label={`Switch language to ${language === 'ru' ? 'English' : 'Русский'}`}
    >
      <span className={`${language === 'ru' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
        RU
      </span>
      <span className="text-gray-300 dark:text-gray-600">/</span>
      <span className={`${language === 'en' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
        EN
      </span>
    </button>
  );
};

export default LanguageSwitch;