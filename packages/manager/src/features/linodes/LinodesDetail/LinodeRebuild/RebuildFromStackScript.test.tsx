import { fireEvent, render, waitFor } from '@testing-library/react';
import * as React from 'react';
import { imageFactory, normalizeEntities } from 'src/factories';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { wrapWithTheme } from 'src/utilities/testHelpers';
import {
  CombinedProps,
  RebuildFromStackScript,
} from './RebuildFromStackScript';
import { preferencesFactory } from 'src/factories/preferences';

const request = jest.requireMock('@linode/api-v4/lib/account');

jest.mock('@linode/api-v4/lib/account', () => ({
  getUsers: jest.fn(),
}));

const images = normalizeEntities(imageFactory.buildList(10));

request.getUsers = jest.fn().mockResolvedValue([]);

const props: CombinedProps = {
  type: 'community',
  linodeId: 1234,
  imagesData: images,
  requestKeys: jest.fn(),
  imagesLoading: false,
  imagesError: {},
  imagesLastUpdated: 0,
  userSSHKeys: [],
  getUserPreferences: jest.fn(),
  updateUserPreferences: jest.fn(),
  preferences: preferencesFactory.build(),
  disabled: false,
  closeSnackbar: jest.fn(),
  enqueueSnackbar: jest.fn(),
  passwordHelperText: '',
  handleRebuildError: jest.fn(),
  onClose: jest.fn(),
  ...reactRouterProps,
};

describe('RebuildFromStackScript', () => {
  it('renders a SelectImage panel', () => {
    const { queryByText } = render(
      wrapWithTheme(<RebuildFromStackScript {...props} />)
    );
    expect(queryByText('Select Image')).toBeInTheDocument();
  });

  it('renders a SelectStackScript panel', () => {
    const { queryByPlaceholderText } = render(
      wrapWithTheme(<RebuildFromStackScript {...props} />)
    );
    expect(queryByPlaceholderText('Search by Label, Username, or Description'));
  });

  it.skip('validates the form upon clicking the "Rebuild" button', async () => {
    const { getByTestId, getByText } = render(
      wrapWithTheme(<RebuildFromStackScript {...props} />)
    );
    fireEvent.click(getByTestId('rebuild-button'));
    await waitFor(
      () => [
        getByText('A StackScript is required.'),
        getByText('An image is required.'),
        getByText('Password is required.'),
      ],
      {}
    );
  });
});
