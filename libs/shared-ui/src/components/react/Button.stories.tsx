import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Button } from './Button';

/**
 * The `Button` component follows IBM Carbon design principles:
 * - 0px border radius (square corners)
 * - IBM Plex Sans 14px / 400 weight
 * - 48px minimum touch target height
 * - 5 semantic variants mapping to the portal's design system
 */
const meta = {
  title: 'Shared UI / React / Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'ghost', 'danger'],
      description: 'Visual variant following Carbon button hierarchy',
      table: { defaultValue: { summary: 'primary' } },
    },
    children: {
      control: 'text',
      description: 'Button label or content',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the button',
    },
    onClick: { action: 'clicked' },
  },
  args: {
    onClick: fn(),
    children: 'Button Label',
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { variant: 'primary', children: 'Primary Action' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Secondary Action' },
};

export const Tertiary: Story = {
  args: { variant: 'tertiary', children: 'Tertiary Action' },
};

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Ghost Action' },
};

export const Danger: Story = {
  args: { variant: 'danger', children: 'Delete Record' },
};

export const Disabled: Story = {
  args: { variant: 'primary', children: 'Disabled', disabled: true },
};

export const WithIcon: Story = {
  args: { variant: 'primary', children: '📋  View Permits' },
};

/** All variants side-by-side for visual comparison. */
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', padding: '16px', background: '#f4f4f4' }}>
      {(['primary', 'secondary', 'tertiary', 'ghost', 'danger'] as const).map(v => (
        <Button key={v} variant={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</Button>
      ))}
    </div>
  ),
};
