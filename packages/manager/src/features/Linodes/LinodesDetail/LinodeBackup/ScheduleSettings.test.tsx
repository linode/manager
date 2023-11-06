import * as React from 'react';

import { profileFactory } from 'src/factories';
import { linodeFactory } from 'src/factories/linodes';
import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ScheduleSettings } from './ScheduleSettings';
import { DateTime } from 'luxon';

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

  it('renders with the linode schedule taking into account the user timezone (UTC)', async () => {
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

  it('renders with the linode schedule taking into account the user timezone (America/New_York)', async () => {
    server.use(
      rest.get('*/linode/instances/1', (req, res, ctx) => {
        return res(
          ctx.json(
            linodeFactory.build({
              backups: {
                enabled: true,
                schedule: {
                  day: 'Wednesday',
                  window: 'W10',
                },
              },
              id: 1,
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
      <ScheduleSettings isReadOnly={false} linodeId={1} />
    );

    await findByText('Wednesday');

    // Because of Daylight savings time, offset will be -4 or -5.
    const offset = DateTime.now().setZone('America/New_York').offset / 60;

    // W10 indicates that your backups should be taken between 10:00 and 12:00 UTC.
    // W10 in America/New_York will be 06:00 - 08:00 EDT (UTC-4) or 05:00 - 07:00 EST (UTC-5).
    await findByText(`0${10 + offset}:00 - 0${10 + 2 + offset}:00`);

    await findByText('Time displayed in America/New York');
  });
});
