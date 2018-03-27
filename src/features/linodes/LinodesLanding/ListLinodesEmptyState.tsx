import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { compose } from 'redux';

import {
  withStyles,
  Theme,
  WithStyles,
  StyleRulesCallback,
} from 'material-ui/styles';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';


type CSSClasses = 'root' | 'copy' | 'button';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme & Linode.Theme) => ({
  root: {
    paddingTop: theme.spacing.unit * 3,
    paddingBottom: theme.spacing.unit * 3,
  },
  copy: {
    textAlign: 'center',
  },
  button: {
    borderRadius: '4px',
  },
  [theme.breakpoints.up('md')]: {
    root: {
      paddingTop: '50px',
      paddingBottom: '50px',
    },
  },
});

interface Props { }

type PropsWithStyles = Props & WithStyles<CSSClasses> & RouteComponentProps<{}>;

class ListLinodesEmptyState extends React.Component<PropsWithStyles> {
  render() {
    const { classes } = this.props;

    return (
      <Grid
        container
        spacing={24}
        alignItems="center"
        direction="column"
        justify="center"
        className={classes.root}
      >
        <Grid item xs={12}> Image goes here... </Grid>
        <Grid item xs={12} lg={10} className={classes.copy}>
          <Typography variant="body1">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce mollis
            quis tortor ultrices lobortis. Aliquam rutrum dolor turpis, at
            molestie purus semper non. Ut finibus bibendum velit.
        </Typography>
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="raised"
            color="primary"
            className={classes.button}
            onClick={() => this.props.history.push('/linodes/create')}
          >
            Add New Linode
          </Button>
        </Grid>
      </Grid>
    );
  }
}
const enhanced = compose(
  withRouter,
  withStyles(styles, { withTheme: true }),
);

export default enhanced(ListLinodesEmptyState);
