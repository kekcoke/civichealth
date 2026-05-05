import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchBatches, postBatch, FinanceBatch } from '../../store/financeSlice';

const TYPE_LABEL: Record<FinanceBatch['type'], string> = {
  tax_collection: 'Tax Collection',
  permit_fee: 'Permit Fee',
  service_charge: 'Service Charge',
};

const STATUS_STYLE: Record<FinanceBatch['status'], { bg: string; color: string }> = {
  draft:     { bg: '#f4f4f4', color: '#525252' },
  submitted: { bg: '#eff8ff', color: '#1d4ed8' },
  posted:    { bg: '#defbe6', color: '#0e6027' },
  reversed:  { bg: '#fff1f1', color: '#da1e28' },
};

export default function FinanceBatches() {
  const dispatch = useDispatch<AppDispatch>();
  const { batches, loading, error } = useSelector((s: RootState) => s.finance);

  useEffect(() => { dispatch(fetchBatches()); }, []);

  const totals = batches.reduce(
    (acc, b) => ({ amount: acc.amount + b.totalAmount, records: acc.records + b.recordCount }),
    { amount: 0, records: 0 }
  );

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24, color: '#161616' }}>Finance Batches</h1>

      {/* Summary tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Batches', value: batches.length },
          { label: 'Total Records', value: totals.records.toLocaleString() },
          { label: 'Total Amount', value: `₱ ${totals.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}` },
        ].map(tile => (
          <div key={tile.label} style={{ background: '#fff', border: '1px solid #e0e0e0', padding: '20px 24px' }}>
            <div style={{ fontSize: 12, color: '#525252', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.32px' }}>{tile.label}</div>
            <div style={{ fontSize: 28, fontWeight: 300, color: '#161616' }}>{tile.value}</div>
          </div>
        ))}
      </div>

      {error && <p style={{ color: '#da1e28', marginBottom: 12 }}>{error}</p>}

      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
        <thead>
          <tr style={{ background: '#e0e0e0', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.32px' }}>
            {['Reference', 'Type', 'Records', 'Amount', 'Status', 'Created', 'Action'].map(h => (
              <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#525252' }}>Loading…</td></tr>
            : batches.map((b, i) => {
              const ss = STATUS_STYLE[b.status];
              return (
                <tr key={b.id} style={{ borderBottom: '1px solid #e0e0e0', background: i % 2 === 0 ? '#fff' : '#f4f4f4' }}>
                  <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600 }}>{b.batchReference}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14 }}>{TYPE_LABEL[b.type]}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14 }}>{b.recordCount.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14 }}>₱ {b.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '3px 10px', fontSize: 12, background: ss.bg, color: ss.color, border: `1px solid ${ss.color}33` }}>
                      {b.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#525252' }}>{new Date(b.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {b.status === 'submitted' && (
                      <button
                        onClick={() => dispatch(postBatch(b.id))}
                        style={{ padding: '5px 14px', background: '#0e6027', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12 }}
                      >
                        Post
                      </button>
                    )}
                  </td>
                </tr>
              );
            })
          }
        </tbody>
      </table>
    </div>
  );
}
