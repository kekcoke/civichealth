import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

const styles: Record<ButtonVariant, React.CSSProperties> = {
  primary:   { background: '#0f62fe', color: '#ffffff' },
  secondary: { background: '#161616', color: '#ffffff' },
  tertiary:  { background: '#ffffff', color: '#0f62fe', border: '1px solid #0f62fe' },
  ghost:     { background: 'transparent', color: '#0f62fe' },
  danger:    { background: '#da1e28', color: '#ffffff' },
};

const base: React.CSSProperties = {
  fontFamily: "'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif",
  fontSize:   '14px',
  fontWeight: 400,
  lineHeight: '1.29',
  letterSpacing: '0.16px',
  borderRadius: 0,
  border: 'none',
  padding: '12px 16px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  minHeight: '48px',
};

/**
 * Button — Carbon/IBM square-corner button for React (lgu-civic).
 * DESIGN.MD: rounded.none, IBM Plex Sans 14px/400, letter-spacing 0.16px.
 */
export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, style, ...rest }) => (
  <button style={{ ...base, ...styles[variant], ...style }} {...rest}>
    {children}
  </button>
);

export default Button;
