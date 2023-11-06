import * as React from 'react';

import { profileFactory } from 'src/factories';
import { linodeFactory } from 'src/factories/linodes';
import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ScheduleSettings } from './ScheduleSettings';

describe('ScheduleSettings', () => {
  it('renders heading and copy', async () => {
    server.use(
      rest.get('*/linode/instances/1', (req, res, ctx) => {
        return res(
          ctx.json(linodeFactory.build({ backups: { enabled: true }, id: 1 }))
        );
      })
    );

    const { getByText } = renderWithTheme(
      <ScheduleSettings isReadOnly={false} linodeId={1} />
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
              backups: {
                enabled: true,
                schedule: {
                  day: 'Monday',
                  window: 'W10',
                },
              },
              id: 1,
            })
          )
        );
      }),
      rest.get('*/profile', (req, res, ctx) => {
        return res(ctx.json(profileFactory.build({ timezone: 'utc' })));
      })
    );

    const { findByText } = renderWithTheme(
      <ScheduleSettings isReadOnly={false} linodeId={1} />
    );

    await findByText('Monday');

    // W10 indicates that your backups should be taken between 10:00 and 12:00
    await findByText('10:00 - 12:00');

    await findByText('Time displayed in utc');
  });
});
