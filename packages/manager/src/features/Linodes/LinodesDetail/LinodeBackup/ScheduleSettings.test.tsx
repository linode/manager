import { linodeFactory } from '@linode/utilities';
import { userEvent } from '@testing-library/user-event';
import { Settings } from 'luxon';
import * as React from 'react';

import { profileFactory } from 'src/factories';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ScheduleSettings } from './ScheduleSettings';

describe('ScheduleSettings', () => {
  it('renders heading and copy', async () => {
    server.use(
      http.get('*/linode/instances/1', () => {
        return HttpResponse.json(
          linodeFactory.build({ backups: { enabled: true }, id: 1 })
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
      http.get('*/linode/instances/1', () => {
        return HttpResponse.json(
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
        );
      }),
      http.get('*/profile', () => {
        return HttpResponse.json(profileFactory.build({ timezone: 'utc' }));
      })
    );

    const { getByPlaceholderText, findByText } = renderWithTheme(
      <ScheduleSettings isReadOnly={false} linodeId={1} />
    );

    const weekMenu = getByPlaceholderText(`Choose a day`);

    await userEvent.click(weekMenu);

    await findByText('Monday');

    // W10 indicates that your backups should be taken between 10:00 and 12:00
    const timeMenu = getByPlaceholderText(`Choose a time`);

    await userEvent.click(timeMenu);

    await findByText('10:00 - 12:00');

    await findByText('Time displayed in utc');
  });

  it('renders with the linode schedule taking into account the user timezone (America/New_York) (EDT)', async () => {
    server.use(
      http.get('*/linode/instances/1', () => {
        return HttpResponse.json(
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
        );
      }),
      http.get('*/profile', () => {
        return HttpResponse.json(
          profileFactory.build({ timezone: 'America/New_York' })
        );
      })
    );

    // Mock that today's date is May 25th, 2018 so that it is daylight savings time
    Settings.now = () => new Date(2018, 4, 25).valueOf();

    const { getByPlaceholderText, findByText } = renderWithTheme(
      <ScheduleSettings isReadOnly={false} linodeId={1} />
    );

    const weekMenu = getByPlaceholderText(`Choose a day`);

    await userEvent.click(weekMenu);

    await findByText('Wednesday');

    // W10 indicates that your backups should be taken between 10:00 and 12:00 UTC.
    // W10 in America/New_York during daylight savings is 06:00 - 08:00 EDT (UTC-4).
    const timeMenu = getByPlaceholderText(`Choose a time`);

    await userEvent.click(timeMenu);

    await findByText(`06:00 - 08:00`);

    await findByText('Time displayed in America/New York');
  });

  it('renders with the linode schedule taking into account the user timezone (America/New_York) (EST)', async () => {
    server.use(
      http.get('*/linode/instances/1', () => {
        return HttpResponse.json(
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
        );
      }),
      http.get('*/profile', () => {
        return HttpResponse.json(
          profileFactory.build({ timezone: 'America/New_York' })
        );
      })
    );

    // Mock that today's date is Nov 7th, 2023 so that it is *not* daylight savings time
    Settings.now = () => new Date(2023, 11, 7).valueOf();

    const { getByPlaceholderText, findByText } = renderWithTheme(
      <ScheduleSettings isReadOnly={false} linodeId={1} />
    );

    const weekMenu = getByPlaceholderText(`Choose a day`);

    await userEvent.click(weekMenu);

    await findByText('Wednesday');

    // W10 indicates that your backups should be taken between 10:00 and 12:00 UTC.
    // W10 in America/New_York when it is not daylight savings is 05:00 - 07:00 EST (UTC-5).
    const timeMenu = getByPlaceholderText(`Choose a time`);

    await userEvent.click(timeMenu);

    await findByText(`05:00 - 07:00`);

    await findByText('Time displayed in America/New York');
  });
});
