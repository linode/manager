import React from 'react';
import { shallow } from 'enzyme';
import { ZonePage } from './ZonePage';
import { testDomain } from '~/data/domains';

describe('components/ZonePage', () => {
  it('should render without error', () => {
    const mockDispatch = jest.fn();
    const wrapper = shallow(
      <ZonePage
        dispatch={mockDispatch}
        domain={testDomain}
      />
    );

    expect(wrapper).toMatchSnapshot();
  });
});
