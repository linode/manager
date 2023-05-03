import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { LinodeBackups } from './LinodeBackups';
import { rest, server } from 'src/mocks/testServer';
import { backupFactory, linodeFactory } from 'src/factories';
import { LinodeBackupsResponse } from '@linode/api-v4';

// I'm so sorry, but I don't know a better way to mock react-router-dom params.
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(() => ({ linodeId: 1 })),
}));

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
              type: 'snapshot',
            }),
            current: backupFactory.build({
              label: 'current-snapshot',
              type: 'snapshot',
            }),
          },
        };
        return res(ctx.json(response));
      })
    );

    const { findByText } = renderWithTheme(<LinodeBackups />);

    await findByText('current-snapshot');
    await findByText('in-progress-test-backup');
    await findByText('Automatic');
  });
});
