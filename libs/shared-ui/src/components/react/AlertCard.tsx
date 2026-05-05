import React from 'react';

type AlertSeverity = 'info' | 'success' | 'warning' | 'error';

interface AlertCardProps {
  title: string;
  severity?: AlertSeverity;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: React.ReactNode;
}

const borderColor: Record<AlertSeverity, string> = {
  info: '#0f62fe', success: '#24a148', warning: '#f1c21b', error: '#da1e28',
};

/**
 * AlertCard — Carbon feature-card for dashboard alert widgets.
 * DESIGN.MD: canvas bg, hairline 1px border, 4px left accent, 0px radius, 24px padding.
 */
export const AlertCard: React.FC<AlertCardProps> = ({
  title, severity = 'info', icon = '[!]', actionLabel, onAction, children,
}) => (
  <div style={{
    background: '#ffffff',
    border: '1px solid #e0e0e0',
    borderLeft: `4px solid ${borderColor[severity]}`,
    borderRadius: 0,
    padding: '24px',
    fontFamily: "'IBM Plex Sans', sans-serif",
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
      <span style={{ fontSize: '16px' }}>{icon}</span>
      <span style={{ fontSize: '16px', fontWeight: 400, color: '#161616', letterSpacing: '0.16px' }}>
        {title}
      </span>
    </div>
    <div style={{ fontSize: '14px', color: '#525252', letterSpacing: '0.16px', lineHeight: '1.29' }}>
      {children}
    </div>
    {actionLabel && (
      <div style={{ marginTop: '16px' }}>
        <a onClick={onAction} style={{ fontSize: '14px', color: '#0f62fe', cursor: 'pointer', letterSpacing: '0.16px' }}>
          {actionLabel} →
        </a>
      </div>
    )}
  </div>
);

export default AlertCard;
