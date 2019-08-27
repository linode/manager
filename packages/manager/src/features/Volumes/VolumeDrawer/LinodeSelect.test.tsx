import { shallow } from 'enzyme';
import * as React from 'react';
import { regions } from 'src/__data__/regionsData';
import { Item } from 'src/components/EnhancedSelect/Select';
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
    <LinodeSelect
      onChange={jest.fn()}
      name=""
      onBlur={jest.fn()}
      region=""
      regionsLoading={false}
      regionsData={regions}
      regionsLastUpdated={0}
    />
  );
  it('renders', () => {
    expect(wrapper).toHaveLength(1);
  });
  it('renders all linodes by default', () => {
    wrapper.setState({ linodes });
    const { options } = wrapper.find('WithStyles(Select)').props() as any;
    const regionItems = options
      .filter((option: Item) => option.data)
      .map((option: Item) => option.data.region);
    linodes.forEach(linode => {
      expect(regionItems.includes(linode.data.region)).toBe(true);
    });
  });
  it('disables Linodes in regions that support block storage when prop specified', () => {
    wrapper.setState({ linodes });
    wrapper.setProps({ shouldOnlyDisplayRegionsWithBlockStorage: true });
    const { options } = wrapper.find('WithStyles(Select)').props() as any;
    expect(options.length).toBe(2);
  });
});
