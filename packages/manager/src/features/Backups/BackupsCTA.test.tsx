import { linodeFactory, profileFactory } from '@linode/utilities';
import * as React from 'react';

import { accountSettingsFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { BackupsCTA } from './BackupsCTA';

describe('BackupsCTA', () => {
  it('should render if all conditions are met', async () => {
    server.use(
      http.get('*/profile', () => {
        return HttpResponse.json(profileFactory.build({ restricted: false }));
      }),
      http.get('*/account/settings', () => {
        return HttpResponse.json(
          accountSettingsFactory.build({ managed: false })
        );
      }),
      http.get('*/profile/preferences', () => {
        return HttpResponse.json(accountSettingsFactory.build({}));
      }),
      http.get('*/linode/instances', () => {
        return HttpResponse.json(
          makeResourcePage(
            linodeFactory.buildList(5, { backups: { enabled: false } })
          )
        );
      })
    );

    const { findByText } = renderWithTheme(<BackupsCTA />);

    expect(await findByText('Enable Linode Backups')).toBeVisible();
  });
});
