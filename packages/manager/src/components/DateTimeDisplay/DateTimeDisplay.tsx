import * as React from 'react';

import { Typography } from 'src/components/Typography';
import { useProfile } from 'src/queries/profile';
import { TimeInterval, formatDate } from 'src/utilities/formatDate';

export interface DateTimeDisplayProps {
  className?: string;
  displayTime?: boolean;
  format?: string;
  humanizeCutoff?: TimeInterval;
  styles?: React.CSSProperties;
  value: string;
}

const DateTimeDisplay = (props: DateTimeDisplayProps) => {
  const { className, displayTime, format, humanizeCutoff, value } = props;
  const { data: profile } = useProfile();
  return (
    <Typography className={className} component="span" style={props.styles}>
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
