import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AppDispatch, RootState } from '../../store';
import { fetchServiceRequests, assignRequest, ServiceRequest } from '../../store/serviceRequestSlice';

// Fix Leaflet default marker icons (webpack asset path issue)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const STATUS_COLOR: Record<ServiceRequest['status'], string> = {
  open:        '#da1e28',
  assigned:    '#0f62fe',
  in_progress: '#b45309',
  resolved:    '#0e6027',
  closed:      '#525252',
};

const CATEGORIES = ['All', 'Road Damage', 'Flooding', 'Waste', 'Street Light', 'Noise', 'Other'];

/** Creates a colored circle marker icon for each request status */
function makeIcon(status: ServiceRequest['status']) {
  const color = STATUS_COLOR[status];
  return L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

/** Pan map to a pin when selectedId changes */
function MapFly({ items, selectedId }: { items: ServiceRequest[]; selectedId: string | null }) {
  const map = useMap();
  useEffect(() => {
    if (!selectedId) return;
    const req = items.find(r => r.id === selectedId);
    if (req) map.flyTo([req.lat, req.lng], 16, { duration: 0.8 });
  }, [selectedId]);
  return null;
}

export default function ServiceRequestDispatch() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error } = useSelector((s: RootState) => s.serviceRequests);
  const [catFilter, setCatFilter] = useState('All');
  const [assignInput, setAssignInput] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => { dispatch(fetchServiceRequests()); }, []);

  const filtered = catFilter === 'All' ? items : items.filter(r => r.category === catFilter);

  // Map center defaults to Metro Manila; shifts to first request if available
  const mapCenter: [number, number] = items.length > 0
    ? [items[0].lat, items[0].lng]
    : [14.5995, 120.9842];

  return (
    <div style={{ padding: 32, fontFamily: 'IBM Plex Sans, sans-serif' }}>
      <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4, color: '#161616' }}>311 Service Request Dispatch</h1>
      <p style={{ fontSize: 13, color: '#525252', marginBottom: 20 }}>
        Live map powered by Leaflet + OpenStreetMap tiles. Click a map pin or list row to highlight.
      </p>

      {/* Category filter pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCatFilter(cat)}
            style={{
              padding: '4px 14px', border: '1px solid', cursor: 'pointer', fontSize: 13,
              borderColor: catFilter === cat ? '#0f62fe' : '#c6c6c6',
              background:  catFilter === cat ? '#0f62fe' : '#fff',
              color:       catFilter === cat ? '#fff'    : '#161616',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {error && <p style={{ color: '#da1e28', marginBottom: 12 }}>{error}</p>}

      {/* Leaflet map (Gap 7) */}
      <div style={{ height: 340, marginBottom: 24, border: '1px solid #e0e0e0', position: 'relative', zIndex: 0 }}>
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapFly items={filtered} selectedId={selectedId} />
          {filtered.map(req => (
            <Marker
              key={req.id}
              position={[req.lat, req.lng]}
              icon={makeIcon(req.status)}
              eventHandlers={{ click: () => setSelectedId(req.id) }}
            >
              <Popup>
                <strong>#{req.ticketNumber}</strong><br />
                {req.category} — {req.address}<br />
                <span style={{ color: STATUS_COLOR[req.status], fontWeight: 600 }}>
                  {req.status.replace('_', ' ')}
                </span>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        {(Object.entries(STATUS_COLOR) as [ServiceRequest['status'], string][]).map(([s, c]) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#525252' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: c, border: '1px solid #fff', boxShadow: '0 0 0 1px #c6c6c6' }} />
            {s.replace('_', ' ')}
          </div>
        ))}
      </div>

      {/* Request list */}
      <div style={{ display: 'grid', gap: 8 }}>
        {loading
          ? <p style={{ color: '#525252' }}>Loading requests…</p>
          : filtered.map(req => (
            <div
              key={req.id}
              onClick={() => setSelectedId(req.id)}
              style={{
                background: selectedId === req.id ? '#edf5ff' : '#fff',
                border: `1px solid ${selectedId === req.id ? '#0f62fe' : '#e0e0e0'}`,
                padding: 16, display: 'flex', gap: 16, alignItems: 'flex-start', cursor: 'pointer',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>#{req.ticketNumber}</span>
                  <span style={{ fontSize: 12, color: '#fff', background: STATUS_COLOR[req.status], padding: '2px 8px' }}>
                    {req.status.replace('_', ' ')}
                  </span>
                  <span style={{ fontSize: 12, color: '#525252', background: '#f4f4f4', padding: '2px 8px', border: '1px solid #e0e0e0' }}>
                    {req.category}
                  </span>
                </div>
                <div style={{ fontSize: 13, marginBottom: 2 }}>{req.description}</div>
                <div style={{ fontSize: 12, color: '#6f6f6f' }}>
                  {req.address} · {req.reporterName} · {new Date(req.createdAt).toLocaleDateString()}
                </div>
                {req.assignedTo && (
                  <div style={{ fontSize: 12, color: '#0f62fe', marginTop: 4 }}>Assigned to: {req.assignedTo}</div>
                )}
              </div>
              {req.status === 'open' && (
                <div
                  style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}
                  onClick={e => e.stopPropagation()} // prevent row click when interacting with input
                >
                  <input
                    placeholder="Assign to…"
                    value={assignInput[req.id] ?? ''}
                    onChange={e => setAssignInput(prev => ({ ...prev, [req.id]: e.target.value }))}
                    style={{ padding: '6px 10px', border: '1px solid #8d8d8d', fontSize: 13, width: 140, fontFamily: 'IBM Plex Sans, sans-serif' }}
                  />
                  <button
                    onClick={() => {
                      if (assignInput[req.id]) dispatch(assignRequest({ id: req.id, assignedTo: assignInput[req.id] }));
                    }}
                    style={{ padding: '6px 14px', background: '#0f62fe', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13 }}
                  >
                    Assign
                  </button>
                </div>
              )}
            </div>
          ))
        }
      </div>
    </div>
  );
}
