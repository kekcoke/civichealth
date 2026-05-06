import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  describe('variant styles', () => {
    it('variant="primary" — background #0f62fe, color #fff', () => {
      render(<Button variant="primary">Primary</Button>);
      const btn = screen.getByRole('button');
      expect(btn.style.background).toBe('#0f62fe');
      expect(btn.style.color).toBe('#ffffff');
    });

    it('variant="secondary" — background #161616', () => {
      render(<Button variant="secondary">Secondary</Button>);
      expect(screen.getByRole('button').style.background).toBe('#161616');
    });

    it('variant="tertiary" — border 1px solid #0f62fe, bg #fff', () => {
      render(<Button variant="tertiary">Tertiary</Button>);
      const btn = screen.getByRole('button');
      expect(btn.style.background).toBe('#ffffff');
      expect(btn.style.border).toContain('#0f62fe');
    });

    it('variant="ghost" — transparent background', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const btn = screen.getByRole('button');
      // 'transparent' may be stored as 'rgba(0,0,0,0)' or 'transparent'
      expect(['transparent', 'rgba(0,0,0,0)']).toContain(btn.style.background);
    });

    it('variant="danger" — background #da1e28', () => {
      render(<Button variant="danger">Danger</Button>);
      expect(screen.getByRole('button').style.background).toBe('#da1e28');
    });
  });

  describe('base styles', () => {
    it('minHeight is 48px', () => {
      render(<Button>Base</Button>);
      expect(screen.getByRole('button').style.minHeight).toBe('48px');
    });

    it('borderRadius is 0 (Carbon square corners)', () => {
      render(<Button>Base</Button>);
      expect(screen.getByRole('button').style.borderRadius).toBe('0px');
    });
  });

  describe('native attribute spreading', () => {
    it('accepts and applies disabled prop', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('accepts onClick handler', async () => {
      const onClick = jasmine.createSpy('onClick');
      render(<Button onClick={onClick}>Click me</Button>);
      await userEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('renders children as button label', () => {
      render(<Button>Save Preferences</Button>);
      expect(screen.getByText('Save Preferences')).toBeTruthy();
    });
  });
});
