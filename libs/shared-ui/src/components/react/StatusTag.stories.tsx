import type { Meta, StoryObj } from '@storybook/react';
import { StatusTag, resolveStatus } from './StatusTag';

/**
 * `StatusTag` renders a semantic color-coded pill for entity states.
 * It maps common civic/health status strings automatically via `resolveStatus()`.
 *
 * **Auto-resolved values:**
 * - `success` → PAID, APPROVED, ACTIVE, CLEARED, COMPLETED, IN GOOD
 * - `error`   → OVERDUE, ARREARS, FAILED, DENIED
 * - `warning` → PENDING, UNDER REVIEW, IN PROGRESS
 * - `info`    → SUBMITTED, OPEN, SCHEDULED
 * - `neutral` → everything else
 */
const meta = {
  title: 'Shared UI / React / StatusTag',
  component: StatusTag,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['success', 'warning', 'error', 'info', 'neutral'],
      description: 'Semantic color variant',
      table: { defaultValue: { summary: 'neutral' } },
    },
    children: {
      control: 'text',
      description: 'Label text displayed in the tag',
    },
  },
} satisfies Meta<typeof StatusTag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: { status: 'success', children: 'APPROVED' },
};

export const Warning: Story = {
  args: { status: 'warning', children: 'PENDING' },
};

export const Error: Story = {
  args: { status: 'error', children: 'OVERDUE' },
};

export const Info: Story = {
  args: { status: 'info', children: 'SCHEDULED' },
};

export const Neutral: Story = {
  args: { status: 'neutral', children: 'UNKNOWN' },
};

/** All 5 status variants in a row. */
export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '16px' }}>
      {(['success', 'warning', 'error', 'info', 'neutral'] as const).map(s => (
        <StatusTag key={s} status={s}>{s.toUpperCase()}</StatusTag>
      ))}
    </div>
  ),
};

/** Demonstrates the `resolveStatus()` helper with real portal values. */
export const AutoResolved: Story = {
  render: () => {
    const samples = [
      'PAID', 'APPROVED', 'ACTIVE', 'CLEARED',
      'PENDING', 'UNDER REVIEW', 'IN PROGRESS',
      'OVERDUE', 'ARREARS', 'DENIED',
      'SCHEDULED', 'OPEN', 'SUBMITTED',
      'UNKNOWN',
    ];
    return (
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '16px' }}>
        {samples.map(s => (
          <StatusTag key={s} status={resolveStatus(s)}>{s}</StatusTag>
        ))}
      </div>
    );
  },
};
