import { shallow } from 'enzyme';
import * as React from 'react';

import { DisplaySettings } from './DisplaySettings';

describe('Email change form', () => {
  const update = jest.fn();

  const component = shallow(
    <DisplaySettings 
      loading={false} 
      username="exampleuser" 
      email="me@this.com" 
      updateProfile={update}
      classes={{
        root: '',
        title: '',
      }}
    />
  );

  it('should render', () => {
    expect(component).toHaveLength(1);
  });
});