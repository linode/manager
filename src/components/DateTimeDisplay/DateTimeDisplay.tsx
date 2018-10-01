import * as moment from 'moment-timezone';
import { compose, pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

import { ISO_FORMAT } from 'src/constants';

type ClassNames = 'root';

export type TimeInterval = 'day' | 'week' | 'month' | 'year' | 'never';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

export interface Props {
  value: string;
  format?: string;
  humanizeCutoff?: TimeInterval;
}

type CombinedProps = Props & StateProps & WithStyles<ClassNames>;

const durationMap = {
  'day': () => moment.duration(1,'days'),
  'week': () => moment.duration(1,'weeks'),
  'month': () => moment.duration(1,'months'),
  'year': () => moment.duration(1,'years'),
  'never': () => moment.duration(1000,'years'),
}

const shouldCutoff = (time: any, cutoff?: TimeInterval): boolean => {
  if (!cutoff) { return false; }
  const duration = durationMap[cutoff]();
  const diff =  moment.duration(moment().diff(time));
  return diff <= duration;
}

export const DateTimeDisplay: React.StatelessComponent<CombinedProps> = (props) => {
  let time;
  try {
    time = moment.utc(props.value).tz(props.timezone);
  }
  catch {
    return null;
  }
  const formattedTime = shouldCutoff(time, props.humanizeCutoff)
    ? time.fromNow()
    : time.format(props.format || ISO_FORMAT)
    return (
      <React.Fragment>
        {formattedTime}
      </React.Fragment>
    )
};

const styled = withStyles(styles, { withTheme: true });

interface StateProps {
  timezone: string;
}

const mapStateToProps: MapStateToProps<StateProps, Props, ApplicationState> = (state) => ({
  timezone: pathOr('GMT', ['data', 'timezone'], state.__resources.profile),
});

const connected = connect(mapStateToProps);

const enhanced = compose<any, any, any>(
  styled,
  connected,
);

export default enhanced(DateTimeDisplay);
