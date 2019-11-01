import { LongviewClient } from 'linode-js-sdk/lib/longview'
import { longviewClients } from 'src/__data__/longview'
import { filterLongviewClientsByQuery } from './LongviewLanding';


describe('Utility Functions', () => {
  it('should properly filter longview clients by query', () => {
    const mockLongviewClients: Record<string, LongviewClient> = longviewClients.reduce((acc, eachClient) => {
      acc[eachClient.id] = eachClient;
      return acc;
    }, {})

    expect(filterLongviewClientsByQuery('1', mockLongviewClients)).toEqual({
      1: longviewClients[0]
    }),
      expect(filterLongviewClientsByQuery('client', mockLongviewClients)).toEqual(mockLongviewClients),
      expect(filterLongviewClientsByQuery('(', mockLongviewClients)).toEqual({}),
      expect(filterLongviewClientsByQuery(')', mockLongviewClients)).toEqual({}),
      expect(filterLongviewClientsByQuery('fdsafdsafsdf', mockLongviewClients)).toEqual({})
  });
});