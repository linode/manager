import React from 'react';
import { Preview } from '@storybook/react';
import { MINIMAL_VIEWPORTS } from '@storybook/addon-viewport';
import {
  Title,
  Subtitle,
  Description,
  Primary,
  Controls,
  Stories,
} from '@storybook/blocks';
import { wrapWithTheme } from '../src/utilities/testHelpers';
import { useDarkMode } from 'storybook-dark-mode';
import { DocsContainer as BaseContainer } from '@storybook/addon-docs';
import { themes } from '@storybook/theming';
import { worker } from '../src/mocks/testBrowser';

import '../src/index.css';
import '@reach/tabs/styles.css';

MINIMAL_VIEWPORTS.mobile1.styles = {
  height: '667px',
  width: '375px',
};

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

const preview: Preview = {
  decorators: [
    (Story) => {
      const isDark = useDarkMode();
      return wrapWithTheme(<Story />, { theme: isDark ? 'dark' : 'light' });
    },
  ],
  loaders: [
    async () => ({
      msw: await worker?.start(),
    }),
  ],
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    backgrounds: {
      grid: {
        disable: true,
      },
    },
    options: {
      storySort: {
        method: 'alphabetical',
        order: ['Intro', 'Core Styles', 'Components', 'Features'],
      },
    },
    viewport: {
      viewports: MINIMAL_VIEWPORTS,
    },
    darkMode: {
      dark: { ...themes.dark },
      light: { ...themes.normal },
    },
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
      sort: 'requiredFirst',
    },
    docs: {
      container: DocsContainer,
      page: () => (
        <>
          <Title />
          <Subtitle />
          <Description />
          <Primary />
          <Controls />
          <Stories />
        </>
      ),
    },
  },
};

export default preview;
