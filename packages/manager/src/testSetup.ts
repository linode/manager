import { server } from './mocks/testServer';
import { expect, vi } from 'vitest';
import matchers from '@testing-library/jest-dom/matchers';
import Enzyme from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';

// Enzyme React 17 adapter.
Enzyme.configure({ adapter: new Adapter() });

// JSDom matchers.
expect.extend(matchers);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

/** LocalStorage mocks */
const localStorageMock = (function () {
  // eslint-disable-line wrap-iife
  let store = {};
  return {
    clear() {
      store = {};
    },
    getItem(key: string) {
      return store[key];
    },
    removeItem(key: string) {
      delete store[key];
    },
    setItem(key: string, value: any) {
      store[key] = value?.toString() || '';
    },
  };
})();

//const window = new Window();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
//window.localStorage = localStorageMock as Storage;

// The version of jsdom we're using doesn't have classLists, so...
//document.body.classList = [];
// Object.defineProperty(document.body.classList, 'toggle', {
//   enumerable: false,
//   writable: true,
//   remove(className: string) {
//     const index = this.indexOf()
//   }
//   value(className: string) {
//     let index = this.indexOf(className);
//     index > -1
//       ? this.splice(index, 1)
//       : this.push(className);
//     return !(index > -1);
//   }
// });

// HTMLCanvasElement.prototype.getContext = () => {
//   return 0;
// };

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

vi.mock('chart.js', async () => {
  const actual = await vi.importActual<any>('chart.js');

  return {
    ...actual,
    Chart: vi.fn(),
    _adapters: {
      _date: {
        override: vi.fn(),
      },
    },
    defaults: {
      global: {
        defaultFontFamily: '',
        defaultFontSize: '',
        defaultFontStyle: '',
      },
    },
  };
});

vi.mock('highlight.js/lib/highlight', () => ({
  default: {
    configure: vi.fn(),
    registerLanguage: vi.fn(),
    highlightBlock: vi.fn(),
  },
}));
