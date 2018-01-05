import React from 'react';
import { shallow } from 'enzyme';
import { NotFound } from 'linode-components';

describe('layouts/NotFound', () => {
  it('should return 404 Not Found', () => {
    const wrapper = shallow(<NotFound />);

    expect(wrapper.prop('status')).toBe(404);
  });
});
