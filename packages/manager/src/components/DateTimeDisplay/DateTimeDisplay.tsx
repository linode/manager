import * as React from 'react';
import Typography from 'src/components/core/Typography';
import formatDate, { TimeInterval } from 'src/utilities/formatDate';

export interface Props {
  value: string;
  format?: string;
  displayTime?: boolean;
  humanizeCutoff?: TimeInterval;
  className?: string;
  styles?: React.CSSProperties;
}

export const DateTimeDisplay = (props: Props) => {
  const { format, humanizeCutoff, displayTime, value, className } = props;
  return (
    <Typography style={props.styles} component="span" className={className}>
      {formatDate(value, { format, humanizeCutoff, displayTime })}
    </Typography>
  );
};

export default DateTimeDisplay;
