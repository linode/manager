import { shallow } from 'enzyme';
import * as React from 'react';

import { normalizedImages } from 'src/__data__/images';

import { ImageAndPassword } from './ImageAndPassword';

const props = {
  classes: { root: '' },
  images: normalizedImages,
  imagesLoading: false,
  imagesError: {},
  imagesData: {},
  onImageChange: jest.fn(),
  password: '',
  onPasswordChange: jest.fn(),
  userSSHKeys: [],
  requestKeys: jest.fn(),
  permissions: null
};

const component = shallow(<ImageAndPassword {...props} />);

describe('Component', () => {
  it('should render', () => {
    expect(component).toBeDefined();
  });
});
