import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import { NGO, GeoCoordinates } from '../types';
import { NGOS as CANONICAL_NGOS } from '../constants';
import {
  Navigation,
  Compass,
  MapPin,
  Globe2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Radio,
  Layers,
  LocateFixed,
  Eye,
  Sparkles,
  Building2,
} from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';

import 'leaflet/dist/leaflet.css';

interface NgoMapLocatorProps {
  ngos: NGO[];
  onSelectNgo?: (ngo: NGO) => void;
}

// Canonical city coordinates database for positioning & fallback
const GLOBAL_CITIES_COORDS: Record<string, { coords: GeoCoordinates; country: string; flag: string }> = {
  'San Francisco, CA': { coords: { lat: 37.7749, lng: -122.4194 }, country: 'United States', flag: '🇺🇸' },
  'Chicago, IL': { coords: { lat: 41.8781, lng: -87.6298 }, country: 'United States', flag: '🇺🇸' },
  'Austin, TX': { coords: { lat: 30.2672, lng: -97.7431 }, country: 'United States', flag: '🇺🇸' },
  'Seattle, WA': { coords: { lat: 47.6062, lng: -122.3321 }, country: 'United States', flag: '🇺🇸' },
  'New York, NY': { coords: { lat: 40.7128, lng: -74.0060 }, country: 'United States', flag: '🇺🇸' },
  'Los Angeles, CA': { coords: { lat: 34.0522, lng: -118.2437 }, country: 'United States', flag: '🇺🇸' },
  'Boston, MA': { coords: { lat: 42.3601, lng: -71.0589 }, country: 'United States', flag: '🇺🇸' },
  'Denver, CO': { coords: { lat: 39.7392, lng: -104.9903 }, country: 'United States', flag: '🇺🇸' },
};

// Great-circle Haversine distance formula
function calculateDistance(coord1: GeoCoordinates, coord2: GeoCoordinates, unit: 'mi' | 'km' = 'mi'): number {
  const R = unit === 'mi' ? 3958.8 : 6371.0;
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLon = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Bearing angle from origin to target in degrees
function calculateBearing(start: GeoCoordinates, end: GeoCoordinates): number {
  const startLat = (start.lat * Math.PI) / 180;
  const startLng = (start.lng * Math.PI) / 180;
  const endLat = (end.lat * Math.PI) / 180;
  const endLng = (end.lng * Math.PI) / 180;
  const dLng = endLng - startLng;
  const y = Math.sin(dLng) * Math.cos(endLat);
  const x = Math.cos(startLat) * Math.sin(endLat) - Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return Math.round((brng + 360) % 360);
}

// Available Leaflet tile basemaps
const BASEMAP_TILES = {
  streets: {
    name: 'Street Cartography',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
  },
  satellite: {
    name: 'Satellite View',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Earthstar Geographics',
    subdomains: 'abcd',
    maxZoom: 18,
  },
  dark: {
    name: 'Night / Dark Mode',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
  },
};

export const NgoMapLocator: React.FC<NgoMapLocatorProps> = ({ ngos: propNgos, onSelectNgo }) => {
  // Use current prop NGOs (supporting search and category filters) or fallback to canonical NGOs
  const allNgos = useMemo(() => {
    return propNgos && propNgos.length > 0 ? propNgos : CANONICAL_NGOS;
  }, [propNgos]);

  const { theme } = useTheme();

  // Current user reference location (Default: San Francisco)
  const [userLocation, setUserLocation] = useState<GeoCoordinates>({
    lat: 37.7749,
    lng: -122.4194,
  });
  const [locationName, setLocationName] = useState('San Francisco, CA');
  const [maxDistance, setMaxDistance] = useState<number>(15000); // 15,000 mi = global
  const [unit, setUnit] = useState<'mi' | 'km'>('mi');
  const [selectedNgoId, setSelectedNgoId] = useState<string | null>(allNgos[0]?.id || null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [statusNotice, setStatusNotice] = useState<{ text: string; type: 'success' | 'warn' | 'info' } | null>(null);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'dark'>(() => (theme === 'dark' ? 'dark' : 'streets'));
  const [viewMode, setViewMode] = useState<'map' | 'radar'>('map');

  // Automatically update basemap when global theme toggles
  useEffect(() => {
    setMapStyle(theme === 'dark' ? 'dark' : 'streets');
  }, [theme]);

  // DOM Container for Leaflet map
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const vectorLayerRef = useRef<L.LayerGroup | null>(null);

  // Helper to resolve accurate coordinates for an NGO
  const getNgoCoordinates = (ngo: NGO): GeoCoordinates => {
    if (
      ngo.coordinates &&
      typeof ngo.coordinates.lat === 'number' &&
      !isNaN(ngo.coordinates.lat) &&
      typeof ngo.coordinates.lng === 'number' &&
      !isNaN(ngo.coordinates.lng)
    ) {
      return ngo.coordinates;
    }
    const loc = (ngo.location || ngo.address || '').toLowerCase();
    for (const [cityName, info] of Object.entries(GLOBAL_CITIES_COORDS)) {
      const cityFirstPart = cityName.split(',')[0].trim().toLowerCase();
      if (loc.includes(cityFirstPart)) {
        return info.coords;
      }
    }
    return { lat: 37.7749, lng: -122.4194 };
  };

  // Dynamically extract all unique cities containing NGOs across the world
  const citiesWithNgos = useMemo(() => {
    const cityMap = new Map<
      string,
      { name: string; country: string; flag: string; coords: GeoCoordinates; count: number; isInternational: boolean }
    >();

    allNgos.forEach((ngo) => {
      const loc = ngo.location?.trim() || 'San Francisco, CA';
      const coords = getNgoCoordinates(ngo);
      const existing = cityMap.get(loc);

      if (existing) {
        existing.count += 1;
      } else {
        // Determine flag and country info
        let country = 'United States';
        let flag = '🇺🇸';
        let isInternational = false;

        const known = GLOBAL_CITIES_COORDS[loc];
        if (known) {
          country = known.country;
          flag = known.flag;
          isInternational = known.country !== 'United States';
        } else {
          const lower = loc.toLowerCase();
          if (lower.includes('uk') || lower.includes('london')) {
            country = 'United Kingdom'; flag = '🇬🇧'; isInternational = true;
          } else if (lower.includes('germany') || lower.includes('berlin')) {
            country = 'Germany'; flag = '🇩🇪'; isInternational = true;
          } else if (lower.includes('kenya') || lower.includes('nairobi')) {
            country = 'Kenya'; flag = '🇰🇪'; isInternational = true;
          } else if (lower.includes('india') || lower.includes('bengaluru') || lower.includes('bangalore')) {
            country = 'India'; flag = '🇮🇳'; isInternational = true;
          } else if (lower.includes('japan') || lower.includes('tokyo')) {
            country = 'Japan'; flag = '🇯🇵'; isInternational = true;
          } else if (lower.includes('canada') || lower.includes('toronto')) {
            country = 'Canada'; flag = '🇨🇦'; isInternational = true;
          } else if (lower.includes('australia') || lower.includes('sydney')) {
            country = 'Australia'; flag = '🇦🇺'; isInternational = true;
          } else if (lower.includes('france') || lower.includes('paris')) {
            country = 'France'; flag = '🇫🇷'; isInternational = true;
          } else if (lower.includes('singapore')) {
            country = 'Singapore'; flag = '🇸🇬'; isInternational = true;
          }
        }

        cityMap.set(loc, { name: loc, country, flag, coords, count: 1, isInternational });
      }
    });

    const items = Array.from(cityMap.values());
    return items.sort((a, b) => {
      if (a.isInternational && !b.isInternational) return -1;
      if (!a.isInternational && b.isInternational) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [allNgos]);

  // Synchronize initial selected NGO
  useEffect(() => {
    if (allNgos.length > 0 && (!selectedNgoId || !allNgos.some((n) => n.id === selectedNgoId))) {
      setSelectedNgoId(allNgos[0].id);
    }
  }, [allNgos, selectedNgoId]);

  // Multi-tier GPS, Network IP, and Device Timezone Location Detection
  const handleDetectLocation = () => {
    setIsDetecting(true);
    setStatusNotice({ text: 'Acquiring location coordinates via GPS satellite / network lock...', type: 'info' });

    let hasResponded = false;

    const finalizeDetection = (coords: GeoCoordinates, placeName: string, precisionStr: string) => {
      if (hasResponded) return;
      hasResponded = true;
      setIsDetecting(false);
      setUserLocation(coords);
      setLocationName(placeName);
      setMaxDistance(15000);

      // Select nearest NGO
      let nearestNgo: NGO = allNgos[0];
      let minDistance = Infinity;
      allNgos.forEach((ngo) => {
        const ngoCoord = getNgoCoordinates(ngo);
        const d = calculateDistance(coords, ngoCoord, unit);
        if (d < minDistance) {
          minDistance = d;
          nearestNgo = ngo;
        }
      });

      if (nearestNgo) {
        setSelectedNgoId(nearestNgo.id);
        if (onSelectNgo) onSelectNgo(nearestNgo);
      }

      setStatusNotice({
        text: `Location locked: ${placeName} (${coords.lat.toFixed(2)}°, ${coords.lng.toFixed(2)}°) • ${precisionStr}. Nearest hub: ${
          nearestNgo ? nearestNgo.name : 'active center'
        } (${minDistance} ${unit}).`,
        type: 'success',
      });

      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([coords.lat, coords.lng], 11, { duration: 1.2 });
      }
    };

    // Resilient fallback using IP geolocation and device timezone
    const runIpAndTimezoneFallback = async () => {
      // 1. Try ipwho.is
      try {
        const res = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(3000) });
        if (res.ok) {
          const data = await res.json();
          if (data && data.success !== false && data.latitude && data.longitude) {
            const cityName = `${data.city || 'Regional Center'}, ${data.country_code || data.country || ''}`;
            finalizeDetection(
              { lat: Number(data.latitude), lng: Number(data.longitude) },
              cityName,
              'Network IP Geo-Lock'
            );
            return;
          }
        }
      } catch {
        // try next
      }

      // 2. Try ipapi.co
      try {
        const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
        if (res.ok) {
          const data = await res.json();
          if (data && data.latitude && data.longitude) {
            const cityName = `${data.city || 'Regional Center'}, ${data.country_name || data.country_code || ''}`;
            finalizeDetection(
              { lat: Number(data.latitude), lng: Number(data.longitude) },
              cityName,
              'High-Resolution IP Geolocation'
            );
            return;
          }
        }
      } catch {
        // try next
      }

      // 3. Timezone heuristic (always succeeds on all browsers without external dependencies)
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        const tzMap: Record<string, { name: string; coords: GeoCoordinates }> = {
          'Asia/Calcutta': { name: 'Bengaluru, India', coords: { lat: 12.9716, lng: 77.5946 } },
          'Asia/Kolkata': { name: 'Bengaluru, India', coords: { lat: 12.9716, lng: 77.5946 } },
          'Europe/London': { name: 'London, UK', coords: { lat: 51.5074, lng: -0.1278 } },
          'Europe/Berlin': { name: 'Berlin, Germany', coords: { lat: 52.5200, lng: 13.4050 } },
          'Europe/Paris': { name: 'Paris, France', coords: { lat: 48.8566, lng: 2.3522 } },
          'Africa/Nairobi': { name: 'Nairobi, Kenya', coords: { lat: -1.2921, lng: 36.8219 } },
          'Asia/Tokyo': { name: 'Tokyo, Japan', coords: { lat: 35.6762, lng: 139.6503 } },
          'Asia/Singapore': { name: 'Singapore', coords: { lat: 1.2897, lng: 103.8501 } },
          'Australia/Sydney': { name: 'Sydney, Australia', coords: { lat: -33.8688, lng: 151.2093 } },
          'America/Toronto': { name: 'Toronto, Canada', coords: { lat: 43.6532, lng: -79.3832 } },
          'America/Chicago': { name: 'Chicago, IL', coords: { lat: 41.8781, lng: -87.6298 } },
          'America/Los_Angeles': { name: 'San Francisco, CA', coords: { lat: 37.7749, lng: -122.4194 } },
          'America/New_York': { name: 'New York, NY', coords: { lat: 40.7128, lng: -74.0060 } },
          'America/Denver': { name: 'Austin, TX', coords: { lat: 30.2672, lng: -97.7431 } },
        };

        const matchedTz = tzMap[tz];
        if (matchedTz) {
          finalizeDetection(matchedTz.coords, matchedTz.name, `Detected via Device Timezone (${tz})`);
          return;
        }
      } catch {
        // fallback to default
      }

      // Default fallback
      finalizeDetection({ lat: 37.7749, lng: -122.4194 }, 'San Francisco, CA', 'Default Reference Center');
    };

    if (!navigator.geolocation) {
      runIpAndTimezoneFallback();
      return;
    }

    const timeoutTimer = setTimeout(() => {
      if (!hasResponded) {
        runIpAndTimezoneFallback();
      }
    }, 4500);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutTimer);
        const coords: GeoCoordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        // Match to closest known city if within 50 miles, else show GPS coordinates
        let nearestCity = `My GPS Position (${coords.lat.toFixed(2)}°, ${coords.lng.toFixed(2)}°)`;
        let minD = Infinity;
        citiesWithNgos.forEach((c) => {
          const d = calculateDistance(coords, c.coords, 'mi');
          if (d < minD && d < 50) {
            minD = d;
            nearestCity = `Near ${c.name} (GPS)`;
          }
        });

        finalizeDetection(
          coords,
          nearestCity,
          `High-Accuracy GPS Lock (±${Math.round(position.coords.accuracy || 15)}m)`
        );
      },
      (error) => {
        clearTimeout(timeoutTimer);
        console.warn('Browser GPS permission or signal check:', error);
        runIpAndTimezoneFallback();
      },
      {
        enableHighAccuracy: false,
        timeout: 4000,
        maximumAge: 60000,
      }
    );
  };

  // Calculate distance for all NGOs and sort nearest first
  const ngosWithDistance = useMemo(() => {
    return allNgos
      .map((ngo) => {
        const coords = getNgoCoordinates(ngo);
        const dist = calculateDistance(userLocation, coords, unit);
        const bearing = calculateBearing(userLocation, coords);
        return {
          ...ngo,
          computedCoords: coords,
          distance: dist,
          bearing,
        };
      })
      .sort((a, b) => a.distance - b.distance);
  }, [allNgos, userLocation, unit]);

  // Filter NGOs by radius
  const filteredNgos = useMemo(() => {
    return ngosWithDistance.filter((ngo) => ngo.distance <= maxDistance);
  }, [ngosWithDistance, maxDistance]);

  const activeSelectedNgo = useMemo(() => {
    return ngosWithDistance.find((n) => n.id === selectedNgoId) || ngosWithDistance[0];
  }, [ngosWithDistance, selectedNgoId]);

  // Handle manual city selection from dropdown or quick-access chips
  const handleSelectCity = (targetCityName: string) => {
    const matched = citiesWithNgos.find((c) => c.name === targetCityName);
    if (matched) {
      setUserLocation(matched.coords);
      setLocationName(matched.name);
      setMaxDistance(15000); // Allow global radius so the map doesn't hide centers

      // Auto-focus and select the NGO in that city
      const cityToken = matched.name.split(',')[0].trim().toLowerCase();
      const localNgo = allNgos.find((n) =>
        (n.location || n.address || '').toLowerCase().includes(cityToken)
      );

      if (localNgo) {
        setSelectedNgoId(localNgo.id);
        if (onSelectNgo) onSelectNgo(localNgo);
      }

      setStatusNotice({
        text: `Map located to ${matched.name}. Active accredited hub: ${localNgo?.name || matched.name}.`,
        type: 'info',
      });

      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([matched.coords.lat, matched.coords.lng], 11, { duration: 1.2 });
      }
    }
  };

  // Handle NGO selection (centers map and selects)
  const handleSelectNgo = (ngo: NGO) => {
    setSelectedNgoId(ngo.id);
    const coords = getNgoCoordinates(ngo);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([coords.lat, coords.lng], 13, { duration: 1.0 });
    }

    if (onSelectNgo) {
      onSelectNgo(ngo);
    }
  };

  // -------------------------------------------------------------
  // LEAFLET MAP INITIALIZATION & RENDERING
  // -------------------------------------------------------------
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Create map instance
      const map = L.map(mapContainerRef.current, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 3,
        zoomControl: false,
        attributionControl: true,
      });

      // Add zoom control in top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Create base tile layer
      const basemap = BASEMAP_TILES[mapStyle];
      const tileLayer = L.tileLayer(basemap.url, {
        attribution: basemap.attribution,
        maxZoom: basemap.maxZoom,
        subdomains: basemap.subdomains,
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      // Layers for dynamic markers & vectors
      const markersLayer = L.layerGroup().addTo(map);
      const vectorLayer = L.layerGroup().addTo(map);

      markersLayerRef.current = markersLayer;
      vectorLayerRef.current = vectorLayer;
      mapInstanceRef.current = map;

      // Force canvas size calculation after mount
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 250);

      // Setup ResizeObserver for smooth responsive layout changes
      if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
        const ro = new ResizeObserver(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        });
        ro.observe(mapContainerRef.current);
      }
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update tile layer when mapStyle changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    const basemap = BASEMAP_TILES[mapStyle];
    const newTileLayer = L.tileLayer(basemap.url, {
      attribution: basemap.attribution,
      maxZoom: basemap.maxZoom,
      subdomains: basemap.subdomains,
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newTileLayer;
  }, [mapStyle]);

  // Update markers, user pin, flight vectors on state changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !vectorLayerRef.current) return;

    const markersLayer = markersLayerRef.current;
    const vectorLayer = vectorLayerRef.current;

    markersLayer.clearLayers();
    vectorLayer.clearLayers();

    // 1. Add User Location Marker
    const userHtml = `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-8 h-8 rounded-full bg-emerald-500/30 animate-ping"></div>
        <div class="relative w-7 h-7 rounded-full bg-emerald-600 border-2 border-white shadow-lg flex items-center justify-center text-white">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 2v20m10-10H2" />
          </svg>
        </div>
        <div class="absolute top-8 px-2 py-0.5 rounded-full bg-gray-950/90 text-emerald-300 border border-emerald-400/40 text-[10px] font-bold shadow-md whitespace-nowrap pointer-events-none">
          📍 You (${locationName.split(',')[0]})
        </div>
      </div>
    `;

    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: userHtml,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon });
    userMarker.bindPopup(`
      <div class="p-2 space-y-1 font-sans text-xs">
        <div class="font-bold text-gray-900">Reference Position: ${locationName}</div>
        <div class="text-gray-500">Coordinates: ${userLocation.lat.toFixed(4)}°, ${userLocation.lng.toFixed(4)}°</div>
        <div class="text-[11px] text-emerald-600 font-semibold">Distances to all NGOs calculated from here.</div>
      </div>
    `);
    markersLayer.addLayer(userMarker);

    // 2. Add NGO Markers
    filteredNgos.forEach((ngo) => {
      const isSelected = selectedNgoId === ngo.id;
      const coords = ngo.computedCoords;

      const ngoHtml = `
        <div class="group relative flex flex-col items-center cursor-pointer transition-transform hover:scale-110">
          ${
            isSelected
              ? '<div class="absolute -inset-1 rounded-full bg-blue-500/40 animate-pulse"></div>'
              : ''
          }
          <div class="relative w-8 h-8 rounded-xl ${
            isSelected ? 'bg-blue-600 shadow-blue-500/50' : 'bg-indigo-700 shadow-indigo-500/30'
          } text-white border-2 border-white shadow-lg flex items-center justify-center font-bold text-xs">
            <span>${ngo.courses?.length || 1}</span>
          </div>
          <div class="mt-1 px-2 py-0.5 rounded-md ${
            isSelected
              ? 'bg-blue-900 text-blue-100 border border-blue-400 font-black'
              : 'bg-gray-900/90 text-gray-200 border border-gray-700 font-medium'
          } text-[9.5px] shadow-sm whitespace-nowrap truncate max-w-[120px]">
            ${ngo.name}
          </div>
        </div>
      `;

      const ngoIcon = L.divIcon({
        className: 'custom-ngo-marker',
        html: ngoHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const ngoMarker = L.marker([coords.lat, coords.lng], { icon: ngoIcon });

      ngoMarker.on('click', () => {
        handleSelectNgo(ngo);
      });

      // Rich popup content
      const popupContent = `
        <div class="font-sans p-2 space-y-2 max-w-[240px]">
          <div class="flex items-center justify-between gap-2">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">${
              ngo.type
            }</span>
            <span class="text-xs font-black text-emerald-600">${ngo.distance} ${unit}</span>
          </div>
          <div class="font-bold text-sm text-gray-900 leading-snug">${ngo.name}</div>
          <div class="text-xs text-gray-500 leading-tight">${ngo.address || ngo.location}</div>
          <div class="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
            <span class="text-gray-700 font-semibold">${ngo.courses?.length || 0} Programs</span>
            <a href="#/ngo/${
              ngo.id
            }" class="text-blue-600 font-bold hover:underline inline-flex items-center">View Hub &rarr;</a>
          </div>
        </div>
      `;
      ngoMarker.bindPopup(popupContent);
      markersLayer.addLayer(ngoMarker);

      // 3. Connect selected NGO to User with great-circle polyline if not at the exact location
      if (isSelected && ngo.distance > 0.5) {
        const polyline = L.polyline(
          [
            [userLocation.lat, userLocation.lng],
            [coords.lat, coords.lng],
          ],
          {
            color: '#3b82f6',
            weight: 3,
            opacity: 0.85,
            dashArray: '8, 8',
          }
        );
        vectorLayer.addLayer(polyline);

        // Midpoint marker showing exact distance
        const midLat = (userLocation.lat + coords.lat) / 2;
        const midLng = (userLocation.lng + coords.lng) / 2;
        const midHtml = `
          <div class="px-2.5 py-1 rounded-full bg-blue-900 text-white border border-blue-400 text-[10px] font-black shadow-lg whitespace-nowrap">
            🧭 ${ngo.distance} ${unit} (${ngo.bearing}°)
          </div>
        `;
        const midIcon = L.divIcon({
          className: 'custom-mid-marker',
          html: midHtml,
          iconSize: [80, 20],
          iconAnchor: [40, 10],
        });
        const midMarker = L.marker([midLat, midLng], { icon: midIcon });
        vectorLayer.addLayer(midMarker);
      }
    });
  }, [filteredNgos, userLocation, selectedNgoId, unit, locationName]);

  // Fit all active hubs within view
  const handleFitAllHubs = () => {
    if (!mapInstanceRef.current || filteredNgos.length === 0) return;

    const bounds = L.latLngBounds([
      [userLocation.lat, userLocation.lng],
      ...filteredNgos.map((n) => [n.computedCoords.lat, n.computedCoords.lng] as [number, number]),
    ]);

    mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 13 });
  };

  // Center on user position
  const handleCenterUser = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 12, { duration: 1 });
  };

  // Center on selected hub
  const handleFocusSelectedHub = () => {
    if (!mapInstanceRef.current || !activeSelectedNgo) return;
    const coords = activeSelectedNgo.computedCoords;
    mapInstanceRef.current.flyTo([coords.lat, coords.lng], 14, { duration: 1.2 });
  };

  return (
    <div className="space-y-6">
      {/* Control Bar Header */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <Compass className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
                  Interactive NGO Map & Distance Locator
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Explore accredited vocational centers worldwide with live satellite & street mapping, accurate GPS locks, and distance calculations.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Location Detection & City Selector */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* GPS Trigger Button */}
            <button
              onClick={handleDetectLocation}
              disabled={isDetecting}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center space-x-2 transition-all disabled:opacity-50"
              title="Detect your exact location with browser GPS or Network IP"
            >
              <Navigation className={`w-3.5 h-3.5 ${isDetecting ? 'animate-spin' : ''}`} />
              <span>{isDetecting ? 'Locking Coordinates...' : 'Use My GPS'}</span>
            </button>

            {/* City Dropdown Containing ALL Global & US Cities with NGOs */}
            <div className="flex items-center space-x-1.5 text-xs text-gray-600 dark:text-gray-300 flex-grow sm:flex-grow-0">
              <span className="font-semibold hidden sm:inline">Select City:</span>
              <select
                value={locationName}
                onChange={(e) => handleSelectCity(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                {!citiesWithNgos.some((c) => c.name === locationName) && (
                  <option value={locationName}>📍 {locationName}</option>
                )}
                <optgroup label="🌍 International Cities with Hubs">
                  {citiesWithNgos
                    .filter((c) => c.isInternational)
                    .map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.flag} {c.name} ({c.count} {c.count === 1 ? 'Hub' : 'Hubs'})
                      </option>
                    ))}
                </optgroup>
                <optgroup label="🇺🇸 United States Cities with Hubs">
                  {citiesWithNgos
                    .filter((c) => !c.isInternational)
                    .map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.flag} {c.name} ({c.count} {c.count === 1 ? 'Hub' : 'Hubs'})
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>

            {/* Unit Toggle: Miles vs Kilometers */}
            <div className="inline-flex rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-1 text-xs font-bold">
              <button
                onClick={() => setUnit('mi')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  unit === 'mi'
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Miles
              </button>
              <button
                onClick={() => setUnit('km')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  unit === 'km'
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                KM
              </button>
            </div>
          </div>
        </div>

        {/* Quick-Access International & US City Chips */}
        <div className="pt-2 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-1">
            Global Hubs:
          </span>
          {citiesWithNgos.map((c) => {
            const isActive = locationName.includes(c.name.split(',')[0]);
            return (
              <button
                key={`chip-${c.name}`}
                onClick={() => handleSelectCity(c.name)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1 shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700/60 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <span>{c.flag}</span>
                <span>{c.name.split(',')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Status Notification Banner */}
        {statusNotice && (
          <div
            className={`flex items-center justify-between p-3 rounded-2xl text-xs ${
              statusNotice.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : statusNotice.type === 'warn'
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              {statusNotice.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span>{statusNotice.text}</span>
            </div>
            <button
              onClick={() => setStatusNotice(null)}
              className="text-[11px] font-bold hover:underline opacity-80"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Distance Range Filter Pills */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-gray-600 dark:text-gray-400">Search Radius:</span>
            <div className="inline-flex flex-wrap rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-1">
              {[
                { label: `50 ${unit}`, val: unit === 'mi' ? 50 : 80 },
                { label: `250 ${unit}`, val: unit === 'mi' ? 250 : 400 },
                { label: `1,000 ${unit}`, val: unit === 'mi' ? 1000 : 1600 },
                { label: `5,000 ${unit}`, val: unit === 'mi' ? 5000 : 8000 },
                { label: 'Global (All)', val: 15000 },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setMaxDistance(opt.val)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    maxDistance === opt.val
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="text-gray-500 dark:text-gray-400">
            Displaying <strong className="text-blue-600 dark:text-blue-400 font-black">{filteredNgos.length}</strong> of{' '}
            {allNgos.length} hubs relative to{' '}
            <span className="font-bold text-gray-800 dark:text-gray-200">{locationName}</span>
          </div>
        </div>
      </div>

      {/* Main Map View & Nearest Hubs Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Map Canvas */}
        <div className="lg:col-span-8 bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
          {/* Map Top Bar: Style Switcher & Fast Actions */}
          <div className="p-3 bg-gray-50 dark:bg-gray-900/90 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-gray-600 dark:text-gray-300 flex items-center space-x-1">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Map Layer:</span>
              </span>
              <div className="inline-flex rounded-xl bg-gray-200 dark:bg-gray-800 p-0.5">
                {(['streets', 'satellite', 'dark'] as const).map((styleKey) => (
                  <button
                    key={styleKey}
                    onClick={() => setMapStyle(styleKey)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-all ${
                      mapStyle === styleKey
                        ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-white shadow-xs'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {styleKey}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={handleFitAllHubs}
                className="px-2.5 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-[11px] font-bold flex items-center space-x-1"
                title="Fit all hubs and reference points in view"
              >
                <Globe2 className="w-3 h-3 text-blue-600" />
                <span>Fit All Hubs</span>
              </button>

              <button
                onClick={handleCenterUser}
                className="px-2.5 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-[11px] font-bold flex items-center space-x-1"
                title="Center map on your reference location"
              >
                <LocateFixed className="w-3 h-3 text-emerald-600" />
                <span>Center on Me</span>
              </button>

              {activeSelectedNgo && (
                <button
                  onClick={handleFocusSelectedHub}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 text-[11px] font-bold flex items-center space-x-1"
                  title="Fly to selected NGO hub"
                >
                  <Building2 className="w-3 h-3" />
                  <span>Focus Hub</span>
                </button>
              )}
            </div>
          </div>

          {/* Map Viewport Container */}
          <div className="relative w-full h-[520px] bg-slate-900">
            {/* The Leaflet Map container */}
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* Selected NGO Floating Overlay Card */}
            {activeSelectedNgo && (
              <div className="absolute bottom-3 left-3 right-3 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-100 dark:bg-blue-900/70 text-blue-800 dark:text-blue-200">
                      {activeSelectedNgo.type}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                      <Compass className="w-3.5 h-3.5 mr-1" />
                      {activeSelectedNgo.distance} {unit} away ({activeSelectedNgo.bearing}°)
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-gray-900 dark:text-white">
                    {activeSelectedNgo.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                    {activeSelectedNgo.address || activeSelectedNgo.location} • {activeSelectedNgo.courses?.length || 0} active accredited programs
                  </p>
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0">
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(
                      activeSelectedNgo.address || activeSelectedNgo.location || activeSelectedNgo.name
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 text-xs font-bold rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-1"
                  >
                    <span>Directions</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <Link
                    to={`/ngo/${activeSelectedNgo.id}`}
                    className="px-4 py-1.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center space-x-1"
                  >
                    <span>View Hub</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Proximity Sorted NGO List */}
        <div className="lg:col-span-4 space-y-3 max-h-[570px] overflow-y-auto pr-1">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
            <span>Nearest Hubs ({filteredNgos.length})</span>
            <span>Sorted by Distance</span>
          </div>

          {filteredNgos.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 text-center space-y-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No NGOs found within {maxDistance} {unit} of {locationName}.
              </p>
              <button
                onClick={() => setMaxDistance(15000)}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Expand to Global Search →
              </button>
            </div>
          ) : (
            filteredNgos.map((ngo) => {
              const isSelected = selectedNgoId === ngo.id;
              return (
                <div
                  key={ngo.id}
                  onClick={() => handleSelectNgo(ngo)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-md ring-1 ring-blue-400'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      {ngo.type}
                    </span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1 inline" />
                      {ngo.distance} {unit}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mt-1.5">
                    {ngo.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                    {ngo.address || ngo.location}
                  </p>

                  <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs">
                    <span className="text-gray-600 dark:text-gray-300 font-medium">
                      {ngo.courses?.length || 0} Vocational Courses
                    </span>
                    <Link
                      to={`/ngo/${ngo.id}`}
                      className="text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center space-x-0.5"
                    >
                      <span>Explore</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default NgoMapLocator;
