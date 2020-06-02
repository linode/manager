import * as React from 'react';

import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import HeaderBreadCrumb, { BreadCrumbProps } from './HeaderBreadCrumb';

const useStyles = makeStyles((theme: Theme) => ({ root: {} }));

export interface HeaderProps extends BreadCrumbProps {
  actions: JSX.Element;
}

export const LandingHeader: React.FC<HeaderProps> = props => {
  const { actions, iconType, parentLink, title } = props;
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
          <HeaderBreadCrumb
            iconType={iconType}
            title={title}
            parentLink={parentLink}
          />
          {props.children && <Grid item>{props.children}</Grid>}
        </Grid>
      </Grid>
      <Grid item>{actions}</Grid>
    </Grid>
  );
};

export default LandingHeader;
