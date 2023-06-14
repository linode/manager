import * as React from 'react';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';
import { rest, server } from 'src/mocks/testServer';
import { sshKeyFactory } from 'src/factories';
import { SSHKeys } from './SSHKeys';
import { waitForElementToBeRemoved } from '@testing-library/react';

// We have to do this because if we don't, the <Hidden /> columns don't render
beforeAll(() => mockMatchMedia());

describe('SSHKeys', () => {
  it('should have table header with SSH Keys title', async () => {
    const sshKeys = sshKeyFactory.buildList(5);

    server.use(
      rest.get('*/profile/sshkeys', (req, res, ctx) => {
        return res(ctx.json(makeResourcePage(sshKeys)));
      })
    );

    const { getByText, getByTestId } = renderWithTheme(<SSHKeys />);

    // Check for table headers
    getByText('Label');
    getByText('Key');
    getByText('Created');

    // Loading state should render
    expect(getByTestId('table-row-loading')).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId('table-row-loading'));

    // Verify some SSH keys render in the table after loading
    for (const key of sshKeys) {
      getByText(key.label);
    }
  });
});
