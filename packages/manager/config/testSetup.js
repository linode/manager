// Configure Enzyme Adapter
const sdk = require('@linode/api-v4/lib/request');
const preferences = require.requireMock('@linode/api-v4/lib/profile');
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

// If we ever forget to mock a request in our unit tests,
// and hit the API, log an error to the console (and stop
// the request)
sdk.baseRequest.interceptors.request.use(request => {
  console.error('Making a real API request', request.url);
  return null;
});

// Our renderWithTheme helper includes a call to /preferences, mock that out
jest.mock('@linode/api-v4/lib/profile', () => ({
  getUserPreferences: jest.fn(),
  updateUserPreferences: jest.fn()
}));

preferences.getUserPreferences = jest.fn().mockResolvedValue({});
preferences.updateUserPreferences = jest.fn().mockResolvedValue({});

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

Object.defineProperty(window, 'URL', { value: { createObjectURL: jest.fn() } });

HTMLCanvasElement.prototype.getContext = () => {
  return 0;
};

jest.mock('highlight.js/lib/highlight', () => ({
  default: {
    configure: jest.fn(),
    registerLanguage: jest.fn(),
    highlightBlock: jest.fn()
  }
}));
