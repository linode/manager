import userEvent from '@testing-library/user-event';
import React from 'react';

import { imageFactory, linodeFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { RebuildImageDrawer } from './RebuildImageDrawer';

const props = {
  changeLinode: vi.fn(),
  image: imageFactory.build(),
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
    getByText('Restore from Image');
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
    await userEvent.click(getByText('Restore Image'));

    expect(mockHistoryPush).toBeCalledWith({
      pathname: '/linodes/1/rebuild',
      search: 'selectedImageId=private%2F0',
    });
  });
});
