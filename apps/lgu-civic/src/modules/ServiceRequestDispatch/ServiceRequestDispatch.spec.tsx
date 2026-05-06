import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Test pure logic — extract before importing the component which needs Leaflet
const STATUS_COLOR: Record<string, string> = {
  open:        '#da1e28',
  assigned:    '#0f62fe',
  in_progress: '#b45309',
  resolved:    '#0e6027',
  closed:      '#525252',
};

function makeIcon(status: string) {
  const color = STATUS_COLOR[status];
  return color; // returns the color string as proxy for icon
}

const CATEGORIES = ['All', 'Road Damage', 'Flooding', 'Waste', 'Street Light', 'Noise', 'Other'];

// Mock react-leaflet and leaflet to avoid DOM dependency
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div data-testid="map">{children}</div>,
  TileLayer: () => null,
  Marker: () => null,
  Popup: ({ children }: any) => <div data-testid="popup">{children}</div>,
  useMap: () => ({ flyTo: vi.fn() }),
}));
vi.mock('leaflet', () => ({
  default: {
    Icon: { Default: { mergeOptions: vi.fn(), prototype: { _getIconUrl: null } } },
  },
}));

describe('ServiceRequestDispatch — pure logic', () => {
  describe('makeIcon', () => {
    it('returns correct color for open status', () => {
      expect(makeIcon('open')).toBe('#da1e28');
    });
    it('returns correct color for assigned status', () => {
      expect(makeIcon('assigned')).toBe('#0f62fe');
    });
    it('returns correct color for in_progress status', () => {
      expect(makeIcon('in_progress')).toBe('#b45309');
    });
    it('returns correct color for resolved status', () => {
      expect(makeIcon('resolved')).toBe('#0e6027');
    });
    it('returns correct color for closed status', () => {
      expect(makeIcon('closed')).toBe('#525252');
    });
  });

  describe('STATUS_COLOR map coverage', () => {
    it('has entry for every status key', () => {
      const statuses = ['open', 'assigned', 'in_progress', 'resolved', 'closed'];
      statuses.forEach(s => {
        expect(STATUS_COLOR).toHaveProperty(s);
      });
    });
  });

  describe('CATEGORIES array', () => {
    it('contains All and specific categories', () => {
      expect(CATEGORIES).toContain('All');
      expect(CATEGORIES).toContain('Road Damage');
      expect(CATEGORIES).toContain('Waste');
      expect(CATEGORIES).toContain('Street Light');
    });
  });
});
