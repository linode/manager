import React from 'react';
import { shallow } from 'enzyme';
import { DomainDetails } from './DomainDetails';
import { testDomain } from '~/data/domains';

describe('components/ZonePage', () => {
  it('should render without error', () => {
    const mockDispatch = jest.fn();
    const wrapper = shallow(
      <DomainDetails
        dispatch={mockDispatch}
        domain={testDomain}
      />
    );

    expect(wrapper).toMatchSnapshot();
  });
});
