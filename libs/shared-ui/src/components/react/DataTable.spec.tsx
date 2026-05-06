import React from 'react';
import { render, screen } from '@testing-library/react';
import { DataTable } from './DataTable';

describe('DataTable', () => {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status', isStatus: true },
    { key: 'amount', label: 'Amount' },
  ];

  const rows = [
    { name: 'Invoice A', status: 'PAID', amount: 1000 },
    { name: 'Invoice B', status: 'OVERDUE', amount: 500 },
  ];

  it('renders empty message when data is empty', () => {
    render(<DataTable columns={columns} data={[]} />);
    expect(screen.getByText('No records found.')).toBeTruthy();
  });

  it('renders table with data', () => {
    render(<DataTable columns={columns} data={rows} />);
    expect(screen.getByText('Invoice A')).toBeTruthy();
    expect(screen.getByText('Invoice B')).toBeTruthy();
  });

  it('renders column headers', () => {
    render(<DataTable columns={columns} data={rows} />);
    expect(screen.getByText('Name')).toBeTruthy();
    expect(screen.getByText('Status')).toBeTruthy();
    expect(screen.getByText('Amount')).toBeTruthy();
  });
});
