import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../lib/axios'; // Ensure this path is correct

const WS_URL = "wss://safe-n-core.onrender.com/ws";

export const useIncidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const socketRef = useRef(null);

  // Helper to unify ID access
  const getIncId = (inc) => inc?._id || inc?.id || inc?.incident_id;

  // 1. Load existing active incidents from API
  const fetchActive = useCallback(async () => {
    try {
      const res = await api.get('/incident?status=ACTIVE');
      const data = res.data?.data || res.data || [];
      // Normalize IDs immediately on fetch
      const cleanData = Array.isArray(data) ? data.map(i => ({ ...i, _id: getIncId(i) })) : [];
      setIncidents(cleanData);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  }, []);

  useEffect(() => {
    fetchActive();

    const token = localStorage.getItem("token");
    if (!token) return;

    const ws = new WebSocket(`${WS_URL}?token=${token}`);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("🖥 Operator connected");
      ws.send(JSON.stringify({ type: "SUBSCRIBE_OPERATORS" }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const msgData = message.data;
        const incomingId = msgData?.incident_id || msgData?._id || msgData?.id;

        if (message.type === "INCIDENT_CREATED") {
          const newInc = { ...msgData, _id: incomingId };
          setIncidents(prev => {
            if (prev.find(i => getIncId(i) === incomingId)) return prev;
            return [newInc, ...prev];
          });
          ws.send(JSON.stringify({ type: "SUBSCRIBE_INCIDENT", incidentId: incomingId }));
        }

        if (message.type === "LOCATION_UPDATE") {
          const updateLogic = (inc) => 
            getIncId(inc) === incomingId 
              ? { ...inc, location: { ...inc.location, ...msgData.location } } 
              : inc;

          setIncidents(prev => prev.map(updateLogic));
          
          // Sync the selected incident if it's the one moving
          setSelectedIncident(prev => {
            if (getIncId(prev) === incomingId) {
              return { ...prev, location: { ...prev.location, ...msgData.location } };
            }
            return prev;
          });
        }

        if (message.type === "INCIDENT_RESOLVED") {
          setIncidents(prev => prev.filter(i => getIncId(i) !== incomingId));
          setSelectedIncident(prev => getIncId(prev) === incomingId ? null : prev);
        }
      } catch (e) {
        console.error("WS Parsing Error", e);
      }
    };

    ws.onclose = () => console.log("🔌 Connection Closed");

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [fetchActive]); // Re-runs if fetchActive changes (which is rare due to useCallback)

  const resolveIncident = async (id) => {
    try {
      await api.patch(`/incident/${id}/resolve`, {});
      // State updates will actually happen via the WS "INCIDENT_RESOLVED" message 
      // but we filter here too for instant UI feedback
      setIncidents(prev => prev.filter(i => getIncId(i) !== id));
      if (getIncId(selectedIncident) === id) setSelectedIncident(null);
    } catch (err) {
      console.error("Resolve failed:", err);
    }
  };

  return { 
    incidents, 
    selectedIncident, 
    setSelectedIncident, 
    resolveIncident,
    getIncId // Export this so Dashboard can use it for keys
  };
};