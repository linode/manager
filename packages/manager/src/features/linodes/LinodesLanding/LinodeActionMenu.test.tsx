import { shallow } from 'enzyme';
import * as React from 'react';
import { extendedTypes } from 'src/__data__/ExtendedType';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { regionFactory } from 'src/factories/regions';
import { CombinedProps, LinodeActionMenu } from './LinodeActionMenu';

const props: CombinedProps = {
  linodeId: 123,
  linodeLabel: 'testLinode',
  linodeRegion: 'us-east',
  linodeType: 'g6-standard-1',
  openDeleteDialog: jest.fn(),
  readOnly: false,
  typesLoading: false,
  regionsData: [],
  regionsLastUpdated: 0,
  regionsLoading: false,
  openPowerActionDialog: jest.fn(),
  linodeBackups: {
    enabled: false,
    schedule: {
      window: null,
      day: null
    },
    last_successful: null
  },
  linodeStatus: '',
  noImage: false,
  ...reactRouterProps
};

describe('LinodeActionMenu', () => {
  const wrapper = shallow<LinodeActionMenu>(<LinodeActionMenu {...props} />);

  describe('buildQueryStringForLinodeClone', () => {
    it('returns `type`, `subtype`, and `linodeID` params', () => {
      const result = wrapper.instance().buildQueryStringForLinodeClone();
      expect(result).toMatch('type=');
      expect(result).toMatch('subtype=');
      expect(result).toMatch('linodeID=');
    });

    it('includes `regionID` param if valid region', () => {
      wrapper.setProps({
        linodeRegion: 'us-east',
        regionsData: regionFactory.buildList(1, { id: 'us-east' })
      });
      expect(wrapper.instance().buildQueryStringForLinodeClone()).toMatch(
        'regionID=us-east'
      );

      wrapper.setProps({
        linodeRegion: 'invalid-region'
      });
      expect(wrapper.instance().buildQueryStringForLinodeClone()).not.toMatch(
        'regionID='
      );
    });

    it('includes `typeID` param if valid type', () => {
      wrapper.setProps({
        // This is not actually (currently) a valid type, but it's in the mock data
        linodeType: 'g5-standard-2',
        typesData: extendedTypes
      });
      expect(wrapper.instance().buildQueryStringForLinodeClone()).toMatch(
        'typeID=g5-standard-2'
      );

      wrapper.setProps({
        linodeType: 'invalid-type'
      });
      expect(wrapper.instance().buildQueryStringForLinodeClone()).not.toMatch(
        'typeID='
      );
    });
  });
});
