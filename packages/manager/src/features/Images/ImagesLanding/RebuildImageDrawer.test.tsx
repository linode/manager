import { linodeFactory } from '@linode/utilities';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { imageFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { RebuildImageDrawer } from './RebuildImageDrawer';

const props = {
  changeLinode: vi.fn(),
  image: imageFactory.build(),
  isFetching: false,
  onClose: vi.fn(),
  open: true,
};

const mockHistoryPush = vi.fn();
vi.mock('react-router-dom', async () => {
  return {
    ...(await vi.importActual('react-router-dom')),
    useHistory: () => ({
      push: mockHistoryPush,
    }),
  };
});

describe('RebuildImageDrawer', () => {
  it('should render', async () => {
    const { getByText } = renderWithTheme(<RebuildImageDrawer {...props} />);

    // Verify title renders
    getByText('Rebuild an Existing Linode from an Image');

    // Verify image label is displayed
    getByText(props.image.label);
  });

  it('should allow selecting a Linode to rebuild', async () => {
    const { findByText, getByRole, getByText } = renderWithTheme(
      <RebuildImageDrawer {...props} />
    );

    server.use(
      http.get('*/linode/instances', () => {
        return HttpResponse.json(makeResourcePage(linodeFactory.buildList(5)));
      })
    );

    await userEvent.click(getByRole('combobox'));
    await userEvent.click(await findByText('linode-1'));
    await userEvent.click(getByText('Rebuild Linode'));

    expect(mockHistoryPush).toBeCalledWith({
      pathname: '/linodes/1/rebuild',
      search: 'selectedImageId=private%2F1',
    });
  });
});
