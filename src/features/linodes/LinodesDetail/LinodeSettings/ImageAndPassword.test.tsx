import { shallow } from 'enzyme';
import * as React from 'react';

import { images } from 'src/__data__/images';

import { ImageAndPassword } from './ImageAndPassword';

const props = {
  classes: { root: '' },
  images,
  imagesLoading: false,
  imageError: undefined,
  onImageChange: jest.fn(),
  password: '',
  onPasswordChange: jest.fn(),
  userSSHKeys: [],
  permissions: null
};

const component = shallow(<ImageAndPassword {...props} />);

describe('Component', () => {
  it('should render', () => {
    expect(component).toBeDefined();
  });
});
