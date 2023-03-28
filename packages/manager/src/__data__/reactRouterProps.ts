import { vi } from 'vitest';
import { RouteComponentProps } from 'react-router-dom';

type History = RouteComponentProps<{}>['history'];
type Location = History['location'];

export const mockLocation: Location = {
  pathname: '/',
  search: '?query=search',
  state: {},
  hash: '',
};

export const match: RouteComponentProps<{}>['match'] = {
  params: 'test',
  isExact: false,
  path: 'localhost',
  url: 'localhost',
};

export const history: History = {
  length: 1,
  action: 'POP',
  location: mockLocation,
  push: vi.fn(),
  replace: vi.fn(),
  go: vi.fn(),
  goBack: vi.fn(),
  goForward: vi.fn(),
  block: vi.fn(),
  listen: vi.fn(),
  createHref: vi.fn(),
};

export const reactRouterProps: RouteComponentProps<any> = {
  history,
  location: mockLocation,
  match,
  staticContext: undefined,
};
