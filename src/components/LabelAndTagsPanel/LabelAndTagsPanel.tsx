import * as React from 'react';

import { withStyles, StyleRulesCallback, WithStyles, Theme } from 'material-ui';

import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';

import TextField, { Props as TextFieldProps } from 'src/components/TextField';
import Notice from 'src/components/Notice';

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
  labelFieldProps?: TextFieldProps;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class InfoPanel extends React.Component<CombinedProps> {

  static defaultProps: Partial<Props> = {
    labelFieldProps: {
      label: 'Label',
      placeholder: 'Enter a Label',
    },
  };

  render() {
    const { classes, error, labelFieldProps } = this.props;

    return (
      <Paper className={classes.root} data-qa-label-header>
        <div className={classes.inner}>
          {error && <Notice text={error} error />}
          <Typography variant="title">Label</Typography>
          <TextField {...labelFieldProps} />
        </div>
      </Paper>
    );
  }
}

export default styled<Props>(InfoPanel);
