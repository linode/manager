import * as React from 'react';
import {
  cleanup,
  fireEvent,
  render,
  waitForElement
} from 'react-testing-library';
import { images } from 'src/__data__/images';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { wrapWithTheme } from 'src/utilities/testHelpers';
import { CombinedProps, RebuildFromImage } from './RebuildFromImage';

jest.mock('src/utilities/scrollErrorIntoView');

afterEach(cleanup);

const props: CombinedProps = {
  classes: { root: '', error: '' },
  linodeId: 1234,
  imagesData: images,
  imagesLoading: false,
  userSSHKeys: [],
  closeSnackbar: jest.fn(),
  enqueueSnackbar: jest.fn(),
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
    await waitForElement(() => [
      getByText('An image is required.'),
      getByText('Password cannot be blank.')
    ]);
  });

  it('opens a confirmation modal after form has been validated', async () => {
    const { getByTestId, getByText, getByPlaceholderText } = render(
      wrapWithTheme(<RebuildFromImage {...props} />)
    );
    fireEvent.click(getByText('Ubuntu'));
    fireEvent.change(getByPlaceholderText('Enter a password.'), {
      target: { value: 'AAbbCC1234!!' }
    });
    fireEvent.click(getByTestId('rebuild-button'));
    await waitForElement(() => getByText('Confirm Linode Rebuild'));
  });
});
