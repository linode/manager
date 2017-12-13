import React from 'react';
import { shallow } from 'enzyme';
import TransferPool from './TransferPool';

describe('components/TransferPool', () => {
  it('should render without error', () => {
    const wrapper = shallow(
      <TransferPool transfer={{}} />
    );

    expect(wrapper).toMatchSnapshot();
  });
});
