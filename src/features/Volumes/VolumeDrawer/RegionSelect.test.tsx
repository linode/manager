import { shallow } from 'enzyme';
import * as React from 'react';
import { regionsWithoutBlockStorage } from 'src/constants';
import { formatRegion } from 'src/utilities';
import { RegionSelect } from './RegionSelect';

const regionsData: Linode.Region[] = [
  { id: 'us-southeast', country: 'US' },
  { id: 'us-west', country: 'US' },
  { id: 'ap-northeast-1a', country: 'JP' }
];

const regionList = regionsData.map(eachRegion => {
  const label = formatRegion('' + eachRegion.id);
  return { label, value: eachRegion.id };
});

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
    regionsData.forEach(() => {
      expect(wrapper.find('WithStyles(Select)').prop('options')).toEqual(
        regionList
      );
    });
  });
  it('disables regions without block storage if prop specified', () => {
    wrapper.setProps({ shouldOnlyDisplayRegionsWithBlockStorage: true });
    regionsWithoutBlockStorage.forEach(region => {
      expect(wrapper.find('WithStyles(Select)').prop('options')).not.toEqual(
        regionList
      );
    });
  });
});
