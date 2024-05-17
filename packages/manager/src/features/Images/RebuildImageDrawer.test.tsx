import userEvent from '@testing-library/user-event';
import React from 'react';

import { linodeFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { RebuildImageDrawer } from './RebuildImageDrawer';

const props = {
  changeLinode: vi.fn(),
  onClose: vi.fn(),
  open: true,
};

describe('RebuildImageDrawer', () => {
  it('should render', async () => {
    const { getByText } = renderWithTheme(<RebuildImageDrawer {...props} />);

    // Verify title renders
    getByText('Restore from Image');
  });

  it('should allow editing image details', async () => {
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

    expect(props.changeLinode).toBeCalledWith(1);
  });
});
