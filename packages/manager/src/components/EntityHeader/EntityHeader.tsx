import * as React from 'react';

import { makeStyles, Theme } from 'src/components/core/styles';
import EntityIcon, { Variant } from 'src/components/EntityIcon';
import Grid from 'src/components/Grid';
import Typography from 'src/components/core/Typography';

const useStyles = makeStyles((theme: Theme) => ({ root: {} }));

export interface HeaderProps {
  title: string;
  iconType: Variant;
  actions: JSX.Element;
}

export const LandingHeader: React.FC<HeaderProps> = props => {
  const { actions, iconType, title } = props;
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
            <EntityIcon variant={iconType} />
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
