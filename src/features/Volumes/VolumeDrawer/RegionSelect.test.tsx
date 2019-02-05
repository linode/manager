import { shallow } from 'enzyme';
import * as React from 'react';
import { regionsWithoutBlockStorage } from 'src/constants';
import { RegionSelect, regionSupportMessage } from './RegionSelect';

const regionsData: Linode.Region[] = [
  { id: 'us-southeast', country: 'US' },
  { id: 'us-west', country: 'US' },
  { id: 'ap-northeast-1a', country: 'JP' }
];

describe('Region Select', () => {
  const wrapper = shallow(
    <RegionSelect
      classes={{ root: '' }}
      name=""
      onChange={jest.fn()}
      onBlur={jest.fn()}
      value=""
      regionsData={regionsData}
      regionsLoading={false}
    />
  );

  it('renders', () => {
    expect(wrapper).toHaveLength(1);
  });
  it('includes all regions by default.', () => {
    regionsData.forEach(region => {
      expect(
        wrapper.find(`[data-qa-attach-to-region="${region.id}"]`)
      ).toHaveLength(1);
    });
  });
  it('disables regions without block storage if prop specified', () => {
    wrapper.setProps({ shouldOnlyIncludeRegionsWithBlockStorage: true });
    regionsData.forEach(region => {
      if (regionsWithoutBlockStorage.includes(region.id)) {
        expect(
          wrapper
            .find(`[data-qa-attach-to-region="${region.id}"]`)
            .prop('disabled')
        ).toBe(true);
      } else {
        expect(
          wrapper
            .find(`[data-qa-attach-to-region="${region.id}"]`)
            .prop('disabled')
        ).toBe(false);
      }
    });
  });
  it('displays tooltip for regions without block storage if prop specified', () => {
    wrapper.setProps({ shouldOnlyIncludeRegionsWithBlockStorage: true });
    regionsData.forEach(region => {
      if (regionsWithoutBlockStorage.includes(region.id)) {
        expect(
          wrapper
            .find(`[data-qa-attach-to-region="${region.id}"]`)
            .prop('tooltip')
        ).toBe(regionSupportMessage);
      } else {
        expect(
          wrapper
            .find(`[data-qa-attach-to-region="${region.id}"]`)
            .prop('tooltip')
        ).toBe('');
      }
    });
  });
});
