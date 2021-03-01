// Configure Enzyme Adapter
const Enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');
const React = require('react');

require('@testing-library/jest-dom/extend-expect');

Enzyme.configure({ adapter: new Adapter() });

/** LocalStorage mocks */
const localStorageMock = (function () {
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
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

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

jest.mock('chart.js', () => ({
  Chart: jest.fn(),
  _adapters: {
    _date: {
      override: jest.fn(),
    },
  },
  defaults: {
    global: {
      defaultFontFamily: '',
      defaultFontSize: '',
      defaultFontStyle: '',
    },
  },
}));

jest.mock('highlight.js/lib/highlight', () => ({
  default: {
    configure: jest.fn(),
    registerLanguage: jest.fn(),
    highlightBlock: jest.fn(),
  },
}));
