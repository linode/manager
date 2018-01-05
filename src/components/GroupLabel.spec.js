import React from 'react';
import { shallow } from 'enzyme';
import GroupLabel from './GroupLabel';

describe('components/GroupLabel', () => {
  it('should render without error', () => {
    const wrapper = shallow(
      <GroupLabel object={{ group: 'A', label: 'B' }} />
    );

    expect(wrapper).toMatchSnapshot();
  });
});
