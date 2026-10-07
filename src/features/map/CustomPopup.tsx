import type { ICustomPopupProps } from '../../types/map.types';

const CustomPopup = ({ location, onClose }: ICustomPopupProps) => {
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 w-72 sm:w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 z-10 w-7 h-7 flex items-center justify-center bg-white/90 dark:bg-gray-800/90 rounded-full shadow hover:bg-white dark:hover:bg-gray-700 transition-colors"
        aria-label="Закрыть"
      >
        <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Image */}
      <div className="h-40 sm:h-48 overflow-hidden">
        <img
          src={location.photo}
          alt={location.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 leading-tight">
          {location.name}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          {location.city}, {location.address}
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-3">
          {location.description}
        </p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {location.system}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            {location.coating}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            {location.buildingType}
          </span>
        </div>
        <a
          href={`tel:${location.phone}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          {location.phone}
        </a>
      </div>
    </div>
  );
};

export default CustomPopup;