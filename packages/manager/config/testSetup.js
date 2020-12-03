// Configure Enzyme Adapter
const Enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');

require('@testing-library/jest-dom/extend-expect');

Enzyme.configure({ adapter: new Adapter() });

/** LocalStorage mocks */
const localStorageMock = (function() {
  // eslint-disable-line wrap-iife
  let store = {};
  return {
    clear() {
      store = {};
    },
    getItem(key) {
      return store[key];
    },
    removeItem(key) {
      delete store[key];
    },
    setItem(key, value) {
      store[key] = value.toString();
    }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

HTMLCanvasElement.prototype.getContext = () => {
  return 0;
};

// mocks the constructor returned by chart.js
jest.mock('chart.js');
// this ignored injecting the adapter
// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.mock('chartjs-adapter-luxon', () => {});
// mock chart.ts to not edit Chart.defaults which is not imported well with jest runtime
jest.mock('src/utilities/charts.ts', () => {
  return { setUpCharts: jest.fn() };
});

jest.mock('highlight.js/lib/highlight', () => ({
  default: {
    configure: jest.fn(),
    registerLanguage: jest.fn(),
    highlightBlock: jest.fn()
  }
}));
