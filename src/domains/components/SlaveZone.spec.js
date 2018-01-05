import React from 'react';
import { shallow } from 'enzyme';
import { SlaveZone } from './SlaveZone';
import { testDomain } from '~/data/domains';

describe('components/SlaveZone', () => {
  it('should render without error', () => {
    const mockDispatch = jest.fn();
    const wrapper = shallow(
      <SlaveZone
        dispatch={mockDispatch}
        domain={testDomain}
      />
    );

    expect(wrapper).toMatchSnapshot();
  });
});
