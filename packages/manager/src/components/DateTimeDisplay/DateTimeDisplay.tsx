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

type CombinedProps = Props;

export const DateTimeDisplay: React.FC<CombinedProps> = props => {
  const { format, humanizeCutoff, displayTime, value, className } = props;
  const _displayTime = displayTime !== false;
  return (
    <Typography style={props.styles} component="span" className={className}>
      {formatDate(value, { format, humanizeCutoff, displayTime: _displayTime })}
    </Typography>
  );
};

export default DateTimeDisplay;
