import { shallow } from 'enzyme';
import { pathOr } from 'ramda';
import * as React from 'react';
import { Item } from 'src/components/EnhancedSelect/Select';
import { doesRegionSupportBlockStorage } from 'src/utilities/doesRegionSupportBlockStorage';
import { LinodeSelect } from './LinodeSelect';

const linodes: Item[] = [
  {
    label: 'test-linode-001',
    value: 1,
    data: {
      region: 'us-central'
    }
  },
  {
    label: 'test-linode-002',
    value: 2,
    data: {
      region: 'us-southeast'
    }
  },
  {
    label: 'test-linode-003',
    value: 3,
    data: {
      region: 'ap-northeast-1a'
    }
  }
];

describe('Linode Select', () => {
  const wrapper = shallow(
    <LinodeSelect onChange={jest.fn()} name="" onBlur={jest.fn()} region="" />
  );
  it('renders', () => {
    expect(wrapper).toHaveLength(1);
  });
  it('renders all linodes by default', () => {
    wrapper.setState({ linodes });
    const { options } = wrapper.find('WithStyles(Select)').props() as any;
    const regions = options
      .filter((option: Item) => option.data)
      .map((option: Item) => option.data.region);
    linodes.forEach(linode => {
      expect(regions.includes(linode.data.region)).toBe(true);
    });
  });
  it('disables Linodes in regions that support block storage when prop specified', () => {
    wrapper.setState({ linodes });
    wrapper.setProps({ shouldOnlyDisplayRegionsWithBlockStorage: true });
    const { options } = wrapper.find('WithStyles(Select)').props() as any;
    options.forEach((option: any) => {
      const region = pathOr('', ['data', 'region'], option);
      expect(doesRegionSupportBlockStorage(region)).toBe(true);
    });
  });
});
