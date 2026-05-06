import { resolveStatus } from './StatusTag';

describe('resolveStatus', () => {
  it('PAID → success', () => {
    expect(resolveStatus('PAID')).toBe('success');
  });

  it('overdue (case-insensitive) → error', () => {
    expect(resolveStatus('overdue')).toBe('error');
    expect(resolveStatus('OVERDUE')).toBe('error');
  });

  it('PENDING → warning', () => {
    expect(resolveStatus('PENDING')).toBe('warning');
  });

  it('OPEN → info', () => {
    expect(resolveStatus('OPEN')).toBe('info');
    expect(resolveStatus('open')).toBe('info');
  });

  it('UNKNOWN → neutral', () => {
    expect(resolveStatus('UNKNOWN')).toBe('neutral');
  });

  it('null input → neutral (null-safe)', () => {
    expect(resolveStatus(null as any)).toBe('neutral');
  });

  it('undefined input → neutral', () => {
    expect(resolveStatus(undefined as any)).toBe('neutral');
  });
});

describe('StatusTag component', () => {
  it('renders children as text', () => {
    // Dynamically import to avoid TS noise at module level
    const { StatusTag } = require('./StatusTag');
    const React = require('react');
    const { render, screen } = require('@testing-library/react');

    render(React.createElement(StatusTag, { status: 'success' }, 'PAID'));
    expect(screen.getByText('PAID')).toBeTruthy();
  });
});
