import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  describe('renders', () => {
    it('renders button with text', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByText('Click me')).toBeTruthy();
    });

    it('renders primary button', () => {
      render(<Button variant="primary">Primary</Button>);
      expect(screen.getByRole('button')).toBeTruthy();
    });

    it('renders secondary button', () => {
      render(<Button variant="secondary">Secondary</Button>);
      expect(screen.getByRole('button')).toBeTruthy();
    });

    it('renders danger button', () => {
      render(<Button variant="danger">Danger</Button>);
      expect(screen.getByRole('button')).toBeTruthy();
    });
  });

  describe('disabled state', () => {
    it('renders disabled button', () => {
      render(<Button disabled>Disabled</Button>);
      const btn = screen.getByRole('button');
      expect(btn).toBeTruthy();
    });
  });

  describe('onClick handler', () => {
    it('calls onClick when clicked', async () => {
      const onClick = jest.fn();
      render(<Button onClick={onClick}>Click me</Button>);
      await userEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });
});
