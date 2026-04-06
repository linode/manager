import { DateTime } from 'luxon';
import * as React from 'react';

import { ISO_DATETIME_NO_TZ_FORMAT } from 'src/constants';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { DateTimeDisplay } from './DateTimeDisplay';

import type { DateTimeDisplayProps } from './DateTimeDisplay';

vi.mock('@linode/utilities', async () => {
  const actual = await vi.importActual('@linode/utilities');
  return {
    ...actual,
    getUserTimezone: vi.fn().mockReturnValue('utc'),
  };
});

const APIDate = '2018-07-20T04:23:17';

describe('DateTimeDisplay component', () => {
  it('should not display the time', () => {
    const props = { displayTime: false, value: APIDate };
    const { getByText } = renderWithTheme(<DateTimeDisplay {...props} />);

    getByText('2018-07-20');
  });

  it('should display the time', () => {
    const props = { displayTime: true, value: APIDate };
    const { getByText } = renderWithTheme(<DateTimeDisplay {...props} />);

    getByText('2018-07-20 04:23');
  });

  it('should format the time based on the specified format only', () => {
    const props = {
      displayTime: false,
      format: 'MM-dd-yyyy HH:mm',
      value: APIDate,
    };
    const { getByText } = renderWithTheme(<DateTimeDisplay {...props} />);

    getByText('07-20-2018 04:23');
  });

  it('should format the time based on the specified format only pt2', () => {
    const props = { displayTime: true, format: 'MM-dd-yyyy', value: APIDate };
    const { getByText } = renderWithTheme(<DateTimeDisplay {...props} />);

    getByText('07-20-2018');
  });

  describe('Non-humanized dates', () => {
    it('should be displayed in 24-hour ISO format', () => {
      const props = { humanizeCutoff: undefined, value: APIDate };
      const { getByText } = renderWithTheme(<DateTimeDisplay {...props} />);

      getByText('2018-07-20 04:23');
    });
  });

  describe('Humanized dates', () => {
    it('should output humanized strings if the date is earlier than the cutoff', () => {
      const props: DateTimeDisplayProps = {
        humanizeCutoff: 'day',
        value: DateTime.utc()
          .minus({ minutes: 5 })
          .toFormat(ISO_DATETIME_NO_TZ_FORMAT),
      };
      const { getByText } = renderWithTheme(<DateTimeDisplay {...props} />);

      getByText('5 minutes ago');
    });
    describe('should output ISO strings if the date is older than the cutoff', () => {
      const almostOneWeek = DateTime.utc().minus({ days: 6 });
      const almostOneWeekString = almostOneWeek.toFormat(
        ISO_DATETIME_NO_TZ_FORMAT
      );
      it('cutoff month', () => {
        const props: DateTimeDisplayProps = {
          humanizeCutoff: 'month',
          value: almostOneWeekString,
        };
        const { getByText } = renderWithTheme(<DateTimeDisplay {...props} />);
        getByText('6 days ago');
      });

      it('cutoff day', () => {
        const props: DateTimeDisplayProps = {
          humanizeCutoff: 'day',
          value: almostOneWeekString,
        };
        const { getByText } = renderWithTheme(<DateTimeDisplay {...props} />);
        getByText(`${almostOneWeek.year}`, { exact: false });
      });
    });
    it('should always output formatted text if humanizedCutoff is set to never', () => {
      const aLongTimeAgo = DateTime.utc()
        .minus({ years: 10 })
        .toFormat(ISO_DATETIME_NO_TZ_FORMAT);
      const props: DateTimeDisplayProps = {
        humanizeCutoff: 'never',
        value: aLongTimeAgo,
      };
      const { getByText } = renderWithTheme(<DateTimeDisplay {...props} />);
      getByText('10 years ago');
    });
  });
});
