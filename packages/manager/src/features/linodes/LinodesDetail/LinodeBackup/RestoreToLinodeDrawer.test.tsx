import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { RestoreToLinodeDrawer } from './RestoreToLinodeDrawer';
import { rest, server } from 'src/mocks/testServer';
import { linodeFactory } from 'src/factories';

describe('RestoreToLinodeDrawer', () => {
  it('renders without crashing', async () => {
    server.use(
      rest.get('*/linode/instances/1', (req, res, ctx) => {
        return res(
          ctx.json(linodeFactory.build({ id: 1, backups: { enabled: true } }))
        );
      })
    );

    const { getByText } = renderWithTheme(
      <RestoreToLinodeDrawer
        open={true}
        linodeId={1}
        backup={undefined}
        onClose={jest.fn()}
      />
    );

    getByText(/Restore Backup from/);
  });
});
