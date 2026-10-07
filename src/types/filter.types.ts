// ============================================================
// Типы для модуля фильтрации
// ============================================================

import type { SystemType, CoatingType, BuildingType } from './map.types';

/** Интерфейс состояния всех фильтров */
export interface IFilterState {
  systems: SystemType[];
  coatings: CoatingType[];
  buildingTypes: BuildingType[];
  searchQuery: string;
}

/** Допустимые ключи фильтров для редактирования */
export type FilterGroupKey = 'systems' | 'coatings' | 'buildingTypes';

/** Набор опций фильтра для UI */
export interface IFilterGroupOption<T extends string> {
  value: T;
  label: string;
  count: number;
}

/** Пропсы для компонента FilterGroup */
export interface IFilterGroupProps<T extends string> {
  title: string;
  options: IFilterGroupOption<T>[];
  selected: T[];
  onChange: (value: T) => void;
}

/** Пропсы для SearchInput */
export interface ISearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/** Пропсы для FilterSidebar (десктоп) */
export interface IFilterSidebarProps {
  filterState: IFilterState;
  onFilterChange: (group: FilterGroupKey, value: string) => void;
  onSearchChange: (query: string) => void;
  onReset: () => void;
  availableOptions: IAvailableFilterOptions;
  totalCount: number;
  filteredCount: number;
}

/** Пропсы для MobileFilterDrawer */
export interface IMobileFilterDrawerProps extends IFilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Доступные опции для UI (подсчёт количества) */
export interface IAvailableFilterOptions {
  systems: IFilterGroupOption<SystemType>[];
  coatings: IFilterGroupOption<CoatingType>[];
  buildingTypes: IFilterGroupOption<BuildingType>[];
}

/** Язык интерфейса */
export type AppLanguage = 'ru' | 'en';
