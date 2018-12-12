import { shallow } from 'enzyme';
import * as React from 'react';

import { images } from 'src/__data__/images';

import { ImageAndPassword } from './ImageAndPassword';

const props = {
  classes: { root: ''},
  images,
  onImageChange: jest.fn(),
  password: '',
  onPasswordChange: jest.fn(),
  userSSHKeys: [],
}

const component = shallow(<ImageAndPassword {...props} />);

describe('Component', () => {
  it('should render', () => {
    expect(component).toBeDefined();
  });
});