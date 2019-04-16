import * as React from 'react';
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
      {formatDate(value, { format, humanizeCutoff })}
    </React.Fragment>
  );
};

export default DateTimeDisplay;
