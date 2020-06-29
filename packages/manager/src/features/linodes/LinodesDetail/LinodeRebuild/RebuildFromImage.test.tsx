import {
  cleanup,
  fireEvent,
  render,
  wait,
  waitForElement
} from '@testing-library/react';
import * as React from 'react';
import { imagesByID as images } from 'src/__data__/images';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { wrapWithTheme } from 'src/utilities/testHelpers';
import { CombinedProps, RebuildFromImage } from './RebuildFromImage';

jest.mock('src/utilities/scrollErrorIntoView');
jest.mock('src/components/EnhancedSelect/Select');
jest.mock('src/hooks/useReduxLoad', () => ({
  useReduxLoad: () => jest.fn().mockReturnValue({ _loading: false })
}));
jest.mock('src/hooks/useImages', () => ({
  useImages: jest.fn().mockResolvedValue({ error: {} })
}));

afterEach(cleanup);

const props: CombinedProps = {
  classes: { root: '', error: '' },
  linodeId: 1234,
  imagesData: images,
  imagesError: {},
  imagesLoading: false,
  imagesLastUpdated: 0,
  userSSHKeys: [],
  closeSnackbar: jest.fn(),
  enqueueSnackbar: jest.fn(),
  permissions: 'read_write',
  passwordHelperText: '',
  passwordValidation: 'complexity',
  requestKeys: jest.fn(),
  disabled: false,
  ...reactRouterProps
};

describe('RebuildFromImage', () => {
  it('renders a SelectImage panel', () => {
    const { queryByText } = render(
      wrapWithTheme(<RebuildFromImage {...props} />)
    );
    expect(queryByText('Select Image')).toBeInTheDocument();
  });

  it('validates the form upon clicking the "Rebuild" button', async () => {
    const { getByTestId, getByText } = render(
      wrapWithTheme(<RebuildFromImage {...props} />)
    );
    fireEvent.click(getByTestId('rebuild-button'));
    await waitForElement(
      () => [
        getByText('An image is required.'),
        getByText('Password is required.')
      ],
      {}
    );
  });

  it('opens a confirmation modal after form has been validated', async () => {
    const { getByTestId, getByText, getByPlaceholderText } = render(
      wrapWithTheme(<RebuildFromImage {...props} />)
    );
    fireEvent.change(getByTestId('select'), {
      target: { value: 'linode/centos7' }
    });

    fireEvent.blur(getByTestId('select'));

    await wait(() =>
      fireEvent.change(getByPlaceholderText('Enter a password.'), {
        target: { value: 'xE7%9hX#hJsM' }
      })
    );
    fireEvent.click(getByTestId('rebuild-button'));

    await waitForElement(() => getByText('Confirm Linode Rebuild'), {});
  });
});
