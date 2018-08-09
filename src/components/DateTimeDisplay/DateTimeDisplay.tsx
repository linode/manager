import * as moment from 'moment-timezone';
import { compose, pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

export interface Props {
  value: string;
  format?: string
  }

interface ConnectedProps {
  timezone: string;
}

type CombinedProps = Props & ConnectedProps & WithStyles<ClassNames>;

const DateTimeDisplay: React.StatelessComponent<CombinedProps> = (props) => {
  try {
    return (
      <React.Fragment>
        { moment(props.value).tz(props.timezone).format(props.format || 'Y-MM-DD') }
      </React.Fragment>
    )
  }
  catch {
    return null;
  }
};

const styled = withStyles(styles, { withTheme: true });

const connected = connect<ConnectedProps>((state: Linode.AppState) => ({
  timezone: pathOr('GMT', ['resources', 'profile', 'data', 'timezone'], state),
}));

const enhanced = compose<any, any, any>(
  styled,
  connected,
);

export default enhanced(DateTimeDisplay);
