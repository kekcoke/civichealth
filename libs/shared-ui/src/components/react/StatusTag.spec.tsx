import React from 'react';
import { render, screen } from '@testing-library/react';
import { resolveStatus, StatusTag } from './StatusTag';

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
    expect(resolveStatus(null as unknown as string)).toBe('neutral');
  });

  it('undefined input → neutral', () => {
    expect(resolveStatus(undefined as unknown as string)).toBe('neutral');
  });
});

describe('StatusTag component', () => {
  it('renders children as text', () => {
    render(<StatusTag status="success">PAID</StatusTag>);
    expect(screen.getByText('PAID')).toBeTruthy();
  });
});
