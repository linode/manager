import { server } from './testServer';

beforeAll(() => server.listen());
afterAll(() => server.close());
