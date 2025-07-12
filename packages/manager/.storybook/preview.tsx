import React from 'react';
import { Preview } from '@storybook/react-vite';
import { storybookWorker } from '../src/mocks/mswWorkers';
import { DocsContainer as BaseContainer } from '@storybook/addon-docs/blocks';
import {
  DARK_MODE_EVENT_NAME,
  useDarkMode,
} from '@vueless/storybook-dark-mode';
import { PropsWithChildren } from 'react';
import { addons } from 'storybook/preview-api';
import { themes } from './themes';
import {
  Title,
  Subtitle,
  Description,
  Primary,
  Controls,
  DocsContainerProps,
} from '@storybook/addon-docs/blocks';
import { wrapWithTheme } from '../src/utilities/testHelpers';
import '../src/index.css';
import '@reach/tabs/styles.css'; // @todo M3-6705 Remove this when replacing @reach/tabs with MUI Tabs

const channel = addons.getChannel();

storybookWorker.start({ onUnhandledRequest: 'bypass' });

/**
 * This exists as a workaround to get dark mode working in "docs" pages.
 * See https://github.com/hipstersmoothie/storybook-dark-mode/issues/282#issuecomment-2246463856
 */
function useDocsDarkMode() {
  const [isDark, setDark] = React.useState(channel.last(DARK_MODE_EVENT_NAME));

  React.useEffect(() => {
    channel.on(DARK_MODE_EVENT_NAME, setDark);
    return () => channel.off(DARK_MODE_EVENT_NAME, setDark);
  }, [channel, setDark]);

  return isDark;
}

export const DocsContainer = ({
  children,
  context,
}: PropsWithChildren<DocsContainerProps>) => {
  const isDark = useDocsDarkMode();

  return (
    <BaseContainer
      theme={isDark ? themes.dark : themes.light}
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
  parameters: {
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
    darkMode: {
      dark: themes.dark,
      light: themes.light,
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
      codePanel: true,
    },
  },
  tags: ['autodocs'],
};

export default preview;
