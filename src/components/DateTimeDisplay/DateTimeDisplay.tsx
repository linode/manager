import { pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';

import formatDate, { TimeInterval } from 'src/utilities/formatDate'

export interface Props {
  value: string;
  format?: string;
  humanizeCutoff?: TimeInterval;
}

type CombinedProps = Props & StateProps;

export const DateTimeDisplay: React.StatelessComponent<CombinedProps> = (props) => {
  const { format, humanizeCutoff, timezone, value } = props;
  return (
    <React.Fragment>
      {formatDate(value, { format, humanizeCutoff, timezone })}
    </React.Fragment>
  )
};

interface StateProps {
  timezone: string;
}

const mapStateToProps: MapStateToProps<StateProps, Props, ApplicationState> = (state) => ({
  timezone: pathOr('GMT', ['data', 'timezone'], state.__resources.profile),
});

const connected = connect(mapStateToProps);

export default connected(DateTimeDisplay);
