import { genActions } from 'internal';

describe('internal', () => {
  it('generates an action to update one resource');
  const config = {
    name: 'regions',
    primaryKey: 'id',
    endpoint: id => `/regions/${id}`,
    supports: [ONE, MANY],
  };
});
