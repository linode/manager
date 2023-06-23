import * as React from 'react';
import Typography from 'src/components/core/Typography';
import { useProfile } from 'src/queries/profile';
import formatDate, { TimeInterval } from 'src/utilities/formatDate';

export interface DateTimeDisplayProps {
  value: string;
  format?: string;
  displayTime?: boolean;
  humanizeCutoff?: TimeInterval;
  className?: string;
  styles?: React.CSSProperties;
}

const DateTimeDisplay = (props: DateTimeDisplayProps) => {
  const { className, displayTime, format, humanizeCutoff, value } = props;
  const { data: profile } = useProfile();
  return (
    <Typography style={props.styles} component="span" className={className}>
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
