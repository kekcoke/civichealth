import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { DataTable } from './DataTable';

/**
 * `DataTable` is a Carbon-style data grid used across the portal for
 * tabular civic and health data.
 *
 * Features:
 * - Alternating row shading (`surface-1`)
 * - 1px hairline borders, 0px radius
 * - Built-in `StatusTag` rendering for status columns
 * - Optional row action button
 * - Empty state message
 */
const meta = {
  title: 'Shared UI / React / DataTable',
  component: DataTable,
  tags: ['autodocs'],
  argTypes: {
    columns: { description: 'Column definitions (key, label, isStatus, render, width)' },
    data: { description: 'Array of row objects' },
    actionLabel: { control: 'text', description: 'Label for the row action button' },
    onRowAction: { action: 'row action clicked' },
  },
  args: { onRowAction: fn() },
  decorators: [
    Story => (
      <div style={{ padding: '24px', background: '#f4f4f4' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Sample datasets ────────────────────────────────────────────────────────

const invoiceColumns = [
  { key: 'invoiceNumber', label: 'Invoice #', width: '120px' },
  { key: 'type', label: 'Type' },
  { key: 'dueDate', label: 'Due Date', width: '110px' },
  { key: 'amount', label: 'Amount', width: '110px' },
  { key: 'status', label: 'Status', width: '120px', isStatus: true },
];

const invoiceData = [
  { invoiceNumber: 'INV-0092', type: 'Property Tax',  dueDate: '05/15/2026', amount: '₱1,250.00', status: 'PENDING' },
  { invoiceNumber: 'INV-0041', type: 'Pet License',   dueDate: '01/10/2026', amount: '₱45.00',    status: 'PAID' },
  { invoiceNumber: 'INV-0033', type: 'Business Permit',dueDate: '12/31/2025',amount: '₱3,200.00', status: 'OVERDUE' },
];

const permitColumns = [
  { key: 'permitNumber', label: 'Permit #', width: '110px' },
  { key: 'description', label: 'Description' },
  { key: 'applicant', label: 'Applicant' },
  { key: 'status', label: 'Status', width: '130px', isStatus: true },
];

const permitData = [
  { permitNumber: '#882', description: 'Home Renovation (Kitchen)', applicant: 'John Doe',  status: 'APPROVED' },
  { permitNumber: '#901', description: 'Block Party (July 4th)',     applicant: 'Jane Roe',  status: 'UNDER REVIEW' },
  { permitNumber: '#915', description: 'Food Stall Operations',      applicant: 'Pedro Cruz', status: 'PENDING' },
];

const appointmentColumns = [
  { key: 'date', label: 'Date', width: '110px' },
  { key: 'type', label: 'Appointment Type' },
  { key: 'provider', label: 'Provider' },
  { key: 'location', label: 'Location' },
  { key: 'status', label: 'Status', width: '120px', isStatus: true },
];

const appointmentData = [
  { date: 'May 10, 2026', type: 'General Checkup',  provider: 'Dr. Smith',  location: 'Downtown Clinic, 3A', status: 'SCHEDULED' },
  { date: 'Apr 12, 2026', type: 'Bloodwork Lab',     provider: 'Dr. Reyes',  location: 'HA Lab Unit 2',       status: 'COMPLETED' },
  { date: 'Mar 05, 2026', type: 'Follow-up',         provider: 'Dr. Santos', location: 'Rural Health Unit 7', status: 'COMPLETED' },
];

// ── Stories ────────────────────────────────────────────────────────────────

export const InvoicesTable: Story = {
  name: 'Invoices (Civic)',
  args: {
    columns: invoiceColumns,
    data: invoiceData,
    actionLabel: 'Pay',
  },
};

export const PermitQueue: Story = {
  name: 'Permit Queue (Civic)',
  args: {
    columns: permitColumns,
    data: permitData,
    actionLabel: 'Review',
  },
};

export const AppointmentsTable: Story = {
  name: 'Appointments (Health)',
  args: {
    columns: appointmentColumns,
    data: appointmentData,
    actionLabel: 'View',
  },
};

export const EmptyState: Story = {
  name: 'Empty State',
  args: {
    columns: invoiceColumns,
    data: [],
    actionLabel: 'View',
  },
};

export const NoRowAction: Story = {
  name: 'No Row Action',
  args: {
    columns: permitColumns,
    data: permitData,
    onRowAction: undefined,
  },
};

/** Custom render function — e.g. adding a link in a cell. */
export const WithCustomRenderer: Story = {
  name: 'Custom Cell Renderer',
  args: {
    columns: [
      { key: 'name', label: 'Citizen' },
      { key: 'barangay', label: 'Barangay' },
      {
        key: 'status',
        label: 'Status',
        isStatus: true,
      },
      {
        key: 'actions',
        label: 'Quick Link',
        render: (row: any) => (
          <a href={`/citizens/${row.id}`} style={{ color: '#0f62fe', fontSize: 13 }}>
            Open Profile →
          </a>
        ),
      },
    ],
    data: [
      { id: '001', name: 'Juan dela Cruz', barangay: 'Poblacion', status: 'ACTIVE' },
      { id: '002', name: 'Maria Santos',   barangay: 'Bagong Ilog', status: 'ARREARS' },
    ],
  },
};
