/** Enzyme Configuration **/
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';

Enzyme.configure({ adapter: new Adapter() });

import 'babel-polyfill';

/** Globals **/
// import zxcvbn from 'zxcvbn';
window.zxcvbn = jest.fn(() => ({ score: 4 }));

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
