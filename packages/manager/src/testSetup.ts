import matchers from '@testing-library/jest-dom/matchers';
import Enzyme from 'enzyme';
// @ts-expect-error not a big deal, we can suffer
import Adapter from 'enzyme-adapter-react-16';
import { expect } from 'vitest';

// // Enzyme React 17 adapter.
// Enzyme.configure({ adapter: new Adapter() });

// JSDom matchers.
expect.extend(matchers);

import { server } from './mocks/testServer';

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

require('@testing-library/jest-dom/extend-expect');

Enzyme.configure({ adapter: new Adapter() });

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

/**
 ***************************************
 *  Custom matchers & matchers overrides
 ***************************************
 */

/**
 * Matcher override for toBeDisabled and toBeEnabled
 */
const ariaDisabled = 'aria-disabled';
expect.extend({
  toBeDisabled(element: HTMLElement) {
    const isAriaDisabled = element.getAttribute(ariaDisabled) === 'true';
    const disabledMessage = `expected ${element?.tagName} to be disabled`;

    if (element?.tagName.toLowerCase() === 'input') {
      return isAriaDisabled
        ? {
            message: () => disabledMessage,
            pass: true,
          }
        : {
            message: () => disabledMessage,
            pass: false,
          };
    } else {
      const isDisabled = element.hasAttribute('disabled');
      return isDisabled
        ? {
            message: () => disabledMessage,
            pass: true,
          }
        : {
            message: () => disabledMessage,
            pass: false,
          };
    }
  },
  toBeEnabled(element) {
    const isAriaEnabled = !(
      element.getAttribute(ariaDisabled) &&
      element.getAttribute(ariaDisabled) === 'true'
    );
    const enabledMessage = `expected ${element.tagName} to be enabled`;

    if (element.tagName.toLowerCase() === 'button') {
      return isAriaEnabled
        ? {
            message: () => enabledMessage,
            pass: true,
          }
        : {
            message: () => enabledMessage,
            pass: false,
          };
    } else {
      const isEnabled = !element.hasAttribute('disabled');
      return isEnabled
        ? {
            message: () => enabledMessage,
            pass: true,
          }
        : {
            message: () => enabledMessage,
            pass: false,
          };
    }
  },
});
