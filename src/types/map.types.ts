// ============================================================
// Типы для модуля Яндекс Карт и данных объектов
// ============================================================

/** Тип системы остекления/защиты */
export type SystemType = 'Солнечные панели' | 'Витражное остекление' | 'Роллетные системы';

/** Тип покрытия */
export type CoatingType = 'Порошковое' | 'Анодирование';

/** Тип здания */
export type BuildingType = 'Жилой комплекс' | 'Коммерческая недвижимость' | 'Промышленный объект';

/** Интерфейс объекта на карте */
export interface IProjectLocation {
  id: string;
  coordinates: [number, number]; // [longitude, latitude]
  name: string;
  city: string;
  address: string;
  description: string;
  system: SystemType;
  coating: CoatingType;
  buildingType: BuildingType;
  photo: string;
  phone: string;
}

/** Состояние загрузки Яндекс карт */
export type YandexMapLoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

/** Пропсы для компонента YandexMap */
export interface IYandexMapProps {
  locations: IProjectLocation[];
  onMarkerClick: (location: IProjectLocation) => void;
  selectedLocation: IProjectLocation | null;
  className?: string;
}

/** Пропсы для CustomPopup */
export interface ICustomPopupProps {
  location: IProjectLocation;
  onClose: () => void;
}