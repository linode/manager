import { FeatureFlagClient } from '@akamai/compute-ui-core/feature-flags';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mediaQuery from 'css-mediaquery';
import * as React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import type { FieldValues, UseFormProps } from 'react-hook-form';
import { Provider as ReduxStoreProvider } from 'react-redux';

import { FeatureFlagProvider } from 'src/featureFlags';
import { storeFactory } from 'src/store';

import type { FeatureFlagProvider as FeatureFlagProviderType } from '@akamai/compute-ui-core/feature-flags';
import type { QueryClient as QueryClientType } from '@tanstack/react-query';
import type { AnyRootRoute, AnyRouter } from '@tanstack/react-router';
import type { FlagSet } from 'src/featureFlags';

/**
 * Resolves a shadow DOM query on a host element.
 */
export const getShadowRootElement = <T extends Element>(
  host: HTMLElement,
  selector: string
): Promise<null | T> => {
  return new Promise((resolve) => {
    const shadowRoot = host.shadowRoot;

    if (!shadowRoot) {
      resolve(null);
      return;
    }

    const element = shadowRoot.querySelector<T>(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = shadowRoot.querySelector<T>(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(shadowRoot, { childList: true, subtree: true });
  });
};

/** jsdom does not implement scrollIntoView; CDS select calls it when opening. */
export const mockScrollIntoView = () => {
  Element.prototype.scrollIntoView ??= vi.fn();
};

export const changeCdsTextField = async (host: HTMLElement, value: string) => {
  const input = await getCdsTextFieldInput(host);

  if (!input) {
    throw new Error('cds-text-field input not found');
  }

  await act(async () => {
    fireEvent.input(input, { target: { value } });
    fireEvent.change(input, { target: { value } });

    host.dispatchEvent(
      new CustomEvent('change', {
        bubbles: true,
        composed: true,
        detail: value,
      })
    );
  });
};

export const changeCdsTextArea = async (host: HTMLElement, value: string) => {
  const textarea = await getShadowRootElement<HTMLTextAreaElement>(
    host,
    'textarea'
  );

  if (!textarea) {
    throw new Error('cds-text-area textarea not found');
  }

  await act(async () => {
    fireEvent.input(textarea, { target: { value } });
    fireEvent.change(textarea, { target: { value } });

    host.dispatchEvent(
      new CustomEvent('change', {
        bubbles: true,
        composed: true,
        detail: value,
      })
    );
  });
};

export const submitCdsDrawerForm = () => {
  const form =
    document.querySelector('cds-drawer form') ??
    document.querySelector('form[slot="body"]');

  if (!form) {
    throw new Error('drawer form not found');
  }

  fireEvent.submit(form);
};

export const expectCdsFormError = async (text: RegExp | string) => {
  await waitFor(() => {
    const errors = Array.from(
      document.querySelectorAll<HTMLElement>('cds-form-error')
    );

    expect(errors.length).toBeGreaterThan(0);

    expect(
      errors.some((error) => {
        const content =
          error.innerText ||
          Array.from(error.childNodes)
            .map((node) => node.textContent ?? '')
            .join('') ||
          error.textContent ||
          '';

        return typeof text === 'string'
          ? content.includes(text)
          : text.test(content);
      })
    ).toBe(true);
  });
};

export const expectNotificationBannerText = async (text: string) => {
  await waitFor(() => {
    const banners = Array.from(
      document.querySelectorAll<HTMLElement>('cds-notification-banner')
    );

    expect(
      banners.some((banner) =>
        (banner.shadowRoot?.textContent ?? '').includes(text)
      )
    ).toBe(true);
  });
};

/**
 * Returns the `cds-button` host element whose trimmed text content matches the
 * given label.
 */
export const getCdsButtonHostByText = (
  root: ParentNode,
  text: string
): HTMLElement | undefined =>
  Array.from(root.querySelectorAll<HTMLElement>('cds-button')).find(
    (button) => button.textContent?.trim() === text
  );

/**
 * Resolves the real `<button>` element inside the shadow DOM of the
 * `cds-button` whose text content matches the given label.
 */
export const getCdsButtonByText = async (
  root: ParentNode,
  text: string
): Promise<HTMLButtonElement | null> => {
  const host = getCdsButtonHostByText(root, text);
  if (!host) {
    return null;
  }
  return getShadowRootElement<HTMLButtonElement>(host, 'button');
};

/**
 * Resolves the real `<input>` element inside a `cds-text-field` shadow DOM.
 */
export const getCdsTextFieldInput = async (
  host: HTMLElement
): Promise<HTMLInputElement | null> => {
  return getShadowRootElement<HTMLInputElement>(host, 'input');
};

export const getCdsTooltipHostByText = (
  root: ParentNode,
  text: string
): HTMLElement | undefined =>
  Array.from(root.querySelectorAll<HTMLElement>('cds-tooltip')).find(
    (tooltip) => (tooltip as any).tooltipText === text
  );

export const openActionMenu = async () => {
  const menu = screen.getByTestId('user-action-menu');

  await waitFor(() => {
    expect(menu.shadowRoot?.querySelector('cds-icon')).toBeTruthy();
  });

  const trigger = menu.shadowRoot?.querySelector('cds-icon');
  await userEvent.click(trigger as HTMLElement);
};

// Helper to get the switch control inside a `cds-switch` host element.
export const getSwitchControl = (hostEl: HTMLElement) =>
  getShadowRootElement<HTMLButtonElement>(hostEl, 'button[role="switch"]');

/** `cds-table-row` host elements in the light DOM (Lit slotted children). */
export const getCdsTableRowHosts = (root: ParentNode): HTMLElement[] =>
  Array.from(root.querySelectorAll<HTMLElement>('cds-table-row'));

/**
 * Resolves the rendered `.row` element inside each `cds-table-row` shadow DOM.
 * Prefer this over `getAllByRole('row')`, which does not pierce CDS shadow roots.
 */
export const getCdsTableRows = async (
  root: ParentNode
): Promise<HTMLElement[]> => {
  await waitFor(() => {
    expect(getCdsTableRowHosts(root).length).toBeGreaterThan(0);
  });

  const hosts = getCdsTableRowHosts(root);
  const rows = await Promise.all(
    hosts.map((host) => getShadowRootElement<HTMLElement>(host, '.row'))
  );

  return rows.filter((row): row is HTMLElement => row !== null);
};

// ============================================================================
// Theme Rendering Helpers
// ============================================================================

export const mockMatchMedia = (matches: boolean = true) => {
  window.matchMedia = vi.fn().mockImplementation((query) => {
    return {
      addEventListener: () => vi.fn(),
      addListener: vi.fn(),
      matches,
      media: query,
      onchange: null,
      removeEventListener: () => vi.fn(),
      removeListener: vi.fn(),
    };
  });
};

const createMatchMedia = (width: number) => {
  return (query: string) => {
    return {
      addEventListener: () => vi.fn(),
      addListener: () => vi.fn(),
      dispatchEvent: () => true,
      matches: mediaQuery.match(query, { width }),
      media: '',
      onchange: () => vi.fn(),
      removeEventListener: () => vi.fn(),
      removeListener: () => vi.fn(),
    };
  };
};

export const resizeScreenSize = (width: number) => {
  window.matchMedia = createMatchMedia(width);
};

interface Options {
  flags?: FlagSet;
  initialEntries?: string[];
  initialRoute?: string;
  queryClient?: QueryClientType;
  router?: AnyRouter;
  routeTree?: AnyRootRoute;
}

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: Infinity,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        retry: false,
      },
    },
  });

export const wrapWithProviders = (ui: any, options: Options = {}) => {
  const { queryClient: passedQueryClient } = options;
  const queryClient = passedQueryClient ?? createTestQueryClient();

  const uiToRender = ui.children ?? ui;

  const rootRoute = createRootRoute({});
  const indexRoute = createRoute({
    component: () => uiToRender,
    getParentRoute: () => rootRoute,
    path: options.initialRoute ?? '/',
  });

  const router: AnyRouter =
    options.router ??
    createRouter({
      history: createMemoryHistory({
        initialEntries: options.initialEntries ?? [options.initialRoute ?? '/'],
      }),
      routeTree: rootRoute.addChildren([indexRoute]),
    });

  class MockFlagProvider implements FeatureFlagProviderType<FlagSet, unknown> {
    getFlag(key: keyof FlagSet) {
      return (options.flags as FlagSet)[key] as any;
    }

    getFlags() {
      return options.flags ?? {};
    }

    async identify() {}

    async start() {}

    subscribe() {
      return () => {};
    }
  }

  const featureFlagClient = new FeatureFlagClient<FlagSet, unknown>({
    provider: () => new MockFlagProvider(),
  });

  return (
    <ReduxStoreProvider store={storeFactory()}>
      <QueryClientProvider client={passedQueryClient || queryClient}>
        <FeatureFlagProvider client={featureFlagClient}>
          <RouterProvider router={router} />
        </FeatureFlagProvider>
      </QueryClientProvider>
    </ReduxStoreProvider>
  );
};

// When wrapping a TableRow component to test, we'll get an invalid DOM nesting
// error complaining that a <tr /> cannot appear as a child of a <div />. This
// is a wrapper around `wrapWithProviders()` that renders the `ui` argument in a
// <table /> and <tbody />.
export const wrapWithTableBody = (ui: any, options: Options = {}) =>
  wrapWithProviders(
    <table>
      <tbody>{ui}</tbody>
    </table>,
    options
  );

export const renderWithProviders = (
  ui: React.ReactNode,
  options: Options = {}
) => {
  const rootRoute = createRootRoute({});
  const indexRoute = createRoute({
    component: () => ui,
    getParentRoute: () => rootRoute,
    path: options.initialRoute ?? '/',
  });

  const router: AnyRouter = createRouter({
    history: createMemoryHistory({
      initialEntries: (options.initialEntries as string[]) ?? [
        options.initialRoute ?? '/',
      ],
    }),
    routeTree: rootRoute.addChildren([indexRoute]),
  });

  const utils = render(wrapWithProviders(ui, { ...options, router }));
  return {
    ...utils,
    rerender: (ui: React.ReactNode) =>
      utils.rerender(wrapWithProviders(ui, options)),
    router,
  };
};

interface UseFormPropsWithChildren<T extends FieldValues>
  extends UseFormProps<T> {
  children: React.ReactNode;
}

const FormContextWrapper = <T extends FieldValues>(
  props: UseFormPropsWithChildren<T>
) => {
  const formMethods = useForm<T>(props);

  return <FormProvider {...formMethods}>{props.children}</FormProvider>;
};

interface RenderWithProvidersAndHookFormOptions<T extends FieldValues> {
  component: React.ReactElement<any>;
  options?: Options;
  useFormOptions?: UseFormProps<T>;
}

export const wrapWithFormContext = <T extends FieldValues>(
  options: RenderWithProvidersAndHookFormOptions<T>
) => {
  return (
    <FormContextWrapper {...options.useFormOptions}>
      {options.component}
    </FormContextWrapper>
  );
};

export const renderWithProvidersAndHookFormContext = <T extends FieldValues>(
  options: RenderWithProvidersAndHookFormOptions<T>
) => {
  return renderWithProviders(
    <FormContextWrapper {...options.useFormOptions}>
      {options.component}
    </FormContextWrapper>,
    options.options
  );
};
