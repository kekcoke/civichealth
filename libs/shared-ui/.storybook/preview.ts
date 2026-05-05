import type { Preview } from '@storybook/react';
import '../src/tokens/design-tokens.css';

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'canvas',
      values: [
        { name: 'canvas',  value: '#f4f4f4' },
        { name: 'white',   value: '#ffffff' },
        { name: 'dark',    value: '#161616' },
      ],
    },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/ } },
    docs: {
      description: {
        component: '',
      },
    },
    layout: 'padded',
  },
};

export default preview;
