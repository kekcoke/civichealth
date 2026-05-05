import React from 'react';

type TagStatus = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface StatusTagProps {
  status?: TagStatus;
  children: React.ReactNode;
}

const tagStyles: Record<TagStatus, React.CSSProperties> = {
  success: { background: '#defbe6', color: '#0e6027' },
  warning: { background: '#fdf6dd', color: '#8a5600' },
  error:   { background: '#fff1f1', color: '#da1e28' },
  info:    { background: '#edf5ff', color: '#0043ce' },
  neutral: { background: '#f4f4f4', color: '#525252' },
};

const base: React.CSSProperties = {
  fontFamily:    "'IBM Plex Sans', sans-serif",
  fontSize:      '12px',
  fontWeight:    400,
  letterSpacing: '0.32px',
  lineHeight:    '1.33',
  padding:       '2px 8px',
  borderRadius:  '2px',
  display:       'inline-block',
  whiteSpace:    'nowrap',
};

export const resolveStatus = (value: string): TagStatus => {
  const v = (value || '').toUpperCase();
  if (['PAID','APPROVED','ACTIVE','CLEARED','COMPLETED','IN GOOD'].includes(v)) return 'success';
  if (['OVERDUE','ARREARS','FAILED','DENIED'].includes(v))                      return 'error';
  if (['PENDING','UNDER REVIEW','IN PROGRESS'].includes(v))                     return 'warning';
  if (['SUBMITTED','OPEN','SCHEDULED'].includes(v))                             return 'info';
  return 'neutral';
};

export const StatusTag: React.FC<StatusTagProps> = ({ status = 'neutral', children }) => (
  <span style={{ ...base, ...tagStyles[status] }}>{children}</span>
);

export default StatusTag;
