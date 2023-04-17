import * as React from 'react';
import Typography from 'src/components/core/Typography';
import { useProfile } from 'src/queries/profile';
import formatDate, { TimeInterval } from 'src/utilities/formatDate';

export interface Props {
  value: string;
  format?: string;
  displayTime?: boolean;
  humanizeCutoff?: TimeInterval;
  className?: string;
  styles?: React.CSSProperties;
}

type CombinedProps = Props;

export const DateTimeDisplay: React.FC<CombinedProps> = (props) => {
  const { format, humanizeCutoff, displayTime, value, className } = props;
  const { data: profile } = useProfile();
  return (
    <Typography style={props.styles} component="span" className={className}>
      {formatDate(value, {
        format,
        humanizeCutoff,
        displayTime,
        timezone: profile?.timezone,
      })}
    </Typography>
  );
};

export default DateTimeDisplay;
