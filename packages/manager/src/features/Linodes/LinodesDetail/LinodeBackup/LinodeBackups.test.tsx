import { vi } from 'vitest';
import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { LinodeBackups } from './LinodeBackups';
import { rest, server } from 'src/mocks/testServer';
import { backupFactory, linodeFactory } from 'src/factories';
import { LinodeBackupsResponse } from '@linode/api-v4';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(() => ({ linodeId: 1 })),
  }
})

describe('LinodeBackups', () => {
  it('renders a list of different types of backups if backups are enabled', async () => {
    server.use(
      rest.get('*/linode/instances/1', (req, res, ctx) => {
        return res(
          ctx.json(linodeFactory.build({ id: 1, backups: { enabled: true } }))
        );
      }),
      rest.get('*/linode/instances/1/backups', (req, res, ctx) => {
        const response: LinodeBackupsResponse = {
          automatic: backupFactory.buildList(1, { label: null, type: 'auto' }),
          snapshot: {
            in_progress: backupFactory.build({
              label: 'in-progress-test-backup',
              created: '2023-05-03T04:00:05',
              finished: '2023-05-03T04:02:06',
              type: 'snapshot',
            }),
            current: backupFactory.build({
              label: 'current-snapshot',
              type: 'snapshot',
              status: 'needsPostProcessing',
            }),
          },
        };
        return res(ctx.json(response));
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
      rest.get('*/linode/instances/1', (req, res, ctx) => {
        return res(
          ctx.json(linodeFactory.build({ id: 1, backups: { enabled: false } }))
        );
      })
    );

    const { findByText } = renderWithTheme(<LinodeBackups />);

    await findByText('Enable Backups');
  });
});
