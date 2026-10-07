import { useEffect, useRef, useState } from 'react';
import type {
  IYandexMapProps,
  YandexMapLoadStatus,
} from '../../types/map.types';
import CustomPopup from './CustomPopup';

const YMAPS_API_KEY =
  import.meta.env.VITE_YANDEX_MAPS_API_KEY || '4435c9da-a1d3-436e-8391-c68f5dbc85f7';

interface IPopupPosition {
  x: number;
  y: number;
}

function createMarkerElement(isCluster = false, count?: number): HTMLElement {
  const el = document.createElement('div');
  if (isCluster) {
    el.className =
      'flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-sm shadow-lg border-2 border-white cursor-pointer transition-all duration-200 hover:bg-blue-700 hover:scale-110 hover:shadow-xl';
    el.textContent = String(count ?? 0);
  } else {
    el.className =
      'w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-md cursor-pointer transition-all duration-200 hover:scale-150 hover:bg-blue-600 hover:shadow-lg';
  }
  return el;
}

function getBoundsFromCoords(coords: [number, number][]) {
  let north = -90, south = 90, east = -180, west = 180;
  coords.forEach(([lng, lat]) => {
    if (lat > north) north = lat;
    if (lat < south) south = lat;
    if (lng > east) east = lng;
    if (lng < west) west = lng;
  });
  return { north, south, east, west };
}

const YandexMapComponent = ({
  locations,
  onMarkerClick,
  selectedLocation,
  className = '',
}: IYandexMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const clustererRef = useRef<any>(null);
  const clusterModulesRef = useRef<{ YMapClusterer: any; clusterByGrid: any } | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const popupPositionRef = useRef<IPopupPosition>({ x: 0, y: 0 });
  const [loadStatus, setLoadStatus] = useState<YandexMapLoadStatus>('idle');

  // 1. Загрузка API
  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).ymaps3) {
      const script = document.createElement('script');
      script.src = `https://api-maps.yandex.ru/v3/?apikey=${YMAPS_API_KEY}&lang=ru_RU`;
      script.async = true;
      script.onload = () => setLoadStatus('loading');
      script.onerror = () => setLoadStatus('error');
      document.head.appendChild(script);
      return () => { document.head.removeChild(script); };
    } else if ((window as any).ymaps3) {
      setLoadStatus('loading');
    }
  }, []);

  // 2. Инициализация карты + импорт модуля кластеризации (один раз в ref)
  useEffect(() => {
    if (loadStatus !== 'loading' || !mapContainerRef.current) return;
    let cancelled = false;

    const init = async () => {
      try {
        const ymaps3 = (window as any).ymaps3;
        if (!ymaps3) throw new Error('Yandex Maps API not loaded');
        await ymaps3.ready;
        if (cancelled) return;

        // Импорт модуля кластеризации — сохраняем в ref
        const mod = await ymaps3.import('@yandex/ymaps3-clusterer');
        clusterModulesRef.current = mod;

        const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer } = ymaps3;

        const map = new YMap(mapContainerRef.current!, {
          location: { center: [55.7558, 37.6173], zoom: 5 },
          behaviors: ['drag', 'scrollZoom', 'dblClick'],
        });

        map.addChild(new YMapDefaultSchemeLayer());
        map.addChild(new YMapDefaultFeaturesLayer());

        mapRef.current = map;
        setLoadStatus('loaded');
      } catch (error) {
        console.error('Failed to init Yandex Map:', error);
        if (!cancelled) setLoadStatus('error');
      }
    };

    init();
    return () => { cancelled = true; };
  }, [loadStatus]);

  // 3. Обновление маркеров и кластеров (переиспользуем mod из ref)
  useEffect(() => {
    const map = mapRef.current;
    const mod = clusterModulesRef.current;
    if (!map || !mod || locations.length === 0) return;

    const { YMapClusterer, clusterByGrid } = mod;

    // Очищаем старый кластеризатор
    if (clustererRef.current) {
      try { map.removeChild(clustererRef.current); } catch { /* ignore */ }
      clustererRef.current = null;
    }

    const markerElements = locations.map((loc) => {
      const element = createMarkerElement(false);
      element.dataset.locationId = loc.id;
      element.addEventListener('click', (e) => {
        e.stopPropagation();
        try {
          const px = map.worldToPage(loc.coordinates);
          popupPositionRef.current = { x: px[0], y: px[1] };
        } catch { /* ignore */ }
        onMarkerClick(loc);
      });
      return { coordinates: loc.coordinates, element };
    });

    const clusterer = new YMapClusterer({
      method: clusterByGrid({ gridSize: 64 }),
      features: markerElements.map((m) => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: m.coordinates },
        properties: { element: m.element },
      })),
      cluster: (cluster: any) => {
        const points = cluster.features;
        const element = createMarkerElement(true, points.length);
        element.addEventListener('click', () => {
          const coords = points.map((p: any) => p.geometry.coordinates as [number, number]);
          const bounds = getBoundsFromCoords(coords);
          map.setLocation({ bounds, duration: 400 });
        });
        return { coordinates: cluster.coordinates, element };
      },
    });

    map.addChild(clusterer);
    clustererRef.current = clusterer;

    return () => {
      if (clustererRef.current && map) {
        try { map.removeChild(clustererRef.current); } catch { /* ignore */ }
        clustererRef.current = null;
      }
    };
  }, [locations, onMarkerClick]);

  // 4. Позиционирование попапа
  useEffect(() => {
    if (!selectedLocation || !mapRef.current) return;
    const map = mapRef.current;

    const updatePos = () => {
      try {
        const px = map.worldToPage(selectedLocation.coordinates);
        if (popupRef.current) {
          popupRef.current.style.left = px[0] + 'px';
          popupRef.current.style.top = (px[1] - 16) + 'px';
        }
      } catch { /* ignore */ }
    };

    updatePos();
    const remove = map.on('update', updatePos);
    return () => { if (remove) remove(); };
  }, [selectedLocation]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {(loadStatus === 'idle' || loadStatus === 'loading') && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-10">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Загрузка карты...</p>
          </div>
        </div>
      )}
      {loadStatus === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-10">
          <div className="text-center px-6">
            <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm text-gray-600 dark:text-gray-300">Не удалось загрузить карту. Проверьте подключение к интернету.</p>
          </div>
        </div>
      )}
      <div ref={mapContainerRef} className="w-full h-full" />
      {selectedLocation && (
        <div
          ref={popupRef}
          className="absolute z-20 pointer-events-none"
          style={{ left: popupPositionRef.current.x, top: popupPositionRef.current.y }}
        >
          <div className="pointer-events-auto">
            <CustomPopup location={selectedLocation} onClose={() => onMarkerClick(selectedLocation)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default YandexMapComponent;