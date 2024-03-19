import { setupServer } from 'msw/node';

import { handlers } from './serverHandlers';

export const server = setupServer(...handlers);
export { HttpResponse, http } from 'msw';
