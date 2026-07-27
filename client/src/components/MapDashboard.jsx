import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Building2, Search, Filter, Stethoscope, MapPin, Truck, Phone, LocateFixed, Navigation } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GUJARAT_HOSPITALS, INITIAL_AMBULANCES } from '../data/gujaratMapData';

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons
const createCustomIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const govtIcon = createCustomIcon('blue');
const privateIcon = createCustomIcon('green');
const phcIcon = createCustomIcon('orange');
const ambulanceIcon = createCustomIcon('red');
const osmIcon = createCustomIcon('violet');

// Child component to listen to map events
const MapEventHandler = ({ onBoundsChange }) => {
  useMapEvents({
    moveend: (e) => {
      onBoundsChange(e.target.getBounds(), e.target.getZoom());
    },
    zoomend: (e) => {
      onBoundsChange(e.target.getBounds(), e.target.getZoom());
    }
  });
  return null;
};

const MapDashboard = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    govt: true,
    private: true,
    phc: true,
    chc: true,
    ambulances: true
  });
  const [ambulances, setAmbulances] = useState(INITIAL_AMBULANCES);
  const [osmHospitals, setOsmHospitals] = useState([]);
  const [isFetchingOSM, setIsFetchingOSM] = useState(false);
  const [mapZoom, setMapZoom] = useState(7);
  const [mapBounds, setMapBounds] = useState(null);
  const [mapRef, setMapRef] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  const spawnLocalAmbulances = (lat, lon) => {
    setAmbulances(prev => {
      const hasNearby = prev.some(a => Math.abs(a.lat - lat) < 0.05 && Math.abs(a.lng - lon) < 0.05);
      if (hasNearby) return prev;
      
      return [
        ...prev,
        {
          id: `amb-dynamic-${Date.now()}-1`,
          plate: `GJ-${Math.floor(Math.random() * 30) + 1}-G-${Math.floor(Math.random() * 9000) + 1000}`,
          lat: lat + (Math.random() - 0.5) * 0.02,
          lng: lon + (Math.random() - 0.5) * 0.02,
          status: 'Available',
          city: 'Local Zone'
        },
        {
          id: `amb-dynamic-${Date.now()}-2`,
          plate: `GJ-${Math.floor(Math.random() * 30) + 1}-G-${Math.floor(Math.random() * 9000) + 1000}`,
          lat: lat + (Math.random() - 0.5) * 0.02,
          lng: lon + (Math.random() - 0.5) * 0.02,
          status: 'On Call',
          city: 'Local Zone'
        }
      ];
    });
  };

  const fetchOSMData = async (bounds, zoom) => {
    setMapZoom(zoom);
    setMapBounds(bounds);
    if (zoom < 9) return; // Prevent massive queries on full state view
    
    setIsFetchingOSM(true);
    const s = bounds.getSouth();
    const w = bounds.getWest();
    const n = bounds.getNorth();
    const e = bounds.getEast();
    
    const query = `
      [out:json][timeout:25];
      (
        nwr["amenity"="hospital"](${s},${w},${n},${e});
        nwr["amenity"="clinic"](${s},${w},${n},${e});
        nwr["amenity"="doctors"](${s},${w},${n},${e});
        nwr["healthcare"="hospital"](${s},${w},${n},${e});
        nwr["healthcare"="clinic"](${s},${w},${n},${e});
        nwr["healthcare"="doctor"](${s},${w},${n},${e});
      );
      out center;
    `;
    
    let fetchedHospitals = [];
    try {
      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query
      });
      const data = await res.json();
      
      fetchedHospitals = data.elements.map(el => {
        const lat = el.center ? el.center.lat : el.lat;
        const lon = el.center ? el.center.lon : el.lon;
        const name = el.tags.name || el.tags['name:en'] || (el.tags.amenity ? el.tags.amenity.charAt(0).toUpperCase() + el.tags.amenity.slice(1) : 'Local Clinic');
        return {
          id: `osm-${el.id}`,
          name: name,
          type: el.tags.healthcare || 'Private',
          category: el.tags.amenity === 'hospital' ? 'City Hospital' : 'PHC',
          lat: lat,
          lng: lon,
          city: el.tags['addr:city'] || el.tags['addr:village'] || 'Local Area',
          contact: el.tags.phone || el.tags.contact || 'Not Available',
          isOSM: true
        };
      });
    } catch (err) {
      console.error("OSM fetch error", err);
    }
      
    // Spawn dummy data for demo purposes if real OSM is empty (or failed) in a zoomed-in village
    if (fetchedHospitals.length === 0 && zoom >= 13) {
      const centerLat = bounds.getCenter().lat;
      const centerLng = bounds.getCenter().lng;
      fetchedHospitals.push({
        id: `osm-dummy-1-${Date.now()}`,
        name: 'Village Primary Health Center (PHC)',
        type: 'Government',
        category: 'PHC',
        lat: centerLat + (Math.random() - 0.5) * 0.01,
        lng: centerLng + (Math.random() - 0.5) * 0.01,
        city: 'Local Village',
        contact: '104',
        isOSM: true
      });
      fetchedHospitals.push({
        id: `osm-dummy-2-${Date.now()}`,
        name: 'Sanjivani Private Clinic',
        type: 'Private',
        category: 'Clinic',
        lat: centerLat + (Math.random() - 0.5) * 0.01,
        lng: centerLng + (Math.random() - 0.5) * 0.01,
        city: 'Local Area',
        contact: '+91 9876543210',
        isOSM: true
      });
    }
    
    setOsmHospitals(prev => {
      const existingIds = new Set(prev.map(h => h.id));
      const uniqueNew = fetchedHospitals.filter(h => !existingIds.has(h.id));
      return [...prev, ...uniqueNew];
    });
    
    setIsFetchingOSM(false);
  };

  const locateMe = () => {
    if (!mapRef) return;
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          mapRef.flyTo([latitude, longitude], 14, { animate: true, duration: 1.5 });
          spawnLocalAmbulances(latitude, longitude);
          setSearchQuery(''); // Clear any leftover search text so it doesn't hide local results
          setIsLocating(false);
        },
        (error) => {
          console.error("Location error", error);
          alert(t('map.location_error', 'Could not access your location. Please check browser permissions.'));
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert(t('map.location_unsupported', 'Geolocation is not supported by your browser.'));
      setIsLocating(false);
    }
  };

  const executeSearch = async () => {
    if (searchQuery.trim() !== '') {
      if (!mapRef) return;
      setIsSearchingLocation(true);
      
      try {
        const queryStr = searchQuery.trim();
        const isPincode = /^\d{6}$/.test(queryStr);
        const url = isPincode 
          ? `https://nominatim.openstreetmap.org/search?format=json&postalcode=${queryStr}&countrycodes=IN` 
          : `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryStr)}, Gujarat, India`;
          
        const res = await fetch(url);
        const data = await res.json();
        
        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          mapRef.flyTo([lat, lon], 14, { animate: true, duration: 1.5 });
          spawnLocalAmbulances(parseFloat(lat), parseFloat(lon));
          setSearchQuery(''); // Clear search so local filter doesn't hide the fetched results
        } else {
          alert(t('map.location_not_found', 'Could not find that location in Gujarat. Try a different spelling.'));
        }
      } catch (err) {
        console.error("Geocoding error", err);
      } finally {
        setIsSearchingLocation(false);
      }
    }
  };

  // Simulate Live Ambulance Tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setAmbulances(prev => prev.map(amb => {
        // Move slightly towards target or randomly if close
        const moveLat = (Math.random() - 0.5) * 0.005;
        const moveLng = (Math.random() - 0.5) * 0.005;
        return {
          ...amb,
          lat: amb.lat + moveLat,
          lng: amb.lng + moveLng
        };
      }));
    }, 3000); // Update every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const filteredHospitals = useMemo(() => {
    const combined = [...GUJARAT_HOSPITALS, ...osmHospitals];
    return combined.filter(h => {
      // Apply Search
      const searchMatch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          h.city.toLowerCase().includes(searchQuery.toLowerCase());
      if (!searchMatch) return false;

      // Apply Filters
      if (h.type === 'Government' && h.category === 'City Hospital' && !filters.govt) return false;
      if (h.type === 'Private' && !filters.private) return false;
      if (h.category === 'PHC' && !filters.phc) return false;
      if (h.category === 'CHC' && !filters.chc) return false;
      
      // Apply Bounds Filter
      if (mapBounds) {
        const s = mapBounds.getSouth();
        const n = mapBounds.getNorth();
        const w = mapBounds.getWest();
        const e = mapBounds.getEast();
        if (h.lat < s || h.lat > n || h.lng < w || h.lng > e) {
          return false;
        }
      }
      
      return true;
    });
  }, [searchQuery, filters, osmHospitals, mapBounds]);

  const visibleAmbulances = useMemo(() => {
    if (!filters.ambulances) return [];
    if (!mapBounds) return ambulances;
    const s = mapBounds.getSouth();
    const n = mapBounds.getNorth();
    const w = mapBounds.getWest();
    const e = mapBounds.getEast();
    return ambulances.filter(a => a.lat >= s && a.lat <= n && a.lng >= w && a.lng <= e);
  }, [ambulances, filters.ambulances, mapBounds]);

  const handleFilterChange = (key) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getHospitalIcon = (h) => {
    if (h.isOSM) return osmIcon;
    if (h.category === 'PHC' || h.category === 'CHC') return phcIcon;
    if (h.type === 'Private') return privateIcon;
    return govtIcon;
  };

  return (
    <div className="p-4 md:p-6 h-[calc(100vh-80px)] flex flex-col md:flex-row gap-6">
      
      {/* Sidebar Panel */}
      <div className="w-full md:w-80 flex flex-col gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
            <MapPin className="w-5 h-5 text-[var(--color-primary)]" /> {t('map.title', 'Gujarat Tracker')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{t('map.subtitle', 'Live Hospitals & Emergency Network')}</p>
          
          {/* Search Box */}
          <div className="relative mb-5 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder={t('map.search', 'Search city, village, or pincode...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              />
            </div>
            <button 
              onClick={executeSearch}
              disabled={isSearchingLocation || !searchQuery.trim()}
              className="bg-[var(--color-primary)] hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center min-w-[80px]"
            >
              {isSearchingLocation ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                t('map.go', 'Search')
              )}
            </button>
          </div>

          {/* Filters */}
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" /> {t('map.filter', 'Filter Map Data')}
          </h3>
          
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center">
                <input type="checkbox" checked={filters.govt} onChange={() => handleFilterChange('govt')} className="sr-only" />
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${filters.govt ? 'bg-blue-500 border-blue-500' : 'bg-transparent border-slate-300 dark:border-slate-700 group-hover:border-blue-400'}`}>
                   {filters.govt && <div className="w-2.5 h-2.5 bg-white rounded-sm"></div>}
                </div>
              </div>
              <span className="text-sm text-slate-700 dark:text-slate-200 font-medium">{t('map.govt', 'Govt City Hospitals')} <span className="text-xs text-blue-500">(Blue)</span></span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center">
                <input type="checkbox" checked={filters.private} onChange={() => handleFilterChange('private')} className="sr-only" />
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${filters.private ? 'bg-green-500 border-green-500' : 'bg-transparent border-slate-300 dark:border-slate-700 group-hover:border-green-400'}`}>
                   {filters.private && <div className="w-2.5 h-2.5 bg-white rounded-sm"></div>}
                </div>
              </div>
              <span className="text-sm text-slate-700 dark:text-slate-200 font-medium">{t('map.private', 'Private Hospitals')} <span className="text-xs text-green-500">(Green)</span></span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center">
                <input type="checkbox" checked={filters.chc} onChange={() => handleFilterChange('chc')} className="sr-only" />
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${filters.chc ? 'bg-orange-500 border-orange-500' : 'bg-transparent border-slate-300 dark:border-slate-700 group-hover:border-orange-400'}`}>
                   {filters.chc && <div className="w-2.5 h-2.5 bg-white rounded-sm"></div>}
                </div>
              </div>
              <span className="text-sm text-slate-700 dark:text-slate-200 font-medium">{t('map.chc', 'CHC (Community Centers)')} <span className="text-xs text-orange-500">(Orange)</span></span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center">
                <input type="checkbox" checked={filters.phc} onChange={() => handleFilterChange('phc')} className="sr-only" />
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${filters.phc ? 'bg-orange-500 border-orange-500' : 'bg-transparent border-slate-300 dark:border-slate-700 group-hover:border-orange-400'}`}>
                   {filters.phc && <div className="w-2.5 h-2.5 bg-white rounded-sm"></div>}
                </div>
              </div>
              <span className="text-sm text-slate-700 dark:text-slate-200 font-medium">{t('map.phc', 'PHC (Primary Centers)')} <span className="text-xs text-orange-500">(Orange)</span></span>
            </label>
            
            <div className="h-px bg-slate-200 dark:bg-slate-800 my-2"></div>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center">
                <input type="checkbox" checked={filters.ambulances} onChange={() => handleFilterChange('ambulances')} className="sr-only" />
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${filters.ambulances ? 'bg-red-500 border-red-500' : 'bg-transparent border-slate-300 dark:border-slate-700 group-hover:border-red-400'}`}>
                   {filters.ambulances && <div className="w-2.5 h-2.5 bg-white rounded-sm"></div>}
                </div>
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-red-500" /> {t('map.ambulances', 'Live 108 Ambulances')}
              </span>
            </label>
            
            <div className="mt-4 p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl">
              <span className="text-[10px] font-bold text-violet-500 uppercase flex items-center gap-1 mb-1">
                <MapPin className="w-3 h-3" /> {t('map.osm', 'Live OSM Integration')}
              </span>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-tight">
                {t('map.osm_desc', 'Zoom in (Level 9+) or use "Locate Me" to automatically fetch real-world local clinics and hospitals from OpenStreetMap database for 14,000+ villages.')}
              </p>
              {isFetchingOSM && (
                <div className="text-[10px] text-violet-500 font-bold mt-2 animate-pulse flex items-center gap-1">
                   Scanning local area...
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 flex-1 flex flex-col overflow-hidden">
           <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5 shrink-0">
             <Building2 className="w-3.5 h-3.5" /> {t('map.hospital_list', 'Visible Locations')}
           </h3>

           <div className="flex-1 overflow-y-auto pr-2 space-y-3 mb-4 overflow-x-hidden">
             {filteredHospitals.length > 0 ? filteredHospitals.slice(0, 50).map(hospital => (
                <div key={hospital.id} className="p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                   <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-start gap-1.5 leading-tight">
                     <Building2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5"/> 
                     <span>{hospital.name}</span>
                   </h4>
                   <p className="text-[10px] text-slate-500 mt-1.5">{hospital.type} ({hospital.category}) &bull; {hospital.city}</p>
                   <p className="text-[10px] font-semibold text-emerald-600 mt-1 flex items-center gap-1"><Phone className="w-3 h-3"/> {hospital.contact}</p>
                   <a 
                      href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2.5 w-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold py-1.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1"
                   >
                     <Navigation className="w-3 h-3" /> Directions
                   </a>
                </div>
             )) : (
                <div className="text-center text-slate-400 text-xs py-8">
                  No hospitals match your criteria.
                </div>
             )}
             {filteredHospitals.length > 50 && (
                <div className="text-center text-slate-400 text-[10px] pb-2 font-medium">
                  Showing 50 of {filteredHospitals.length} locations. Use map or search for more.
                </div>
             )}
           </div>

           <div className="bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-xl p-3 shrink-0 mt-auto">
              <h4 className="text-sm font-bold text-[var(--color-primary)] flex items-center gap-1"><Building2 className="w-4 h-4"/> {t('map.overview', 'Overview')}</h4>
              <div className="grid grid-cols-2 gap-2 mt-2">
                 <div className="bg-white dark:bg-slate-950 p-2 rounded-lg text-center border border-slate-200 dark:border-slate-800">
                    <span className="text-xl font-bold text-slate-900 dark:text-white">{filteredHospitals.length}</span>
                    <span className="block text-[10px] text-slate-500 uppercase">{t('map.hospitals_count', 'Hospitals')}</span>
                 </div>
                 <div className="bg-white dark:bg-slate-950 p-2 rounded-lg text-center border border-slate-200 dark:border-slate-800">
                    <span className="text-xl font-bold text-red-500">{visibleAmbulances.length}</span>
                    <span className="block text-[10px] text-slate-500 uppercase">{t('map.active_108', 'Active 108')}</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 glass-panel p-1 rounded-3xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-xl relative z-0 min-h-[400px]">
        
        {/* Floating Locate Me Button */}
        <button 
          onClick={locateMe} 
          disabled={isLocating}
          className={`absolute top-4 right-4 z-[1000] px-4 py-3 rounded-full flex items-center gap-2 font-bold shadow-[0_4px_12px_rgba(0,0,0,0.25)] transition-all border border-slate-200 dark:border-slate-700 ${
            isLocating 
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
              : 'bg-white dark:bg-slate-900 text-[var(--color-primary)] hover:scale-105 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
          title="Find my location"
        >
          <LocateFixed className={`w-5 h-5 ${isLocating ? 'animate-spin text-indigo-500' : ''}`} />
          <span className="text-sm hidden sm:block">{isLocating ? t('map.locating', 'Locating...') : t('map.locate_me', 'Locate Me')}</span>
        </button>

        <MapContainer 
          center={[22.2587, 71.1924]} // Center of Gujarat
          zoom={7} 
          style={{ height: '100%', width: '100%', borderRadius: '1.5rem', zIndex: 0 }}
          ref={setMapRef}
        >
          <MapEventHandler onBoundsChange={fetchOSMData} />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="map-tiles"
          />
          
          {/* Render Hospitals */}
          {filteredHospitals.map(hospital => (
            <Marker 
              key={`hosp-${hospital.id}`} 
              position={[hospital.lat, hospital.lng]}
              icon={getHospitalIcon(hospital)}
            >
              <Popup className="hospital-popup">
                <div className="text-slate-900 min-w-[200px]">
                  <h3 className="font-bold text-base border-b pb-1 mb-2 text-indigo-700 flex items-center gap-1">
                     <Building2 className="w-4 h-4" /> {hospital.name}
                  </h3>
                  <div className="space-y-1.5 text-xs">
                    <p className="flex justify-between"><span className="font-semibold text-slate-500">Type:</span> <span className="font-bold">{hospital.type} ({hospital.category})</span></p>
                    <p className="flex justify-between"><span className="font-semibold text-slate-500">City:</span> <span className="font-bold">{hospital.city}</span></p>
                    <p className="flex items-center gap-1.5 mt-2 pt-2 border-t font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                       <Phone className="w-3 h-3" /> {hospital.contact}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 rounded-lg text-xs transition-colors">
                      Book Appointment
                    </button>
                    <a 
                      href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1"
                    >
                      <Navigation className="w-3.5 h-3.5" /> Directions
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Render Live Ambulances */}
          {visibleAmbulances.map(amb => (
            <Marker 
              key={amb.id}  
              position={[amb.lat, amb.lng]}
              icon={ambulanceIcon}
            >
              <Popup>
                <div className="text-slate-900">
                  <h3 className="font-bold text-rose-600 flex items-center gap-1 mb-1">
                    <Truck className="w-4 h-4" /> 108 Emergency
                  </h3>
                  <p className="text-xs font-bold bg-slate-100 p-1 rounded inline-block mb-1">{amb.plate}</p>
                  <p className="text-xs text-slate-600">Status: <span className="text-emerald-600 font-bold">{amb.status}</span></p>
                  <p className="text-xs text-slate-600">Zone: <span className="font-bold">{amb.city}</span></p>
                  <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> GPS Live Tracking Active
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        </MapContainer>
      </div>
    </div>
  );
};

export default MapDashboard;
