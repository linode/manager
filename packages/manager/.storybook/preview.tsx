// .storybook/preview.js
import { select, withKnobs } from '@storybook/addon-knobs';
import { MINIMAL_VIEWPORTS } from '@storybook/addon-viewport';
import React from 'react';
import '../public/fonts/fonts.css';
import CssBaseline from '../src/components/core/CssBaseline';
import { ThemeProvider } from '../src/components/core/styles';
import '../src/index.css';
import { dark, light } from '../src/themes';
import { wrapWithTheme } from '../src/utilities/testHelpers';

const options = {
  dark,
  light,
};

export const decorators = [
  withKnobs,
  (Story) => {
    const _key = select('theme', ['light', 'dark'], 'light');

    return wrapWithTheme(
      <ThemeProvider theme={options[_key]}>
        <CssBaseline />
        {/* Keep this in case we want to change the background color based on the mode */}
        <div
          style={{
            backgroundColor: options[_key]().bg.app,
          }}
        >
          <Story />
        </div>
      </ThemeProvider>
    );
  },
];

MINIMAL_VIEWPORTS.mobile1.styles = {
  height: '667px',
  width: '375px',
};

export const parameters = {
  controls: { expanded: true },
  options: {
    storySort: {
      order: ['Intro', 'Components', 'UI Elements', 'Core'],
    },
  },
  previewTabs: {
    'storybook/docs/panel': { index: -1 },
  },
  viewport: {
    viewports: MINIMAL_VIEWPORTS,
  },
};

// Use the Mock Service Worker to mock API requests.
if (typeof global.process === 'undefined') {
  try {
    const { worker } = require('../src/mocks/testBrowser');
    worker.start();
  } catch (e) {
    console.warn('Unable to start the MSW', e);
  }
}
