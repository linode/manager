import * as React from 'react';

import { withStyles, StyleRulesCallback, WithStyles, Theme } from 'material-ui';

import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';

import TextField from '../../../components/TextField';
import Notice from '../../../components/Notice';

type ClassNames = 'root' | 'inner' | 'panelBody';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    flexGrow: 1,
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    backgroundColor: theme.palette.background.paper,
  },
  inner: {
    padding: theme.spacing.unit * 3,
  },
  panelBody: {
    padding: `${theme.spacing.unit * 3}px 0 ${theme.spacing.unit}px`,
  },
});

const styled = withStyles(styles, { withTheme: true });

interface Props {
  error?: string;
  label: string | null;
  handleChange: (key: string) =>
    (e: React.ChangeEvent<HTMLInputElement>, label: string) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class InfoPanel extends React.Component<CombinedProps> {
  render() {
    const { classes, error, handleChange } = this.props;
    const setLabel = handleChange('label');

    return (
      <Paper className={classes.root} data-qa-label-header>
      <div className={classes.inner}>
        { error && <Notice text={error} error /> }
        <Typography variant="title">Label</Typography>
        <TextField
          label="Linode Label"
          placeholder="Enter a Label"
          onChange={e => setLabel(e, e.target.value)}
        />
      </div>
    </Paper>
    );
  }
}

export default styled<Props>(InfoPanel);
