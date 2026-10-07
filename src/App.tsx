import { useState, useCallback } from "react";
import { locationsData } from "./data/locationsData";
import { useMapFilters } from "./hooks/useMapFilters";
import { useWindowSize } from "./hooks/useWindowSize";
import { useFilterOptions } from "./features/filters/useFilterOptions";
import FilterSidebar from "./features/filters/FilterSidebar";
import MobileFilterDrawer from "./features/filters/MobileFilterDrawer";
import YandexMap from "./features/map/YandexMap";
import LanguageSwitch from "./components/LanguageSwitch";
import type { IProjectLocation } from "./types/map.types";
import type { FilterGroupKey } from "./types/filter.types";

function App() {
  const [selectedLocation, setSelectedLocation] =
    useState<IProjectLocation | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const { isMobile } = useWindowSize();

  const {
    filterState,
    filteredLocations,
    totalCount,
    filteredCount,
    setFilter,
    setSearchQuery,
    resetFilters,
    language,
    toggleLanguage,
  } = useMapFilters(locationsData);

  const availableOptions = useFilterOptions(locationsData);

  const handleMarkerClick = useCallback((location: IProjectLocation) => {
    setSelectedLocation((prev) => (prev?.id === location.id ? null : location));
  }, []);

  const handleFilterChange = useCallback(
    (group: FilterGroupKey, value: string) => {
      setFilter(group, value);
    },
    [setFilter],
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Desktop sidebar */}
      {!isMobile && (
        <FilterSidebar
          filterState={filterState}
          onFilterChange={handleFilterChange}
          onSearchChange={setSearchQuery}
          onReset={resetFilters}
          availableOptions={availableOptions}
          totalCount={totalCount}
          filteredCount={filteredCount}
        />
      )}

      {/* Map area */}
      <div className="flex-1 relative">
        {/* Language switch */}
        <div className="absolute top-4 right-4 z-30">
          <LanguageSwitch language={language} onToggle={toggleLanguage} />
        </div>

        {/* Map component */}
        <YandexMap
          locations={filteredLocations}
          onMarkerClick={handleMarkerClick}
          selectedLocation={selectedLocation}
          className="w-full h-full"
        />

        {/* Mobile filter button */}
        {isMobile && (
          <>
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-5 py-3 rounded-full shadow-lg transition-all duration-200"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <span className="text-sm font-medium">
                Фильтр ({filteredCount})
              </span>
            </button>

            <MobileFilterDrawer
              isOpen={isMobileFilterOpen}
              onClose={() => setIsMobileFilterOpen(false)}
              filterState={filterState}
              onFilterChange={handleFilterChange}
              onSearchChange={setSearchQuery}
              onReset={resetFilters}
              availableOptions={availableOptions}
              totalCount={totalCount}
              filteredCount={filteredCount}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
