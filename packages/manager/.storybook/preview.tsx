import React from 'react';
import { MINIMAL_VIEWPORTS } from '@storybook/addon-viewport';
import { wrapWithTheme } from '../src/utilities/testHelpers';
import { useDarkMode } from 'storybook-dark-mode-v7';
import { DocsContainer as BaseContainer } from '@storybook/addon-docs';
import { themes } from '@storybook/theming';
import '../public/fonts/fonts.css';
import '../src/index.css';

export const DocsContainer = ({ children, context }) => {
  const isDark = useDarkMode();

  return (
    <BaseContainer
      theme={{
        ...themes[isDark ? 'dark' : 'normal'],
        base: isDark ? 'dark' : 'light',
      }}
      context={context}
    >
      {children}
    </BaseContainer>
  );
};

export const decorators = [
  (Story) => {
    const isDark = useDarkMode();
    return wrapWithTheme(<Story />, { theme: isDark ? 'dark' : 'light' });
  },
];

MINIMAL_VIEWPORTS.mobile1.styles = {
  height: '667px',
  width: '375px',
};

export const parameters = {
  controls: { expanded: true },
  darkMode: {
    dark: { ...themes.dark },
    light: { ...themes.normal },
  },
  options: {
    storySort: {
      method: 'alphabetical',
      order: ['Intro', 'Features', 'Components', 'Elements', 'Core Styles'],
    },
  },
  viewMode: 'docs',
  viewport: {
    viewports: MINIMAL_VIEWPORTS,
  },
  docs: {
    container: DocsContainer,
  },
};
