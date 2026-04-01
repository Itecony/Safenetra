import api from '../lib/axios';

export const incidentService = {
  // Trigger SOS (User side)
  triggerSOS: async (lat, lng, accuracy = 5) => {
    const payload = {
      location: {
        latitude: lat,
        longitude: lng,
        accuracy: accuracy
      }
    };
    const { data } = await api.post('/incident/sos', payload);
    return data;
  },

  // Resolve Incident (Operator side)
  resolveIncident: async (incidentId) => {
    const { data } = await api.patch(`/incident/${incidentId}/resolve`);
    return data;
  },

  // Cancel Incident
  cancelIncident: async (incidentId) => {
    const { data } = await api.patch(`/incident/${incidentId}/cancel`);
    return data;
  }
};