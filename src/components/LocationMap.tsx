import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Users, Calendar, RefreshCcw } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useApi } from '@/hooks/useApi';
import { useSocket } from '@/hooks/useSocket';

// Hook for fetching location map data
export const useLocationMapData = () => {
  return useApi<any[]>('/api/bookings/locations');
};

interface LocationMapProps {
  className?: string;
}

const LocationMap: React.FC<LocationMapProps> = ({ className }) => {
  const { data: locationData, loading, error, refetch } = useLocationMapData();
  const { recentBookings } = useSocket(); // For real-time updates
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [cityMonthlyData, setCityMonthlyData] = useState<any[]>([]);
  const [loadingMonthly, setLoadingMonthly] = useState(false);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  // Get Mapbox token from environment
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

  // Function to fetch monthly breakdown for a city
  const fetchCityMonthlyData = async (cityName: string) => {
    setLoadingMonthly(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/city/${encodeURIComponent(cityName)}/monthly`);
      if (response.ok) {
        const monthlyData = await response.json();
        setCityMonthlyData(monthlyData);
      } else {
        console.error('Failed to fetch monthly data');
        setCityMonthlyData([]);
      }
    } catch (error) {
      console.error('Error fetching monthly data:', error);
      setCityMonthlyData([]);
    } finally {
      setLoadingMonthly(false);
    }
  };

  // Initialize map
  useEffect(() => {
    if (mapboxToken && mapContainer.current && !map.current && locationData && locationData.length > 0) {
      initializeMap();
    }
  }, [mapboxToken, locationData]);

  // Update markers when location data changes or when new bookings come in
  useEffect(() => {
    if (map.current && locationData && locationData.length > 0) {
      updateMarkers();
    }
  }, [locationData, recentBookings]);

  // Handle window resize for responsive map view
  useEffect(() => {
    const handleResize = () => {
      if (map.current) {
        const isMobile = window.innerWidth < 768;
        const mapConfig = isMobile 
          ? { zoom: 4.0, center: [-118, 50] as [number, number] } // Focus on Vancouver and Calgary for mobile
          : { zoom: 3.6, center: [-96, 47] as [number, number] }; // Full view for desktop
        
        map.current.flyTo({
          center: mapConfig.center,
          zoom: mapConfig.zoom,
          duration: 1000
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const initializeMap = () => {
    if (!mapboxToken || !mapContainer.current || !locationData) return;

    try {
      mapboxgl.accessToken = mapboxToken;

      // Responsive map settings
      const isMobile = window.innerWidth < 768;
      const mapConfig = isMobile 
        ? { zoom: 4.0, center: [-118, 50] as [number, number] } // Focus on Vancouver and Calgary for mobile
        : { zoom: 3.6, center: [-96, 47] as [number, number] }; // Full view for desktop
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v10',
        zoom: mapConfig.zoom,
        center: mapConfig.center,
        pitch: 30,
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl(),
        'top-right'
      );

      map.current.on('load', () => {
        updateMarkers();
      });

    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  const updateMarkers = () => {
    if (!map.current || !locationData) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add markers for each city with real data
    locationData.forEach(city => {
      // Create marker element with real booking count
      const markerEl = document.createElement('div');
      markerEl.className = 'custom-marker';
      
      // Calculate marker size based on booking count (relative)
      const maxBookings = Math.max(...locationData.map(c => c.bookings));
      const minSize = 24;
      const maxSize = 48;
      const size = minSize + ((city.bookings / maxBookings) * (maxSize - minSize));
      
      // Determine color based on recent activity
      const isActive = city.recentBookings > 0;
      const colorClass = isActive 
        ? 'from-green-500 to-green-600 ring-green-400/50' 
        : 'from-blue-500 to-blue-600 ring-blue-400/50';

      markerEl.innerHTML = `
        <div class="relative">
          <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg cursor-pointer transform hover:scale-110 transition-all duration-200 ring-2 ring-blue-400/50">
            <span class="text-white text-xs font-bold">${city.bookings > 999 ? Math.floor(city.bookings / 1000) + 'k' : city.bookings}</span>
          </div>
          <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-l-transparent border-r-transparent border-t-blue-500"></div>
        </div>
      `;

      // Add marker to map
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([city.lng, city.lat])
        .addTo(map.current);

      markers.current.push(marker);

      // Add click event
      markerEl.addEventListener('click', () => {
        setSelectedCity(city);
        fetchCityMonthlyData(city.city);
        map.current.flyTo({
          center: [city.lng, city.lat],
          zoom: 10,
          duration: 2000
        });
      });

      // Add popup on hover
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false
      }).setHTML(`
        <div class="text-center p-2">
          <h3 class="font-bold text-gray-900">${city.city}</h3>
          <p class="text-sm text-gray-600">${city.bookings.toLocaleString()} bookings</p>
        </div>
      `);

      markerEl.addEventListener('mouseenter', () => {
        popup.setLngLat([city.lng, city.lat]).addTo(map.current);
      });

      markerEl.addEventListener('mouseleave', () => {
        popup.remove();
      });
    });
  };

  if (error) {
    return (
      <Card className={`p-6 bg-gradient-card shadow-card border-border ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-semibold text-foreground">Global Booking Map</h3>
          </div>
          <button
            onClick={() => refetch()}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            title="Refresh data"
          >
            <RefreshCcw className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="text-center py-8 bg-secondary/30 rounded-lg border border-border/50">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground mb-2">Failed to load map data</p>
          <button
            onClick={() => refetch()}
            className="mt-2 text-sm text-primary hover:underline font-medium"
          >
            Try again
          </button>
        </div>
      </Card>
    );
  }

  if (!mapboxToken) {
    return (
      <Card className={`p-6 bg-gradient-card shadow-card border-border ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-semibold text-foreground">Global Booking Map</h3>
          </div>
        </div>
        <div className="text-center py-8 bg-secondary/30 rounded-lg border border-border/50">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">Mapbox token not configured</p>
          <p className="text-sm text-muted-foreground mt-1">Please add VITE_MAPBOX_TOKEN to environment</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 bg-gradient-card shadow-card border-border ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-semibold text-foreground">Global Booking Map</h3>
          {loading && <span className="text-xs text-muted-foreground">Loading...</span>}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
            {locationData?.length || 0} Cities
          </Badge>
          <button
            onClick={() => refetch()}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            title="Refresh data"
          >
            <RefreshCcw className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading && !locationData ? (
        <div className="h-96 flex items-center justify-center bg-secondary/30 rounded-lg">
          <div className="flex items-center gap-2">
            <RefreshCcw className="w-5 h-5 animate-spin text-primary" />
            <span className="text-muted-foreground">Loading map data...</span>
          </div>
        </div>
      ) : locationData && locationData.length === 0 ? (
        <div className="h-96 flex items-center justify-center bg-secondary/30 rounded-lg">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No location data available</p>
            <p className="text-sm text-muted-foreground mt-1">Check back later for updates</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Map container */}
          <div className="relative">
            <div ref={mapContainer} className="w-full h-96 rounded-lg overflow-hidden bg-secondary/30" />
            
            {/* Loading overlay for refresh */}
            {loading && locationData && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <div className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg shadow-lg">
                  <RefreshCcw className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm text-foreground">Refreshing data...</span>
                </div>
              </div>
            )}
            
            {/* Reset button */}
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 left-2"
              onClick={() => {
                if (map.current) {
                  const isMobile = window.innerWidth < 768;
                  const resetConfig = isMobile 
                    ? { zoom: 4.0, center: [-118, 50] as [number, number] } // Focus on Vancouver and Calgary for mobile
                    : { zoom: 3.6, center: [-96, 47] as [number, number] }; // Full view for desktop
                  
                  map.current.flyTo({
                    center: resetConfig.center,
                    zoom: resetConfig.zoom,
                    duration: 2000
                  });
                  setSelectedCity(null);
                }
              }}
            >
              Reset View
            </Button>

          </div>

          {/* City details */}
          {selectedCity && (
            <div className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-6 h-6 text-primary" />
                <h4 className="text-xl font-bold text-foreground">{selectedCity.city}</h4>
              </div>
              
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Total bookings */}
                <div className="text-center lg:text-left p-4 bg-background/50 rounded-lg backdrop-blur-sm flex-shrink-0">
                  <p className="text-3xl font-bold text-primary mb-1">{selectedCity.bookings.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">Total Bookings</p>
                </div>
                
                {/* Monthly breakdown - compact horizontal */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">Last 6 Months</span>
                    {loadingMonthly && <RefreshCcw className="w-4 h-4 animate-spin text-primary" />}
                  </div>
                  
                  {loadingMonthly ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Loading monthly data...</span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {cityMonthlyData.map((month, index) => (
                        <div key={index} className="text-center px-3 py-2 bg-background/30 rounded-lg border border-border/30 min-w-[70px]">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">{month.month}</p>
                          <p className="text-lg font-bold text-foreground">{month.bookings}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* City list */}
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity duration-300 ${loading ? 'opacity-75' : 'opacity-100'}`}>
            {locationData?.map(city => (
              <div 
                key={city.city} 
                className={`group flex items-center justify-between p-5 bg-gradient-to-r from-card to-card/80 rounded-xl border border-border/50 shadow-sm hover:shadow-md hover:shadow-primary/5 transition-all duration-300 hover:scale-[1.02] hover:border-primary/20 backdrop-blur-sm cursor-pointer ${
                  selectedCity?.city === city.city ? 'bg-secondary/70 ring-1 ring-primary' : ''
                }`}
                onClick={() => {
                  setSelectedCity(city);
                  fetchCityMonthlyData(city.city);
                  if (map.current) {
                    map.current.flyTo({
                      center: [city.lng, city.lat],
                      zoom: 10,
                      duration: 2000
                    });
                  }
                }}
              >
                <div>
                  <h4 className="font-semibold text-foreground">{city.city}</h4>
                  <p className="text-sm text-muted-foreground">
                    {city.bookings.toLocaleString()} bookings
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default LocationMap;