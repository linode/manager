const mockLocation = {
  pathname: '/',
  search: '?query=search',
  state: {},
  hash: ''
};

export const reactRouterProps: any = {
  history: {
    length: 1,
    action: 'POP',
    location: mockLocation,
    push: jest.fn(),
    replace: jest.fn(),
    go: jest.fn(),
    goBack: jest.fn(),
    goForward: jest.fn(),
    block: jest.fn(),
    listen: jest.fn(),
    createHref: jest.fn()
  },
  location: mockLocation,
  match: {
    params: 'test',
    isExact: false,
    path: 'localhost',
    url: 'localhost'
  },
  staticContext: undefined
};
