import { vi } from 'vitest';
import { shallow } from 'enzyme';
import * as React from 'react';
import { wrapWithTheme } from 'src/utilities/testHelpers';
import { imageFactory, normalizeEntities } from 'src/factories';

const normalizedImages = normalizeEntities(imageFactory.buildList(10));

import { ImageAndPassword } from './ImageAndPassword';

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
  userSSHKeys: [],
  requestKeys: vi.fn(),
  permissions: null,
};

const component = shallow(wrapWithTheme(<ImageAndPassword {...props} />));

describe('Component', () => {
  it('should render', () => {
    expect(component).toBeDefined();
  });
});
