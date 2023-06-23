import { shallow } from 'enzyme';
import * as React from 'react';
import { wrapWithTheme } from 'src/utilities/testHelpers';
import { imageFactory, normalizeEntities } from 'src/factories';

const normalizedImages = normalizeEntities(imageFactory.buildList(10));

import { ImageAndPassword } from './ImageAndPassword';

const props = {
  authorizedUsers: [],
  classes: { root: '' },
  images: normalizedImages,
  imagesData: {},
  imagesError: {},
  imagesLastUpdated: 0,
  imagesLoading: false,
  onImageChange: jest.fn(),
  onPasswordChange: jest.fn(),
  password: '',
  permissions: null,
  setAuthorizedUsers: jest.fn(),
};

const component = shallow(wrapWithTheme(<ImageAndPassword {...props} />));

describe('Component', () => {
  it('should render', () => {
    expect(component).toBeDefined();
  });
});
