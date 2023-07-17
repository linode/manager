import Enzyme from 'enzyme';
// @ts-expect-error not a big deal, we can suffer
import Adapter from 'enzyme-adapter-react-16';

import { server } from './mocks/testServer';

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

require('@testing-library/jest-dom/extend-expect');

Enzyme.configure({ adapter: new Adapter() });

// @ts-expect-error this prevents some console errors
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
  _adapters: {
    _date: {
      override: jest.fn(),
    },
  },
  Chart: jest.fn(),
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
    highlightBlock: jest.fn(),
    registerLanguage: jest.fn(),
  },
}));
