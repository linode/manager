import * as React from 'react';

import {
  accountSettingsFactory,
  linodeFactory,
  profileFactory,
} from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { BackupsCTA } from './BackupsCTA';

describe('BackupsCTA', () => {
  it('should render if all conditions are met', async () => {
    server.use(
      rest.get('*/profile', (req, res, ctx) => {
        return res(ctx.json(profileFactory.build({ restricted: false })));
      }),
      rest.get('*/account/settings', (req, res, ctx) => {
        return res(ctx.json(accountSettingsFactory.build({ managed: false })));
      }),
      rest.get('*/profile/preferences', (req, res, ctx) => {
        return res(ctx.json(accountSettingsFactory.build({})));
      }),
      rest.get('*/linode/instances', (req, res, ctx) => {
        return res(
          ctx.json(
            makeResourcePage(
              linodeFactory.buildList(5, { backups: { enabled: false } })
            )
          )
        );
      })
    );

    const { findByText } = renderWithTheme(<BackupsCTA />);

    expect(await findByText('Enable Linode Backups')).toBeVisible();
  });
});
