import { waitForElementToBeRemoved } from '@testing-library/react';
import * as React from 'react';

import { sshKeyFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { SSHKeys } from './SSHKeys';

// We have to do this because if we don't, the <Hidden /> columns don't render
beforeAll(() => mockMatchMedia());

describe('SSHKeys', () => {
  it('should have table header with SSH Keys title', async () => {
    const sshKeys = sshKeyFactory.buildList(5);

    server.use(
      http.get('*/profile/sshkeys', () => {
        return HttpResponse.json(makeResourcePage(sshKeys));
      })
    );

    const { getByTestId, getByText } = renderWithTheme(<SSHKeys />);

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
