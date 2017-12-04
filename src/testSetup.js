/** Enzyme Configuration **/
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';

Enzyme.configure({ adapter: new Adapter() });

/* setup.js */
// const { jsdom } = require('jsdom');

// global.document = jsdom('');
// global.window = document.defaultView;
// global.navigator = {
//   userAgent: 'node.js',
// };

// function copyProps(src, target) {
//   const props = Object.getOwnPropertyNames(src)
//     .filter(prop => typeof target[prop] === 'undefined')
//     .reduce((result, prop) => ({
//       ...result,
//       [prop]: Object.getOwnPropertyDescriptor(src, prop),
//     }), {});
//   Object.defineProperties(target, props);
// }
// copyProps(document.defaultView, global);

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
