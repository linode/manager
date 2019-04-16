import * as React from 'react';
import Typography from 'src/components/core/Typography';
import formatDate, { TimeInterval } from 'src/utilities/formatDate';

export interface Props {
  value: string;
  format?: string;
  humanizeCutoff?: TimeInterval;
}

type CombinedProps = Props;

export const DateTimeDisplay: React.StatelessComponent<
  CombinedProps
> = props => {
  const { format, humanizeCutoff, value } = props;
  return (
    <React.Fragment>
      <Typography variant="body1">
        {formatDate(value, { format, humanizeCutoff })}
      </Typography>
    </React.Fragment>
  );
};

export default DateTimeDisplay;
