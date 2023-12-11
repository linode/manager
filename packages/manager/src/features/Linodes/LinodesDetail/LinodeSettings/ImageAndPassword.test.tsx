import { shallow } from 'enzyme';
import * as React from 'react';

import { imageFactory, normalizeEntities } from 'src/factories';
import { wrapWithTheme } from 'src/utilities/testHelpers';

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
  linodeId: 0,
  onImageChange: vi.fn(),
  onPasswordChange: vi.fn(),
  password: '',
  setAuthorizedUsers: vi.fn(),
};

const component = shallow(wrapWithTheme(<ImageAndPassword {...props} />));

describe('Component', () => {
  it('should render', () => {
    expect(component).toBeDefined();
  });
});
