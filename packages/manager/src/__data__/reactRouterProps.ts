import type { RouteComponentProps } from 'react-router-dom';

type History = RouteComponentProps<{}>['history'];
type Location = History['location'];

export const mockLocation: Location = {
  hash: '',
  pathname: '/',
  search: '?query=search',
  state: {},
};

export const match: RouteComponentProps<{}>['match'] = {
  isExact: false,
  params: 'test',
  path: 'localhost',
  url: 'localhost',
};

export const history: History = {
  action: 'POP',
  block: vi.fn(),
  createHref: vi.fn(),
  go: vi.fn(),
  goBack: vi.fn(),
  goForward: vi.fn(),
  length: 1,
  listen: vi.fn(),
  location: mockLocation,
  push: vi.fn(),
  replace: vi.fn(),
};

export const reactRouterProps: RouteComponentProps<any> = {
  history,
  location: mockLocation,
  match,
  staticContext: undefined,
};
