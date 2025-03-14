import React from 'react';

import { linodeDiskFactory } from 'src/factories';
import { linodeFactory } from '@linode/utilities';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { LinodeDisks } from './LinodeDisks';

describe('LinodeDisks', () => {
  it('should render', async () => {
    const disks = linodeDiskFactory.buildList(5);

    server.use(
      http.get('*/linode/instances/:id', () => {
        return HttpResponse.json(linodeFactory.build());
      }),
      http.get('*/linode/instances/:id/disks', () => {
        return HttpResponse.json(makeResourcePage(disks));
      })
    );

    const { findByText, getByText } = renderWithTheme(<LinodeDisks />);

    // Verify heading renders
    expect(getByText('Disks')).toBeVisible();

    // Verify all 5 disks returned by the API render
    for (const disk of disks) {
      // This rule is *crazy*
      // eslint-disable-next-line no-await-in-loop
      await findByText(disk.label);
    }
  });
});
