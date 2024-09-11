// ***********************************************************
// This example support/component.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import * as React from 'react';
import { mount } from 'cypress/react18';

import { Provider } from 'react-redux';
import { LDProvider } from 'launchdarkly-react-client-sdk';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientFactory } from '@src/queries/base';
import { LinodeThemeWrapper } from 'src/LinodeThemeWrapper';
import { SnackbarProvider } from 'notistack';
import { MemoryRouter } from 'react-router-dom';
import { storeFactory } from 'src/store';

import '@testing-library/cypress/add-commands';
import { ThemeName } from 'src/foundations/themes';

import 'cypress-axe';

// Load fonts using Vite rather than HTML `<link />`.
import '../../../public/fonts/fonts.css';

/**
 * Mounts a component with a Cloud Manager theme applied.
 *
 * @param jsx - React Component to mount.
 * @param theme - Cloud Manager theme to apply. Defaults to `light`.
 */
export const mountWithTheme = (
  jsx: React.ReactNode,
  theme: ThemeName = 'light',
  flags: any = {}
) => {
  const queryClient = queryClientFactory();
  const store = storeFactory();

  return mount(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <LinodeThemeWrapper theme={theme}>
          <LDProvider
            clientSideID={''}
            deferInitialization
            flags={flags}
            options={{ bootstrap: flags }}
          >
            <SnackbarProvider>
              <MemoryRouter>{jsx}</MemoryRouter>
            </SnackbarProvider>
          </LDProvider>
        </LinodeThemeWrapper>
      </QueryClientProvider>
    </Provider>
  );
};

// Augment the Cypress namespace to include type definitions for
// your custom command.
// Alternatively, can be defined in cypress/support/component.d.ts
// with a <reference path="./component" /> at the top of your spec.
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
      mountWithTheme: typeof mountWithTheme;
    }
  }
}

Cypress.Commands.add('mount', mount);
Cypress.Commands.add('mountWithTheme', mountWithTheme);
