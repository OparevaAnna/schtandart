import { useState, useMemo, useCallback } from 'react';
import type { IProjectLocation } from '../types/map.types';
import type { IFilterState, FilterGroupKey, AppLanguage } from '../types/filter.types';

const createInitialFilterState = (): IFilterState => ({
  systems: [],
  coatings: [],
  buildingTypes: [],
  searchQuery: '',
});

interface IUseMapFiltersReturn {
  /** Текущее состояние фильтров */
  filterState: IFilterState;
  /** Отфильтрованный массив объектов */
  filteredLocations: IProjectLocation[];
  /** Общее количество объектов */
  totalCount: number;
  /** Количество после фильтрации */
  filteredCount: number;
  /** Установить значение фильтра (toggle для групп, строка для поиска) */
  setFilter: (group: FilterGroupKey, value: string) => void;
  /** Установить поисковый запрос */
  setSearchQuery: (query: string) => void;
  /** Сбросить все фильтры */
  resetFilters: () => void;
  /** Язык интерфейса */
  language: AppLanguage;
  /** Переключить язык */
  toggleLanguage: () => void;
}

export const useMapFilters = (locations: IProjectLocation[]): IUseMapFiltersReturn => {
  const [filterState, setFilterState] = useState<IFilterState>(createInitialFilterState);
  const [language, setLanguage] = useState<AppLanguage>('ru');

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => (prev === 'ru' ? 'en' : 'ru'));
  }, []);

  /**
   * Универсальный toggle-обработчик для групп фильтров.
   * Если значение уже выбрано — удаляет, иначе — добавляет.
   */
  const setFilter = useCallback((group: FilterGroupKey, value: string) => {
    setFilterState(prev => {
      const currentGroup = prev[group] as string[];
      const exists = currentGroup.includes(value);
      return {
        ...prev,
        [group]: exists
          ? currentGroup.filter(v => v !== value)
          : [...currentGroup, value],
      };
    });
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setFilterState(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilterState(createInitialFilterState());
  }, []);

  /**
   * Логика фильтрации:
   * - Внутри группы: OR (выбраны «Порошковое» OR «Анодирование»)
   * - Между группами: AND (системы AND покрытия AND типы зданий)
   * - Поиск: регистронезависимый по name, city, address
   */
  const filteredLocations = useMemo(() => {
    return locations.filter(location => {
      // Фильтр по системам (OR внутри группы)
      if (filterState.systems.length > 0 && !filterState.systems.includes(location.system)) {
        return false;
      }

      // Фильтр по покрытиям (OR внутри группы)
      if (filterState.coatings.length > 0 && !filterState.coatings.includes(location.coating)) {
        return false;
      }

      // Фильтр по типам зданий (OR внутри группы)
      if (filterState.buildingTypes.length > 0 && !filterState.buildingTypes.includes(location.buildingType)) {
        return false;
      }

      // Поиск по строке (регистронезависимый)
      if (filterState.searchQuery.trim() !== '') {
        const query = filterState.searchQuery.toLowerCase().trim();
        const matchName = location.name.toLowerCase().includes(query);
        const matchCity = location.city.toLowerCase().includes(query);
        const matchAddress = location.address.toLowerCase().includes(query);

        if (!matchName && !matchCity && !matchAddress) {
          return false;
        }
      }

      return true;
    });
  }, [locations, filterState]);

  const totalCount = locations.length;
  const filteredCount = filteredLocations.length;

  return {
    filterState,
    filteredLocations,
    totalCount,
    filteredCount,
    setFilter,
    setSearchQuery,
    resetFilters,
    language,
    toggleLanguage,
  };
};