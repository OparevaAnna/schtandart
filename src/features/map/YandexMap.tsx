import { useEffect, useRef, useState, useCallback } from "react";
import type {
  IYandexMapProps,
  YandexMapLoadStatus,
  IProjectLocation,
} from "../../types/map.types";
import CustomPopup from "./CustomPopup";

// Yandex Maps API key from environment
const YMAPS_API_KEY =
  import.meta.env.VITE_YANDEX_MAPS_API_KEY || "YOUR_API_KEY_HERE";

/** Глобальный тип ymaps3 */
type Ymaps3Type = any;

/** Позиция попапа в пикселях */
interface IPopupPosition {
  x: number;
  y: number;
}

/** Создать кастомный HTML-элемент маркера */
const createMarkerElement = (
  isCluster: boolean = false,
  count?: number,
): HTMLElement => {
  const el = document.createElement("div");

  if (isCluster) {
    el.className =
      "flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-sm shadow-lg border-2 border-white cursor-pointer transition-all duration-200 hover:bg-blue-700 hover:scale-110 hover:shadow-xl";
    el.textContent = String(count ?? 0);
  } else {
    el.className =
      "w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-md cursor-pointer transition-all duration-200 hover:scale-150 hover:bg-blue-600 hover:shadow-lg";
  }

  return el;
};

/** Получить границы для набора координат */
const getBoundsFromCoords = (
  coords: [number, number][],
): {
  north: number;
  south: number;
  east: number;
  west: number;
} => {
  let north = -90;
  let south = 90;
  let east = -180;
  let west = 180;

  coords.forEach(([lng, lat]) => {
    if (lat > north) north = lat;
    if (lat < south) south = lat;
    if (lng > east) east = lng;
    if (lng < west) west = lng;
  });

  return { north, south, east, west };
};

const YandexMap = ({
  locations,
  onMarkerClick,
  selectedLocation,
  className = "",
}: IYandexMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const clustererRef = useRef<any>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const popupPositionRef = useRef<IPopupPosition>({ x: 0, y: 0 });
  const [loadStatus, setLoadStatus] = useState<YandexMapLoadStatus>("idle");
  const ymaps3Ref = useRef<Ymaps3Type>(null);

  // ========================
  // 1. Загрузка API
  // ========================
  useEffect(() => {
    if (typeof window !== "undefined" && !(window as any).ymaps3) {
      const script = document.createElement("script");
      script.src = `https://api-maps.yandex.ru/v3/?apikey=${YMAPS_API_KEY}&lang=ru_RU`;
      script.async = true;
      script.onload = () => setLoadStatus("loading");
      script.onerror = () => setLoadStatus("error");
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    } else if ((window as any).ymaps3) {
      setLoadStatus("loading");
    }
  }, []);

  // ========================
  // 2. Инициализация карты
  // ========================
  useEffect(() => {
    if (loadStatus !== "loading" || !mapContainerRef.current) return;

    let isMounted = true;

    const initMap = async () => {
      try {
        const ymaps3: Ymaps3Type = (window as any).ymaps3;
        if (!ymaps3) throw new Error("Yandex Maps API not loaded");

        await ymaps3.ready;
        if (!isMounted) return;

        ymaps3Ref.current = ymaps3;

        const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer } =
          ymaps3;

        // Import clusterer
        const { YMapClusterer, clusterByGrid } = await ymaps3.import(
          "@yandex/ymaps3-clusterer",
        );

        // Сохраняем ссылку на конструктор кластера для обновления
        const ClustererConstructor = YMapClusterer;
        const clusterByGridFn = clusterByGrid;

        // Создаём карту
        const map = new YMap(mapContainerRef.current, {
          location: {
            center: [55.7558, 37.6173], // Москва
            zoom: 5,
          },
          behaviors: ["drag", "scrollZoom", "dblClick"],
        });

        map.addChild(new YMapDefaultSchemeLayer());
        map.addChild(new YMapDefaultFeaturesLayer());

        mapRef.current = map;
        setLoadStatus("loaded");

        return () => {
          map.destroy();
          mapRef.current = null;
          clustererRef.current = null;
        };
      } catch (error) {
        console.error("Failed to initialize Yandex Map:", error);
        if (isMounted) setLoadStatus("error");
      }
    };

    initMap();

    return () => {
      isMounted = false;
    };
  }, [loadStatus]);

  // ========================
  // 3. Обновление маркеров и кластеров при изменении locations
  // ========================
  useEffect(() => {
    const map = mapRef.current;
    const ymaps3 = ymaps3Ref.current;

    if (!map || !ymaps3 || locations.length === 0) return;

    let isMounted = true;

    const updateMarkers = async () => {
      try {
        // Очищаем старый кластеризатор, если есть
        if (clustererRef.current) {
          map.removeChild(clustererRef.current);
          clustererRef.current = null;
        }

        // Импортируем кластеризатор (уже должен быть загружен)
        const { YMapClusterer, clusterByGrid } = await ymaps3.import(
          "@yandex/ymaps3-clusterer",
        );

        // Создаём HTML-элементы маркеров для кластеризатора
        const markerElements = locations.map((loc) => {
          const element = createMarkerElement(false);
          element.dataset.locationId = loc.id;

          element.addEventListener("click", (e) => {
            e.stopPropagation();
            // Конвертируем координаты маркера в пиксели для позиционирования попапа
            const pixelCoords = map.worldToPage(loc.coordinates);
            popupPositionRef.current = {
              x: pixelCoords[0],
              y: pixelCoords[1],
            };
            onMarkerClick(loc);
          });

          return {
            coordinates: loc.coordinates,
            element,
          };
        });

        // Создаём кластеризатор с кастомным рендером кластеров
        const clusterer = new YMapClusterer({
          method: clusterByGrid({ gridSize: 64 }),
          features: markerElements.map((m) => ({
            type: "Feature" as const,
            geometry: {
              type: "Point" as const,
              coordinates: m.coordinates,
            },
            properties: {
              element: m.element,
            },
          })),
          cluster: (cluster: any) => {
            const coords = cluster.coordinates;
            const points = cluster.features;
            const element = createMarkerElement(true, points.length);

            element.addEventListener("click", () => {
              // Плавный зум к границам точек кластера
              const clusterCoords = points.map(
                (p: any) => p.geometry.coordinates as [number, number],
              );
              const bounds = getBoundsFromCoords(clusterCoords);

              map.setLocation({
                bounds: {
                  north: bounds.north,
                  south: bounds.south,
                  east: bounds.east,
                  west: bounds.west,
                },
                duration: 400,
              });
            });

            return {
              coordinates: coords,
              element,
            };
          },
        });

        map.addChild(clusterer);
        clustererRef.current = clusterer;
      } catch (error) {
        console.error("Failed to update markers:", error);
      }
    };

    updateMarkers();

    return () => {
      isMounted = false;
      if (clustererRef.current && map) {
        try {
          map.removeChild(clustererRef.current);
        } catch {
          // ignore
        }
        clustererRef.current = null;
      }
    };
  }, [locations, onMarkerClick]);

  // ========================
  // 4. Позиционирование попапа
  // ========================
  // Отслеживаем положение маркера и перемещаем попап
  useEffect(() => {
    if (!selectedLocation || !popupRef.current || !mapRef.current) return;

    const map = mapRef.current;
    const popupEl = popupRef.current;

    const updatePopupPosition = () => {
      const pixelCoords = map.worldToPage(selectedLocation.coordinates);
      if (popupEl) {
        popupEl.style.left = `${pixelCoords[0]}px`;
        popupEl.style.top = `${pixelCoords[1] - 16}px`; // немного выше маркера
      }
    };

    updatePopupPosition();

    // Обновляем позицию при перемещении/зуме карты
    const removeListener = map.on("update", updatePopupPosition);

    return () => {
      if (removeListener) removeListener();
    };
  }, [selectedLocation]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Loader */}
      {(loadStatus === "idle" || loadStatus === "loading") && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-10">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Загрузка карты...
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {loadStatus === "error" && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-10">
          <div className="text-center px-6">
            <svg
              className="w-12 h-12 text-red-400 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Не удалось загрузить карту. Проверьте подключение к интернету.
            </p>
          </div>
        </div>
      )}

      {/* Map container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Custom popup — рендерится поверх карты в абсолютных координатах */}
      {selectedLocation && (
        <div
          ref={popupRef}
          className="absolute z-20 pointer-events-none"
          style={{
            left: popupPositionRef.current.x,
            top: popupPositionRef.current.y,
          }}
        >
          <div className="pointer-events-auto">
            <CustomPopup
              location={selectedLocation}
              onClose={() => onMarkerClick(selectedLocation)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default YandexMap;
