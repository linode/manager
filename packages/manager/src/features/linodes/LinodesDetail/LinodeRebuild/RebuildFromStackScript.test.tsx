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
import {
  CombinedProps,
  RebuildFromStackScript
} from './RebuildFromStackScript';

jest.mock('src/utilities/scrollErrorIntoView');

afterEach(cleanup);

const props: CombinedProps = {
  type: 'community',
  classes: {
    root: '',
    error: '',
    emptyImagePanel: '',
    emptyImagePanelText: ''
  },
  linodeId: 1234,
  imagesData: images,
  imagesLoading: false,
  userSSHKeys: [],
  closeSnackbar: jest.fn(),
  enqueueSnackbar: jest.fn(),
  ...reactRouterProps
};

describe('RebuildFromStackScript', () => {
  it('renders a SelectImage panel', () => {
    const { queryByText } = render(
      wrapWithTheme(<RebuildFromStackScript {...props} />)
    );
    expect(queryByText('Select Image')).toBeInTheDocument();
  });

  it('renders a SelectStackScript panel', () => {
    const { queryByText } = render(
      wrapWithTheme(<RebuildFromStackScript {...props} />)
    );
    expect(queryByText('Select StackScript')).toBeInTheDocument();
  });

  it('validates the form upon clicking the "Rebuild" button', async () => {
    const { getByTestId, getByText } = render(
      wrapWithTheme(<RebuildFromStackScript {...props} />)
    );
    fireEvent.click(getByTestId('rebuild-button'));
    await waitForElement(() => [
      getByText('A StackScript is required.'),
      getByText('An image is required.'),
      getByText('Password cannot be blank.')
    ]);
  });
});
