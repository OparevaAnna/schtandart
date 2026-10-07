import type { IFilterSidebarProps, SystemType, CoatingType, BuildingType } from '../../types/filter.types';
import SearchInput from '../../components/SearchInput';
import FilterGroup from './FilterGroup';

const FilterSidebar = ({
  filterState,
  onFilterChange,
  onSearchChange,
  onReset,
  availableOptions,
  totalCount,
  filteredCount,
}: IFilterSidebarProps) => {
  return (
    <aside className="w-80 h-full overflow-y-auto bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Фильтры
          </h2>
          <button
            onClick={onReset}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            Сбросить
          </button>
        </div>
        <SearchInput
          value={filterState.searchQuery}
          onChange={onSearchChange}
          placeholder="Поиск по названию, городу, адресу..."
        />
      </div>

      {/* Filter groups */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <FilterGroup<SystemType>
          title="Системы"
          options={availableOptions.systems}
          selected={filterState.systems}
          onChange={(value) => onFilterChange('systems', value)}
        />
        <FilterGroup<CoatingType>
          title="Покрытие"
          options={availableOptions.coatings}
          selected={filterState.coatings}
          onChange={(value) => onFilterChange('coatings', value)}
        />
        <FilterGroup<BuildingType>
          title="Тип объекта"
          options={availableOptions.buildingTypes}
          selected={filterState.buildingTypes}
          onChange={(value) => onFilterChange('buildingTypes', value)}
        />
      </div>

      {/* Footer with count */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Показано{' '}
          <span className="font-medium text-gray-900 dark:text-white">
            {filteredCount}
          </span>{' '}
          из{' '}
          <span className="font-medium text-gray-900 dark:text-white">
            {totalCount}
          </span>
        </p>
      </div>
    </aside>
  );
};

export default FilterSidebar;