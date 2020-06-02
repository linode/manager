import { renderWithTheme } from 'src/utilities/testHelpers';
import { cleanup } from '@testing-library/react';
import { DateTime } from 'luxon';
import * as React from 'react';
import { DateTimeDisplay, Props } from './DateTimeDisplay';
import { API_DATETIME_NO_TZ_FORMAT } from 'src/constants';

const APIDate = '2018-07-20 04:23:17';

beforeEach(cleanup);

describe('DateTimeDisplay component', () => {
  describe('Non-humanized dates', () => {
    it('should be displayed in 24-hour ISO format', () => {
      const props = { value: APIDate, humanizeCutoff: undefined };
      const { getByText } = renderWithTheme(<DateTimeDisplay {...props} />);

      getByText('2018-07-20 04:23:17');
    });
  });

  describe('Humanized dates', () => {
    it('should output humanized strings if the date is earlier than the cutoff', () => {
      const props = {
        value: DateTime.utc()
          .minus({ minutes: 5 })
          .toFormat(API_DATETIME_NO_TZ_FORMAT),
        humanizeCutoff: 'day'
      } as Props;
      const { getByText } = renderWithTheme(<DateTimeDisplay {...props} />);

      getByText('5 minutes ago');

      // expect(
      //   component
      //     .find('WithStyles(ForwardRef(Typography))')
      //     .children()
      //     .text()
      // ).toContain('5 minutes ago');
    });
    describe('should output ISO strings if the date is older than the cutoff', () => {
      const almostOneWeek = DateTime.utc().minus({ days: 6 });
      const almostOneWeekString = almostOneWeek.toFormat(
        API_DATETIME_NO_TZ_FORMAT
      );
      it('cutoff month', () => {
        const props = {
          value: almostOneWeekString,
          humanizeCutoff: 'month'
        } as Props;
        const { getByText } = renderWithTheme(<DateTimeDisplay {...props} />);
        getByText('6 days ago');
      });

      it('cutoff day', () => {
        const props = {
          value: almostOneWeekString,
          humanizeCutoff: 'day'
        } as Props;
        const { getByText } = renderWithTheme(<DateTimeDisplay {...props} />);
        getByText(`${almostOneWeek.year}`, { exact: false });
      });
    });
    it('should always output formatted text if humanizedCutoff is set to never', () => {
      const aLongTimeAgo = DateTime.utc()
        .minus({ years: 10 })
        .toFormat(API_DATETIME_NO_TZ_FORMAT);
      const props = {
        value: aLongTimeAgo,
        humanizeCutoff: 'never'
      } as Props;
      const { getByText } = renderWithTheme(<DateTimeDisplay {...props} />);
      getByText('10 years ago');
    });
  });
});
