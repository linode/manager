import * as moment from 'moment-timezone';
import { compose, pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

import { ISO_FORMAT } from 'src/constants';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

export interface Props {
  value: string;
  format?: string
}

type CombinedProps = Props & StateProps & WithStyles<ClassNames>;

const DateTimeDisplay: React.StatelessComponent<CombinedProps> = (props) => {
  try {
    return (
      <React.Fragment>
        {moment.utc(props.value).tz(props.timezone).format(props.format || ISO_FORMAT)}
      </React.Fragment>
    )
  }
  catch {
    return null;
  }
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
