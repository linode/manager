import '@testing-library/jest-dom/vitest';
import Enzyme from 'enzyme';
// @ts-expect-error not a big deal, we can suffer
import Adapter from 'enzyme-adapter-react-16';

// // Enzyme React 17 adapter.
// Enzyme.configure({ adapter: new Adapter() });

import { server } from './mocks/testServer';

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

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

vi.mock('chart.js', () => ({
  _adapters: {
    _date: {
      override: vi.fn(),
    },
  },
  Chart: vi.fn(),
  defaults: {
    global: {
      defaultFontFamily: '',
      defaultFontSize: '',
      defaultFontStyle: '',
    },
  },
}));

vi.mock('highlight.js/lib/highlight', () => ({
  default: {
    configure: vi.fn(),
    highlightBlock: vi.fn(),
    registerLanguage: vi.fn(),
  },
}));
