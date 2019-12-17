// Configure Enzyme Adapter
var Enzyme = require('enzyme');
var Adapter = require('enzyme-adapter-react-16');

require('@testing-library/jest-dom/extend-expect');

Enzyme.configure({ adapter: new Adapter() });

/** LocalStorage mocks */
const localStorageMock = (function() {
  // eslint-disable-line wrap-iife
  let store = {};
  return {
    clear: function() {
      store = {};
    },
    getItem: function(key) {
      return store[key];
    },
    removeItem: function(key) {
      delete store[key];
    },
    setItem: function(key, value) {
      store[key] = value.toString();
    }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

Object.defineProperty(window, 'URL', { value: { createObjectURL: jest.fn() } });

HTMLCanvasElement.prototype.getContext = () => {
  return 0;
};

jest.mock('react-chartjs-2', () => ({
  Doughnut: () => null,
  Line: () => null,
  defaults: {
    global: {
      defaultFontFamily: '',
      defaultFontSize: '',
      defaultFontStyle: ''
    }
  }
}));
