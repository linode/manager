import { server } from './mocks/testServer';

beforeAll(() => server.listen());
afterAll(() => server.close());
