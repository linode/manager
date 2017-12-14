import React from 'react';
import { shallow } from 'enzyme';
import { IndexPage } from './IndexPage';

import { testUser } from '~/data/users';

describe('components/IndexPage', () => {
  it('should render without errro', () => {
    const mockDispatch = jest.fn();
    const wrapper = shallow(
      <IndexPage dispatch={mockDispatch} user={testUser} >
        <div></div>
      </IndexPage>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
