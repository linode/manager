import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup, configure } from '@testing-library/react';
import { expect } from 'vitest';

import { server } from './mocks/testServer';

/**
 * Stub LaunchDarkly in unit tests: avoids loading the real SDK (slow, flaky teardown
 * when several Vitest processes run) while preserving `LDProvider` + `flags` behavior
 * via React context so `renderWithTheme(..., { flags })` keeps working.
 */
vi.mock('launchdarkly-react-client-sdk', async () => {
  const React = await import('react');
  const LDFlagsContext = React.createContext<Record<string, unknown>>({});

  return {
    LDProvider: ({
      children,
      flags,
    }: {
      children?: React.ReactNode;
      flags?: Record<string, unknown>;
    }) =>
      React.createElement(
        LDFlagsContext.Provider,
        { value: flags ?? {} },
        children ?? null
      ),
    useFlags: () => React.useContext(LDFlagsContext),
    useLDClient: () => ({
      identify: vi.fn().mockResolvedValue(undefined),
    }),
    withLDProvider: () => (Component: React.ComponentType) => Component,
  };
});

expect.extend(matchers);

// Configure testing-library timeouts for CI stability
configure({
  asyncUtilTimeout: process.env.CI ? 10000 : 5000, // Increase waitFor timeout in CI
});

afterEach(() => {
  cleanup();
});

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }), 30000); // 30s timeout for MSW setup
afterAll(() => server.close(), 30000); // 30s timeout for cleanup
afterEach(() => server.resetHandlers());

// @ts-expect-error this prevents some console errors
HTMLCanvasElement.prototype.getContext = () => {
  return 0;
};

/**
 * When we mock chartjs below, we need
 * to use a class component for Line,
 * bc our abstraction passes a ref to it.
 *
 * The tests will pass without this hack,
 * but there will be a console warning
 * reminding us that function components can't
 * have Refs.
 */

vi.mock('chart.js', () => ({
  _adapters: {
    _date: {
      override: vi.fn(),
    },
  },
  Chart: vi.fn(),
  defaults: {
    global: {
      defaultFontFamily: '',
      defaultFontSize: '',
      defaultFontStyle: '',
    },
  },
}));

vi.mock('highlight.js/lib/highlight', () => ({
  default: {
    configure: vi.fn(),
    highlightBlock: vi.fn(),
    registerLanguage: vi.fn(),
  },
}));

// Mock ResizeObserver for tests
global.ResizeObserver = class ResizeObserver {
  disconnect() {}
  observe() {}
  unobserve() {}
};

// @ts-expect-error Mock IntersectionObserver for tests
global.IntersectionObserver = class IntersectionObserver {
  disconnect() {}
  observe() {}
  unobserve() {}
};

/**
 ***************************************
 *  Custom matchers & matchers overrides
 ***************************************
 */

/**
 * Matcher override for toBeDisabled and toBeEnabled
 *
 * The reason for overriding those matchers is that we need to check for the aria-disabled attribute as well.
 * When a button is disabled, it will not necessarily have the `disabled` attribute. but it will have an aria-disabled attribute set to true.
 */
const ariaDisabledAttribute = 'aria-disabled';

const isElementDisabled = (element: HTMLElement) => {
  // We really only want to check for `aria-disabled` on buttons since this is a Cloud Manager customization
  return element.tagName.toLowerCase() === 'button'
    ? element.getAttribute(ariaDisabledAttribute) === 'true' ||
        element.hasAttribute('disabled')
    : element.hasAttribute('disabled');
};

interface HandleResult {
  condition: boolean;
  element: HTMLElement;
  expectedState: 'disabled' | 'enabled';
  thisInstance: any;
}

const handleResult = ({
  condition,
  element,
  expectedState,
  thisInstance,
}: HandleResult) => {
  const message = `${thisInstance?.utils?.printReceived(
    element ?? ''
  )}\n\n expected ${element?.tagName} to be ${expectedState}`;
  return condition
    ? {
        message: () => '',
        pass: true,
      }
    : {
        message: () => message,
        pass: false,
      };
};

expect.extend({
  toBeDisabled(this: any, element: HTMLElement) {
    const isDisabled = isElementDisabled(element);

    return handleResult({
      condition: isDisabled,
      element,
      expectedState: 'disabled',
      thisInstance: this,
    });
  },
  toBeEnabled(this: any, element: HTMLElement) {
    const isEnabled = !isElementDisabled(element);

    return handleResult({
      condition: isEnabled,
      element,
      expectedState: 'enabled',
      thisInstance: this,
    });
  },
});
