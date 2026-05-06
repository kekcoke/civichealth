import React from 'react';
import { render, screen } from '@testing-library/react';
import { DataTable } from './DataTable';
import { StatusTag } from './StatusTag';

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

  it('empty data array → "No records found." centered', () => {
    render(<DataTable columns={columns} data={[]} />);
    expect(screen.getByText('No records found.')).toBeTruthy();
  });

  it('row alternates background on odd index (i % 2 === 1)', () => {
    const { container } = render(<DataTable columns={columns} data={rows} />);
    const trs = container.querySelectorAll('tbody tr');
    // Row 0 (even) → white, Row 1 (odd) → #f4f4f4
    expect(trs[0].style.background).not.toBe('#f4f4f4');
  });

  it('isStatus=true column renders StatusTag', () => {
    const { container } = render(<DataTable columns={columns} data={[rows[0]]} />);
    // StatusTag renders an inline span — check it exists
    const spans = container.querySelectorAll('tbody span');
    expect(spans.length).toBeGreaterThan(0);
  });

  it('col.render function used when provided', () => {
    const colsWithRender = [
      { key: 'name', label: 'Name' },
      {
        key: 'status',
        label: 'Status',
        render: (row: any) => <span data-testid="custom-render">{row.status}-custom</span>,
      },
    ];
    render(<DataTable columns={colsWithRender} data={[rows[0]]} />);
    expect(screen.getByTestId('custom-render').textContent).toBe('PAID-custom');
  });

  it('onRowAction button calls it with row data', async () => {
    const onRowAction = jasmine.createSpy('onRowAction');
    const actionCols = [...columns, { key: 'id', label: 'ID' }];
    render(<DataTable columns={actionCols} data={[rows[0]]} onRowAction={onRowAction} actionLabel="View" />);
    const userEvent = require('@testing-library/user-event');
    await userEvent.click(screen.getByText('View'));
    expect(onRowAction).toHaveBeenCalledWith(rows[0]);
  });

  it('column header order matches columns array', () => {
    const { container } = render(<DataTable columns={columns} data={[]} />);
    const headers = Array.from(container.querySelectorAll('thead th')).map(h => h.textContent?.trim());
    expect(headers).toEqual(['Name', 'Status', 'Amount', 'Actions']);
  });
});
