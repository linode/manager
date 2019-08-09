import { RouteComponentProps } from 'react-router-dom';

type History = RouteComponentProps<{}>['history'];
type Location = History['location'];

export const mockLocation: Location = {
  pathname: '/',
  search: '?query=search',
  state: {},
  hash: ''
};

export const match: RouteComponentProps<{}>['match'] = {
  params: 'test',
  isExact: false,
  path: 'localhost',
  url: 'localhost'
};

export const history: History = {
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
};

export const reactRouterProps: RouteComponentProps<{}> = {
  history,
  location: mockLocation,
  match,
  staticContext: undefined
};
