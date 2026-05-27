import { formatDate } from '@akamai/compute-ui-core/datetime';
import { useProfile } from '@linode/queries';
import { Typography } from '@linode/ui';
import * as React from 'react';

import type { SxProps, Theme } from '@linode/ui';

export interface DateTimeDisplayProps {
  /**
   * Additional styles to apply to the root element
   */
  className?: string;
  /**
   * If true displays time component of the date and time provided
   */
  displayTime?: boolean;
  /**
   * String that specifies a luxon compatible format to use
   */
  format?: string;
  /**
   * If the date and time provided is within the designated time frame then the date is displayed as a relative date
   */
  humanizeCutoff?: TimeInterval;
  /**
   * Styles to pass through to the sx prop.
   */
  sx?: SxProps<Theme>;
  /**
   * The date and time string to display
   */
  value: string;
}

/**
 * Time interval units for date humanization cutoffs.
 */
type TimeInterval = 'day' | 'month' | 'never' | 'week' | 'year';

const DateTimeDisplay = (props: DateTimeDisplayProps) => {
  const { className, displayTime, format, humanizeCutoff, value, sx } = props;
  const { data: profile } = useProfile();
  return (
    <Typography className={className} component="span" sx={sx}>
      {formatDate(value, {
        displayTime,
        format,
        humanizeCutoff,
        timezone: profile?.timezone,
      })}
    </Typography>
  );
};

export { DateTimeDisplay };
