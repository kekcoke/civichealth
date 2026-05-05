import React from 'react';
import { StatusTag, resolveStatus } from './StatusTag';

export interface Column<T = any> {
  key: keyof T | string;
  label: string;
  width?: string;
  isStatus?: boolean;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  onRowAction?: (row: T) => void;
  actionLabel?: string;
}

/**
 * DataTable — Carbon data table for React (lgu-civic).
 * DESIGN.MD: surface-1 alternate rows, hairline borders, 0px radius, body-sm type.
 */
export function DataTable<T extends Record<string, any>>({
  columns, data, onRowAction, actionLabel,
}: DataTableProps<T>) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{
        width: '100%', borderCollapse: 'collapse',
        fontFamily: "'IBM Plex Sans', sans-serif",
        fontSize: '14px', fontWeight: 400, letterSpacing: '0.16px', lineHeight: '1.29',
      }}>
        <thead>
          <tr style={{ background: '#f4f4f4', borderBottom: '1px solid #e0e0e0' }}>
            {columns.map(col => (
              <th key={String(col.key)} style={{
                textAlign: 'left', padding: '12px 16px', color: '#161616',
                fontWeight: 600, fontSize: '12px', letterSpacing: '0.32px',
                whiteSpace: 'nowrap', width: col.width,
              }}>{col.label}</th>
            ))}
            {onRowAction && <th style={{ padding: '12px 16px', fontSize: '12px', letterSpacing: '0.32px', fontWeight: 600 }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={columns.length + (onRowAction ? 1 : 0)}
              style={{ textAlign: 'center', color: '#8c8c8c', padding: '32px 16px' }}>
              No records found.
            </td></tr>
          ) : data.map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 1 ? '#f4f4f4' : '#ffffff' }}>
              {columns.map(col => (
                <td key={String(col.key)} style={{ padding: '12px 16px', color: '#161616', borderBottom: '1px solid #e0e0e0' }}>
                  {col.render ? col.render(row)
                    : col.isStatus
                    ? <StatusTag status={resolveStatus(String(row[col.key]))}>{row[col.key]}</StatusTag>
                    : row[col.key]}
                </td>
              ))}
              {onRowAction && (
                <td style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0' }}>
                  <button onClick={() => onRowAction(row)} style={{
                    background: 'transparent', color: '#0f62fe', border: 'none',
                    fontSize: '14px', cursor: 'pointer', letterSpacing: '0.16px', padding: 0,
                  }}>{actionLabel || 'View'}</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
