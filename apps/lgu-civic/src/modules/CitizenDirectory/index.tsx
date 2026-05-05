import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchCitizens, selectCitizen, setPage, Citizen } from '../../store/citizenSlice';

const statusBadge = (s: Citizen['status']) => ({
  display: 'inline-block', padding: '2px 8px', fontSize: 12,
  background: s === 'active' ? '#defbe6' : '#fff1f1',
  color: s === 'active' ? '#0e6027' : '#da1e28',
  border: `1px solid ${s === 'active' ? '#a7f0ba' : '#ffd7d9'}`,
});

export default function CitizenDirectory() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error, total, page } = useSelector((s: RootState) => s.citizens);
  const [search, setSearch] = useState('');

  useEffect(() => { dispatch(fetchCitizens({ page, search })); }, [page, search]);

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24, color: '#161616' }}>Citizen Directory</h1>

      {/* Search bar */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search by name, email, or barangay…"
          value={search}
          onChange={e => { setSearch(e.target.value); dispatch(setPage(1)); }}
          style={{
            width: 320, padding: '8px 12px', border: '1px solid #8d8d8d',
            outline: 'none', fontSize: 14, fontFamily: 'IBM Plex Sans, sans-serif',
          }}
        />
      </div>

      {error && <p style={{ color: '#da1e28', marginBottom: 12 }}>{error}</p>}

      {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#ffffff' }}>
        <thead>
          <tr style={{ background: '#e0e0e0', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.32px' }}>
            {['Full Name', 'Email', 'Phone', 'Barangay', 'Status', 'Actions'].map(h => (
              <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#525252' }}>Loading…</td></tr>
            : items.map((c, i) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #e0e0e0', background: i % 2 === 0 ? '#ffffff' : '#f4f4f4' }}>
                <td style={{ padding: '12px 16px', fontSize: 14 }}>{c.fullName}</td>
                <td style={{ padding: '12px 16px', fontSize: 14 }}>{c.email}</td>
                <td style={{ padding: '12px 16px', fontSize: 14 }}>{c.phone}</td>
                <td style={{ padding: '12px 16px', fontSize: 14 }}>{c.barangay}</td>
                <td style={{ padding: '12px 16px' }}><span style={statusBadge(c.status)}>{c.status}</span></td>
                <td style={{ padding: '12px 16px' }}>
                  <button
                    onClick={() => dispatch(selectCitizen(c))}
                    style={{ padding: '4px 12px', background: '#0f62fe', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12 }}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>

      {/* Pagination */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
        <button
          disabled={page <= 1}
          onClick={() => dispatch(setPage(page - 1))}
          style={{ padding: '6px 16px', border: '1px solid #8d8d8d', background: '#fff', cursor: page > 1 ? 'pointer' : 'not-allowed' }}
        >
          Previous
        </button>
        <span style={{ fontSize: 14, color: '#525252' }}>Page {page} · {total} total</span>
        <button
          disabled={page * 20 >= total}
          onClick={() => dispatch(setPage(page + 1))}
          style={{ padding: '6px 16px', border: '1px solid #8d8d8d', background: '#fff', cursor: page * 20 < total ? 'pointer' : 'not-allowed' }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
