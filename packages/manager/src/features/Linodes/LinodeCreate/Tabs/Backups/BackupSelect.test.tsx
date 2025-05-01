import { backupFactory, linodeFactory } from '@linode/utilities';
import React from 'react';

import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { BackupSelect } from './BackupSelect';

import type { LinodeCreateFormValues } from '../../utilities';
import type { LinodeBackupsResponse } from '@linode/api-v4';

describe('BackupSelect', () => {
  it('renders a heading', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <BackupSelect />,
    });

    const heading = getByText('Select Backup');

    expect(heading).toBeVisible();
    expect(heading.tagName).toBe('H2');
  });

  it('should render backups based on the selected Linode ID in form state', async () => {
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

    const { findAllByText, getByText } =
      renderWithThemeAndHookFormContext<LinodeCreateFormValues>({
        component: <BackupSelect />,
        useFormOptions: {
          defaultValues: { linode: linodeFactory.build({ id: 2 }) },
        },
      });

    const automaticBackups = await findAllByText('Automatic');

    // Verify all 3 automatic backups show up
    expect(automaticBackups).toHaveLength(3);

    // Verify the latest snapshot shows up
    expect(getByText('my-snapshot')).toBeVisible();
  });
});
