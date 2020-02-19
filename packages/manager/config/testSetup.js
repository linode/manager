// Configure Enzyme Adapter
var Enzyme = require('enzyme');
var Adapter = require('enzyme-adapter-react-16');
var React = require('react');

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

// c/f https://github.com/mui-org/material-ui/issues/15726
window.document.createRange = () => ({
  setStart: () => {},
  setEnd: () => {},
  commonAncestorContainer: {
    nodeName: 'BODY',
    ownerDocument: document
  }
});
