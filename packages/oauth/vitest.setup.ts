import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './msw'


beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
