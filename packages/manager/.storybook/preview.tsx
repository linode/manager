// .storybook/preview.js
import React from 'react';
import CssBaseline from '../src/components/core/CssBaseline';
import { select, withKnobs } from '@storybook/addon-knobs';
import { MINIMAL_VIEWPORTS } from '@storybook/addon-viewport';
import { ThemeProvider } from '../src/components/core/styles';
import { dark, light } from '../src/themes';
import { wrapWithTheme } from '../src/utilities/testHelpers';
import { initialize, mswDecorator } from 'msw-storybook-addon';
import { handlers } from '../src/mocks/serverHandlers';
import '../public/fonts/fonts.css';
import '../src/index.css';

const options = {
  dark,
  light,
};

initialize({
  onUnhandledRequest: 'warn',
});

export const decorators = [
  mswDecorator,
  withKnobs,
  (Story) => {
    const _key = select('theme', ['light', 'dark'], 'light');

    return wrapWithTheme(
      <ThemeProvider theme={options[_key]}>
        <CssBaseline />
        {/* Keep this in case we want to change the background color based on the mode */}
        {/* <div
          style={{
            backgroundColor: options[_key]().cmrBGColors.bgApp,
          }}
        > */}
        <Story />
        {/* </div> */}
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
      method: 'alphabetical',
      order: ['Guidelines', 'Components', 'UI Elements', 'Core'],
    },
  },
  viewport: {
    viewports: MINIMAL_VIEWPORTS,
  },
  msw: handlers,
};
