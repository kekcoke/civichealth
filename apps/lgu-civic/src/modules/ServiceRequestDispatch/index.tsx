import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchServiceRequests, assignRequest, ServiceRequest } from '../../store/serviceRequestSlice';

const STATUS_COLOR: Record<ServiceRequest['status'], string> = {
  open: '#da1e28', assigned: '#0f62fe', in_progress: '#b45309',
  resolved: '#0e6027', closed: '#525252',
};

const CATEGORIES = ['All', 'Road Damage', 'Flooding', 'Waste', 'Street Light', 'Noise', 'Other'];

export default function ServiceRequestDispatch() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error } = useSelector((s: RootState) => s.serviceRequests);
  const [catFilter, setCatFilter] = useState('All');
  const [assignInput, setAssignInput] = useState<Record<string, string>>({});

  useEffect(() => { dispatch(fetchServiceRequests()); }, []);

  const filtered = catFilter === 'All' ? items : items.filter(r => r.category === catFilter);

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8, color: '#161616' }}>311 Service Request Dispatch</h1>
      <p style={{ fontSize: 13, color: '#525252', marginBottom: 24 }}>
        Map integration: Leaflet + PostGIS recommended (Gap 7). Coordinate columns available in data.
      </p>

      {/* Category filter pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCatFilter(cat)}
            style={{
              padding: '4px 14px', border: '1px solid', cursor: 'pointer', fontSize: 13,
              borderColor: catFilter === cat ? '#0f62fe' : '#c6c6c6',
              background: catFilter === cat ? '#0f62fe' : '#fff',
              color: catFilter === cat ? '#fff' : '#161616',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {error && <p style={{ color: '#da1e28', marginBottom: 12 }}>{error}</p>}

      {/* Map placeholder */}
      <div style={{ height: 200, background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, border: '1px dashed #8d8d8d' }}>
        <span style={{ color: '#525252', fontSize: 14 }}>🗺 Leaflet map renders here — integrate <code>react-leaflet</code> with PostGIS tile layer</span>
      </div>

      {/* Request list */}
      <div style={{ display: 'grid', gap: 8 }}>
        {loading
          ? <p style={{ color: '#525252' }}>Loading requests…</p>
          : filtered.map(req => (
            <div key={req.id} style={{ background: '#fff', border: '1px solid #e0e0e0', padding: 16, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
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
                <div style={{ fontSize: 12, color: '#6f6f6f' }}>{req.address} · {req.reporterName} · {new Date(req.createdAt).toLocaleDateString()}</div>
                {req.assignedTo && <div style={{ fontSize: 12, color: '#0f62fe', marginTop: 4 }}>Assigned to: {req.assignedTo}</div>}
              </div>
              {req.status === 'open' && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
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
