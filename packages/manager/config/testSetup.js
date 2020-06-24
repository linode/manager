// Configure Enzyme Adapter
const sdk = require('@linode/api-v4/lib/request');
const preferences = require.requireMock('@linode/api-v4/lib/profile');
const Enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');
const React = require('react');

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
class Line extends React.Component {
  render() {
    return null;
  }
}

jest.mock('react-chartjs-2', () => ({
  Doughnut: () => null,
  Line,
  defaults: {
    global: {
      defaultFontFamily: '',
      defaultFontSize: '',
      defaultFontStyle: ''
    }
  }
}));

jest.mock('highlight.js/lib/highlight', () => ({
  default: {
    configure: jest.fn(),
    registerLanguage: jest.fn(),
    highlightBlock: jest.fn()
  }
}));
