import { LinodeBackupsResponse } from '@linode/api-v4';
import * as React from 'react';

import { backupFactory, linodeFactory } from 'src/factories';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { LinodeBackups } from './LinodeBackups';

// I'm so sorry, but I don't know a better way to mock react-router-dom params.
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(() => ({ linodeId: 1 })),
  };
});

describe('LinodeBackups', () => {
  it('renders a list of different types of backups if backups are enabled', async () => {
    server.use(
      http.get('*/linode/instances/1', () => {
        return HttpResponse.json(
          linodeFactory.build({ backups: { enabled: true }, id: 1 })
        );
      }),
      http.get('*/linode/instances/1/backups', () => {
        const response: LinodeBackupsResponse = {
          automatic: backupFactory.buildList(1, { label: null, type: 'auto' }),
          snapshot: {
            current: backupFactory.build({
              label: 'current-snapshot',
              status: 'needsPostProcessing',
              type: 'snapshot',
            }),
            in_progress: backupFactory.build({
              created: '2023-05-03T04:00:05',
              finished: '2023-05-03T04:02:06',
              label: 'in-progress-test-backup',
              type: 'snapshot',
            }),
          },
        };
        return HttpResponse.json(response);
      })
    );

    const { findByText, getByText } = renderWithTheme(<LinodeBackups />);

    // Verify an automated backup renders
    await findByText('current-snapshot');
    getByText('Automatic');

    // Verify an `in_progress` snapshot renders
    getByText('in-progress-test-backup');
    getByText('2 minutes, 1 second');

    // Verify an `current` snapshot renders
    getByText('current-snapshot');
    getByText('Processing');
  });

  it('renders BackupsPlaceholder is backups are not enabled on this linode', async () => {
    server.use(
      http.get('*/linode/instances/1', () => {
        return HttpResponse.json(
          linodeFactory.build({ backups: { enabled: false }, id: 1 })
        );
      })
    );

    const { findByText } = renderWithTheme(<LinodeBackups />);

    await findByText('Enable Backups');
  });
});
