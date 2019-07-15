import * as React from 'react';
import Typography from 'src/components/core/Typography';
import formatDate, { TimeInterval } from 'src/utilities/formatDate';

export interface Props {
  value: string;
  format?: string;
  humanizeCutoff?: TimeInterval;
  className?: string;
  styles?: React.CSSProperties;
}

type CombinedProps = Props;

export const DateTimeDisplay: React.StatelessComponent<
  CombinedProps
> = props => {
  const { format, humanizeCutoff, value, className } = props;
  return (
    <React.Fragment>
      <Typography style={props.styles} component="span" className={className}>
        {formatDate(value, { format, humanizeCutoff })}
      </Typography>
    </React.Fragment>
  );
};

export default DateTimeDisplay;
