import React from 'react';
import CssBaseline from '../src/components/core/CssBaseline';
import { StyledEngineProvider } from '@mui/material/styles';
import { MINIMAL_VIEWPORTS } from '@storybook/addon-viewport';
import { ThemeProvider } from '../src/components/core/styles';
import { dark, light } from '../src/themes';
import { wrapWithTheme } from '../src/utilities/testHelpers';
import '../public/fonts/fonts.css';
import '../src/index.css';

const options = {
  dark,
  light,
};

export const decorators = [
  (Story) => {
    return wrapWithTheme(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={light}>
          <CssBaseline />
          {/* Keep this in case we want to change the background color based on the mode */}
          {/* <div
          style={{
            backgroundColor: options[_key]().bg.app,
          }}
        > */}
          <Story />
          {/* </div> */}
        </ThemeProvider>
      </StyledEngineProvider>
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
      order: ['Intro', 'Features', 'Components', 'Elements', 'Core Styles'],
    },
  },
  previewTabs: {
    'storybook/docs/panel': { index: -1 },
  },
  viewMode: 'docs',
  viewport: {
    viewports: MINIMAL_VIEWPORTS,
  },
};
