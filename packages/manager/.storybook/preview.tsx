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
import { wrapWithTheme, wrapWithRouter } from '../src/utilities/testHelpers';
import { useDarkMode } from 'storybook-dark-mode';
import { DocsContainer as BaseContainer } from '@storybook/addon-docs';
import { themes } from '@storybook/theming';
import { storybookWorker } from '../src/mocks/mswWorkers';

import '../src/index.css';
// TODO: M3-6705 Remove this when replacing @reach/tabs with MUI Tabs
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
    (Story, context) => {
      const isDark = useDarkMode();
      return context.parameters.tanStackRouter
        ? wrapWithTheme(wrapWithRouter(<Story />), {
            theme: isDark ? 'dark' : 'light',
          })
        : wrapWithTheme(<Story />, { theme: isDark ? 'dark' : 'light' });
    },
  ],
  loaders: [
    async () => ({
      msw: await storybookWorker?.start(),
    }),
  ],
  parameters: {
    backgrounds: {
      grid: {
        disable: true,
      },
    },
    options: {
      storySort: {
        method: 'alphabetical',
        order: [
          'Intro',
          'Design System',
          'Icons',
          'Foundations',
          'Components',
          'Features',
        ],
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
        </>
      ),
    },
  },
};

export default preview;
