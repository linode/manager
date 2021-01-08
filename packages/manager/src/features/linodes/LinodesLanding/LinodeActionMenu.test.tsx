import { extendedTypes } from 'src/__data__/ExtendedType';
import { regionFactory } from 'src/factories/regions';
import { buildQueryStringForLinodeClone } from './LinodeActionMenu';

describe('LinodeActionMenu', () => {
  describe('buildQueryStringForLinodeClone', () => {
    it('returns `type` and `linodeID` params', () => {
      const result = buildQueryStringForLinodeClone(
        1,
        'us-east',
        'g6-standard-1',
        [],
        []
      );
      expect(result).toMatch('type=');
      expect(result).toMatch('linodeID=');
    });

    it('includes `regionID` param if valid region', () => {
      const regionsData = regionFactory.buildList(1, { id: 'us-east' });
      expect(
        buildQueryStringForLinodeClone(1, 'us-east', '', [], regionsData)
      ).toMatch('regionID=us-east');
      expect(
        buildQueryStringForLinodeClone(1, 'invalid-region', '', [], regionsData)
      ).not.toMatch('regionID=us-east');
    });

    it('includes `typeID` param if valid type', () =>
      expect(
        buildQueryStringForLinodeClone(
          1,
          '',
          'g5-standard-2',
          extendedTypes,
          []
        )
      ).toMatch('typeID=g5-standard-2'));
    expect(
      buildQueryStringForLinodeClone(1, '', 'invalid-type', extendedTypes, [])
    ).not.toMatch('typeID=');
  });
});
