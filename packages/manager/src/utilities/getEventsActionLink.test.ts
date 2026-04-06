import { getEngineFromDatabaseEntityURL } from './getEventsActionLink';

describe('getEngineFromDatabaseEntityURL', () => {
  it('should return an engine from a URL returned by apiv4', () => {
    expect(
      getEngineFromDatabaseEntityURL('/v4/databases/postgresql/instances/2959')
    ).toBe('postgresql');
  });
});
