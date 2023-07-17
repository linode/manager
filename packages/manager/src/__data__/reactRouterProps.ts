import { RouteComponentProps } from 'react-router-dom';

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
  block: jest.fn(),
  createHref: jest.fn(),
  go: jest.fn(),
  goBack: jest.fn(),
  goForward: jest.fn(),
  length: 1,
  listen: jest.fn(),
  location: mockLocation,
  push: jest.fn(),
  replace: jest.fn(),
};

export const reactRouterProps: RouteComponentProps<any> = {
  history,
  location: mockLocation,
  match,
  staticContext: undefined,
};
