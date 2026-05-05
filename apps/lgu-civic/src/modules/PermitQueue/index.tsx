import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchPermits, updatePermitStatus, setStatusFilter, Permit } from '../../store/permitSlice';

const STATUS_COLORS: Record<Permit['status'], { bg: string; color: string; border: string }> = {
  pending:      { bg: '#fff8e1', color: '#b45309', border: '#fde68a' },
  under_review: { bg: '#eff8ff', color: '#1d4ed8', border: '#bfdbfe' },
  approved:     { bg: '#defbe6', color: '#0e6027', border: '#a7f0ba' },
  rejected:     { bg: '#fff1f1', color: '#da1e28', border: '#ffd7d9' },
};

const FILTERS: Array<Permit['status'] | 'all'> = ['all', 'pending', 'under_review', 'approved', 'rejected'];

export default function PermitQueue() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error, statusFilter } = useSelector((s: RootState) => s.permits);

  useEffect(() => { dispatch(fetchPermits(statusFilter)); }, [statusFilter]);

  const filtered = statusFilter === 'all' ? items : items.filter(p => p.status === statusFilter);

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24, color: '#161616' }}>Permit Queue</h1>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '1px solid #e0e0e0' }}>
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => dispatch(setStatusFilter(f))}
            style={{
              padding: '8px 20px', border: 'none', cursor: 'pointer',
              fontSize: 14, background: 'transparent', fontFamily: 'IBM Plex Sans, sans-serif',
              borderBottom: statusFilter === f ? '2px solid #0f62fe' : '2px solid transparent',
              color: statusFilter === f ? '#0f62fe' : '#525252', fontWeight: statusFilter === f ? 600 : 400,
            }}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {error && <p style={{ color: '#da1e28', marginBottom: 12 }}>{error}</p>}

      <div style={{ display: 'grid', gap: 12 }}>
        {loading
          ? <p style={{ color: '#525252' }}>Loading permits…</p>
          : filtered.map(permit => {
            const c = STATUS_COLORS[permit.status];
            return (
              <div key={permit.id} style={{ background: '#fff', border: '1px solid #e0e0e0', padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{permit.applicantName}</div>
                  <div style={{ fontSize: 13, color: '#525252' }}>{permit.permitType} · Submitted {new Date(permit.submittedAt).toLocaleDateString()}</div>
                  {permit.reviewedBy && <div style={{ fontSize: 12, color: '#6f6f6f', marginTop: 4 }}>Reviewer: {permit.reviewedBy}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ padding: '3px 10px', fontSize: 12, background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
                    {permit.status.replace('_', ' ')}
                  </span>
                  {permit.status === 'pending' && (
                    <>
                      <button
                        onClick={() => dispatch(updatePermitStatus({ id: permit.id, status: 'approved' }))}
                        style={{ padding: '6px 14px', background: '#0e6027', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13 }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => dispatch(updatePermitStatus({ id: permit.id, status: 'rejected' }))}
                        style={{ padding: '6px 14px', background: '#da1e28', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13 }}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        }
      </div>
    </div>
  );
}
