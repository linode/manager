import { shallow } from 'enzyme';
import * as React from 'react';
import { imageFactory, normalizeEntities } from 'src/factories';
import { wrapWithTheme } from 'src/utilities/testHelpers';

const normalizedImages = normalizeEntities(imageFactory.buildList(10));

import { ImageAndPassword } from './ImageAndPassword';

const props = {
  classes: { root: '' },
  images: normalizedImages,
  imagesLoading: false,
  imagesError: {},
  imagesData: {},
  imagesLastUpdated: 0,
  onImageChange: jest.fn(),
  password: '',
  onPasswordChange: jest.fn(),
  authorizedUsers: [],
  setAuthorizedUsers: jest.fn(),
  permissions: null,
};

const component = shallow(wrapWithTheme(<ImageAndPassword {...props} />));

describe('Component', () => {
  it('should render', () => {
    expect(component).toBeDefined();
  });
});
