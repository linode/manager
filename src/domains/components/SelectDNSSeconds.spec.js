import React from 'react';
import { shallow } from 'enzyme';
import SelectDNSSeconds from './SelectDNSSeconds';

describe('components/SelectDNSSeconds', () => {
  it('should render without error', () => {
    const wrapper = shallow(
      <SelectDNSSeconds
        value={0}
        onChange={jest.fn()}
        id="ttl"
        name="ttl"
        defaultSeconds={0}
      />
    );

    expect(wrapper).toMatchSnapshot();
  });
});
