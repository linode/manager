import React from 'react';

import { backupFactory } from 'src/factories';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { BackupSelect } from './BackupSelect';

import type {
  CreateLinodeRequest,
  LinodeBackupsResponse,
} from '@linode/api-v4';

describe('BackupSelect', () => {
  it('renders a heading', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <BackupSelect />,
    });

    const heading = getByText('Select Backup');

    expect(heading).toBeVisible();
    expect(heading.tagName).toBe('H2');
  });

  it('should render backups based on the selected Linode ID in query params', async () => {
    const backups: LinodeBackupsResponse = {
      automatic: backupFactory.buildList(3),
      snapshot: {
        current: backupFactory.build({ label: 'my-snapshot' }),
        in_progress: null,
      },
    };

    server.use(
      http.get('*/linode/instances/2/backups', () => {
        return HttpResponse.json(backups);
      })
    );

    const {
      findAllByText,
      getByText,
    } = renderWithThemeAndHookFormContext<CreateLinodeRequest>({
      component: <BackupSelect />,
      options: {
        MemoryRouter: {
          initialEntries: ['/linodes/create?type=Backups&linodeID=2'],
        },
      },
    });

    const automaticBackups = await findAllByText('Automatic');

    // Verify all 3 automatic backups show up
    expect(automaticBackups).toHaveLength(3);

    // Verify the latest snapshot shows up
    expect(getByText('my-snapshot')).toBeVisible();
  });
});
