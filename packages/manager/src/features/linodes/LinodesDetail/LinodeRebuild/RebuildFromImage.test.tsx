import { render } from '@testing-library/react';
import * as React from 'react';
import { imageFactory, normalizeEntities } from 'src/factories';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { wrapWithTheme } from 'src/utilities/testHelpers';
import { CombinedProps, RebuildFromImage } from './RebuildFromImage';

jest.mock('src/utilities/scrollErrorIntoView');
jest.mock('src/components/EnhancedSelect/Select');
jest.mock('src/hooks/useReduxLoad', () => ({
  useReduxLoad: () => jest.fn().mockReturnValue({ _loading: false }),
}));
jest.mock('src/hooks/useImages', () => ({
  useImages: jest.fn().mockResolvedValue({ error: {} }),
}));

const images = normalizeEntities(imageFactory.buildList(10));

const props: CombinedProps = {
  linodeId: 1234,
  imagesData: images,
  imagesError: {},
  imagesLoading: false,
  imagesLastUpdated: 0,
  userSSHKeys: [],
  closeSnackbar: jest.fn(),
  enqueueSnackbar: jest.fn(),
  passwordHelperText: '',
  requestKeys: jest.fn(),
  disabled: false,
  handleRebuildError: jest.fn(),
  onClose: jest.fn(),
  ...reactRouterProps,
};

describe('RebuildFromImage', () => {
  it('renders a SelectImage panel', () => {
    const { queryByText } = render(
      wrapWithTheme(<RebuildFromImage {...props} />)
    );
    expect(queryByText('Select Image')).toBeInTheDocument();
  });
});
