import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ShieldAlert, User, MapPin, Phone, Mail, Hash } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import api from '../lib/axios';
import 'leaflet/dist/leaflet.css';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapController({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.length === 2) {
      map.flyTo(coords, 17, { animate: true, duration: 1 });
    }
  }, [coords, map]);
  return null;
}

const Dashboard = () => {
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [address, setAddress] = useState('');
  const [isSendingSOS, setIsSendingSOS] = useState(false);
  const socketRef = useRef(null);
  const locationsRef = useRef({});

  const getIncId = (inc) => inc?._id || inc?.id || inc?.incident_id;

  const getUserInfo = (inc) => {
    const u = inc?.user || inc?.reporter || {};
    const name =
      u.full_name ||
      u.name ||
      `${u.first_name || u.firstName || ''} ${u.last_name || u.lastName || ''}`.trim() ||
      u.username ||
      'Unknown User';
    return {
      displayName: name,
      email: u.email || 'No email',
      phone: u.phone || u.phoneNumber || '---',
    };
  };

  const getCoords = (inc) => {
    if (!inc) return null;
    const id = getIncId(inc);
    if (id && locationsRef.current[id]?.length > 0) {
      const trail = locationsRef.current[id];
      const latest = trail[trail.length - 1];
      const lat = parseFloat(latest.latitude);
      const lng = parseFloat(latest.longitude);
      if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
    }
    if (inc?.location?.latitude != null) {
      const lat = parseFloat(inc.location.latitude);
      const lng = parseFloat(inc.location.longitude);
      if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
    }
    if (inc?.latitude != null) {
      const lat = parseFloat(inc.latitude);
      const lng = parseFloat(inc.longitude);
      if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
    }
    return null;
  };

  const getTrail = (inc) => {
    const id = getIncId(inc);
    if (!id || !locationsRef.current[id] || locationsRef.current[id].length < 2) return [];
    return locationsRef.current[id]
      .map((loc) => {
        const lat = parseFloat(loc.latitude);
        const lng = parseFloat(loc.longitude);
        return isNaN(lat) || isNaN(lng) ? null : [lat, lng];
      })
      .filter(Boolean);
  };

  const seedLocationsRef = useCallback((id, locations) => {
    if (!id || !Array.isArray(locations)) return;
    const existing = locationsRef.current[id] || [];
    if (locations.length > existing.length) {
      locationsRef.current[id] = locations.map((l) => ({
        latitude: l.latitude,
        longitude: l.longitude,
      }));
      console.log(`🗂 seeded locationsRef[${id}] with ${locations.length} entries`);
    }
  }, []);

  const appendToLocationsRef = useCallback((id, newEntry) => {
    if (!id) return;
    if (!locationsRef.current[id]) locationsRef.current[id] = [];
    locationsRef.current[id] = [...locationsRef.current[id], newEntry];
    console.log(`📍 locationsRef[${id}] now has ${locationsRef.current[id].length} entries`);
  }, []);

  const forceRerender = useCallback((id) => {
    setIncidents((prev) =>
      prev.map((inc) => getIncId(inc) === id ? { ...inc, _lastUpdate: Date.now() } : inc)
    );
    setSelectedIncident((prev) => {
      if (!prev || getIncId(prev) !== id) return prev;
      return { ...prev, _lastUpdate: Date.now() };
    });
  }, []);

  const extractLocationFromUpdate = (msgData) => {
    if (Array.isArray(msgData?.locations) && msgData.locations.length > 0) {
      const latest = msgData.locations[msgData.locations.length - 1];
      return { latitude: latest.latitude, longitude: latest.longitude };
    }
    if (msgData?.location?.latitude != null) return msgData.location;
    if (msgData?.location?.lat != null) return { latitude: msgData.location.lat, longitude: msgData.location.lng };
    if (msgData?.latitude != null) return { latitude: msgData.latitude, longitude: msgData.longitude };
    if (msgData?.lat != null) return { latitude: msgData.lat, longitude: msgData.lng };
    return null;
  };

  useEffect(() => {
    const fetchAddress = async () => {
      const coords = getCoords(selectedIncident);
      if (!coords) { setAddress(''); return; }
      setAddress('Fetching address...');
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords[0]}&lon=${coords[1]}`
        );
        const data = await res.json();
        setAddress(data.display_name || 'Unknown Location');
      } catch {
        setAddress('Address unavailable');
      }
    };
    fetchAddress();
  }, [selectedIncident]);

  const fetchIncidents = useCallback(async () => {
    try {
      const response = await api.get('/incident?status=ACTIVE');
      const data = response.data?.data || response.data || [];
      if (Array.isArray(data) && data.length > 0) {
        const fullIncidents = await Promise.all(
          data.map(async (inc) => {
            const id = inc._id || inc.id || inc.incident_id;
            try {
              const fullRes = await api.get(`/incident/${id}`);
              const full = fullRes.data?.data || fullRes.data;
              seedLocationsRef(id, full.locations);
              return { ...full, _id: id };
            } catch {
              return { ...inc, _id: id };
            }
          })
        );
        setIncidents(fullIncidents);
      } else {
        setIncidents([]);
      }
    } catch (err) {
      console.error('fetchIncidents error:', err);
    }
  }, [seedLocationsRef]);

  // Polling fallback — catches location updates WS misses
  useEffect(() => {
    let isPolling = false;

    const poll = async () => {
      if (isPolling) return;
      isPolling = true;

      const activeIds = Object.keys(locationsRef.current);
      if (activeIds.length === 0) { isPolling = false; return; }

      for (const id of activeIds) {
        try {
          const fullRes = await api.get(`/incident/${id}`);
          const fullInc = fullRes.data?.data || fullRes.data;

          if (fullInc?.status === 'RESOLVED' || fullInc?.status === 'INACTIVE') {
            console.log(`🗑 Poll: ${id} resolved, removing`);
            delete locationsRef.current[id];
            setIncidents((prev) => prev.filter((i) => getIncId(i) !== id));
            setSelectedIncident((prev) => getIncId(prev) === id ? null : prev);
            continue;
          }

          if (!fullInc?.locations?.length) continue;

          const incoming = fullInc.locations;
          const existing = locationsRef.current[id] || [];

          if (incoming.length > existing.length) {
            console.log(`🔄 POLL: ${id} — ${existing.length} → ${incoming.length} points`);
            seedLocationsRef(id, incoming);
            forceRerender(id);
          }
        } catch (err) {
          console.warn(`⚠️ Poll failed for ${id} — server may be waking up`);
        }
      }

      isPolling = false;
    };

    const interval = setInterval(poll, 8000);
    return () => clearInterval(interval);
  }, [seedLocationsRef, forceRerender]);

  useEffect(() => {
    fetchIncidents();

    const connectWS = () => {
      const token = localStorage.getItem('token');
      if (!token || socketRef.current?.readyState === WebSocket.OPEN) return;

      const socket = new WebSocket(`wss://safe-n-core.onrender.com/ws?token=${token}`);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log('🟢 WebSocket connected');
        socket.send(JSON.stringify({ type: 'SUBSCRIBE_OPERATORS' }));
      };

      socket.onmessage = async (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('📡 WS TYPE:', message.type);

          const msgData = message.data;
          const id = msgData?.incident_id || msgData?._id || msgData?.id;

          if (message.type === 'INCIDENT_CREATED') {
            console.log('🆕 INCIDENT_CREATED:', id);
            const newInc = { ...msgData, _id: id };
            setIncidents((prev) => [newInc, ...prev.filter((i) => getIncId(i) !== id)]);
            setSelectedIncident(newInc);
            socket.send(JSON.stringify({ type: 'SUBSCRIBE_INCIDENT', incidentId: id }));
            socket.send(JSON.stringify({ type: 'SUBSCRIBE_INCIDENT', incident_id: id }));

            try {
              const fullRes = await api.get(`/incident/${id}`);
              const fullInc = fullRes.data?.data || fullRes.data;
              const withId = { ...fullInc, _id: id };
              seedLocationsRef(id, fullInc.locations);
              setIncidents((prev) => prev.map((i) => getIncId(i) === id ? withId : i));
              setSelectedIncident((prev) => getIncId(prev) === id ? withId : prev);
            } catch (err) {
              console.error('❌ Full incident fetch failed:', err);
            }
          }

          else if (message.type === 'LOCATION_UPDATE') {
            console.log('📍 LOCATION_UPDATE:', JSON.stringify(msgData, null, 2));
            const location = extractLocationFromUpdate(msgData);
            if (!location) {
              console.warn('⚠️ LOCATION_UPDATE had no extractable location, poller will catch it');
              return;
            }
            const newEntry = {
              latitude: location.latitude ?? location.lat,
              longitude: location.longitude ?? location.lng,
            };
            appendToLocationsRef(id, newEntry);
            forceRerender(id);
          }

          else if (message.type === 'INCIDENT_RESOLVED') {
            console.log('✅ INCIDENT_RESOLVED:', id);
            delete locationsRef.current[id];
            setIncidents((prev) => prev.filter((inc) => getIncId(inc) !== id));
            setSelectedIncident((prev) => (getIncId(prev) === id ? null : prev));
          }

          else {
            console.log('❓ UNHANDLED WS TYPE:', message.type);
          }

        } catch (e) {
          console.error('WS parse error:', e);
        }
      };

      socket.onerror = (err) => console.error('🔴 WS ERROR:', err);
      socket.onclose = (event) => {
        console.warn('🔴 WS Closed. Code:', event.code, 'Reason:', event.reason);
        setTimeout(connectWS, 5000);
      };
    };

    connectWS();
    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, [fetchIncidents, seedLocationsRef, appendToLocationsRef, forceRerender]);

  const handleTriggerSOS = () => {
    if (isSendingSOS) return;
    setIsSendingSOS(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const locObj = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          const response = await api.post('/incident/sos', {
            trigger_type: 'ONE_TAP',
            is_test: true,
            location: { ...locObj, accuracy: 10 },
            device: { device_id: 'DASH_' + Date.now(), device_type: 'BROWSER' },
          });

          const raw = response.data?.data || response.data;
          const id = raw._id || raw.id || raw.incident_id;
          appendToLocationsRef(id, { latitude: locObj.latitude, longitude: locObj.longitude });

          const newInc = { ...raw, _id: id };
          setIncidents((prev) => [newInc, ...prev.filter((i) => getIncId(i) !== id)]);
          setSelectedIncident(newInc);

          if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type: 'SUBSCRIBE_INCIDENT', incidentId: id }));
          }
        } catch (err) {
          console.error('SOS error:', err);
        } finally {
          setIsSendingSOS(false);
        }
      },
      (err) => {
        console.error('❌ Geolocation error:', err);
        setIsSendingSOS(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const selectedCoords = getCoords(selectedIncident);
  const selectedId = getIncId(selectedIncident);

  return (
    <div className="flex h-screen bg-slate-950 text-white p-4 gap-4 overflow-hidden font-sans">
      {/* SIDEBAR */}
      <div className="w-80 flex flex-col gap-4 overflow-y-auto pr-2">
        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl">
          <h1 className="text-xl font-black flex items-center gap-2 mb-4 text-red-500">
            <ShieldAlert /> SAFEN COMMAND
          </h1>
          <button
            onClick={handleTriggerSOS}
            disabled={isSendingSOS}
            className={`w-full p-4 rounded-xl font-bold transition-all ${
              isSendingSOS ? 'bg-slate-700 animate-pulse' : 'bg-red-600 hover:bg-red-500'
            }`}
          >
            {isSendingSOS ? 'SENDING...' : 'TRIGGER TEST SOS'}
          </button>
        </div>

        <div className="flex-1 space-y-2">
          <h2 className="text-[10px] font-bold text-slate-500 uppercase px-2">
            Active ({incidents.length})
          </h2>
          {incidents.map((inc) => {
            const id = getIncId(inc);
            const isActive = getIncId(selectedIncident) === id;
            const coords = getCoords(inc);
            return (
              <div
                key={id || Math.random()}
                onClick={() => setSelectedIncident(inc)}
                className={`p-4 rounded-xl cursor-pointer border transition-all ${
                  isActive ? 'bg-red-600/20 border-red-500' : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex justify-between items-center">
                  <p className="font-bold text-sm truncate">{getUserInfo(inc).displayName}</p>
                  <span className="w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
                </div>
                <p className="text-[10px] font-mono text-slate-500 mt-1">
                  ID: {id ? String(id).slice(-8).toUpperCase() : 'PENDING...'}
                </p>
                {coords && (
                  <p className="text-[10px] font-mono text-slate-600 mt-0.5">
                    {coords[0].toFixed(4)}, {coords[1].toFixed(4)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* MAP */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex-1 rounded-3xl overflow-hidden border border-slate-800 relative bg-slate-900">
          <MapContainer
            center={[9.082, 8.6753]}
            zoom={6}
            style={{ height: '100%', width: '100%' }}
          >
            {/* ✅ Pure satellite imagery — no white wash */}
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              maxZoom={19}
            />
            {/* ✅ Labels-only layer — transparent background, just text/roads on top */}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              maxZoom={19}
              opacity={1}
            />

            {incidents.map((inc) => {
              const pos = getCoords(inc);
              const id = getIncId(inc);
              const trail = getTrail(inc);
              const isSelected = getIncId(selectedIncident) === id;

              return (
                <React.Fragment key={id}>
                  {trail.length >= 2 && (
                    <Polyline
                      positions={trail}
                      pathOptions={{
                        color: isSelected ? '#ef4444' : '#94a3b8',
                        weight: isSelected ? 4 : 2,
                        opacity: isSelected ? 1 : 0.5,
                        dashArray: isSelected ? undefined : '4 6',
                      }}
                    />
                  )}
                  {pos && (
                    <Marker position={pos} icon={DefaultIcon}>
                      <Popup>
                        <b>{getUserInfo(inc).displayName}</b><br />
                        ID: {id}<br />
                        {pos[0].toFixed(6)}, {pos[1].toFixed(6)}<br />
                        {trail.length > 0 && <span>🛤 {trail.length} points tracked</span>}
                      </Popup>
                    </Marker>
                  )}
                </React.Fragment>
              );
            })}

            {selectedIncident && <MapController coords={selectedCoords} />}
          </MapContainer>

          {selectedIncident && (
            <div className="absolute bottom-6 left-6 right-6 bg-slate-900/95 backdrop-blur-md p-6 rounded-2xl border border-slate-700 z-[1000]">
              <div className="flex justify-between items-start gap-4">
                <div className="flex gap-4 items-start flex-1 min-w-0">
                  <div className="bg-red-600 p-3 rounded-2xl shrink-0">
                    <User size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-black truncate">
                      {getUserInfo(selectedIncident).displayName}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Hash size={11} className="text-slate-500 shrink-0" />
                      <p className="text-[11px] font-mono text-slate-400 truncate">
                        {selectedId || 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin size={11} className="text-red-400 shrink-0 animate-pulse" />
                      <p className="text-[11px] font-mono text-red-300">
                        {selectedCoords
                          ? `${selectedCoords[0].toFixed(6)}, ${selectedCoords[1].toFixed(6)}`
                          : 'Waiting for location...'}
                      </p>
                    </div>
                    <div className="flex items-start gap-1 mt-1">
                      <MapPin size={11} className="text-slate-500 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-slate-400 line-clamp-2">{address || '—'}</p>
                    </div>
                    {selectedId && locationsRef.current[selectedId]?.length > 0 && (
                      <p className="text-[10px] text-slate-600 mt-1">
                        🛤 {locationsRef.current[selectedId].length} points tracked
                      </p>
                    )}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                      <div className="flex items-center gap-1">
                        <Mail size={11} className="text-slate-500" />
                        <span className="text-[11px] text-slate-400">
                          {getUserInfo(selectedIncident).email}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone size={11} className="text-slate-500" />
                        <span className="text-[11px] text-slate-400">
                          {getUserInfo(selectedIncident).phone}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    const id = getIncId(selectedIncident);
                    await api.patch(`/incident/${id}/resolve`, {});
                    delete locationsRef.current[id];
                    setIncidents((prev) => prev.filter((i) => getIncId(i) !== id));
                    setSelectedIncident(null);
                  }}
                  className="bg-green-600 px-6 py-3 rounded-2xl font-black hover:bg-green-500 shrink-0 text-sm"
                >
                  RESOLVE
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;