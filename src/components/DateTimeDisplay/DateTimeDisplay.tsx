import { pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { MapState } from 'src/store/types';
import formatDate, { TimeInterval } from 'src/utilities/formatDate';


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

const mapStateToProps: MapState<StateProps, Props> = (state) => ({
  timezone: pathOr('GMT', ['data', 'timezone'], state.__resources.profile),
});

const connected = connect(mapStateToProps);

export default connected(DateTimeDisplay);
