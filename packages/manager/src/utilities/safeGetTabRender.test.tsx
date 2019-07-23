import { safeGetTabRender, Tab } from './safeGetTabRender';

jest.mock('src/exceptionReporting');

const mockFn = jest.fn();

const mockTabs: Tab[] = [
  {
    title: 'Example Tab',
    render: mockFn
  },
  {
    title: 'Example Tab 2',
    render: mockFn
  }
];

describe('getSafeTabRender', () => {
  it('should return the default render method if there is one', () => {
    expect(safeGetTabRender(mockTabs, 0)).toEqual(mockFn);
  });

  it('should return a default render method if the tab does not exist', () => {
    const render = safeGetTabRender(mockTabs, 3);
    expect(render().props).toHaveProperty(
      'errorText',
      'An unexpected error occurred.'
    );
  });
});
