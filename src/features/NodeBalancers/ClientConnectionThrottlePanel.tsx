import * as React from 'react';

import { withStyles, StyleRulesCallback, WithStyles, Theme } from 'material-ui';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';

import TextField, { Props as TextFieldProps } from 'src/components/TextField';

type ClassNames = 'root' | 'inner';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
    flexGrow: 1,
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    backgroundColor: theme.color.white,
  },
  inner: {
    padding: theme.spacing.unit * 3,
  },
});

const styled = withStyles(styles, { withTheme: true });

interface Props {
  error?: string;
  textFieldProps?: TextFieldProps;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class ClientConnectionThrottlePanel extends React.Component<CombinedProps> {

  static defaultProps: Partial<Props> = {
    textFieldProps: {
      placeholder: '0',
    },
  };

  render() {
    const { classes, textFieldProps } = this.props;

    return (
      <Paper className={classes.root} data-qa-label-header>
        <div className={classes.inner}>
          <Typography variant="title">Client Connection Throttle</Typography>
          <TextField type="number" {...textFieldProps} />
        </div>
      </Paper>
    );
  }
}

export default styled<Props>(ClientConnectionThrottlePanel);
