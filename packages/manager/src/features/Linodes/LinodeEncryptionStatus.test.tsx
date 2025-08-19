import { linodeFactory, regionFactory } from '@linode/utilities';
import React from 'react';

import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { LinodeEncryptionStatus } from './LinodeEncryptionStatus';

describe('LinodeEncryptionStatus', () => {
  it('renders "Encrypted" if the Linode disk_encryption value is "enabled"', async () => {
    const linode = linodeFactory.build({ disk_encryption: 'enabled' });

    server.use(
      http.get('*/v4*/linode/instances/:id', () => {
        return HttpResponse.json(linode);
      })
    );

    const { findAllByText } = renderWithTheme(
      <LinodeEncryptionStatus linodeId={linode.id} />
    );

    const [icon, text] = await findAllByText('Encrypted');

    expect(icon).toBeInTheDocument();
    expect(text).toBeVisible();
  });

  it("renders a tooltip explaning how to enable/disable encryption if the Linode's region suppors it and the Linode is not part of an LKE cluster", async () => {
    const region = regionFactory.build({ capabilities: ['Disk Encryption'] });
    const linode = linodeFactory.build({
      disk_encryption: 'disabled',
      lke_cluster_id: null,
    });

    server.use(
      http.get('*/v4*/linode/instances/:id', () => {
        return HttpResponse.json(linode);
      }),
      http.get('*/v4*/regions/:id', () => {
        return HttpResponse.json(region);
      })
    );

    const { findByLabelText } = renderWithTheme(
      <LinodeEncryptionStatus linodeId={linode.id} />
    );

    expect(
      await findByLabelText(
        'Rebuild this Linode to enable or disable disk encryption.'
      )
    ).toBeVisible();
  });
});
