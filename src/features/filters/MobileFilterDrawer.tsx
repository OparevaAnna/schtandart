import type { IMobileFilterDrawerProps } from "../../types/filter.types";
import type {
  SystemType,
  CoatingType,
  BuildingType,
} from "../../types/map.types";
import SearchInput from "../../components/SearchInput";
import FilterGroup from "./FilterGroup";
import { useEffect } from "react";

const MobileFilterDrawer = ({
  isOpen,
  onClose,
  filterState,
  onFilterChange,
  onSearchChange,
  onReset,
  availableOptions,
  totalCount,
  filteredCount,
}: IMobileFilterDrawerProps) => {
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 rounded-t-2xl shadow-xl max-h-[80vh] flex flex-col animate-slide-up">
        {/* Handle */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Фильтры
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={onReset}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              Сбросить
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Закрыть"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-800">
          <SearchInput
            value={filterState.searchQuery}
            onChange={onSearchChange}
            placeholder="Поиск..."
          />
        </div>

        {/* Filter groups */}
        <div className="flex-1 overflow-y-auto px-5 py-2">
          <FilterGroup<SystemType>
            title="Системы"
            options={availableOptions.systems}
            selected={filterState.systems}
            onChange={(value) => onFilterChange("systems", value)}
          />
          <FilterGroup<CoatingType>
            title="Покрытие"
            options={availableOptions.coatings}
            selected={filterState.coatings}
            onChange={(value) => onFilterChange("coatings", value)}
          />
          <FilterGroup<BuildingType>
            title="Тип объекта"
            options={availableOptions.buildingTypes}
            selected={filterState.buildingTypes}
            onChange={(value) => onFilterChange("buildingTypes", value)}
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Показано{" "}
            <span className="font-medium text-gray-900 dark:text-white">
              {filteredCount}
            </span>{" "}
            из{" "}
            <span className="font-medium text-gray-900 dark:text-white">
              {totalCount}
            </span>
          </p>
        </div>
      </div>
    </>
  );
};

export default MobileFilterDrawer;
