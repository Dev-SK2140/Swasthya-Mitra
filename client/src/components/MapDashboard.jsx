import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, AlertTriangle, ShieldAlert } from 'lucide-react';

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MOCK_OUTBREAKS = [
  { id: 1, type: 'Dengue Outbreak', lat: 23.0225, lng: 72.5714, cases: 14, radius: 2500, color: '#ef4444' }, // Ahmedabad
  { id: 2, type: 'Cholera Cluster', lat: 22.3039, lng: 70.8022, cases: 8, radius: 1500, color: '#f59e0b' },  // Rajkot
  { id: 3, type: 'Malaria Risk Zone', lat: 21.1702, lng: 72.8311, cases: 5, radius: 2000, color: '#3b82f6' }  // Surat
];

const MapDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://swasthya-mitra-o4st.onrender.com/api');
        const response = await fetch(`${API_URL}/patients`);
        const data = await response.json();
        
        // Filter patients who have a location set
        const mappedPatients = data
          .filter(p => p.location && p.location.lat && p.location.lng)
          .map(p => ({
            id: p._id,
            name: p.name,
            symptoms: p.symptoms || [],
            lat: p.location.lat,
            lng: p.location.lng,
            risk: p.riskLevel || 'Normal'
          }));
        
        setPatients(mappedPatients.length > 0 ? mappedPatients : [
          // Fallback mocks if DB has no geolocated patients yet
          { id: 'p1', name: 'Ramesh', symptoms: ['Fever', 'Joint Pain'], lat: 23.02, lng: 72.57, risk: 'High' },
          { id: 'p2', name: 'Sita', symptoms: ['Fever', 'Rash'], lat: 23.03, lng: 72.58, risk: 'High' },
          { id: 'p3', name: 'Kishan', symptoms: ['Diarrhea', 'Vomiting'], lat: 22.31, lng: 70.81, risk: 'Critical' },
        ]);
      } catch (err) {
        console.error("Error fetching map patients:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  return (
    <div className="p-6 h-[calc(100vh-80px)] flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Epidemiology Outbreak Map</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Real-time geospatial tracking of symptom clusters in rural districts.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm">
            <AlertTriangle className="w-5 h-5" /> 3 Active Clusters
          </div>
        </div>
      </div>

      <div className="flex-1 glass-panel p-1 rounded-3xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-xl relative z-0">
        {!loading && (
          <MapContainer 
            center={[22.2587, 71.1924]} // Center of Gujarat
            zoom={7} 
            style={{ height: '100%', width: '100%', borderRadius: '1.5rem', zIndex: 0 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              className="map-tiles"
            />
            
            {/* Render Outbreak Hotspot Radii */}
            {MOCK_OUTBREAKS.map(outbreak => (
              <Circle 
                key={`ob-${outbreak.id}`}
                center={[outbreak.lat, outbreak.lng]}
                radius={outbreak.radius}
                pathOptions={{ fillColor: outbreak.color, fillOpacity: 0.2, color: outbreak.color, weight: 2 }}
              >
                <Popup>
                  <div className="text-slate-900">
                    <h3 className="font-bold text-base flex items-center gap-1 text-rose-600">
                      <ShieldAlert className="w-4 h-4" /> {outbreak.type}
                    </h3>
                    <p className="text-xs font-semibold mt-1">{outbreak.cases} reported cases in last 48 hrs.</p>
                    <button className="mt-2 text-[10px] bg-rose-100 text-rose-700 px-2 py-1 rounded w-full font-bold">Deploy Rapid Response Team</button>
                  </div>
                </Popup>
              </Circle>
            ))}

            {/* Render Patient Markers */}
            {patients.map(patient => (
              <Marker key={patient.id} position={[patient.lat, patient.lng]}>
                <Popup>
                  <div className="text-slate-900">
                    <h4 className="font-bold">{patient.name}</h4>
                    <p className="text-[10px] text-slate-500 mb-1">Risk: <span className="font-bold text-rose-500">{patient.risk}</span></p>
                    <p className="text-xs bg-slate-100 p-1 rounded border border-slate-200">
                      Symptoms: {patient.symptoms.join(', ')}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
        
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapDashboard;
