import * as React from 'react';

import Paper from '@material-ui/core/Paper';
import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

type ClassNames = 'root'
  | 'searchHeading';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
    padding: theme.spacing.unit * 2,
    backgroundColor: theme.color.green,
  },
  searchHeading: {
    textAlign: 'center',
    margin: theme.spacing.unit * 3,
    color: theme.color.white,
    fontSize: '1.2em',
  },
});

interface Props {}

interface State {}

type CombinedProps = Props & WithStyles<ClassNames>;

class SearchPanel extends React.Component<CombinedProps, State> {
  state: State = {};

  render() {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <Paper
          className={classes.root}
        >
          <Typography
            variant="subheading"
            className={classes.searchHeading}
          >
            Ways to Get Help
        </Typography>
        </Paper>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(SearchPanel);
