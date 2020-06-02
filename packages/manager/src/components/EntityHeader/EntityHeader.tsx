import * as React from 'react';

import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import Typography from 'src/components/core/Typography';

const useStyles = makeStyles((theme: Theme) => ({ root: {} }));

export interface HeaderProps {
  title: string;
  iconType: string;
  actions: JSX.Element;
}

export const LandingHeader: React.FC<HeaderProps> = props => {
  const { actions, title } = props;
  const classes = useStyles();

  return (
    <Grid
      container
      alignItems="center"
      justify="space-between"
      className={classes.root}
    >
      <Grid item>
        <Grid container direction="row" alignItems="center">
          <Grid item>
            <i />
          </Grid>
          <Grid item>
            <Typography variant="h2">{title}s</Typography>
          </Grid>
          {props.children && <Grid item>{props.children}</Grid>}
        </Grid>
      </Grid>
      <Grid item>{actions}</Grid>
    </Grid>
  );
};

export default LandingHeader;
