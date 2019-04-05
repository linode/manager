// Configure Enzyme Adapter
var Enzyme = require('enzyme');
var Adapter = require('enzyme-adapter-react-16');

require('jest-dom/extend-expect');

Enzyme.configure({ adapter: new Adapter() });

/** LocalStorage mocks **/
const localStorageMock = (function () { // eslint-disable-line wrap-iife
  let store = {};
  return {
    getItem: function (key) {
      return store[key];
    },
    setItem: function (key, value) {
      store[key] = value.toString();
    },
    clear: function () {
      store = {};
    },
    removeItem: function (key) {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
