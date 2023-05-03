import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { ScheduleSettings } from './ScheduleSettings';
import { rest, server } from 'src/mocks/testServer';
import { linodeFactory } from 'src/factories/linodes';
import { profileFactory } from 'src/factories';

describe('RestoreToLinodeDrawer', () => {
  it('renders heading and copy', async () => {
    server.use(
      rest.get('*/linode/instances/1', (req, res, ctx) => {
        return res(
          ctx.json(linodeFactory.build({ id: 1, backups: { enabled: true } }))
        );
      })
    );

    const { getByText } = renderWithTheme(
      <ScheduleSettings linodeId={1} isReadOnly={false} />
    );

    getByText('Settings');
    getByText(
      /Configure when automatic backups are initiated. The Linode Backup Service/
    );
  });

  it('renders with the linode schedule taking into account the user timezone', async () => {
    server.use(
      rest.get('*/linode/instances/1', (req, res, ctx) => {
        return res(
          ctx.json(
            linodeFactory.build({
              id: 1,
              backups: {
                enabled: true,
                schedule: {
                  day: 'Monday',
                  window: 'W4',
                },
              },
            })
          )
        );
      }),
      rest.get('*/profile', (req, res, ctx) => {
        return res(
          ctx.json(profileFactory.build({ timezone: 'America/New_York' }))
        );
      })
    );

    const { findByText } = renderWithTheme(
      <ScheduleSettings linodeId={1} isReadOnly={false} />
    );

    await findByText('Monday');
    await findByText('00:00 - 02:00');

    await findByText('America/New York', { exact: false });
  });
});
