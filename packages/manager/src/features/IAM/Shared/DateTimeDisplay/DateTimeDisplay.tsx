import { formatDate } from '@akamai/compute-ui-core/datetime';
import { useProfile } from '@linode/queries';
import * as React from 'react';

import type { Profile } from '@linode/api-v4';

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
   * Additional styles to apply to the root element
   */
  style?: React.CSSProperties;
  /**
   * The date and time string to display
   */
  value: string;
}

/**
 * Time interval units for date humanization cutoffs.
 */
type TimeInterval = 'day' | 'month' | 'never' | 'week' | 'year';

export const DateTimeDisplay = (props: DateTimeDisplayProps) => {
  const { className, displayTime, format, humanizeCutoff, value, style } =
    props;
  const { data: profile } = useProfile();
  return (
    <span className={className} style={style}>
      {formatDate(value, {
        displayTime,
        format,
        humanizeCutoff,
        timezone: (profile as Profile).timezone,
      })}
    </span>
  );
};
