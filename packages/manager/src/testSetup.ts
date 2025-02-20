import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';
import { expect } from 'vitest';

import { server } from './mocks/testServer';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterAll(() => server.close());
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
