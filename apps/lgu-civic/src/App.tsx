import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { useAuthGuard } from './hooks/useAuthGuard';

const CitizenDirectory = lazy(() => import('./modules/CitizenDirectory'));
const PermitQueue = lazy(() => import('./modules/PermitQueue'));
const ServiceRequestDispatch = lazy(() => import('./modules/ServiceRequestDispatch'));
const FinanceBatches = lazy(() => import('./modules/FinanceBatches'));

const navItems = [
  { to: '/citizens', label: 'Citizen Directory' },
  { to: '/permits', label: 'Permit Queue' },
  { to: '/dispatch', label: '311 Dispatch' },
  { to: '/finance', label: 'Finance Batches' },
];

function Shell() {
  const { authorized, role } = useAuthGuard(['civic_employee', 'super_admin']);

  if (!authorized) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p style={{ color: '#da1e28', fontFamily: 'IBM Plex Sans, sans-serif' }}>
          Access denied — insufficient role: <strong>{role ?? 'unauthenticated'}</strong>
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'IBM Plex Sans, sans-serif' }}>
      {/* Left nav */}
      <nav style={{ width: 240, background: '#161616', padding: '24px 0', flexShrink: 0 }}>
        <div style={{ padding: '0 16px 24px', color: '#f4f4f4', fontSize: 14, fontWeight: 600, letterSpacing: '0.16px' }}>
          LGU Civic Admin
        </div>
        {navItems.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'block',
              padding: '12px 16px',
              color: isActive ? '#ffffff' : '#c6c6c6',
              background: isActive ? '#0f62fe' : 'transparent',
              textDecoration: 'none',
              fontSize: 14,
              borderLeft: isActive ? '3px solid #ffffff' : '3px solid transparent',
            })}
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', background: '#f4f4f4' }}>
        <Suspense fallback={<div style={{ padding: 32, color: '#525252' }}>Loading module…</div>}>
          <Routes>
            <Route path="/" element={<Navigate to="/citizens" replace />} />
            <Route path="/citizens/*" element={<CitizenDirectory />} />
            <Route path="/permits/*" element={<PermitQueue />} />
            <Route path="/dispatch/*" element={<ServiceRequestDispatch />} />
            <Route path="/finance/*" element={<FinanceBatches />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}
