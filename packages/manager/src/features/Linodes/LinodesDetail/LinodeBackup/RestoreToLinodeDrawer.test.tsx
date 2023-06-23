import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { RestoreToLinodeDrawer } from './RestoreToLinodeDrawer';
import { rest, server } from 'src/mocks/testServer';
import { backupFactory, linodeFactory } from 'src/factories';

describe('RestoreToLinodeDrawer', () => {
  it('renders without crashing', async () => {
    server.use(
      rest.get('*/linode/instances/1', (req, res, ctx) => {
        return res(
          ctx.json(linodeFactory.build({ backups: { enabled: true }, id: 1 }))
        );
      })
    );

    const backup = backupFactory.build({ created: '2023-05-03T04:00:47' });

    const { getByText } = renderWithTheme(
      <RestoreToLinodeDrawer
        open={true}
        linodeId={1}
        backup={backup}
        onClose={jest.fn()}
      />
    );

    getByText(`Restore Backup from ${backup.created}`);
  });
});
