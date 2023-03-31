import { vi } from 'vitest';
import { shallow } from 'enzyme';
import * as React from 'react';
import { wrapWithTheme } from 'src/utilities/testHelpers';
import { imageFactory, normalizeEntities } from 'src/factories';
import { ImageAndPassword } from './ImageAndPassword';

const normalizedImages = normalizeEntities(imageFactory.buildList(10));

const props = {
  classes: { root: '' },
  images: normalizedImages,
  imagesLoading: false,
  imagesError: {},
  imagesData: {},
  imagesLastUpdated: 0,
  onImageChange: vi.fn(),
  password: '',
  onPasswordChange: vi.fn(),
  authorizedUsers: [],
  userSSHKeys: [],
  requestKeys: vi.fn(),
  setAuthorizedUsers: vi.fn(),
  permissions: null,
};

describe('Component', () => {
  it('should render', () => {
    const component = shallow(wrapWithTheme(<ImageAndPassword {...props} />));
    expect(component).toBeDefined();
  });
});
