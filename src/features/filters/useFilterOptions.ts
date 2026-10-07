import { useMemo } from 'react';
import type { IProjectLocation } from '../../types/map.types';
import type { IAvailableFilterOptions, } from '../../types/filter.types';
import type {SystemType,  CoatingType,  BuildingType} from "../../types/map.types"


export const useFilterOptions = (locations: IProjectLocation[]): IAvailableFilterOptions => {
  return useMemo(() => {
    const systemCounts: Record<SystemType, number> = {
      'Солнечные панели': 0,
      'Витражное остекление': 0,
      'Роллетные системы': 0,
    };
    const coatingCounts: Record<CoatingType, number> = {
      'Порошковое': 0,
      'Анодирование': 0,
    };
    const buildingTypeCounts: Record<BuildingType, number> = {
      'Жилой комплекс': 0,
      'Коммерческая недвижимость': 0,
      'Промышленный объект': 0,
    };

    locations.forEach((loc) => {
      systemCounts[loc.system]++;
      coatingCounts[loc.coating]++;
      buildingTypeCounts[loc.buildingType]++;
    });

    return {
      systems: [
        { value: 'Солнечные панели', label: 'Солнечные панели', count: systemCounts['Солнечные панели'] },
        { value: 'Витражное остекление', label: 'Витражное остекление', count: systemCounts['Витражное остекление'] },
        { value: 'Роллетные системы', label: 'Роллетные системы', count: systemCounts['Роллетные системы'] },
      ],
      coatings: [
        { value: 'Порошковое', label: 'Порошковое', count: coatingCounts['Порошковое'] },
        { value: 'Анодирование', label: 'Анодирование', count: coatingCounts['Анодирование'] },
      ],
      buildingTypes: [
        { value: 'Жилой комплекс', label: 'Жилой комплекс', count: buildingTypeCounts['Жилой комплекс'] },
        { value: 'Коммерческая недвижимость', label: 'Коммерческая недвижимость', count: buildingTypeCounts['Коммерческая недвижимость'] },
        { value: 'Промышленный объект', label: 'Промышленный объект', count: buildingTypeCounts['Промышленный объект'] },
      ],
    };
  }, [locations]);
};
