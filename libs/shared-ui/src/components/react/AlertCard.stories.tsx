import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { AlertCard } from './AlertCard';

/**
 * `AlertCard` is a Carbon-style feature card used on dashboards to surface
 * notifications, warnings, and action items.
 *
 * Design tokens:
 * - White canvas background (`#ffffff`)
 * - 1px hairline border (`#e0e0e0`)
 * - 4px left accent bar by severity color
 * - 0px border radius
 * - 24px padding
 */
const meta = {
  title: 'Shared UI / React / AlertCard',
  component: AlertCard,
  tags: ['autodocs'],
  argTypes: {
    severity: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error'],
      description: 'Controls the left accent bar color',
      table: { defaultValue: { summary: 'info' } },
    },
    title: {
      control: 'text',
      description: 'Card heading',
    },
    icon: {
      control: 'text',
      description: 'Emoji or text icon displayed before the title',
    },
    actionLabel: {
      control: 'text',
      description: 'Optional CTA link label',
    },
    onAction: { action: 'action clicked' },
    children: {
      control: 'text',
      description: 'Card body content',
    },
  },
  args: {
    onAction: fn(),
  },
  decorators: [
    Story => (
      <div style={{ maxWidth: 480, padding: '24px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AlertCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {
  args: {
    severity: 'info',
    title: 'Appointment Reminder',
    icon: '📅',
    children: 'You have a General Checkup with Dr. Smith on May 10 at 09:00 AM — Downtown Clinic, Room 3A.',
    actionLabel: 'View Appointments',
  },
};

export const Success: Story = {
  args: {
    severity: 'success',
    title: 'Permit Approved',
    icon: '✅',
    children: 'Your Home Renovation permit (#882) has been approved and is ready for payment.',
    actionLabel: 'Proceed to Payment',
  },
};

export const Warning: Story = {
  args: {
    severity: 'warning',
    title: 'Tax Payment Due Soon',
    icon: '⚠️',
    children: 'Your Property Tax invoice INV-0092 of ₱1,250.00 is due on May 15, 2026.',
    actionLabel: 'Pay Now',
  },
};

export const Error: Story = {
  args: {
    severity: 'error',
    title: 'Abnormal Lab Result',
    icon: '🧪',
    children: 'Your Lipid Panel result from Apr 12 has been flagged as ABNORMAL. Please contact your provider.',
    actionLabel: 'View Report',
  },
};

export const NoAction: Story = {
  args: {
    severity: 'info',
    title: 'System Maintenance',
    icon: '🔧',
    children: 'Scheduled maintenance on May 8, 2026 from 00:00–02:00 UTC. No data loss expected.',
  },
};

/** All 4 severity levels in a column. */
export const AllSeverities: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px', maxWidth: 500 }}>
      {(['info', 'success', 'warning', 'error'] as const).map(s => (
        <AlertCard key={s} severity={s} title={`${s.charAt(0).toUpperCase() + s.slice(1)} Alert`} icon={
          { info: 'ℹ️', success: '✅', warning: '⚠️', error: '🚨' }[s]
        }>
          This is a sample {s} message body explaining the situation to the user.
        </AlertCard>
      ))}
    </div>
  ),
};
